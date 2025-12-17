"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { ProductVariant } from "@/hooks/use-product-variants"
import { useTranslations } from "next-intl"

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
            names[variant.id] = optionParts ? `${productName} (${optionParts})` : productName
        })
        return names
    }, [variants, productName])

    const updateQuantity = useCallback((variantId: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [variantId]: Math.max(0, (prev[variantId] || 0) + delta)
        }))
    }, [])

    const setQuantity = useCallback((variantId: string, qty: number) => {
        setQuantities(prev => ({
            ...prev,
            [variantId]: Math.max(0, qty)
        }))
    }, [])

    const totalItems = useMemo(() => {
        return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
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
            setQuantities(prev => {
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
            {/* Variant List */}
            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                {variants.map((variant) => {
                    const qty = quantities[variant.id] || 0
                    const displayName = variantDisplayNames[variant.id]
                    const price = variant.pricing_type === 'per_unit' && variant.price_per_unit
                        ? variant.price_per_unit
                        : variant.price
                    const isAvailable = variant.is_available &&
                        (!variant.track_inventory || variant.stock_quantity > 0 || variant.allow_backorder)

                    return (
                        <div
                            key={variant.id}
                            className={`flex items-center gap-4 p-3 ${!isAvailable ? 'opacity-50' : ''}`}
                        >
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(variant.id, -1)}
                                    disabled={disabled || !isAvailable || qty === 0}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                    type="number"
                                    min="0"
                                    value={qty}
                                    onChange={(e) => setQuantity(variant.id, parseInt(e.target.value) || 0)}
                                    className="h-8 w-14 text-center px-1"
                                    disabled={disabled || !isAvailable}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(variant.id, 1)}
                                    disabled={disabled || !isAvailable}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Variant Name */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                    {displayName}
                                </p>
                                {variant.sku && (
                                    <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                                )}
                                {!isAvailable && (
                                    <p className="text-xs text-red-500">{t('products.outOfStock')}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                                <span className="font-semibold text-primary">
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
            {totalItems > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span>{t('cart.total')} ({totalItems} items):</span>
                        <span className="font-bold text-lg text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleAddAllToCart}
                        disabled={disabled || totalItems === 0}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {t('product.addToCart')} ({totalItems})
                    </Button>
                </div>
            )}

            {totalItems === 0 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                    {t('product.selectVariant', { name: '' })}
                </p>
            )}
        </div>
    )
}
