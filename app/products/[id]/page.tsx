"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, use } from "react"
import { ChevronLeft, ChevronRight, Mail, MessageCircle, ShoppingCart, Menu, Loader2, AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"

type Product = Tables<'products'>

interface CartItem {
  id: string
  productId: string
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
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

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

  const handleVariantChange = (value: string) => {
    setSelectedVariant(value)
  }

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem("monarca-cart")
    let cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : []

    const price = product.pricing_type === "per_unit" && product.price_per_unit
      ? product.price_per_unit
      : product.price

    const cartItemId = selectedVariant ? `${product.id}-${selectedVariant}` : product.id

    const existingItemIndex = cartItems.findIndex((item) => item.id === cartItemId)

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += quantity
    } else {
      cartItems.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price,
        quantity,
        image: product.images && product.images[0] ? product.images[0] : "/placeholder.svg",
        variant: selectedVariant ? { name: "Option", value: selectedVariant } : undefined,
        unitType: product.pricing_type === "per_unit" ? product.unit_type || undefined : undefined,
        isPerUnit: product.pricing_type === "per_unit",
      })
    }

    localStorage.setItem("monarca-cart", JSON.stringify(cartItems))
    // Count items: per-unit products count as 1, regular products count by quantity
    const count = cartItems.reduce((acc, item) => acc + (item.isPerUnit ? 1 : item.quantity), 0)
    setCartCount(count)
    window.dispatchEvent(new CustomEvent("cart-updated"))

    const itemDescription = product.pricing_type === "per_unit"
      ? `${quantity} ${product.unit_type}(s) of ${product.name}`
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

  const displayPrice = product.pricing_type === "per_unit" && product.price_per_unit
    ? product.price_per_unit * quantity
    : product.price

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
                {product.pricing_type === "per_unit" && product.unit_type && (
                  <span className="text-lg text-muted-foreground ml-2">
                    (${product.price_per_unit} per {product.unit_type})
                  </span>
                )}
              </p>
              {product.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

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
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
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
