"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createOrderWithItems, NewOrderItem } from "@/hooks/use-orders"
import { useProducts } from "@/hooks/use-products"
import { useProductVariants } from "@/hooks/use-product-variants"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

interface OrderLineItem extends NewOrderItem {
    product_name: string
    product_image: string
    variant_id?: string
    variant_sku?: string
}

export default function NewOrderPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { products, loading: productsLoading } = useProducts()
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showProductSearch, setShowProductSearch] = useState(false)

    const [orderData, setOrderData] = useState({
        customer_name: "",
        customer_email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        notes: "",
        status: "pending" as const,
    })

    const [items, setItems] = useState<OrderLineItem[]>([])
    const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
    const [showVariantsDialog, setShowVariantsDialog] = useState(false)

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Fetch variants for selected product
    const [productVariants, setProductVariants] = useState<any[]>([])
    const [loadingVariants, setLoadingVariants] = useState(false)

    const handleProductClick = async (product: typeof products[0]) => {
        setSelectedProduct(product)
        setLoadingVariants(true)

        // Fetch variants
        const { data: variants } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)

        if (variants && variants.length > 0) {
            setProductVariants(variants)
            setShowVariantsDialog(true)
        } else {
            // No variants, add product directly
            addProductWithoutVariant(product)
        }
        setLoadingVariants(false)
    }

    const addProductWithoutVariant = (product: typeof products[0]) => {
        const existingIndex = items.findIndex(item => item.product_id === product.id && !item.variant_id)
        if (existingIndex >= 0) {
            const updated = [...items]
            updated[existingIndex].quantity += 1
            setItems(updated)
        } else {
            setItems([...items, {
                product_id: product.id,
                product_name: product.name,
                product_image: product.images?.[0] || "",
                quantity: 1,
                price_at_purchase: product.price,
            }])
        }
        setShowProductSearch(false)
        setSearchQuery("")
    }

    const addProductWithVariant = (variant: any) => {
        if (!selectedProduct) return

        const existingIndex = items.findIndex(item => item.variant_id === variant.id)
        if (existingIndex >= 0) {
            const updated = [...items]
            updated[existingIndex].quantity += 1
            setItems(updated)
        } else {
            setItems([...items, {
                product_id: selectedProduct.id,
                variant_id: variant.id,
                product_name: `${selectedProduct.name}${variant.sku ? ` - ${variant.sku}` : ''}`,
                product_image: variant.images?.[0] || selectedProduct.images?.[0] || "",
                variant_sku: variant.sku || 'N/A',
                quantity: 1,
                price_at_purchase: variant.price || selectedProduct.price,
            }])
        }
        setShowVariantsDialog(false)
        setShowProductSearch(false)
        setSearchQuery("")
        setSelectedProduct(null)
    }

    const updateItemQuantity = (index: number, quantity: number) => {
        if (quantity < 1) return
        const updated = [...items]
        updated[index].quantity = quantity
        setItems(updated)
    }

    const updateItemPrice = (index: number, price: number) => {
        const updated = [...items]
        updated[index].price_at_purchase = price
        setItems(updated)
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!orderData.customer_name || !orderData.customer_email) {
            toast({
                title: "Validation Error",
                description: "Customer name and email are required",
                variant: "destructive",
            })
            return
        }

        if (items.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please add at least one product",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const order = await createOrderWithItems(
                {
                    customer_name: orderData.customer_name,
                    customer_email: orderData.customer_email,
                    status: orderData.status,
                    total: calculateTotal(),
                    shipping_address: {
                        address: orderData.address,
                        city: orderData.city,
                        state: orderData.state,
                        zip: orderData.zip,
                        country: orderData.country,
                        phone: orderData.phone,
                    },
                    notes: orderData.notes,
                },
                items.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price_at_purchase: item.price_at_purchase,
                }))
            )

            toast({
                title: "Order Created",
                description: `Order #${order.id.slice(0, 8)} has been created successfully.`,
            })

            router.push("/admin/orders")
        } catch (error: any) {
            console.error("Error creating order:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to create order. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/orders">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Create Manual Order</h1>
                    <p className="text-gray-600 mt-1">Create an order on behalf of a customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="customer_name">Customer Name *</Label>
                                        <Input
                                            id="customer_name"
                                            value={orderData.customer_name}
                                            onChange={(e) => setOrderData({ ...orderData, customer_name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="customer_email">Email *</Label>
                                        <Input
                                            id="customer_email"
                                            type="email"
                                            value={orderData.customer_email}
                                            onChange={(e) => setOrderData({ ...orderData, customer_email: e.target.value })}
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={orderData.phone}
                                        onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input
                                        id="address"
                                        value={orderData.address}
                                        onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                                        placeholder="123 Main St"
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={orderData.city}
                                            onChange={(e) => setOrderData({ ...orderData, city: e.target.value })}
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            value={orderData.state}
                                            onChange={(e) => setOrderData({ ...orderData, state: e.target.value })}
                                            placeholder="NY"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="zip">ZIP/Postal Code</Label>
                                        <Input
                                            id="zip"
                                            value={orderData.zip}
                                            onChange={(e) => setOrderData({ ...orderData, zip: e.target.value })}
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        value={orderData.country}
                                        onValueChange={(value) => setOrderData({ ...orderData, country: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="CA">Canada</SelectItem>
                                            <SelectItem value="MX">Mexico</SelectItem>
                                            <SelectItem value="VE">Venezuela</SelectItem>
                                            <SelectItem value="CO">Colombia</SelectItem>
                                            <SelectItem value="ES">Spain</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Order Items</CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowProductSearch(!showProductSearch)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Product
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Product Search */}
                                {showProductSearch && (
                                    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search products..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {productsLoading ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                                </div>
                                            ) : filteredProducts.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center py-4">No products found</p>
                                            ) : (
                                                filteredProducts.slice(0, 10).map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="flex items-center gap-3 p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleProductClick(product)}
                                                    >
                                                        {product.images?.[0] && (
                                                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                                                <Image
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{product.name}</p>
                                                            <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="sm">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Items List */}
                                {items.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-6">
                                        No items added yet. Click &quot;Add Product&quot; to add items.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                                {item.product_image && (
                                                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{item.product_name}</p>
                                                    {item.variant_sku && (
                                                        <p className="text-xs text-gray-500">SKU: {item.variant_sku}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                            className="text-center"
                                                        />
                                                    </div>
                                                    <span className="text-gray-400">×</span>
                                                    <div className="w-24">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.price_at_purchase}
                                                            onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                    <span className="font-semibold w-20 text-right">
                                                        ${(item.quantity * item.price_at_purchase).toFixed(2)}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Variants Dialog */}
                        <Dialog open={showVariantsDialog} onOpenChange={setShowVariantsDialog}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Select Variant for {selectedProduct?.name}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {loadingVariants ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                        </div>
                                    ) : productVariants.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">
                                            No variants found
                                        </p>
                                    ) : (
                                        productVariants.map((variant) => {
                                            const stockQty = variant.stock_quantity || 0
                                            const isLowStock = stockQty > 0 && stockQty <= 5
                                            const isOutOfStock = stockQty <= 0

                                            return (
                                                <div
                                                    key={variant.id}
                                                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${isOutOfStock
                                                            ? 'bg-gray-50 cursor-not-allowed opacity-60'
                                                            : 'hover:bg-gray-50 cursor-pointer hover:border-primary'
                                                        }`}
                                                    onClick={() => !isOutOfStock && addProductWithVariant(variant)}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-base">{variant.sku || 'No SKU'}</p>
                                                            {isOutOfStock && (
                                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                                                    Out of Stock
                                                                </span>
                                                            )}
                                                            {isLowStock && (
                                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                                                    Low Stock
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Stock: <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
                                                                }`}>{stockQty}</span> {variant.unit_type || 'units'}
                                                        </p>
                                                        {variant.pricing_type === 'per_unit' && variant.unit_type && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Sold by {variant.unit_type}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right mx-4">
                                                        <p className="text-lg font-bold text-primary">
                                                            ${(variant.price || 0).toFixed(2)}
                                                        </p>
                                                        {variant.pricing_type === 'per_unit' && (
                                                            <p className="text-xs text-gray-500">per {variant.unit_type}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isOutOfStock}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add
                                                    </Button>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={orderData.notes}
                                    onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                                    placeholder="Internal notes about this order..."
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={orderData.status}
                                    onValueChange={(value: typeof orderData.status) => setOrderData({ ...orderData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inquiry">Inquiry</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items ({items.reduce((sum, i) => sum + i.quantity, 0)})</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span className="text-lg">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading || items.length === 0}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Order...
                                </>
                            ) : (
                                "Create Order"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
