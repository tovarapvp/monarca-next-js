"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Variant {
    id: string
    product_id: string
    name: string      // e.g., "Size", "Color"
    value: string     // e.g., "Large", "Red"
    price: number | null  // Optional price override
}

export interface NewVariant {
    name: string
    value: string
    price?: number | null
}

export function useProductVariants(productId: string | null) {
    const [variants, setVariants] = useState<Variant[]>([])
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
                .from('variants')
                .select('*')
                .eq('product_id', productId)
                .order('name', { ascending: true })

            if (fetchError) throw fetchError

            setVariants(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching variants:', err)
        } finally {
            setLoading(false)
        }
    }

    return { variants, loading, error, refetch: fetchVariants, setVariants }
}

export async function createVariant(productId: string, variant: NewVariant): Promise<Variant> {
    const { data, error } = await supabase
        .from('variants')
        .insert({
            product_id: productId,
            name: variant.name,
            value: variant.value,
            price: variant.price || null,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function createMultipleVariants(productId: string, variants: NewVariant[]): Promise<Variant[]> {
    if (variants.length === 0) return []

    const variantsToInsert = variants.map(v => ({
        product_id: productId,
        name: v.name,
        value: v.value,
        price: v.price || null,
    }))

    const { data, error } = await supabase
        .from('variants')
        .insert(variantsToInsert)
        .select()

    if (error) throw error
    return data || []
}

export async function updateVariant(id: string, variant: Partial<NewVariant>): Promise<Variant> {
    const { data, error } = await supabase
        .from('variants')
        .update({
            name: variant.name,
            value: variant.value,
            price: variant.price,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteVariant(id: string): Promise<void> {
    const { error } = await supabase
        .from('variants')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function deleteProductVariants(productId: string): Promise<void> {
    const { error } = await supabase
        .from('variants')
        .delete()
        .eq('product_id', productId)

    if (error) throw error
}
