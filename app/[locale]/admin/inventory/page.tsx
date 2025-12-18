"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    AlertTriangle,
    TrendingDown,
    RefreshCw,
    Search,
    Download,
    Upload,
    Edit,
    Check,
    X
} from "lucide-react"
import { getLowStockVariants, getOutOfStockVariants, bulkUpdateStock } from "@/lib/inventory"
import { useProductVariants } from "@/hooks/use-product-variants"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface VariantWithProduct {
    id: string
    sku: string
    stock_quantity: number
    track_inventory: boolean
    is_available: boolean
    product_id: string
    products: {
        name: string
        images: string[] | null
    }
}

export default function InventoryPage() {
    const { toast } = useToast()
    const [lowStockItems, setLowStockItems] = useState<VariantWithProduct[]>([])
    const [outOfStockItems, setOutOfStockItems] = useState<VariantWithProduct[]>([])
    const [allVariants, setAllVariants] = useState<VariantWithProduct[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<number>(0)

    const loadInventoryData = async () => {
        setLoading(true)
        try {
            const [lowStock, outOfStock, allData] = await Promise.all([
                getLowStockVariants(5),
                getOutOfStockVariants(),
                supabase
                    .from('product_variants')
                    .select(`
            id,
            sku,
            stock_quantity,
            track_inventory,
            is_available,
            product_id,
            products (
              name,
              images
            )
          `)
                    .eq('track_inventory', true)
                    .order('stock_quantity', { ascending: true })
            ])

            if (lowStock.data) setLowStockItems(lowStock.data as VariantWithProduct[])
            if (outOfStock.data) setOutOfStockItems(outOfStock.data as VariantWithProduct[])
            if (allData.data) setAllVariants(allData.data as VariantWithProduct[])
        } catch (error) {
            console.error('Error loading inventory:', error)
            toast({
                title: "Error",
                description: "Failed to load inventory data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInventoryData()
    }, [])

    const filteredVariants = allVariants.filter(variant =>
        variant.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variant.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEditStock = (variantId: string, currentStock: number) => {
        setEditingId(variantId)
        setEditValue(currentStock)
    }

    const handleSaveStock = async (variantId: string) => {
        const result = await bulkUpdateStock([
            { variantId, newStock: editValue, notes: 'Manual adjustment from admin panel' }
        ])

        if (result.success) {
            toast({
                title: "Success",
                description: "Stock updated successfully"
            })
            setEditingId(null)
            loadInventoryData()
        } else {
            toast({
                title: "Error",
                description: result.errors.join(', '),
                variant: "destructive"
            })
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditValue(0)
    }

    const totalLowStock = lowStockItems.length
    const totalOutOfStock = outOfStockItems.length
    const totalInventoryValue = allVariants.reduce((sum, v) => sum + v.stock_quantity, 0)

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-800">Inventory Management</h1>
                <p className="text-gray-600 mt-1">Monitor and manage product stock levels</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Items Tracked
                        </CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{allVariants.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalInventoryValue} units in stock
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-orange-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">
                            Low Stock Alert
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{totalLowStock}</div>
                        <p className="text-xs text-orange-700 mt-1">
                            Items with ≤ 5 units
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">
                            Out of Stock
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{totalOutOfStock}</div>
                        <p className="text-xs text-red-700 mt-1">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Section */}
            {(totalLowStock > 0 || totalOutOfStock > 0) && (
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    {/* Low Stock */}
                    {totalLowStock > 0 && (
                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Low Stock Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {lowStockItems.slice(0, 5).map((variant) => (
                                        <div key={variant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                {variant.products?.images?.[0] && (
                                                    <img
                                                        src={variant.products.images[0]}
                                                        alt={variant.products.name}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{variant.products?.name}</p>
                                                    <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                                {variant.stock_quantity} left
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Out of Stock */}
                    {totalOutOfStock > 0 && (
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-800">
                                    <TrendingDown className="h-5 w-5" />
                                    Out of Stock
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {outOfStockItems.slice(0, 5).map((variant) => (
                                        <div key={variant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                {variant.products?.images?.[0] && (
                                                    <img
                                                        src={variant.products.images[0]}
                                                        alt={variant.products.name}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{variant.products?.name}</p>
                                                    <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                                                </div>
                                            </div>
                                            <Badge variant="destructive">
                                                Out of Stock
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* All Inventory Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>All Inventory</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by SKU or product name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="outline" onClick={loadInventoryData}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 font-medium">Product</th>
                                    <th className="text-left p-3 font-medium">SKU</th>
                                    <th className="text-center p-3 font-medium">Stock</th>
                                    <th className="text-center p-3 font-medium">Status</th>
                                    <th className="text-center p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVariants.map((variant) => (
                                    <tr key={variant.id} className="border-b hover:bg-muted/30">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                {variant.products?.images?.[0] && (
                                                    <img
                                                        src={variant.products.images[0]}
                                                        alt={variant.products.name}
                                                        className="w-12 h-12 rounded object-cover"
                                                    />
                                                )}
                                                <span className="font-medium">{variant.products?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{variant.sku}</code>
                                        </td>
                                        <td className="p-3 text-center">
                                            {editingId === variant.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                                        className="w-20 text-center"
                                                        min="0"
                                                    />
                                                    <Button size="sm" onClick={() => handleSaveStock(variant.id)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-lg font-semibold">{variant.stock_quantity}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {variant.stock_quantity === 0 ? (
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            ) : variant.stock_quantity <= 5 ? (
                                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                                    Low Stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                                    In Stock
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {editingId === variant.id ? null : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditStock(variant.id, variant.stock_quantity)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
