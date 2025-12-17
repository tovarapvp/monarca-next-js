"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Package } from "lucide-react"

export interface DirectVariant {
    name: string
    sku: string
    price: number
    stockQuantity: number
    isAvailable: boolean
}

interface DirectVariantsSectionProps {
    variants: DirectVariant[]
    setVariants: (variants: DirectVariant[]) => void
    basePrice: number
    disabled?: boolean
}

export function DirectVariantsSection({
    variants,
    setVariants,
    basePrice,
    disabled = false
}: DirectVariantsSectionProps) {
    const [newVariantName, setNewVariantName] = useState("")

    // Add a new variant
    const addVariant = () => {
        if (!newVariantName.trim()) return

        const newVariant: DirectVariant = {
            name: newVariantName.trim(),
            sku: generateSku(newVariantName.trim()),
            price: basePrice,
            stockQuantity: 0,
            isAvailable: true,
        }

        setVariants([...variants, newVariant])
        setNewVariantName("")
    }

    // Generate SKU from name
    const generateSku = (name: string): string => {
        return name
            .slice(0, 15)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
    }

    // Update a specific variant field
    const updateVariant = (index: number, field: keyof DirectVariant, value: any) => {
        const updated = [...variants]
        updated[index] = { ...updated[index], [field]: value }
        setVariants(updated)
    }

    // Remove a variant
    const removeVariant = (index: number) => {
        const updated = [...variants]
        updated.splice(index, 1)
        setVariants(updated)
    }

    // Apply base price to all variants
    const applyPriceToAll = () => {
        const updated = variants.map(v => ({ ...v, price: basePrice }))
        setVariants(updated)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Variantes del Producto
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add New Variant */}
                <div className="space-y-2">
                    <Label>Agregar Nueva Variante</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nombre de la variante (ej: T6, T7, Rojo, Grande)"
                            value={newVariantName}
                            onChange={(e) => setNewVariantName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                            disabled={disabled}
                        />
                        <Button
                            type="button"
                            onClick={addVariant}
                            disabled={disabled || !newVariantName.trim()}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                        </Button>
                    </div>
                </div>

                {/* Variants List */}
                {variants.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                                Variantes ({variants.length})
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={applyPriceToAll}
                                disabled={disabled}
                            >
                                Aplicar Precio Base a Todas
                            </Button>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm font-medium">
                            <div className="col-span-4">Nombre</div>
                            <div className="col-span-2">SKU</div>
                            <div className="col-span-2">Precio</div>
                            <div className="col-span-2">Stock</div>
                            <div className="col-span-1">Activo</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Variants Rows */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg bg-background"
                                >
                                    <div className="col-span-4">
                                        <Input
                                            value={variant.name}
                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                            disabled={disabled}
                                            placeholder="Nombre"
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                            disabled={disabled}
                                            placeholder="SKU"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={variant.price}
                                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                            disabled={disabled}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            value={variant.stockQuantity}
                                            onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                                            disabled={disabled}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Switch
                                            checked={variant.isAvailable}
                                            onCheckedChange={(checked) => updateVariant(index, 'isAvailable', checked)}
                                            disabled={disabled}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            disabled={disabled}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {variants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay variantes configuradas.</p>
                        <p className="text-sm">Agrega variantes como tallas, colores o modelos.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
