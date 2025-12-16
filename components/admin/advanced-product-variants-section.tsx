"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, X, Trash2, Package, RefreshCw } from "lucide-react"
import { ProductOption, ProductOptionValue, ProductVariant, generateVariantCombinations } from "@/hooks/use-product-variants"

interface NewOption {
    name: string
    values: string[]
}

interface NewVariant {
    optionValues: { optionName: string; value: string }[]
    sku: string
    price: number
    compareAtPrice: number | null
    pricingType: 'fixed' | 'per_unit'
    unitType: string | null
    pricePerUnit: number | null
    minQuantity: number
    maxQuantity: number | null
    stockQuantity: number
    trackInventory: boolean
    isAvailable: boolean
}

interface ProductVariantsSectionProps {
    options: NewOption[]
    setOptions: (options: NewOption[]) => void
    variants: NewVariant[]
    setVariants: (variants: NewVariant[]) => void
    basePrice: number
    disabled?: boolean
}

const UNIT_TYPES = [
    { value: 'meter', label: 'Meters' },
    { value: 'yard', label: 'Yards' },
    { value: 'foot', label: 'Feet' },
    { value: 'centimeter', label: 'Centimeters' },
    { value: 'inch', label: 'Inches' },
    { value: 'kilogram', label: 'Kilograms' },
    { value: 'gram', label: 'Grams' },
    { value: 'pound', label: 'Pounds' },
    { value: 'liter', label: 'Liters' },
    { value: 'unit', label: 'Units' },
]

