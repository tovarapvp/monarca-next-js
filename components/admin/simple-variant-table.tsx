"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, DollarSign } from "lucide-react"

export interface SimpleVariant {
    sku: string
    description: string
    price: number
    useBasePrice: boolean
    stock: number
}

interface SimpleVariantTableProps {
    variants: SimpleVariant[]
    setVariants: (variants: SimpleVariant[]) => void
    basePrice: number
    disabled?: boolean
}

export function SimpleVariantTable({
    variants,
    setVariants,
    basePrice,
    disabled = false
}: SimpleVariantTableProps) {
    // Add a new variant row
    const addVariant = () => {
        setVariants([
            ...variants,
            {
                sku: "",
                description: "",
                price: basePrice,
                useBasePrice: true,
                stock: 0
            }
        ])
    }

    // Remove a variant
    const removeVariant = (index: number) => {
        const updated = [...variants]
        updated.splice(index, 1)
        setVariants(updated)
    }

    // Update a specific variant field
    const updateVariant = (index: number, field: keyof SimpleVariant, value: any) => {
        const updated = [...variants]
        updated[index] = { ...updated[index], [field]: value }

        // If switching to use base price, update the price
        if (field === 'useBasePrice' && value === true) {
            updated[index].price = basePrice
        }

        setVariants(updated)
    }

    // Apply base price to all variants
    const applyBasePriceToAll = () => {
        const updated = variants.map(v => ({
            ...v,
            price: basePrice,
            useBasePrice: true
        }))
        setVariants(updated)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Variantes Simplificadas
                    </CardTitle>
                    {variants.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={applyBasePriceToAll}
                            disabled={disabled}
                        >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Aplicar Precio Base a Todas
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                    Agrega cada variante de tu producto (ej: #25 (T6), #33 (T7), etc.)
                </div>

                {/* Variants Table */}
                {variants.length > 0 && (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                            <div className="col-span-2">SKU/Código</div>
                            <div className="col-span-3">Descripción</div>
                            <div className="col-span-2">Precio ($)</div>
                            <div className="col-span-2">Usar Base</div>
                            <div className="col-span-2">Stock</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Variant Rows */}
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-lg">
                                {/* SKU */}
                                <div className="col-span-2">
                                    <Input
                                        placeholder="#25"
                                        value={variant.sku}
                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        disabled={disabled}
                                        className="h-9"
                                    />
                                </div>

                                {/* Description */}
                                <div className="col-span-3">
                                    <Input
                                        placeholder="(T6)"
                                        value={variant.description}
                                        onChange={(e) => updateVariant(index, 'description', e.target.value)}
                                        disabled={disabled}
                                        className="h-9"
                                    />
                                </div>

                                {/* Price */}
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={variant.price}
                                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                        disabled={disabled || variant.useBasePrice}
                                        className="h-9"
                                    />
                                </div>

                                {/* Use Base Price Checkbox */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <Checkbox
                                        checked={variant.useBasePrice}
                                        onCheckedChange={(checked) => updateVariant(index, 'useBasePrice', checked)}
                                        disabled={disabled}
                                    />
                                </div>

                                {/* Stock */}
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={variant.stock}
                                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                        disabled={disabled}
                                        className="h-9"
                                    />
                                </div>

                                {/* Delete Button */}
                                <div className="col-span-1 flex justify-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeVariant(index)}
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Variant Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    disabled={disabled}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Variante
                </Button>

                {/* Empty State */}
                {variants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground space-y-2">
                        <p className="text-sm">No hay variantes configuradas.</p>
                        <p className="text-xs">
                            Haz clic en "Agregar Variante" para comenzar.
                        </p>
                    </div>
                )}

                {/* Helper Text */}
                <div className="text-xs text-muted-foreground space-y-1 mt-4">
                    <p>💡 <strong>Consejos:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>El SKU puede ser el código del producto (#25, #33, etc.)</li>
                        <li>La descripción puede incluir la talla o características (T6, T7, T8)</li>
                        <li>Marca "Usar Base" para que la variante use el precio base del producto</li>
                        <li>Desmarca "Usar Base" si quieres un precio diferente para esa variante</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
