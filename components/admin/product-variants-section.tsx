"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, X } from "lucide-react"
import { NewVariant } from "@/hooks/use-variants"

interface ProductVariantsSectionProps {
    variants: NewVariant[]
    onChange: (variants: NewVariant[]) => void
    disabled?: boolean
}

export function ProductVariantsSection({ variants, onChange, disabled }: ProductVariantsSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [newVariant, setNewVariant] = useState<NewVariant>({
        name: "",
        value: "",
        price: null,
    })

    const addVariant = () => {
        if (!newVariant.name.trim() || !newVariant.value.trim()) return

        onChange([...variants, { ...newVariant }])
        setNewVariant({ name: "", value: "", price: null })
        setShowAddForm(false)
    }

    const removeVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index))
    }

    const updateVariant = (index: number, field: keyof NewVariant, value: string | number | null) => {
        const updated = [...variants]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    // Group variants by name for display
    const groupedVariants: Record<string, NewVariant[]> = variants.reduce((acc, variant) => {
        const key = variant.name
        if (!acc[key]) acc[key] = []
        acc[key].push(variant)
        return acc
    }, {} as Record<string, NewVariant[]>)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Product Variants</CardTitle>
                    {!showAddForm && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddForm(true)}
                            disabled={disabled}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Variant
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Existing Variants */}
                {Object.keys(groupedVariants).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedVariants).map(([name, items]) => (
                            <div key={name} className="border rounded-lg p-4">
                                <h4 className="font-medium text-sm text-gray-700 mb-3">{name}</h4>
                                <div className="space-y-2">
                                    {items.map((variant, idx) => {
                                        const globalIndex = variants.findIndex(
                                            v => v.name === variant.name && v.value === variant.value && v.price === variant.price
                                        )
                                        return (
                                            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-md p-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={variant.value}
                                                        onChange={(e) => updateVariant(globalIndex, 'value', e.target.value)}
                                                        placeholder="Value"
                                                        disabled={disabled}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={variant.price || ""}
                                                        onChange={(e) => updateVariant(
                                                            globalIndex,
                                                            'price',
                                                            e.target.value ? parseFloat(e.target.value) : null
                                                        )}
                                                        placeholder="Price"
                                                        disabled={disabled}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVariant(globalIndex)}
                                                    disabled={disabled}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !showAddForm && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No variants added yet. Add variants for options like Size, Color, etc.
                        </p>
                    )
                )}

                {/* Add New Variant Form */}
                {showAddForm && (
                    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Add New Variant</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewVariant({ name: "", value: "", price: null })
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="variantName">Variant Type *</Label>
                                <Input
                                    id="variantName"
                                    value={newVariant.name}
                                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                                    placeholder="e.g., Size, Color"
                                    list="variant-types"
                                />
                                <datalist id="variant-types">
                                    <option value="Size" />
                                    <option value="Color" />
                                    <option value="Material" />
                                    <option value="Length" />
                                    <option value="Style" />
                                </datalist>
                            </div>
                            <div>
                                <Label htmlFor="variantValue">Value *</Label>
                                <Input
                                    id="variantValue"
                                    value={newVariant.value}
                                    onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                                    placeholder="e.g., Large, Red"
                                />
                            </div>
                            <div>
                                <Label htmlFor="variantPrice">Price Override (optional)</Label>
                                <Input
                                    id="variantPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newVariant.price || ""}
                                    onChange={(e) => setNewVariant({
                                        ...newVariant,
                                        price: e.target.value ? parseFloat(e.target.value) : null
                                    })}
                                    placeholder="Leave empty for base price"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewVariant({ name: "", value: "", price: null })
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={addVariant}
                                disabled={!newVariant.name.trim() || !newVariant.value.trim()}
                            >
                                Add Variant
                            </Button>
                        </div>
                    </div>
                )}

                {/* Quick Add Buttons for Common Variants */}
                {!showAddForm && variants.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                        <p className="text-xs text-muted-foreground w-full mb-1">Quick add:</p>
                        {[
                            { name: "Size", value: "S" },
                            { name: "Size", value: "M" },
                            { name: "Size", value: "L" },
                            { name: "Color", value: "Gold" },
                            { name: "Color", value: "Silver" },
                        ].map((quick, idx) => (
                            <Button
                                key={idx}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => onChange([...variants, { ...quick, price: null }])}
                                disabled={disabled}
                            >
                                {quick.name}: {quick.value}
                            </Button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
