"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { ProductVariant } from "@/hooks/use-product-variants"

interface VariantListProps {
    productName: string
    variants: ProductVariant[]
    onAddToCart: (selectedVariants: { variant: ProductVariant; quantity: number }[]) => void
    disabled?: boolean
}

export function VariantList({
    productName,
    variants,
    onAddToCart,
    disabled = false
}: VariantListProps) {
    // Track quantities for each variant
    const [quantities, setQuantities] = useState<Record<string, number>>(
        variants.reduce((acc, v) => ({ ...acc, [v.id]: 0 }), {})
    )

    // Update quantity for a variant
    const updateQuantity = (variantId: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[variantId] || 0
            const newValue = Math.max(0, current + delta)
            return { ...prev, [variantId]: newValue }
        })
    }

    // Set quantity directly
    const setQuantity = (variantId: string, value: number) => {
        setQuantities(prev => ({
            ...prev,
            [variantId]: Math.max(0, value)
        }))
    }

    // Handle add to cart
    const handleAddToCart = () => {
        const selectedVariants = variants
            .map(variant => ({
                variant,
                quantity: quantities[variant.id] || 0
            }))
            .filter(item => item.quantity > 0)

        if (selectedVariants.length > 0) {
            onAddToCart(selectedVariants)
            // Reset quantities after adding to cart
            setQuantities(variants.reduce((acc, v) => ({ ...acc, [v.id]: 0 }), {}))
        }
    }

    // Check if variant is available
    const isVariantAvailable = (variant: ProductVariant): boolean => {
        if (!variant.is_available) return false
        if (!variant.track_inventory) return true
        if (variant.stock_quantity <= 0 && !variant.allow_backorder) return false
        return true
    }

    // Get stock status text
    const getStockStatus = (variant: ProductVariant): string | null => {
        if (!variant.is_available) return "No disponible"
        if (!variant.track_inventory) return null
        if (variant.stock_quantity <= 0) {
            return variant.allow_backorder ? "Bajo pedido" : "Agotado"
        }
        if (variant.stock_quantity < 5) {
            return `Solo ${variant.stock_quantity} disponibles`
        }
        return null
    }

    // Get display price for variant
    const getDisplayPrice = (variant: ProductVariant): number => {
        if (variant.pricing_type === 'per_unit' && variant.price_per_unit) {
            return variant.price_per_unit
        }
        return variant.price
    }

    // Build variant display name
    const getVariantDisplayName = (variant: ProductVariant): string => {
        if (variant.option_values && variant.option_values.length > 0) {
            const optionText = variant.option_values
                .map((ov: any) => `${ov.value}`)
                .join(' ')
            return `${productName} ${optionText}`
        }
        return variant.sku || productName
    }

    const hasAnySelection = Object.values(quantities).some(q => q > 0)

    if (variants.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">
                Variantes Disponibles ({variants.length})
            </div>

            {/* Variant List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {variants.map((variant) => {
                    const isAvailable = isVariantAvailable(variant)
                    const stockStatus = getStockStatus(variant)
                    const price = getDisplayPrice(variant)
                    const displayName = getVariantDisplayName(variant)
                    const quantity = quantities[variant.id] || 0

                    return (
                        <div
                            key={variant.id}
                            className={`
                border rounded-lg p-3 transition-all
                ${isAvailable ? 'bg-background hover:border-primary/50' : 'bg-muted/50 opacity-60'}
                ${quantity > 0 ? 'border-primary shadow-sm' : 'border-border'}
              `}
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* Variant Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-foreground truncate">
                                        {displayName}
                                    </div>
                                    {stockStatus && (
                                        <div className={`text-xs mt-0.5 ${isAvailable ? 'text-orange-600' : 'text-destructive'
                                            }`}>
                                            {stockStatus}
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    <div className="font-bold text-primary">
                                        ${price.toFixed(2)}
                                    </div>
                                    {variant.pricing_type === 'per_unit' && variant.unit_type && (
                                        <div className="text-xs text-muted-foreground">
                                            por {variant.unit_type}
                                        </div>
                                    )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => updateQuantity(variant.id, -1)}
                                        disabled={disabled || !isAvailable || quantity === 0}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>

                                    <input
                                        type="number"
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(variant.id, parseInt(e.target.value) || 0)}
                                        className="w-12 h-8 text-center border rounded text-sm"
                                        disabled={disabled || !isAvailable}
                                    />

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => updateQuantity(variant.id, 1)}
                                        disabled={disabled || !isAvailable}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Add to Cart Button */}
            <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={handleAddToCart}
                disabled={disabled || !hasAnySelection}
            >
                <ShoppingCart className="h-5 w-5" />
                {hasAnySelection
                    ? `Añadir al carrito (${Object.values(quantities).reduce((a, b) => a + b, 0)} items)`
                    : "Selecciona variantes"}
            </Button>
        </div>
    )
}
