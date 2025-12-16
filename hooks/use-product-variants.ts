"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

// Types for the new architecture
export interface ProductOption {
    id: string
    product_id: string
    name: string          // "Color", "Size", "Width"
    position: number
    values?: ProductOptionValue[]
}

export interface ProductOptionValue {
    id: string
    option_id: string
    value: string         // "Red", "XL", "5cm"
    position: number
}

export interface ProductVariant {
    id: string
    product_id: string
    sku: string | null

    // Pricing
    price: number
    compare_at_price: number | null

    // Per-unit pricing
    pricing_type: 'fixed' | 'per_unit'
    unit_type: string | null
    price_per_unit: number | null
    min_quantity: number
    max_quantity: number | null

    // Inventory
    stock_quantity: number
    track_inventory: boolean
    allow_backorder: boolean

    // Media
    images: string[] | null

    // Status
    is_available: boolean

    // Metadata
    weight_grams: number | null
    barcode: string | null
    created_at: string

    // Joined data
    option_values?: ProductOptionValue[]
}

// ============= HOOKS =============

// Fetch product options with their values
export function useProductOptions(productId: string | null) {
    const [options, setOptions] = useState<ProductOption[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!productId) {
            setOptions([])
            setLoading(false)
            return
        }
        fetchOptions()
    }, [productId])

    async function fetchOptions() {
        if (!productId) return

        try {
            setLoading(true)
            setError(null)

            // Fetch options
            const { data: optionsData, error: optionsError } = await supabase
                .from('product_options')
                .select('*')
                .eq('product_id', productId)
                .order('position', { ascending: true })

            if (optionsError) throw optionsError

            // Fetch values for each option
            const optionsWithValues = await Promise.all(
                (optionsData || []).map(async (option) => {
                    const { data: valuesData } = await supabase
                        .from('product_option_values')
                        .select('*')
                        .eq('option_id', option.id)
                        .order('position', { ascending: true })

                    return { ...option, values: valuesData || [] }
                })
            )

            setOptions(optionsWithValues)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching product options:', err)
        } finally {
            setLoading(false)
        }
    }

    return { options, loading, error, refetch: fetchOptions }
}

// Fetch product variants (SKUs) with their option values
export function useProductVariants(productId: string | null) {
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!productId) {
            setVariants([])
            setLoading(false)
            return
        }
        fetchVariants()
    }, [productId])

    async function fetchVariants() {
        if (!productId) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('product_variants')
                .select(`
                    *,
                    variant_option_values (
                        option_value_id,
                        product_option_values (
                            id,
                            value,
                            option_id,
                            product_options (
                                id,
                                name
                            )
                        )
                    )
                `)
                .eq('product_id', productId)
                .order('created_at', { ascending: true })

            if (fetchError) throw fetchError

            // Transform data to include option_values array
            const transformedVariants = (data || []).map(variant => {
                const optionValues = variant.variant_option_values?.map((vov: any) => ({
                    id: vov.product_option_values.id,
                    option_id: vov.product_option_values.option_id,
                    value: vov.product_option_values.value,
                    option_name: vov.product_option_values.product_options?.name
                })) || []

                return {
                    ...variant,
                    option_values: optionValues,
                    variant_option_values: undefined
                }
            })

            setVariants(transformedVariants)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching product variants:', err)
        } finally {
            setLoading(false)
        }
    }

    return { variants, loading, error, refetch: fetchVariants, setVariants }
}

// ============= CRUD FUNCTIONS =============

// Create a product option
export async function createProductOption(productId: string, name: string, position: number = 0): Promise<ProductOption> {
    const { data, error } = await supabase
        .from('product_options')
        .insert({ product_id: productId, name, position })
        .select()
        .single()

    if (error) throw error
    return data
}

// Create an option value
export async function createOptionValue(optionId: string, value: string, position: number = 0): Promise<ProductOptionValue> {
    const { data, error } = await supabase
        .from('product_option_values')
        .insert({ option_id: optionId, value, position })
        .select()
        .single()

    if (error) throw error
    return data
}

