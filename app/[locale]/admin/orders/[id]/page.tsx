"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, AlertCircle, Package, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { completeManualOrder, cancelOrder } from "@/lib/order-inventory"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    price_at_purchase: number
    variant_name: string | null
    variant_value: string | null
    unit_type: string | null
    is_per_unit: boolean | null
    notes: string | null
    products?: {
        name: string
        images: string[] | null
    }
}

interface Order {
    id: string
    created_at: string
    status: string
    total: number
    customer_name: string
    customer_email: string
    shipping_address: any
    payment_method?: string
    inventory_reduced?: boolean
    notes?: string
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { toast } = useToast()
    const [order, setOrder] = useState<Order | null>(null)
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        async function fetchOrderDetail() {
            try {
                setLoading(true)
                const resolvedParams = await params

                // Fetch order
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', resolvedParams.id)
                    .single()

                if (orderError) throw orderError
                setOrder(orderData)

                // Fetch order items with product details
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select(`
            *,
            products:product_id (
              name,
              images
            )
          `)
                    .eq('order_id', resolvedParams.id)

                if (itemsError) throw itemsError
                setOrderItems(itemsData || [])
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching order:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrderDetail()
    }, [params])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "inquiry": return "bg-gray-100 text-gray-800"
            case "pending": return "bg-yellow-100 text-yellow-800"
            case "processing": return "bg-blue-100 text-blue-800"
            case "shipped": return "bg-purple-100 text-purple-800"
            case "delivered": return "bg-green-100 text-green-800"
            case "cancelled": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error ? error.message : "Order not found"}
                    </AlertDescription>
                </Alert>
                <Link href="/admin/orders" className="mt-4 inline-block">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/orders">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-serif font-bold text-gray-800">
                        Order #{order.id.slice(0, 8)}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                    </Badge>
                    {order.payment_method && (
                        <Badge variant="outline">
                            {order.payment_method === 'stripe' && '💳 Stripe'}
                            {order.payment_method === 'paypal' && '💰 PayPal'}
                            {order.payment_method === 'manual' && '✏️ Manual'}
                        </Badge>
                    )}
                    {order.inventory_reduced ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Inventory Reduced
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending Reduction
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Order Items */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                    <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.products?.images?.[0] ? (
                                            <img
                                                src={item.products.images[0]}
                                                alt={item.products.name || 'Product'}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Package className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{item.products?.name || 'Unknown Product'}</h4>

                                        {/* Variant Info */}
                                        {item.variant_name && item.variant_value && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                <span className="font-medium">{item.variant_name}:</span> {item.variant_value}
                                            </p>
                                        )}

                                        {/* Per-Unit Info */}
                                        {item.is_per_unit && item.unit_type && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    Sold by {item.unit_type}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {item.quantity} {item.unit_type}(s) × ${item.price_at_purchase.toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Regular Price */}
                                        {!item.is_per_unit && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Quantity: {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            ${(item.price_at_purchase * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t">
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer & Shipping Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{order.customer_email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p>{order.shipping_address.address}</p>
                            {order.shipping_address.city && <p>{order.shipping_address.city}</p>}
                            {order.shipping_address.state && order.shipping_address.zipCode && (
                                <p>{order.shipping_address.state} {order.shipping_address.zipCode}</p>
                            )}
                            {order.shipping_address.phone && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Phone: {order.shipping_address.phone}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    {order.payment_method === 'manual' && !order.inventory_reduced && (
                        <Card className="border-2 border-primary/20">
                            <CardHeader>
                                <CardTitle>Order Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    This manual order hasn't reduced inventory yet. Complete it to reduce stock.
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={async () => {
                                        setActionLoading(true)
                                        try {
                                            const result = await completeManualOrder(order.id)
                                            if (result.success) {
                                                toast({ title: "Success", description: result.message })
                                                // Reload order
                                                const { data } = await supabase
                                                    .from('orders')
                                                    .select('*')
                                                    .eq('id', order.id)
                                                    .single()
                                                setOrder(data)
                                            } else {
                                                toast({
                                                    title: "Error",
                                                    description: result.message,
                                                    variant: "destructive"
                                                })
                                            }
                                        } catch (error: any) {
                                            toast({
                                                title: "Error",
                                                description: error.message,
                                                variant: "destructive"
                                            })
                                        } finally {
                                            setActionLoading(false)
                                        }
                                    }}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Complete Order & Reduce Inventory
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Cancel Order Card */}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <Card className="border-2 border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-800">Cancel Order</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {order.inventory_reduced
                                        ? "Canceling will restore inventory to stock."
                                        : "Canceling this order (inventory not yet reduced)."}
                                </p>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to cancel this order?')) return

                                        setActionLoading(true)
                                        try {
                                            const result = await cancelOrder(order.id)
                                            if (result.success) {
                                                toast({ title: "Success", description: result.message })
                                                // Reload order
                                                const { data } = await supabase
                                                    .from('orders')
                                                    .select('*')
                                                    .eq('id', order.id)
                                                    .single()
                                                setOrder(data)
                                            } else {
                                                toast({
                                                    title: "Error",
                                                    description: result.message,
                                                    variant: "destructive"
                                                })
                                            }
                                        } catch (error: any) {
                                            toast({
                                                title: "Error",
                                                description: error.message,
                                                variant: "destructive"
                                            })
                                        } finally {
                                            setActionLoading(false)
                                        }
                                    }}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Canceling...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Order
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
