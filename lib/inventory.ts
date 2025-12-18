import { supabase } from '@/lib/supabase/client'

/**
 * Hook para gestionar operaciones de inventario
 */

export interface InventoryTransaction {
    id: string
    product_variant_id: string
    quantity_change: number
    transaction_type: 'sale' | 'restock' | 'adjustment' | 'return'
    reference_id?: string // Order ID o referencia
    notes?: string
    created_at: string
}

/**
 * Reduce el stock de una variante de producto
 */
export async function reduceStock(
    variantId: string,
    quantity: number,
    transactionType: 'sale' | 'adjustment' = 'sale',
    referenceId?: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Obtener el stock actual
        const { data: variant, error: fetchError } = await supabase
            .from('product_variants')
            .select('stock_quantity, track_inventory, allow_backorder')
            .eq('id', variantId)
            .single()

        if (fetchError) throw fetchError
        if (!variant) throw new Error('Variant not found')

        // Verificar si necesita control de inventario
        if (!variant.track_inventory) {
            return { success: true }
        }

        // Verificar stock disponible
        const newStock = variant.stock_quantity - quantity
        if (newStock < 0 && !variant.allow_backorder) {
            return {
                success: false,
                error: `Insufficient stock. Available: ${variant.stock_quantity}, Requested: ${quantity}`
            }
        }

        // Actualizar el stock
        const { error: updateError } = await supabase
            .from('product_variants')
            .update({
                stock_quantity: Math.max(0, newStock),
                is_available: newStock > 0 || variant.allow_backorder
            })
            .eq('id', variantId)

        if (updateError) throw updateError

        // Registrar la transacción (opcional, si tienes tabla de transacciones)
        await logInventoryTransaction({
            product_variant_id: variantId,
            quantity_change: -quantity,
            transaction_type: transactionType,
            reference_id: referenceId,
            notes: notes
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error reducing stock:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Incrementa el stock de una variante (restock, devoluciones)
 */
export async function increaseStock(
    variantId: string,
    quantity: number,
    transactionType: 'restock' | 'return' | 'adjustment' = 'restock',
    referenceId?: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Obtener el stock actual
        const { data: variant, error: fetchError } = await supabase
            .from('product_variants')
            .select('stock_quantity, track_inventory')
            .eq('id', variantId)
            .single()

        if (fetchError) throw fetchError
        if (!variant) throw new Error('Variant not found')

        if (!variant.track_inventory) {
            return { success: true }
        }

        const newStock = variant.stock_quantity + quantity

        // Actualizar el stock
        const { error: updateError } = await supabase
            .from('product_variants')
            .update({
                stock_quantity: newStock,
                is_available: true
            })
            .eq('id', variantId)

        if (updateError) throw updateError

        // Registrar la transacción
        await logInventoryTransaction({
            product_variant_id: variantId,
            quantity_change: quantity,
            transaction_type: transactionType,
            reference_id: referenceId,
            notes: notes
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error increasing stock:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Verifica si hay stock suficiente para un pedido
 */
export async function checkStockAvailability(
    items: { variantId: string; quantity: number }[]
): Promise<{
    available: boolean
    unavailableItems: { variantId: string; available: number; requested: number }[]
}> {
    try {
        const unavailableItems: { variantId: string; available: number; requested: number }[] = []

        for (const item of items) {
            const { data: variant, error } = await supabase
                .from('product_variants')
                .select('stock_quantity, track_inventory, allow_backorder')
                .eq('id', item.variantId)
                .single()

            if (error || !variant) continue

            if (variant.track_inventory && !variant.allow_backorder) {
                if (variant.stock_quantity < item.quantity) {
                    unavailableItems.push({
                        variantId: item.variantId,
                        available: variant.stock_quantity,
                        requested: item.quantity
                    })
                }
            }
        }

        return {
            available: unavailableItems.length === 0,
            unavailableItems
        }
    } catch (error) {
        console.error('Error checking stock availability:', error)
        return { available: false, unavailableItems: [] }
    }
}

/**
 * Procesa una venta reduciendo el stock de todos los items
 */
export async function processSaleInventory(
    items: { variantId: string; quantity: number }[],
    orderId: string
): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    // Primero verificar disponibilidad
    const { available, unavailableItems } = await checkStockAvailability(items)

    if (!available) {
        return {
            success: false,
            errors: unavailableItems.map(
                item => `Variant ${item.variantId}: only ${item.available} available, ${item.requested} requested`
            )
        }
    }

    // Procesar cada item
    for (const item of items) {
        const result = await reduceStock(
            item.variantId,
            item.quantity,
            'sale',
            orderId,
            `Order #${orderId}`
        )

        if (!result.success) {
            errors.push(result.error || `Failed to reduce stock for variant ${item.variantId}`)
        }
    }

    return {
        success: errors.length === 0,
        errors
    }
}

/**
 * Revierte una venta (devolución) incrementando el stock
 */
export async function reverseSaleInventory(
    items: { variantId: string; quantity: number }[],
    orderId: string
): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    for (const item of items) {
        const result = await increaseStock(
            item.variantId,
            item.quantity,
            'return',
            orderId,
            `Return for Order #${orderId}`
        )

        if (!result.success) {
            errors.push(result.error || `Failed to increase stock for variant ${item.variantId}`)
        }
    }

    return {
        success: errors.length === 0,
        errors
    }
}

/**
 * Registra una transacción de inventario (si tienes tabla de logs)
 * Esta función es opcional y depende de si quieres mantener historial
 */
async function logInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) {
    try {
        // Solo si tienes una tabla inventory_transactions
        const { error } = await supabase
            .from('inventory_transactions')
            .insert({
                ...transaction,
                created_at: new Date().toISOString()
            })

        if (error) {
            console.warn('Failed to log inventory transaction:', error)
        }
    } catch (error) {
        // Fallar silenciosamente, no queremos romper el flujo principal
        console.warn('Inventory logging not available:', error)
    }
}

/**
 * Obtiene variantes con bajo stock
 */
export async function getLowStockVariants(threshold: number = 5) {
    try {
        const { data, error } = await supabase
            .from('product_variants')
            .select(`
        id,
        sku,
        stock_quantity,
        track_inventory,
        is_available,
        product_id,
        products (
          name,
          images
        )
      `)
            .eq('track_inventory', true)
            .lte('stock_quantity', threshold)
            .gt('stock_quantity', 0)
            .order('stock_quantity', { ascending: true })

        if (error) throw error

        return { data: data || [], error: null }
    } catch (error: any) {
        console.error('Error fetching low stock variants:', error)
        return { data: [], error: error.message }
    }
}

/**
 * Obtiene variantes sin stock
 */
export async function getOutOfStockVariants() {
    try {
        const { data, error } = await supabase
            .from('product_variants')
            .select(`
        id,
        sku,
        stock_quantity,
        track_inventory,
        is_available,
        product_id,
        products (
          name,
          images
        )
      `)
            .eq('track_inventory', true)
            .eq('stock_quantity', 0)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { data: data || [], error: null }
    } catch (error: any) {
        console.error('Error fetching out of stock variants:', error)
        return { data: [], error: error.message }
    }
}

/**
 * Actualización masiva de stock
 */
export async function bulkUpdateStock(
    updates: { variantId: string; newStock: number; notes?: string }[]
): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    for (const update of updates) {
        try {
            const { error } = await supabase
                .from('product_variants')
                .update({
                    stock_quantity: update.newStock,
                    is_available: update.newStock > 0
                })
                .eq('id', update.variantId)

            if (error) throw error

            // Log de la transacción
            await logInventoryTransaction({
                product_variant_id: update.variantId,
                quantity_change: 0, // Se registra el cambio absoluto
                transaction_type: 'adjustment',
                notes: update.notes || 'Bulk update'
            })
        } catch (error: any) {
            errors.push(`Variant ${update.variantId}: ${error.message}`)
        }
    }

    return {
        success: errors.length === 0,
        errors
    }
}
