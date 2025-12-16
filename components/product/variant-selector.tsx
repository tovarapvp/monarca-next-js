"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ProductOption, ProductVariant, findVariantByOptions } from "@/hooks/use-product-variants"

interface VariantSelectorProps {
    options: ProductOption[]
    variants: ProductVariant[]
    onVariantSelect: (variant: ProductVariant | null, selectedOptions: Record<string, string>) => void
    disabled?: boolean
}

export function VariantSelector({
    options,
    variants,
    onVariantSelect,
    disabled = false
}: VariantSelectorProps) {
    // Track selected option for each option type
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    // Find the currently selected variant based on selections
    const selectedVariant = useMemo(() => {
        const selectedCount = Object.keys(selectedOptions).length
        if (selectedCount !== options.length) return null
        return findVariantByOptions(variants, selectedOptions)
    }, [selectedOptions, options.length, variants])

    // Notify parent of selection changes
    useEffect(() => {
        onVariantSelect(selectedVariant, selectedOptions)
    }, [selectedVariant, selectedOptions, onVariantSelect])

    // Check if a specific option value is available (has at least one variant with stock)
    const isOptionValueAvailable = (optionName: string, optionValue: string): boolean => {
        // Create a partial selection including this value
        const partialSelection = { ...selectedOptions, [optionName]: optionValue }

        // Find variants that match this partial selection
        const matchingVariants = variants.filter(variant => {
            const variantValues = variant.option_values?.reduce((acc, ov: any) => {
                acc[ov.option_name || ov.optionName] = ov.value
                return acc
            }, {} as Record<string, string>) || {}

            // Check if all partial selections match
            return Object.entries(partialSelection).every(
                ([key, val]) => variantValues[key] === val
            )
        })

        // Available if at least one variant is available and has stock (or doesn't track inventory)
        return matchingVariants.some(v =>
            v.is_available &&
            (!v.track_inventory || v.stock_quantity > 0 || v.allow_backorder)
        )
    }

    // Handle option selection
    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions(prev => {
            // If selecting the same value, deselect it
            if (prev[optionName] === value) {
                const { [optionName]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [optionName]: value }
        })
    }

    // Get stock status label
    const getStockLabel = (variant: ProductVariant): { text: string; color: string } => {
        if (!variant.track_inventory) {
            return { text: "In Stock", color: "bg-green-100 text-green-800" }
        }

        if (variant.stock_quantity <= 0) {
            if (variant.allow_backorder) {
                return { text: "Backorder", color: "bg-yellow-100 text-yellow-800" }
            }
            return { text: "Out of Stock", color: "bg-red-100 text-red-800" }
        }

        if (variant.stock_quantity < 5) {
            return { text: `Only ${variant.stock_quantity} left`, color: "bg-orange-100 text-orange-800" }
        }

        return { text: "In Stock", color: "bg-green-100 text-green-800" }
    }

    if (options.length === 0) return null

    return (
        <div className="space-y-4">
            {options.map((option) => (
                <div key={option.id}>
                    <Label className="text-sm font-medium mb-2 block">
                        {option.name}
                        {selectedOptions[option.name] && (
                            <span className="ml-2 text-muted-foreground font-normal">
                                : {selectedOptions[option.name]}
                            </span>
                        )}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {option.values?.map((value) => {
                            const isSelected = selectedOptions[option.name] === value.value
                            const isAvailable = isOptionValueAvailable(option.name, value.value)

                            return (
                                <button
                                    key={value.id}
                                    type="button"
                                    disabled={disabled || !isAvailable}
                                    onClick={() => handleOptionSelect(option.name, value.value)}
                                    className={`
                                        px-4 py-2 rounded-lg border transition-all
                                        ${isSelected
                                            ? "border-primary bg-primary/10 text-primary font-medium ring-2 ring-primary ring-offset-1"
                                            : isAvailable
                                                ? "border-border hover:border-primary/50"
                                                : "border-border/50 text-muted-foreground/50 line-through cursor-not-allowed"
                                        }
                                    `}
                                >
                                    {value.value}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Selected Variant Info */}
            {selectedVariant && (
                <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">SKU:</span>
                        <span className="font-mono text-sm">{selectedVariant.sku || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Availability:</span>
                        <Badge className={getStockLabel(selectedVariant).color}>
                            {getStockLabel(selectedVariant).text}
                        </Badge>
                    </div>
                    {selectedVariant.pricing_type === 'per_unit' && selectedVariant.unit_type && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Sold by:</span>
                            <span className="text-sm capitalize">{selectedVariant.unit_type}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Incomplete Selection Message */}
            {Object.keys(selectedOptions).length > 0 &&
                Object.keys(selectedOptions).length < options.length && (
                    <p className="text-sm text-muted-foreground italic">
                        Please select all options to see availability
                    </p>
                )}
        </div>
    )
}
