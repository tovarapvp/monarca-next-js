"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    display_order: number
    created_at: string
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true })

            if (fetchError) throw fetchError

            setCategories(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching categories:', err)
        } finally {
            setLoading(false)
        }
    }

    return { categories, loading, error, refetch: fetchCategories }
}

export function useCategory(slug: string | null) {
    const [category, setCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!slug) {
            setLoading(false)
            return
        }

        fetchCategory()
    }, [slug])

    async function fetchCategory() {
        if (!slug) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('categories')
                .select('*')
                .eq('slug', slug)
                .single()

            if (fetchError) throw fetchError

            setCategory(data)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching category:', err)
        } finally {
            setLoading(false)
        }
    }

    return { category, loading, error, refetch: fetchCategory }
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateCategory(id: string, category: Partial<Category>) {
    const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function reorderCategories(categories: { id: string; display_order: number }[]) {
    const promises = categories.map(({ id, display_order }) =>
        supabase
            .from('categories')
            .update({ display_order })
            .eq('id', id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error).map(r => r.error)

    if (errors.length > 0) throw errors[0]
}