export function AdvancedProductVariantsSection({
    options,
    setOptions,
    variants,
    setVariants,
    basePrice,
    disabled = false
}: ProductVariantsSectionProps) {
    const [newOptionName, setNewOptionName] = useState("")
    const [newOptionValue, setNewOptionValue] = useState("")
    const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null)

    // Add a new option (Color, Size, etc.)
    const addOption = () => {
        if (!newOptionName.trim()) return
        if (options.some(o => o.name.toLowerCase() === newOptionName.toLowerCase())) return

        setOptions([...options, { name: newOptionName.trim(), values: [] }])
        setNewOptionName("")
        setActiveOptionIndex(options.length)
    }

    // Add a value to an option
    const addOptionValue = (optionIndex: number) => {
        if (!newOptionValue.trim()) return

        const updatedOptions = [...options]
        if (!updatedOptions[optionIndex].values.includes(newOptionValue.trim())) {
            updatedOptions[optionIndex].values.push(newOptionValue.trim())
            setOptions(updatedOptions)
        }
        setNewOptionValue("")
    }

    // Remove an option value
    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const updatedOptions = [...options]
        updatedOptions[optionIndex].values.splice(valueIndex, 1)
        setOptions(updatedOptions)
    }

    // Remove an entire option
    const removeOption = (index: number) => {
        const updatedOptions = [...options]
        updatedOptions.splice(index, 1)
        setOptions(updatedOptions)
        if (activeOptionIndex === index) setActiveOptionIndex(null)
    }

    // Generate all variant combinations
    const generateVariants = () => {
        const validOptions = options.filter(o => o.values.length > 0)
        if (validOptions.length === 0) {
            setVariants([])
            return
        }

        const combinations = generateAllCombinations(validOptions)
        const newVariants: NewVariant[] = combinations.map(combo => ({
            optionValues: combo,
            sku: generateSku(combo),
            price: basePrice,
            compareAtPrice: null,
            pricingType: 'fixed',
            unitType: null,
            pricePerUnit: null,
            minQuantity: 1,
            maxQuantity: null,
            stockQuantity: 0,
            trackInventory: true,
            isAvailable: true,
        }))

        setVariants(newVariants)
    }

    // Generate combinations recursively
    const generateAllCombinations = (opts: NewOption[]): { optionName: string; value: string }[][] => {
        if (opts.length === 0) return [[]]

        const [first, ...rest] = opts
        const restCombos = generateAllCombinations(rest)

        return first.values.flatMap(val =>
            restCombos.map(combo => [{ optionName: first.name, value: val }, ...combo])
        )
    }

    // Generate SKU from option values
    const generateSku = (optionValues: { optionName: string; value: string }[]): string => {
        return optionValues
            .map(ov => ov.value.slice(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, ''))
            .join('-')
    }

    // Update a specific variant field
    const updateVariant = (index: number, field: keyof NewVariant, value: any) => {
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

    // Apply price to all variants
    const applyPriceToAll = () => {
        const updated = variants.map(v => ({ ...v, price: basePrice }))
        setVariants(updated)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Variants (SKUs)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Options Section */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">1. Define Options (e.g., Color, Size, Width)</Label>

                    {/* Existing Options */}
                    <div className="space-y-3">
                        {options.map((option, optionIndex) => (
                            <div key={optionIndex} className="border rounded-lg p-4 bg-muted/30">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">{option.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(optionIndex)}
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                {/* Option Values */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {option.values.map((val, valIndex) => (
                                        <Badge key={valIndex} variant="secondary" className="flex items-center gap-1">
                                            {val}
                                            <button
                                                type="button"
                                                onClick={() => removeOptionValue(optionIndex, valIndex)}
                                                className="ml-1 hover:text-destructive"
                                                disabled={disabled}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>

                                {/* Add Value Input */}
                                {activeOptionIndex === optionIndex && (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={`Add ${option.name} value...`}
                                            value={newOptionValue}
                                            onChange={(e) => setNewOptionValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionValue(optionIndex))}
                                            disabled={disabled}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => addOptionValue(optionIndex)}
                                            disabled={disabled}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {activeOptionIndex !== optionIndex && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveOptionIndex(optionIndex)}
                                        disabled={disabled}
                                    >
                                        Add Values
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add New Option */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Option name (e.g., Color, Size, Width)"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                            disabled={disabled}
                        />
                        <Button type="button" onClick={addOption} disabled={disabled || !newOptionName.trim()}>
                            <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                    </div>
                </div>

                {/* Generate Variants Button */}
                {options.some(o => o.values.length > 0) && (
                    <div className="flex items-center gap-4 pt-4 border-t">
                        <Label className="text-base font-semibold">2. Generate SKU Variants</Label>
                        <Button
                            type="button"
                            onClick={generateVariants}
                            disabled={disabled}
                            variant="secondary"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate All Combinations
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            ({options.reduce((acc, o) => acc * Math.max(1, o.values.length), 1)} variants)
                        </span>
                    </div>
                )}

                {/* Variants Table */}
                {variants.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">3. Configure Each Variant</Label>
                            <Button type="button" variant="outline" size="sm" onClick={applyPriceToAll}>
                                Apply Base Price to All
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {variants.map((variant, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-background">
                                    {/* Variant Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {variant.optionValues.map((ov, i) => (
                                                <Badge key={i} variant="outline">
                                                    {ov.optionName}: {ov.value}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={variant.isAvailable}
                                                onCheckedChange={(checked) => updateVariant(index, 'isAvailable', checked)}
                                                disabled={disabled}
                                            />
                                            <span className="text-sm">{variant.isAvailable ? 'Available' : 'Unavailable'}</span>
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

                                    {/* Variant Fields */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label className="text-xs">SKU</Label>
                                            <Input
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                disabled={disabled}
                                                placeholder="SKU-001"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Price ($)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Stock Quantity</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.stockQuantity}
                                                onChange={(e) => updateVariant(index, 'stockQuantity', parseFloat(e.target.value) || 0)}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Pricing Type</Label>
                                            <Select
                                                value={variant.pricingType}
                                                onValueChange={(val) => updateVariant(index, 'pricingType', val)}
                                                disabled={disabled}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fixed">Fixed Price</SelectItem>
                                                    <SelectItem value="per_unit">Price Per Unit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Per-Unit Fields */}
                                    {variant.pricingType === 'per_unit' && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-dashed">
                                            <div>
                                                <Label className="text-xs">Unit Type</Label>
                                                <Select
                                                    value={variant.unitType || 'meter'}
                                                    onValueChange={(val) => updateVariant(index, 'unitType', val)}
                                                    disabled={disabled}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {UNIT_TYPES.map(ut => (
                                                            <SelectItem key={ut.value} value={ut.value}>
                                                                {ut.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Price Per Unit ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.pricePerUnit || ''}
                                                    onChange={(e) => updateVariant(index, 'pricePerUnit', parseFloat(e.target.value) || null)}
                                                    disabled={disabled}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Min Quantity</Label>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    value={variant.minQuantity}
                                                    onChange={(e) => updateVariant(index, 'minQuantity', parseFloat(e.target.value) || 1)}
                                                    disabled={disabled}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Max Quantity</Label>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    value={variant.maxQuantity || ''}
                                                    onChange={(e) => updateVariant(index, 'maxQuantity', parseFloat(e.target.value) || null)}
                                                    disabled={disabled}
                                                    placeholder="Unlimited"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {variants.length === 0 && options.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No variants configured yet.</p>
                        <p className="text-sm">Add options like Color, Size, or Width to create product variants.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
