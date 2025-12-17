"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle, Eye, EyeOff, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProducts, deleteProduct } from "@/hooks/use-products"
import { supabase } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"

export default function ProductsPage() {
    const t = useTranslations('admin.products')
    const tCommon = useTranslations('common')
    const { products, loading, error, refetch } = useProducts()
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${tCommon('delete')} "${name}"?`)) {
            return
        }

        try {
            await deleteProduct(id)
            toast({
                title: tCommon('success'),
                description: `"${name}" ${t('title').toLowerCase()}`,
            })
            refetch()
        } catch (error) {
            console.error("Error deleting product:", error)
            toast({
                title: tCommon('error'),
                description: tCommon('error'),
                variant: "destructive",
            })
        }
    }

    const toggleStock = async (id: string, currentStock: boolean | null) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ in_stock: !currentStock })
                .eq('id', id)

            if (error) throw error

            toast({
                title: tCommon('success'),
                description: `Product marked as ${!currentStock ? 'in stock' : 'out of stock'}.`,
            })
            refetch()
        } catch (error) {
            console.error("Error updating stock:", error)
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
                        Error loading products: {error.message}
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
                    <h1 className="text-3xl font-serif font-bold text-gray-800">{t('title')}</h1>
                    <p className="text-gray-600 mt-1">{t('title')}</p>
                </div>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addProduct')}
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={`${tCommon('search')}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                </div>
            )}

            {/* Products Table */}
            {!loading && filteredProducts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('title')}</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery ? t('title') : t('addProduct')}
                        </p>
                        {!searchQuery && (
                            <Link href="/admin/products/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('addProduct')}
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : !loading && (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('productName')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('category')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('price')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('stock')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={product.images?.[0] || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {product.id.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="capitalize text-gray-900">{product.category || "N/A"}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">${product.price}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    variant={product.in_stock ? "default" : "secondary"}
                                                    className={product.in_stock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                                >
                                                    {product.in_stock ? t('active') : t('inactive')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleStock(product.id, product.in_stock)}
                                                    >
                                                        {product.in_stock ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
