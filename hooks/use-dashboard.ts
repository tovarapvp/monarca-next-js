"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface DashboardStats {
    totalProducts: number
    pendingOrders: number
    monthlySales: number
    activeCustomers: number
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        pendingOrders: 0,
        monthlySales: 0,
        activeCustomers: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        try {
            setLoading(true)
            setError(null)

            // Get total products
            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            // Get pending/inquiry orders
            const { count: orderCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['inquiry', 'pending'])

            // Get monthly sales (last 30 days)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: salesData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .not('status', 'eq', 'cancelled')

            const monthlySales = salesData?.reduce((sum, order) => sum + order.total, 0) || 0

            // Get unique customers count (from orders)
            const { data: customersData } = await supabase
                .from('orders')
                .select('customer_email')

            const uniqueCustomers = new Set(customersData?.map(o => o.customer_email)).size

            setStats({
                totalProducts: productCount || 0,
                pendingOrders: orderCount || 0,
                monthlySales: monthlySales,
                activeCustomers: uniqueCustomers,
            })
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching dashboard stats:', err)
        } finally {
            setLoading(false)
        }
    }

    return { stats, loading, error, refetch: fetchStats }
}
