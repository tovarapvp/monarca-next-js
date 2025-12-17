"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from "@/i18n/navigation"
import { Package, ShoppingCart, Users, Plus, Eye, Edit, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard"
import { useTranslations } from "next-intl"

export default function AdminDashboard() {
    const t = useTranslations('admin.dashboard')
    const { stats, loading, error } = useDashboardStats()

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading dashboard data: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gray-800 mb-2">{t('title')}</h1>
                <p className="text-gray-600">{t('welcome')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('totalProducts')}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                <p className="text-xs text-muted-foreground">{t('inCatalog')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('pendingOrders')}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                                <p className="text-xs text-muted-foreground">{t('awaiting')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('monthlySales')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">${stats.monthlySales.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">{t('last30Days')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('activeCustomers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                                <p className="text-xs text-muted-foreground">{t('uniqueCustomers')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('quickActions')}</CardTitle>
                        <CardDescription>{t('manageStore')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/admin/products/new">
                            <Button className="w-full justify-start">
                                <Plus className="h-4 w-4 mr-2" />
                                {t('addNewProduct')}
                            </Button>
                        </Link>
                        <Link href="/admin/orders">
                            <Button variant="outline" className="w-full justify-start">
                                <Eye className="h-4 w-4 mr-2" />
                                {t('viewPendingOrders')}
                            </Button>
                        </Link>
                        <Link href="/admin/products">
                            <Button variant="outline" className="w-full justify-start">
                                <Edit className="h-4 w-4 mr-2" />
                                {t('editProducts')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('activitySummary')}</CardTitle>
                        <CardDescription>{t('latestActivities')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{t('connectedSupabase')}</p>
                                        <p className="text-xs text-gray-500">{t('realTimeEnabled')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{t('productsInCatalog', { count: stats.totalProducts })}</p>
                                        <p className="text-xs text-gray-500">{t('viewInProducts')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{t('pendingOrdersCount', { count: stats.pendingOrders })}</p>
                                        <p className="text-xs text-gray-500">{t('viewInOrders')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
