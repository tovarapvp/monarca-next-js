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
import { getProduct, updateProduct, type Product } from "@/lib/products"
import { ArrowLeft, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditProduct({ params }: { params: { id: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    variants: [] as { name: string; value: string }[],
    inStock: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const authenticated = isAdminAuthenticated()
    if (!authenticated) {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(authenticated)
    loadProduct()
  }, [router, params.id])

  const loadProduct = () => {
    const loadedProduct = getProduct(params.id)
    if (!loadedProduct) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
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
        title: "Producto actualizado",
        description: "Los cambios han sido guardados exitosamente",
      })

      router.push("/admin/products")
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", value: "" }],
    })
  }

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    })
  }

  const updateVariant = (index: number, field: "name" | "value", value: string) => {
    const updatedVariants = formData.variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant,
    )
    setFormData({ ...formData, variants: updatedVariants })
  }

  if (!isAuthenticated || !product) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif text-gray-800">Editar Producto</h1>
            <p className="text-gray-600">Modifica la información del producto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Collar de Oro Rosa"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe las características y detalles del producto..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Precio (USD)</Label>
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
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="necklaces">Collares</SelectItem>
                          <SelectItem value="earrings">Aretes</SelectItem>
                          <SelectItem value="bracelets">Pulseras</SelectItem>
                          <SelectItem value="rings">Anillos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variants */}
              <Card>
                <CardHeader>
                  <CardTitle>Variantes del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Nombre de la Variante</Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                          placeholder="Ej: Talla, Color, Material"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Valor</Label>
                        <Input
                          value={variant.value}
                          onChange={(e) => updateVariant(index, "value", e.target.value)}
                          placeholder="Ej: S, Dorado, Plata"
                        />
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeVariant(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addVariant}>
                    Agregar Variante
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Nota: En esta versión demo, las imágenes se mantienen como están configuradas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado del Producto</CardTitle>
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
                    <Label htmlFor="inStock">Producto en stock</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Link href="/admin/products" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
