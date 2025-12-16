"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

    // Form validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    // Validate pricing based on pricing type
    if (formData.pricing_type === "fixed") {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid price",
          variant: "destructive",
        })
        return
      }
    } else if (formData.pricing_type === "per_unit") {
      if (!formData.unit_type) {
        toast({
          title: "Validation Error",
          description: "Please select a unit type for per-unit pricing",
          variant: "destructive",
        })
        return
      }
      if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid price per unit",
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
          title: "Uploading images...",
          description: "Compressing and uploading your images",
        })
        imageUrls = await uploadMultipleImages(imageFiles, 'product-images', 'products')
      }

      // Parse tags from comma-separated string
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

      // Create options and variants if any
      if (productOptions.length > 0 && productVariants.length > 0 && product) {
        // Create a map to store option value IDs by their name
        const optionValueMap: Record<string, Record<string, string>> = {}

        // First, create all options and their values
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

        // Then, create all variants with their option value links
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
        title: "Product created",
        description: "The product has been successfully added.",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: "There was an error creating the product. Please try again.",
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
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product with complete details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Gold Pendant Necklace"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
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
                      <Label htmlFor="category">Category *</Label>
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
                        <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
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
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
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

            {/* Product Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., 18k Gold"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g., Rose Gold"
                    />
                  </div>

                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g., Medium, 45cm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight_grams}
                    onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                    placeholder="e.g., 8.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Configuration</CardTitle>
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
                      <SelectItem value="per_unit">Price Per Unit (for ribbons, fabrics, etc.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pricing_type === "fixed" ? (
                  <div>
                    <Label htmlFor="price">Price (USD) *</Label>
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
                    <p className="text-sm text-blue-800 font-medium">Per-Unit Pricing Configuration</p>

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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="min_quantity">Minimum Quantity</Label>
                        <Input
                          id="min_quantity"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.min_quantity}
                          onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="max_quantity">Maximum Quantity (optional)</Label>
                        <Input
                          id="max_quantity"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.max_quantity}
                          onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="base_price">Base Display Price (optional)</Label>
                      <Input
                        id="base_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="Optional starting price"
                      />
                      <p className="text-xs text-blue-700 mt-1">
                        This will be shown as a starting price. Actual price calculated based on quantity.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Variants (SKUs) */}
            <AdvancedProductVariantsSection
              options={productOptions}
              setOptions={setProductOptions}
              variants={productVariants}
              setVariants={setProductVariants}
              basePrice={parseFloat(formData.price) || 0}
              disabled={isLoading}
            />

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="care">Care Instructions</Label>
                  <Textarea
                    id="care"
                    value={formData.care_instructions}
                    onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                    placeholder="How to care for this product..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping">Shipping Information</Label>
                  <Textarea
                    id="shipping"
                    value={formData.shipping_info}
                    onChange={(e) => setFormData({ ...formData, shipping_info: e.target.value })}
                    placeholder="Shipping details..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Images will be compressed to WebP
                  </p>
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

            {/* Stock Status */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in_stock" className="cursor-pointer">
                    Product is in stock
                  </Label>
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading || isUploadingImages} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploadingImages ? "Uploading images..." : "Creating product..."}
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
