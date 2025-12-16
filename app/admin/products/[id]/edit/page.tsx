"use client"

import type React from "react"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProduct, updateProduct } from "@/hooks/use-products"
import { ArrowLeft, Upload, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProductVariantsSection } from "@/components/admin/product-variants-section"
import { useProductVariants, NewVariant, createMultipleVariants, deleteProductVariants } from "@/hooks/use-variants"

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { product, loading, error } = useProduct(resolvedParams.id)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    care_instructions: "",
    shipping_info: "",
    in_stock: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [variants, setVariants] = useState<NewVariant[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Fetch existing variants
  const { variants: existingVariants, loading: variantsLoading } = useProductVariants(resolvedParams.id)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category || "",
        care_instructions: product.care_instructions || "",
        shipping_info: product.shipping_info || "",
        in_stock: product.in_stock ?? true,
      })
    }
  }, [product])

  // Load existing variants into state
  useEffect(() => {
    if (existingVariants.length > 0) {
      setVariants(existingVariants.map(v => ({
        name: v.name,
        value: v.value,
        price: v.price,
      })))
    }
  }, [existingVariants])

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

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await updateProduct(resolvedParams.id, {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category || null,
        care_instructions: formData.care_instructions || null,
        shipping_info: formData.shipping_info || null,
        in_stock: formData.in_stock,
      })

      // Update variants: delete existing and create new ones
      await deleteProductVariants(resolvedParams.id)
      if (variants.length > 0) {
        await createMultipleVariants(resolvedParams.id, variants)
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
                    placeholder="e.g., Rose Gold Necklace"
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

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="necklaces">Necklaces</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="bracelets">Bracelets</SelectItem>
                        <SelectItem value="rings">Rings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            <ProductVariantsSection
              variants={variants}
              onChange={setVariants}
              disabled={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Image upload coming soon</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Image upload functionality will be available in a future update.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="in_stock"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="in_stock">Product in stock</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/admin/products" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
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
