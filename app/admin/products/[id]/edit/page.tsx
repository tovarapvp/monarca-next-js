"use client"

import { useState, useRef, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProduct, updateProduct } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import { ArrowLeft, Upload, Loader2, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadMultipleImages } from "@/lib/image-upload"
import Image from "next/image"
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog"
import { AdvancedProductVariantsSection } from "@/components/admin/advanced-product-variants-section"
import {
  useProductOptions,
  useProductVariants,
  createProductOption,
  createOptionValue,
  createProductVariant,
  deleteProductOptionsAndVariants,
  ProductOption
} from "@/hooks/use-product-variants"

interface NewOption {
  name: string
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

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { product, loading, error } = useProduct(resolvedParams.id)
  const { options: existingOptions } = useProductOptions(resolvedParams.id)
  const { variants: existingVariants } = useProductVariants(resolvedParams.id)

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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [productOptions, setProductOptions] = useState<NewOption[]>([])
  const [productVariants, setProductVariants] = useState<NewVariant[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories()

  // Load product data into form
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category || "",
        material: product.material || "",
        color: product.color || "",
        size: product.size || "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
        weight_grams: product.weight_grams?.toString() || "",
        care_instructions: product.care_instructions || "",
        shipping_info: product.shipping_info || "",
        in_stock: product.in_stock ?? true,
        pricing_type: (product.pricing_type === "per_unit" ? "per_unit" : "fixed") as "fixed" | "per_unit",
        unit_type: product.unit_type || "",
        price_per_unit: product.price_per_unit?.toString() || "",
        min_quantity: product.min_quantity?.toString() || "1",
        max_quantity: product.max_quantity?.toString() || "",
      })

      // Load existing images
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images)
      }
    }
  }, [product])

  // Load existing options into state
  useEffect(() => {
    if (existingOptions.length > 0) {
      setProductOptions(existingOptions.map(opt => ({
        name: opt.name,
        values: opt.values?.map(v => v.value) || []
      })))
    }
  }, [existingOptions])

  // Load existing variants into state
  useEffect(() => {
    if (existingVariants.length > 0) {
      setProductVariants(existingVariants.map(v => ({
        optionValues: v.option_values?.map((ov: any) => ({
          optionName: ov.option_name || ov.optionName,
          value: ov.value
        })) || [],
        sku: v.sku || "",
        price: v.price,
        compareAtPrice: v.compare_at_price,
        pricingType: v.pricing_type || 'fixed',
        unitType: v.unit_type,
        pricePerUnit: v.price_per_unit,
        minQuantity: v.min_quantity || 1,
        maxQuantity: v.max_quantity,
        stockQuantity: v.stock_quantity || 0,
        trackInventory: v.track_inventory ?? true,
        isAvailable: v.is_available ?? true,
      })))
    }
  }, [existingVariants])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const totalImages = existingImages.length + imageFiles.length + files.length
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      })
      return
    }

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    const previews = newFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeNewImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    URL.revokeObjectURL(imagePreviews[index])

    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
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
      // Upload new images if any
      let uploadedImageUrls: string[] = []
      if (imageFiles.length > 0) {
        setIsUploadingImages(true)
        uploadedImageUrls = await uploadMultipleImages(imageFiles, 'product-images', 'products')
        setIsUploadingImages(false)
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls]

      // Update product
      await updateProduct(resolvedParams.id, {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        category: formData.category || null,
        material: formData.material || null,
        color: formData.color || null,
        size: formData.size || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : null,
        weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
        care_instructions: formData.care_instructions || null,
        shipping_info: formData.shipping_info || null,
        in_stock: formData.in_stock,
        pricing_type: formData.pricing_type,
        unit_type: formData.pricing_type === "per_unit" ? formData.unit_type : null,
        price_per_unit: formData.pricing_type === "per_unit" && formData.price_per_unit
          ? parseFloat(formData.price_per_unit)
          : null,
        min_quantity: formData.min_quantity ? parseFloat(formData.min_quantity) : 1,
        max_quantity: formData.max_quantity ? parseFloat(formData.max_quantity) : null,
        images: allImages,
      })

      // Update options and variants if they exist
      if (productOptions.length > 0 && productVariants.length > 0) {
        // Delete existing options and variants first (cascade will handle values)
        await deleteProductOptionsAndVariants(resolvedParams.id)

        // Create new options and values
        const optionMap = new Map<string, { optionId: string; valueIds: Map<string, string> }>()

        for (const option of productOptions) {
          const createdOption = await createProductOption(resolvedParams.id, option.name, productOptions.indexOf(option))

          const valueIds = new Map<string, string>()
          for (const value of option.values) {
            const createdValue = await createOptionValue(createdOption.id, value, option.values.indexOf(value))
            valueIds.set(value, createdValue.id)
          }

          optionMap.set(option.name, { optionId: createdOption.id, valueIds })
        }

        // Create variants
        for (const variant of productVariants) {
          const optionValueIds: string[] = []

          for (const optVal of variant.optionValues) {
            const optionData = optionMap.get(optVal.optionName)
            if (optionData) {
              const valueId = optionData.valueIds.get(optVal.value)
              if (valueId) {
                optionValueIds.push(valueId)
              }
            }
          }

          await createProductVariant(resolvedParams.id, {
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
        title: "Product updated",
        description: "The changes have been saved successfully.",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "There was an error updating the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsUploadingImages(false)
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading product: {error.message}
          </AlertDescription>
        </Alert>
        <Link href="/admin/products" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  if (loading || !product) {
    return (
      <div className="p-8 flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-gray-800">Edit Product</h1>
          <p className="text-gray-600">Modify the product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
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
                    placeholder="e.g., Premium Silk Ribbon"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the product features and details..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <CreateCategoryDialog onCategoryCreated={refetchCategories} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., premium, silk, ribbon"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pricing Type *</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="pricing-fixed"
                        name="pricing_type"
                        value="fixed"
                        checked={formData.pricing_type === "fixed"}
                        onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as "fixed" })}
                        className="rounded"
                      />
                      <Label htmlFor="pricing-fixed" className="font-normal cursor-pointer">
                        Fixed Price
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="pricing-per-unit"
                        name="pricing_type"
                        value="per_unit"
                        checked={formData.pricing_type === "per_unit"}
                        onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as "per_unit" })}
                        className="rounded"
                      />
                      <Label htmlFor="pricing-per-unit" className="font-normal cursor-pointer">
                        Price Per Unit
                      </Label>
                    </div>
                  </div>
                </div>

                {formData.pricing_type === "fixed" ? (
                  <div className="grid grid-cols-2 gap-4">
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
                        required={formData.pricing_type === "fixed"}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="inch">Inch</SelectItem>
                            <SelectItem value="kilogram">Kilogram</SelectItem>
                            <SelectItem value="gram">Gram</SelectItem>
                            <SelectItem value="pound">Pound</SelectItem>
                            <SelectItem value="liter">Liter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="price_per_unit">Price Per Unit (USD) *</Label>
                        <Input
                          id="price_per_unit"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price_per_unit}
                          onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                          placeholder="0.00"
                          required={formData.pricing_type === "per_unit"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Base Price (USD)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional base price</p>
                      </div>

                      <div>
                        <Label htmlFor="min_quantity">Min Quantity</Label>
                        <Input
                          id="min_quantity"
                          type="number"
                          step="0.5"
                          min="0"
                          value={formData.min_quantity}
                          onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="max_quantity">Max Quantity</Label>
                        <Input
                          id="max_quantity"
                          type="number"
                          step="0.5"
                          min="0"
                          value={formData.max_quantity}
                          onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., Silk, Cotton"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g., Red, Blue"
                    />
                  </div>

                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g., 2.5cm width"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight_grams">Weight (grams)</Label>
                  <Input
                    id="weight_grams"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight_grams}
                    onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="care_instructions">Care Instructions</Label>
                  <Textarea
                    id="care_instructions"
                    value={formData.care_instructions}
                    onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                    placeholder="How to care for this product..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping_info">Shipping Information</Label>
                  <Textarea
                    id="shipping_info"
                    value={formData.shipping_info}
                    onChange={(e) => setFormData({ ...formData, shipping_info: e.target.value })}
                    placeholder="Shipping details and estimated delivery time..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <AdvancedProductVariantsSection
              options={productOptions}
              setOptions={setProductOptions}
              variants={productVariants}
              setVariants={setProductVariants}
              basePrice={parseFloat(formData.price) || 0}
              disabled={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Current Images</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image
                            src={url}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">New Images</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-blue-300">
                          <Image
                            src={preview}
                            alt={`New image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {(existingImages.length + imageFiles.length) < 5 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Images ({existingImages.length + imageFiles.length}/5)
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG up to 10MB each
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in_stock">Product in stock</Label>
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link href="/admin/products" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isUploadingImages} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploadingImages ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
