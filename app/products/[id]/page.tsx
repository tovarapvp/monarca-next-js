"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, use, useCallback } from "react"
import { ChevronLeft, ChevronRight, Mail, MessageCircle, ShoppingCart, Menu, Loader2, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"
import { useProductOptions, useProductVariants, ProductVariant, ProductOption } from "@/hooks/use-product-variants"
import { VariantSelector } from "@/components/product/variant-selector"

type Product = Tables<'products'>

interface CartItem {
  id: string
  productId: string
  productVariantId?: string  // New: reference to SKU variant
  name: string
  price: number
  image: string
  quantity: number
  variant?: { name: string; value: string }
  unitType?: string
  isPerUnit?: boolean
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [cartCount, setCartCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Fetch options and variants for this product (new SKU system)
  const { options, loading: optionsLoading } = useProductOptions(product?.id || null)
  const { variants, loading: variantsLoading } = useProductVariants(product?.id || null)

  // Fetch product from Supabase
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (fetchError) throw fetchError
        setProduct(data)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [resolvedParams.id])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    const savedCart = localStorage.getItem("monarca-cart")
    if (savedCart) {
      const cartItems: CartItem[] = JSON.parse(savedCart)
      // Count items: per-unit products count as 1, regular products count by quantity
      const count = cartItems.reduce((acc, item) => {
        return acc + (item.isPerUnit ? 1 : item.quantity)
      }, 0)
      setCartCount(count)
    }

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? error.message : "Product not found"}
            </AlertDescription>
          </Alert>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Handle variant selection callback from VariantSelector
  const handleVariantSelect = useCallback((variant: ProductVariant | null, opts: Record<string, string>) => {
    setSelectedVariant(variant)
    setSelectedOptions(opts)
  }, [])

  // Determine if product has the new SKU-based variants
  const hasSkuVariants = options.length > 0 && variants.length > 0

  // Get display price based on selected variant or product base price
  const getDisplayPrice = (): number => {
    if (hasSkuVariants && selectedVariant) {
      if (selectedVariant.pricing_type === 'per_unit' && selectedVariant.price_per_unit) {
        return selectedVariant.price_per_unit * quantity
      }
      return selectedVariant.price
    }
    // Fallback to product price
    if (product.pricing_type === 'per_unit' && product.price_per_unit) {
      return product.price_per_unit * quantity
    }
    return product.price
  }

  // Check if add to cart should be enabled
  const canAddToCart = (): boolean => {
    if (!hasSkuVariants) return true // No variants, always enabled
    if (!selectedVariant) return false // Has variants but none selected
    if (!selectedVariant.is_available) return false
    if (selectedVariant.track_inventory && selectedVariant.stock_quantity <= 0 && !selectedVariant.allow_backorder) {
      return false
    }
    return true
  }

  // Get stock status message
  const getStockStatus = (): { text: string; available: boolean } | null => {
    if (!hasSkuVariants || !selectedVariant) return null

    if (!selectedVariant.is_available) {
      return { text: "Not Available", available: false }
    }
    if (!selectedVariant.track_inventory) {
      return { text: "In Stock", available: true }
    }
    if (selectedVariant.stock_quantity <= 0) {
      if (selectedVariant.allow_backorder) {
        return { text: "Available for Backorder", available: true }
      }
      return { text: "Out of Stock", available: false }
    }
    if (selectedVariant.stock_quantity < 5) {
      return { text: `Only ${selectedVariant.stock_quantity} left!`, available: true }
    }
    return { text: "In Stock", available: true }
  }

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem("monarca-cart")
    let cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : []

    // Calculate price based on variant or product
    let finalPrice: number
    let unitType: string | undefined
    let isPerUnit = false
    let variantDescription: string | undefined
    let cartItemId: string

    if (hasSkuVariants && selectedVariant) {
      // Using new SKU system
      if (selectedVariant.pricing_type === 'per_unit' && selectedVariant.price_per_unit) {
        finalPrice = selectedVariant.price_per_unit
        unitType = selectedVariant.unit_type || undefined
        isPerUnit = true
      } else {
        finalPrice = selectedVariant.price
      }

      // Build variant description from selected options
      variantDescription = Object.entries(selectedOptions)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ')

      // Unique cart ID includes variant ID
      cartItemId = `${product.id}-${selectedVariant.id}`
    } else {
      // Fallback to product pricing
      if (product.pricing_type === 'per_unit' && product.price_per_unit) {
        finalPrice = product.price_per_unit
        unitType = product.unit_type || undefined
        isPerUnit = true
      } else {
        finalPrice = product.price
      }
      cartItemId = product.id
    }

    const existingItemIndex = cartItems.findIndex((item) => item.id === cartItemId)

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += quantity
    } else {
      cartItems.push({
        id: cartItemId,
        productId: product.id,
        productVariantId: selectedVariant?.id || undefined,
        name: product.name,
        price: finalPrice,
        quantity,
        image: selectedVariant?.images?.[0] || (product.images && product.images[0]) || "/placeholder.svg",
        variant: variantDescription ? { name: "Options", value: variantDescription } : undefined,
        unitType,
        isPerUnit,
      })
    }

    localStorage.setItem("monarca-cart", JSON.stringify(cartItems))
    const count = cartItems.reduce((acc, item) => acc + (item.isPerUnit ? 1 : item.quantity), 0)
    setCartCount(count)
    window.dispatchEvent(new CustomEvent("cart-updated"))

    const itemDescription = isPerUnit
      ? `${quantity} ${unitType}(s) of ${product.name}`
      : `${product.name}`

    toast({
      title: "Added to Cart",
      description: `${itemDescription} has been added to your cart.`,
    })
  }

  const handleWhatsAppOrder = () => {
    const price = product.pricing_type === "per_unit" && product.price_per_unit
      ? product.price_per_unit * quantity
      : product.price

    const message = `Hello, I'm interested in the product: ${product.name} - $${price}${product.pricing_type === "per_unit" ? ` (${quantity} ${product.unit_type}s)` : ""
      }. Could you give me more information?`

    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailOrder = () => {
    const price = product.pricing_type === "per_unit" && product.price_per_unit
      ? product.price_per_unit * quantity
      : product.price

    const subject = `Inquiry about ${product.name}`
    const body = `Hello, I'm interested in the product: ${product.name} - $${price}${product.pricing_type === "per_unit" ? ` (${quantity} ${product.unit_type}s)` : ""
      }. Could you give me more information?`

    const emailUrl = `mailto:orders@monarca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = emailUrl
  }

  // Get display price using new function
  const displayPrice = getDisplayPrice()

  // Get unit info for per-unit display
  const isPerUnitPricing = hasSkuVariants && selectedVariant
    ? selectedVariant.pricing_type === 'per_unit'
    : product.pricing_type === 'per_unit'
  const unitTypeDisplay = hasSkuVariants && selectedVariant
    ? selectedVariant.unit_type
    : product.unit_type
  const pricePerUnitDisplay = hasSkuVariants && selectedVariant
    ? selectedVariant.price_per_unit
    : product.price_per_unit

  const images = product.images && product.images.length > 0
    ? product.images
    : ["/placeholder.svg"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid gap-12 lg:grid-cols-2 mb-16">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
              <img
                src={images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 lg:group-hover:scale-125"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${selectedImageIndex === index ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                ${displayPrice.toFixed(2)}
                {isPerUnitPricing && unitTypeDisplay && (
                  <span className="text-lg text-muted-foreground ml-2">
                    (${pricePerUnitDisplay} per {unitTypeDisplay})
                  </span>
                )}
              </p>
              {product.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Product Variants Selector */}
            {hasSkuVariants && (
              <div className="space-y-4">
                <VariantSelector
                  options={options}
                  variants={variants}
                  onVariantSelect={handleVariantSelect}
                />

                {/* Stock Status */}
                {getStockStatus() && (
                  <div className={`text-sm font-medium ${getStockStatus()?.available ? 'text-green-600' : 'text-red-600'}`}>
                    {getStockStatus()?.text}
                  </div>
                )}
              </div>
            )}

            {/* Quantity selector for per-unit products */}
            {product.pricing_type === "per_unit" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label htmlFor="quantity" className="text-sm font-medium text-blue-900">
                  Quantity ({product.unit_type}s)
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max((product.min_quantity || 1), quantity - 0.5))}
                  >
                    -
                  </Button>
                  <input
                    id="quantity"
                    type="number"
                    step={product.unit_type === "meter" || product.unit_type === "yard" ? "0.5" : "1"}
                    min={product.min_quantity || 1}
                    max={product.max_quantity || undefined}
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-20 text-center border rounded px-2 py-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 0.5)}
                  >
                    +
                  </Button>
                  <span className="text-sm text-blue-700">
                    {product.min_quantity && `Min: ${product.min_quantity}`}
                    {product.max_quantity && ` • Max: ${product.max_quantity}`}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={handleAddToCart}
                disabled={!canAddToCart()}
              >
                <ShoppingCart className="h-5 w-5" />
                {hasSkuVariants && !selectedVariant
                  ? "Select Options"
                  : !canAddToCart()
                    ? "Out of Stock"
                    : "Add to Cart"}
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2 bg-transparent hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                  onClick={handleWhatsAppOrder}
                >
                  <MessageCircle className="h-4 w-4" />
                  Inquire via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2 bg-transparent hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
                  onClick={handleEmailOrder}
                >
                  <Mail className="h-4 w-4" />
                  Inquire via Email
                </Button>
              </div>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="flex flex-wrap h-auto">
                <TabsTrigger value="details">Details</TabsTrigger>
                {product.care_instructions && <TabsTrigger value="care">Care</TabsTrigger>}
                {product.shipping_info && <TabsTrigger value="shipping">Shipping</TabsTrigger>}
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-4">
                <div className="space-y-3">
                  {product.material && (
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Material:</span>
                      <span className="text-muted-foreground">{product.material}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Color:</span>
                      <span className="text-muted-foreground">{product.color}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Size:</span>
                      <span className="text-muted-foreground">{product.size}</span>
                    </div>
                  )}
                  {product.weight_grams && (
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Weight:</span>
                      <span className="text-muted-foreground">{product.weight_grams}g</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              {product.care_instructions && (
                <TabsContent value="care" className="mt-6">
                  <p className="text-muted-foreground leading-relaxed">{product.care_instructions}</p>
                </TabsContent>
              )}

              {product.shipping_info && (
                <TabsContent value="shipping" className="mt-6">
                  <p className="text-muted-foreground leading-relaxed">{product.shipping_info}</p>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
