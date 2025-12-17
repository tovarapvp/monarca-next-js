"use client"

import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Package2, Eye, Loader2, AlertCircle, Plus } from "lucide-react"
import { useOrders, updateOrderStatus } from "@/hooks/use-orders"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"

export default function AdminOrders() {
    const t = useTranslations('admin.orders')
    const tCommon = useTranslations('common')
    const { orders, loading, error, refetch } = useOrders()
    const { toast } = useToast()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "inquiry":
                return "bg-gray-100 text-gray-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "processing":
                return "bg-blue-100 text-blue-800"
            case "shipped":
                return "bg-purple-100 text-purple-800"
            case "delivered":
                return "bg-green-100 text-green-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const handleStatusChange = async (orderId: string, currentStatus: string) => {
        const statuses = ["inquiry", "pending", "processing", "shipped", "delivered", "cancelled"]
        const currentIndex = statuses.indexOf(currentStatus)
        const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)]

        try {
            await updateOrderStatus(orderId, nextStatus as any)
            refetch()
            toast({
                title: tCommon('success'),
                description: `${t('status')}: ${nextStatus}`,
            })
        } catch (err) {
            toast({
                title: tCommon('error'),
                description: tCommon('error'),
                variant: "destructive",
            })
        }
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading orders: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-gray-800 mb-2">{t('title')}</h1>
                    <p className="text-gray-600">{t('title')}</p>
                </div>
                <Link href="/admin/orders/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createOrder')}
                    </Button>
                </Link>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                </div>
            )}

            {/* Orders List */}
            {!loading && orders.length > 0 && (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{t('order')} #{order.id.slice(0, 8)}</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            {order.customer_name} • {order.customer_email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={getStatusColor(order.status || "inquiry")}>
                                            {order.status || "inquiry"}
                                        </Badge>
                                        <p className="text-sm text-gray-500">
                                            {order.created_at && new Date(order.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.order_items?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <Package2 className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{item.products?.name || "Unknown Product"}</p>
                                                    <p className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {t('viewDetails')}
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusChange(order.id, order.status || 'pending')}
                                                disabled={order.status === "delivered" || order.status === "cancelled"}
                                            >
                                                {t('updateStatus')}
                                            </Button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary">{t('total')}: ${order.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && orders.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('noOrders')}</h3>
                        <p className="text-gray-600">{t('noOrders')}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
