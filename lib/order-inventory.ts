import { supabase } from '@/lib/supabase/client'
import {
    reduceStock,
    increaseStock,
    checkStockAvailability
} from '@/lib/inventory'

/**
 * Tipos de método de pago
 * NOTA: WhatsApp/Email NO crean órdenes. Solo contactan.
 * Las órdenes manuales las crea el admin desde el panel.
 */
export type PaymentMethod = 'stripe' | 'paypal' | 'manual'

/**
 * Interfaz de orden extendida
 */
export interface OrderWithPayment {
    id: string
    payment_method: PaymentMethod
    status: string
    inventory_reduced: boolean
    total: number
    customer_name: string
    customer_email: string
}

/**
 * Procesa el inventario según el método de pago
 * 
 * REGLAS:
 * - stripe/paypal: Reduce inventario automáticamente al completar pago
 * - manual: NO reduce inventario al crear (se hace cuando admin completa)
 */
export async function processOrderInventory(
    orderId: string,
    items: { variantId: string; quantity: number }[],
    paymentMethod: PaymentMethod
): Promise<{ success: boolean; message: string; errors?: string[] }> {

    // Verificar si ya se redujo el inventario
    const { data: order } = await supabase
        .from('orders')
        .select('inventory_reduced')
        .eq('id', orderId)
        .single()

    if (order?.inventory_reduced) {
        return {
            success: true,
            message: 'Inventory already reduced for this order'
        }
    }

    // SOLO reducir inventario para pagos automáticos (stripe/paypal)
    if (paymentMethod === 'stripe' || paymentMethod === 'paypal') {
        // Verificar disponibilidad primero
        const { available, unavailableItems } = await checkStockAvailability(items)

        if (!available) {
            return {
                success: false,
                message: 'Insufficient stock for some items',
                errors: unavailableItems.map(
                    item => `Variant ${item.variantId}: requested ${item.requested}, available ${item.available}`
                )
            }
        }

        // Reducir stock de cada item
        const errors: string[] = []
        for (const item of items) {
            const result = await reduceStock(
                item.variantId,
                item.quantity,
                'sale',
                orderId,
                `Automatic payment via ${paymentMethod}`
            )

            if (!result.success) {
                errors.push(result.error || `Failed to reduce stock for variant ${item.variantId}`)
            }
        }

        if (errors.length > 0) {
            return {
                success: false,
                message: 'Failed to reduce inventory for some items',
                errors
            }
        }

        // Marcar como inventario reducido
        await supabase
            .from('orders')
            .update({ inventory_reduced: true })
            .eq('id', orderId)

        return {
            success: true,
            message: 'Inventory reduced successfully'
        }
    }

    // Para órdenes manuales, NO reducir inventario al crear
    // El admin lo hará cuando complete la orden
    return {
        success: true,
        message: 'Manual order created. Inventory will be reduced when order is completed by admin.'
    }
}

/**
 * Completa una orden manual y reduce el inventario
 * Esta función se llama desde el admin cuando se marca una orden manual como completada
 */
export async function completeManualOrder(
    orderId: string
): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
        // Obtener la orden y sus items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          variant_id,
          quantity
        )
      `)
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return {
                success: false,
                message: 'Order not found'
            }
        }

        // Verificar que sea manual
        if (order.payment_method !== 'manual') {
            return {
                success: false,
                message: 'This function is only for manual orders. Automatic payments reduce inventory automatically.'
            }
        }

        // Verificar si ya se redujo el inventario
        if (order.inventory_reduced) {
            return {
                success: true,
                message: 'Inventory already reduced for this order'
            }
        }

        // Preparar items para reducción de stock
        const items = (order.order_items || [])
            .filter((item: any) => item.variant_id) // Solo items con variante
            .map((item: any) => ({
                variantId: item.variant_id,
                quantity: item.quantity
            }))

        if (items.length === 0) {
            // Si no hay items con variantes, solo marcar como reducido
            await supabase
                .from('orders')
                .update({
                    inventory_reduced: true,
                    status: 'processing'
                })
                .eq('id', orderId)

            return {
                success: true,
                message: 'Order marked as completed (no inventory to reduce)'
            }
        }

        // Verificar disponibilidad
        const { available, unavailableItems } = await checkStockAvailability(items)

        if (!available) {
            return {
                success: false,
                message: 'Insufficient stock for some items',
                errors: unavailableItems.map(
                    item => `Variant ${item.variantId}: requested ${item.requested}, available ${item.available}`
                )
            }
        }

        // Reducir stock
        const errors: string[] = []
        for (const item of items) {
            const result = await reduceStock(
                item.variantId,
                item.quantity,
                'sale',
                orderId,
                `Manual order completed by admin`
            )

            if (!result.success) {
                errors.push(result.error || `Failed to reduce stock for variant ${item.variantId}`)
            }
        }

        if (errors.length > 0) {
            return {
                success: false,
                message: 'Failed to reduce inventory for some items',
                errors
            }
        }

        // Actualizar orden: marcar inventario reducido y cambiar estado
        await supabase
            .from('orders')
            .update({
                inventory_reduced: true,
                status: 'processing'
            })
            .eq('id', orderId)

        return {
            success: true,
            message: 'Manual order completed and inventory reduced successfully'
        }
    } catch (error: any) {
        console.error('Error completing manual order:', error)
        return {
            success: false,
            message: error.message || 'Unknown error occurred'
        }
    }
}

/**
 * Cancela una orden y restaura el inventario (si ya se había reducido)
 */
export async function cancelOrder(
    orderId: string
): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          variant_id,
          quantity
        )
      `)
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return {
                success: false,
                message: 'Order not found'
            }
        }

        // Solo restaurar inventario si se había reducido
        if (order.inventory_reduced) {
            const items = (order.order_items || [])
                .filter((item: any) => item.variant_id)
                .map((item: any) => ({
                    variantId: item.variant_id,
                    quantity: item.quantity
                }))

            const errors: string[] = []
            for (const item of items) {
                const result = await increaseStock(
                    item.variantId,
                    item.quantity,
                    'return',
                    orderId,
                    `Order cancelled - restoring inventory`
                )

                if (!result.success) {
                    errors.push(result.error || `Failed to restore stock for variant ${item.variantId}`)
                }
            }

            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Failed to restore inventory for some items',
                    errors
                }
            }
        }

        // Actualizar estado de la orden
        await supabase
            .from('orders')
            .update({
                status: 'cancelled',
                inventory_reduced: false
            })
            .eq('id', orderId)

        return {
            success: true,
            message: order.inventory_reduced
                ? 'Order cancelled and inventory restored'
                : 'Order cancelled (no inventory to restore)'
        }
    } catch (error: any) {
        console.error('Error cancelling order:', error)
        return {
            success: false,
            message: error.message || 'Unknown error occurred'
        }
    }
}
