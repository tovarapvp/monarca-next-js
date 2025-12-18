"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, AlertCircle, Mail, User, Calendar, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

interface CustomerOrder {
    id: string
    created_at: string
    status: string
    total: number
}

interface Customer {
    id: string
    full_name: string | null
    role: string
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [orders, setOrders] = useState<CustomerOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchCustomerData()
    }, [params.id])

    async function fetchCustomerData() {
        try {
            setLoading(true)
            setError(null)

            // Fetch customer profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', params.id)
                .single()

            if (profileError) throw profileError

            setCustomer(profileData)

            // Fetch customer orders (we don't have user_id in orders table, so this won't work as is)
            // For now, we'll just show empty orders
            // In a real scenario, you'd need to add user_id to orders table or link via email
            setOrders([])

        } catch (err) {
            setError(err as Error)
            console.error('Error fetching customer:', err)
        } finally {
            setLoading(false)
        }
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading customer: {error.message}
                    </AlertDescription>
                </Alert>
                <Link href="/admin/customers" className="mt-4 inline-block">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Customers
                    </Button>
                </Link>
            </div>
        )
    }

    if (loading || !customer) {
        return (
            <div className="p-8 flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
        )
    }

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/customers">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Customer Details</h1>
                    <p className="text-gray-600 mt-1">{customer.full_name || 'Unknown Customer'}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Customer Info */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{customer.full_name || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                                    {customer.role}
                                </Badge>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-500 mb-1">Customer ID</p>
                                <p className="text-xs font-mono text-gray-600 break-all">{customer.id}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold">{orders.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Spent</p>
                                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-600">No orders yet</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        This customer hasn't placed any orders.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge>{order.status}</Badge>
                                                    <p className="text-lg font-bold mt-1">${order.total}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
