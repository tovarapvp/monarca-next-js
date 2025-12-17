"use client"

import { useState, useRef } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createProduct } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import { ArrowLeft, Upload, Loader2, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadMultipleImages } from "@/lib/image-upload"
import Image from "next/image"
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog"
import { AdvancedProductVariantsSection } from "@/components/admin/advanced-product-variants-section"
import { createProductOption, createOptionValue, createProductVariant } from "@/hooks/use-product-variants"
import { useTranslations } from "next-intl"

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

export default function NewProduct() {
    const t = useTranslations('admin.products')
    const tCommon = useTranslations('common')
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        material: "",
        color: "",
        size: "",
        tags: "",
        weight_grams: "",
        care_instructions: "",
        shipping_info: "",
        in_stock: true,
        pricing_type: "fixed" as "fixed" | "per_unit",
        unit_type: "",
        price_per_unit: "",
        min_quantity: "1",
        max_quantity: "",
    })
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingImages, setIsUploadingImages] = useState(false)
    const [productOptions, setProductOptions] = useState<NewOption[]>([])
    const [productVariants, setProductVariants] = useState<NewVariant[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { toast } = useToast()
    const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories()

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const newFiles = [...imageFiles, ...files].slice(0, 5)
        setImageFiles(newFiles)

        const previews = newFiles.map(file => URL.createObjectURL(file))
        setImagePreviews(previews)
    }

    const removeImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index)
        const newPreviews = imagePreviews.filter((_, i) => i !== index)

        URL.revokeObjectURL(imagePreviews[index])

        setImageFiles(newFiles)
        setImagePreviews(newPreviews)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast({
                title: tCommon('error'),
                description: t('productName'),
                variant: "destructive",
            })
            return
        }

        if (!formData.category) {
            toast({
                title: tCommon('error'),
                description: t('category'),
                variant: "destructive",
            })
            return
        }

        if (formData.pricing_type === "fixed") {
            if (!formData.price || parseFloat(formData.price) <= 0) {
                toast({
                    title: tCommon('error'),
                    description: t('price'),
                    variant: "destructive",
                })
                return
            }
        } else if (formData.pricing_type === "per_unit") {
            if (!formData.unit_type) {
                toast({
                    title: tCommon('error'),
                    description: "Unit type required",
                    variant: "destructive",
                })
                return
            }
            if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
                toast({
                    title: tCommon('error'),
                    description: t('price'),
                    variant: "destructive",
                })
                return
            }
        }

        setIsLoading(true)

        try {
            let imageUrls: string[] = []
            if (imageFiles.length > 0) {
                setIsUploadingImages(true)
                toast({
                    title: tCommon('loading'),
                    description: "Uploading images...",
                })
                imageUrls = await uploadMultipleImages(imageFiles, 'product-images', 'products')
            }

            const tagsArray = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : null

            const product = await createProduct({
                name: formData.name,
                description: formData.description || null,
                price: formData.price ? parseFloat(formData.price) : (formData.pricing_type === "per_unit" && formData.price_per_unit ? parseFloat(formData.price_per_unit) : 0),
                category: formData.category || null,
                material: formData.material || null,
                color: formData.color || null,
                size: formData.size || null,
                tags: tagsArray,
                weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
                images: imageUrls.length > 0 ? imageUrls : null,
                in_stock: formData.in_stock,
                details: null,
                care_instructions: formData.care_instructions || null,
                shipping_info: formData.shipping_info || null,
                pricing_type: formData.pricing_type,
                unit_type: formData.pricing_type === "per_unit" ? formData.unit_type : null,
                price_per_unit: formData.pricing_type === "per_unit" && formData.price_per_unit
                    ? parseFloat(formData.price_per_unit)
                    : null,
                min_quantity: formData.min_quantity ? parseFloat(formData.min_quantity) : 1,
                max_quantity: formData.max_quantity ? parseFloat(formData.max_quantity) : null,
                has_variants: productVariants.length > 0,
                created_at: new Date().toISOString(),
            })

            if (productOptions.length > 0 && productVariants.length > 0 && product) {
                const optionValueMap: Record<string, Record<string, string>> = {}

                for (let i = 0; i < productOptions.length; i++) {
                    const opt = productOptions[i]
                    const createdOption = await createProductOption(product.id, opt.name, i)
                    optionValueMap[opt.name] = {}

                    for (let j = 0; j < opt.values.length; j++) {
                        const val = opt.values[j]
                        const createdValue = await createOptionValue(createdOption.id, val, j)
                        optionValueMap[opt.name][val] = createdValue.id
                    }
                }

                for (const variant of productVariants) {
                    const optionValueIds = variant.optionValues
                        .map(ov => optionValueMap[ov.optionName]?.[ov.value])
                        .filter(Boolean) as string[]

                    await createProductVariant(product.id, {
                        sku: variant.sku,
                        price: variant.price,
                        compare_at_price: variant.compareAtPrice,
                        pricing_type: variant.pricingType,
                        unit_type: variant.unitType,
                        price_per_unit: variant.pricePerUnit,
                        min_quantity: variant.minQuantity,
                        max_quantity: variant.maxQuantity,
                        stock_quantity: variant.stockQuantity,
                        track_inventory: variant.trackInventory,
                        is_available: variant.isAvailable,
                    }, optionValueIds)
                }
            }

            toast({
                title: tCommon('success'),
                description: t('saveProduct'),
            })

            router.push("/admin/products")
        } catch (error) {
            console.error("Error creating product:", error)
            toast({
                title: tCommon('error'),
                description: tCommon('error'),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsUploadingImages(false)
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/products">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {tCommon('goBack')}
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">{t('addProduct')}</h1>
                    <p className="text-gray-600 mt-1">{t('title')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('productName')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">{t('productName')} *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Gold Pendant Necklace"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">{t('description')}</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the product..."
                                        rows={4}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="category">{t('category')} *</Label>
                                            <CreateCategoryDialog
                                                onCategoryCreated={(categoryId) => {
                                                    refetchCategories()
                                                    setFormData({ ...formData, category: categoryId })
                                                }}
                                            />
                                        </div>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={categoriesLoading ? tCommon('loading') : t('category')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input
                                            id="tags"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="luxury, handmade, gift"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('price')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="pricing_type">Pricing Type</Label>
                                    <Select
                                        value={formData.pricing_type}
                                        onValueChange={(value: "fixed" | "per_unit") =>
                                            setFormData({ ...formData, pricing_type: value })
                                        }
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

                                {formData.pricing_type === "fixed" ? (
                                    <div>
                                        <Label htmlFor="price">{t('price')} (USD) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="unit_type">Unit Type *</Label>
                                                <Select
                                                    value={formData.unit_type}
                                                    onValueChange={(value) => setFormData({ ...formData, unit_type: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="meter">Meter</SelectItem>
                                                        <SelectItem value="yard">Yard</SelectItem>
                                                        <SelectItem value="foot">Foot</SelectItem>
                                                        <SelectItem value="centimeter">Centimeter</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="price_per_unit">Price Per Unit *</Label>
                                                <Input
                                                    id="price_per_unit"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.price_per_unit}
                                                    onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <AdvancedProductVariantsSection
                            options={productOptions}
                            setOptions={setProductOptions}
                            variants={productVariants}
                            setVariants={setProductVariants}
                            basePrice={parseFloat(formData.price) || 0}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('images')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={imageFiles.length >= 5}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {imageFiles.length === 0 ? "Upload Images" : `Add More (${imageFiles.length}/5)`}
                                    </Button>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <Image
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('stock')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="in_stock" className="cursor-pointer">
                                        {t('active')}
                                    </Label>
                                    <Switch
                                        id="in_stock"
                                        checked={formData.in_stock}
                                        onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={isLoading || isUploadingImages} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {tCommon('loading')}
                                </>
                            ) : (
                                t('saveProduct')
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
