"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/types/database'

export type Product = Tables<'products'>

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true })

            if (fetchError) throw fetchError

            setProducts(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(id: string | null) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }

        fetchProduct()
    }, [id])

    async function fetchProduct() {
        if (!id) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            setProduct(data)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching product:', err)
        } finally {
            setLoading(false)
        }
    }

    return { product, loading, error, refetch: fetchProduct }
}

export async function createProduct(product: Omit<Product, 'id'>) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateProduct(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Fetch featured/new products for homepage
export function useFeaturedProducts(limit: number = 8) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchFeaturedProducts()
    }, [limit])

    async function fetchFeaturedProducts() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('products')
                .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
                .eq('in_stock', true)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (fetchError) throw fetchError

            setProducts(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching featured products:', err)
        } finally {
            setLoading(false)
        }
    }

    return { products, loading, error, refetch: fetchFeaturedProducts }
}

// Fetch products by category slug
export function useProductsByCategory(categorySlug: string | null) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!categorySlug) {
            setLoading(false)
            return
        }

        fetchProductsByCategory()
    }, [categorySlug])

    async function fetchProductsByCategory() {
        if (!categorySlug) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('products')
                .select(`
          *,
          categories!inner (
            id,
            name,
            slug
          )
        `)
                .eq('categories.slug', categorySlug)
                .eq('in_stock', true)
                .order('name', { ascending: true })

            if (fetchError) throw fetchError

            setProducts(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching products by category:', err)
        } finally {
            setLoading(false)
        }
    }

    return { products, loading, error, refetch: fetchProductsByCategory }
}
