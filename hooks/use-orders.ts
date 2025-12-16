"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/types/database'

export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>

export type OrderWithItems = Order & {
    order_items: (OrderItem & {
        products: Tables<'products'>
    })[]
}

export function useOrders() {
    const [orders, setOrders] = useState<OrderWithItems[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            setOrders(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching orders:', err)
        } finally {
            setLoading(false)
        }
    }

    return { orders, loading, error, refetch: fetchOrders }
}

export function useOrder(id: string | null) {
    const [order, setOrder] = useState<OrderWithItems | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }

        fetchOrder()
    }, [id])

    async function fetchOrder() {
        if (!id) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            setOrder(data)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching order:', err)
        } finally {
            setLoading(false)
        }
    }

    return { order, loading, error, refetch: fetchOrder }
}

export async function updateOrderStatus(id: string, status: Tables<'orders'>['status']) {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}