// Create a product variant (SKU)
export async function createProductVariant(
    productId: string,
    variant: Partial<ProductVariant>,
    optionValueIds: string[]
): Promise<ProductVariant> {
    // Insert variant
    const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .insert({
            product_id: productId,
            sku: variant.sku,
            price: variant.price || 0,
            compare_at_price: variant.compare_at_price,
            pricing_type: variant.pricing_type || 'fixed',
            unit_type: variant.unit_type,
            price_per_unit: variant.price_per_unit,
            min_quantity: variant.min_quantity || 1,
            max_quantity: variant.max_quantity,
            stock_quantity: variant.stock_quantity || 0,
            track_inventory: variant.track_inventory ?? true,
            allow_backorder: variant.allow_backorder ?? false,
            images: variant.images,
            is_available: variant.is_available ?? true,
            weight_grams: variant.weight_grams,
            barcode: variant.barcode,
        })
        .select()
        .single()

    if (variantError) throw variantError

    // Link to option values
    if (optionValueIds.length > 0) {
        const links = optionValueIds.map(valueId => ({
            variant_id: variantData.id,
            option_value_id: valueId
        }))

        const { error: linkError } = await supabase
            .from('variant_option_values')
            .insert(links)

        if (linkError) throw linkError
    }

    // Update product has_variants flag
    await supabase
        .from('products')
        .update({ has_variants: true })
        .eq('id', productId)

    return variantData
}

// Update a product variant
export async function updateProductVariant(
    variantId: string,
    updates: Partial<ProductVariant>
): Promise<ProductVariant> {
    const { data, error } = await supabase
        .from('product_variants')
        .update({
            sku: updates.sku,
            price: updates.price,
            compare_at_price: updates.compare_at_price,
            pricing_type: updates.pricing_type,
            unit_type: updates.unit_type,
            price_per_unit: updates.price_per_unit,
            min_quantity: updates.min_quantity,
            max_quantity: updates.max_quantity,
            stock_quantity: updates.stock_quantity,
            track_inventory: updates.track_inventory,
            allow_backorder: updates.allow_backorder,
            images: updates.images,
            is_available: updates.is_available,
            weight_grams: updates.weight_grams,
            barcode: updates.barcode,
        })
        .eq('id', variantId)
        .select()
        .single()

    if (error) throw error
    return data
}

// Delete a product variant
export async function deleteProductVariant(variantId: string): Promise<void> {
    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

    if (error) throw error
}

// Delete all options and variants for a product
export async function deleteProductOptionsAndVariants(productId: string): Promise<void> {
    // Delete variants first (cascade will delete variant_option_values)
    const { error: variantError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)

    if (variantError) throw variantError

    // Delete options (cascade will delete option_values)
    const { error: optionError } = await supabase
        .from('product_options')
        .delete()
        .eq('product_id', productId)

    if (optionError) throw optionError

    // Update product flag
    await supabase
        .from('products')
        .update({ has_variants: false })
        .eq('id', productId)
}

// Generate all variant combinations from options
export function generateVariantCombinations(
    options: ProductOption[],
    basePrice: number
): { optionValues: ProductOptionValue[], sku: string }[] {
    if (options.length === 0) return []

    const combinations: { optionValues: ProductOptionValue[], sku: string }[] = []

    function generateCombos(
        optionIndex: number,
        currentCombo: ProductOptionValue[],
        skuParts: string[]
    ) {
        if (optionIndex >= options.length) {
            combinations.push({
                optionValues: [...currentCombo],
                sku: skuParts.join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '')
            })
            return
        }

        const option = options[optionIndex]
        for (const value of option.values || []) {
            generateCombos(
                optionIndex + 1,
                [...currentCombo, value],
                [...skuParts, value.value.slice(0, 5)]
            )
        }
    }

    generateCombos(0, [], [])
    return combinations
}

// Find variant by selected option values
export function findVariantByOptions(
    variants: ProductVariant[],
    selectedOptions: Record<string, string> // { "Color": "Red", "Size": "L" }
): ProductVariant | null {
    const selectedValues = Object.values(selectedOptions)

    return variants.find(variant => {
        const variantValues = variant.option_values?.map(ov => ov.value) || []
        return selectedValues.every(val => variantValues.includes(val)) &&
            variantValues.length === selectedValues.length
    }) || null
}
