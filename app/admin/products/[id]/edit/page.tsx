"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAdminAuthenticated } from "@/lib/auth"
import { getProduct, updateProduct, type Product, type Variant } from "@/lib/products"

export default function EditProduct({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    variants: [] as Variant[],
    inStock: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadProduct()
  }, [router, params.id])

  const loadProduct = () => {
    const loadedProduct = getProduct(params.id)
    if (!loadedProduct) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      })
      router.push("/admin/products")
      return
    }

    setProduct(loadedProduct)
    setFormData({
      name: loadedProduct.name,
      description: loadedProduct.description,
      price: loadedProduct.price.toString(),
      category: loadedProduct.category,
      images: loadedProduct.images,
      variants: loadedProduct.variants,
      inStock: loadedProduct.inStock,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updates: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        images: formData.images,
        variants: formData.variants,
        inStock: formData.inStock,
      }

      updateProduct(params.id, updates)

      toast({
        title: "Product updated",
        description: "The changes have been saved successfully.",
      })

      router.push("/admin/products")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the product.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", value: "", price: undefined }],
    })
  }

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    })
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updatedVariants = formData.variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant,
    )
    setFormData({ ...formData, variants: updatedVariants })
  }

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div>
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
                  <Label htmlFor="name">Product Name</Label>
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
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Base Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
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

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Variant Name</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, "name", e.target.value)}
                        placeholder="e.g., Size, Color, Material"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Value</Label>
                      <Input
                        value={variant.value}
                        onChange={(e) => updateVariant(index, "value", e.target.value)}
                        placeholder="e.g., S, Gold, Silver"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Price (optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.price || ""}
                        onChange={(e) => updateVariant(index, "price", e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                        placeholder="Overrides base price"
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeVariant(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addVariant}>
                  Add Variant
                </Button>
              </CardContent>
            </Card>
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
                  <p className="text-sm text-gray-600 mb-2">Drag and drop images here or click to select</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: In this demo version, images are kept as they are configured.
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
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="inStock">Product in stock</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/admin/products" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
