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

export interface NewOrderData {
    customer_name: string
    customer_email: string
    status?: 'inquiry' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    total: number
    shipping_address: {
        address: string
        city: string
        state: string
        zip: string
        country: string
        phone?: string
    }
    notes?: string
    payment_method?: 'stripe' | 'paypal' | 'manual'
    inventory_reduced?: boolean
}

export interface NewOrderItem {
    product_id: string
    quantity: number
    price_at_purchase: number
    variant_info?: string
}

export async function createOrder(orderData: NewOrderData): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .insert({
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            status: orderData.status || 'pending',
            total: orderData.total,
            shipping_address: orderData.shipping_address,
            payment_method: orderData.payment_method || 'manual',
            inventory_reduced: orderData.inventory_reduced || false,
            notes: orderData.notes || null
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function createOrderItems(orderId: string, items: NewOrderItem[]): Promise<void> {
    const itemsToInsert = items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        variant_info: item.variant_info || null,
    }))

    const { error } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

    if (error) throw error
}

export async function createOrderWithItems(
    orderData: NewOrderData,
    items: NewOrderItem[]
): Promise<Order> {
    // Create the order first
    const order = await createOrder(orderData)

    // Then add items
    if (items.length > 0) {
        await createOrderItems(order.id, items)
    }

    return order
}
