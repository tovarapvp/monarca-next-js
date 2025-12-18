"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, ShoppingCart, Package, AlertCircle } from "lucide-react"
import { ProductVariant } from "@/hooks/use-product-variants"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"

interface VariantQuantity {
    variant: ProductVariant
    quantity: number
    displayName: string
}

interface VariantListSelectorProps {
    variants: ProductVariant[]
    productName: string
    productImage: string
    onAddToCart: (items: { variant: ProductVariant; quantity: number }[]) => void
    disabled?: boolean
}

export function VariantListSelector({
    variants,
    productName,
    productImage,
    onAddToCart,
    disabled = false,
}: VariantListSelectorProps) {
    const t = useTranslations()

    // Initialize quantities for all variants
    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {}
        variants.forEach(v => {
            initial[v.id] = 0
        })
        return initial
    })

    // Build display names from variant option values
    const variantDisplayNames = useMemo(() => {
        const names: Record<string, string> = {}
        variants.forEach(variant => {
            // Build name from option values
            const optionParts = variant.option_values?.map(ov => ov.value).join(' / ') || ''
            names[variant.id] = optionParts || variant.sku || productName
        })
        return names
    }, [variants, productName])

    // Get max quantity allowed for a variant based on stock
    const getMaxQuantity = useCallback((variant: ProductVariant): number => {
        if (!variant.track_inventory) return 9999
        if (variant.allow_backorder) return 9999
        return variant.stock_quantity || 0
    }, [])

    // Get stock status for display
    const getStockStatus = useCallback((variant: ProductVariant) => {
        if (!variant.is_available) {
            return { text: t('products.outOfStock'), color: 'destructive' as const, available: false }
        }
        if (!variant.track_inventory) {
            return { text: t('products.inStock'), color: 'default' as const, available: true }
        }
        if (variant.stock_quantity <= 0) {
            if (variant.allow_backorder) {
                return { text: 'Backorder', color: 'secondary' as const, available: true }
            }
            return { text: t('products.outOfStock'), color: 'destructive' as const, available: false }
        }
        if (variant.stock_quantity <= 5) {
            return { text: `${variant.stock_quantity} left`, color: 'outline' as const, available: true }
        }
        return { text: t('products.inStock'), color: 'default' as const, available: true }
    }, [t])

    const updateQuantity = useCallback((variantId: string, delta: number) => {
        const variant = variants.find(v => v.id === variantId)
        if (!variant) return

        const maxQty = getMaxQuantity(variant)
        setQuantities((prev: Record<string, number>) => {
            const newQty = Math.max(0, Math.min(maxQty, (prev[variantId] || 0) + delta))
            return {
                ...prev,
                [variantId]: newQty
            }
        })
    }, [variants, getMaxQuantity])

    const setQuantity = useCallback((variantId: string, qty: number) => {
        const variant = variants.find(v => v.id === variantId)
        if (!variant) return

        const maxQty = getMaxQuantity(variant)
        setQuantities((prev: Record<string, number>) => ({
            ...prev,
            [variantId]: Math.max(0, Math.min(maxQty, qty))
        }))
    }, [variants, getMaxQuantity])

    const totalItems = useMemo(() => {
        return Object.values(quantities).reduce((sum: number, qty: number) => sum + qty, 0)
    }, [quantities])

    const totalPrice = useMemo(() => {
        return variants.reduce((sum, variant) => {
            const qty = quantities[variant.id] || 0
            const price = variant.pricing_type === 'per_unit' && variant.price_per_unit
                ? variant.price_per_unit
                : variant.price
            return sum + (price * qty)
        }, 0)
    }, [variants, quantities])

    const handleAddAllToCart = () => {
        const itemsToAdd = variants
            .filter(v => (quantities[v.id] || 0) > 0)
            .map(v => ({
                variant: v,
                quantity: quantities[v.id]
            }))

        if (itemsToAdd.length > 0) {
            onAddToCart(itemsToAdd)
            // Reset quantities after adding
            setQuantities((prev: Record<string, number>) => {
                const reset: Record<string, number> = {}
                Object.keys(prev).forEach(k => { reset[k] = 0 })
                return reset
            })
        }
    }

    if (variants.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Available Variants</h3>
            </div>

            {/* Variant List */}
            <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto bg-card shadow-sm">
                {variants.map((variant) => {
                    const qty = quantities[variant.id] || 0
                    const displayName = variantDisplayNames[variant.id]
                    const price = variant.pricing_type === 'per_unit' && variant.price_per_unit
                        ? variant.price_per_unit
                        : variant.price
                    const stockStatus = getStockStatus(variant)
                    const isAvailable = stockStatus.available
                    const maxQty = getMaxQuantity(variant)

                    return (
                        <div
                            key={variant.id}
                            className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${!isAvailable ? 'opacity-60' : ''}`}
                        >
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-full"
                                    onClick={() => updateQuantity(variant.id, -1)}
                                    disabled={disabled || !isAvailable || qty === 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    min="0"
                                    max={maxQty}
                                    value={qty}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(variant.id, parseInt(e.target.value) || 0)}
                                    className="h-9 w-16 text-center font-semibold"
                                    disabled={disabled || !isAvailable}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-full"
                                    onClick={() => updateQuantity(variant.id, 1)}
                                    disabled={disabled || !isAvailable || qty >= maxQty}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Variant Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-sm">
                                        {displayName}
                                    </p>
                                    <Badge variant={stockStatus.color} className="text-xs">
                                        {stockStatus.text}
                                    </Badge>
                                </div>
                                {variant.sku && (
                                    <p className="text-xs text-muted-foreground mt-1">SKU: {variant.sku}</p>
                                )}
                                {qty > 0 && (
                                    <p className="text-xs text-primary font-medium mt-1">
                                        Subtotal: ${(price * qty).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                                <span className="font-bold text-lg text-primary">
                                    ${price.toFixed(2)}
                                </span>
                                {variant.pricing_type === 'per_unit' && variant.unit_type && (
                                    <span className="text-xs text-muted-foreground block">
                                        /{variant.unit_type}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Summary and Add to Cart */}
            {totalItems > 0 ? (
                <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Order Summary</p>
                            <p className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-bold text-2xl text-primary">${totalPrice.toFixed(2)}</p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="w-full gap-2 h-12 text-base font-semibold"
                        onClick={handleAddAllToCart}
                        disabled={disabled || totalItems === 0}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {t('product.addToCart')} ({totalItems})
                    </Button>
                </div>
            ) : (
                <div className="bg-muted/50 border border-dashed rounded-lg p-6 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                        Select quantities above to add items to your cart
                    </p>
                </div>
            )}
        </div>
    )
}
