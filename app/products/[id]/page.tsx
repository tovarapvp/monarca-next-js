"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Mail, MessageCircle, ShoppingCart, Menu } from "lucide-react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Mock product data - in a real app this would come from an API
const productData = {
  1: {
    id: 1,
    name: "Golden Butterfly Necklace",
    price: 299,
    description:
      "Embrace transformation with this exquisite golden butterfly necklace. Crafted with precision and passion, this piece symbolizes growth, beauty, and the courage to embrace change. The delicate butterfly pendant catches light beautifully, making it perfect for both everyday elegance and special occasions.",
    images: [
      "/luxury-jewelry.png?height=600&width=600&query=golden butterfly necklace main view",
      "/luxury-jewelry.png?height=600&width=600&query=golden butterfly necklace side view",
      "/luxury-jewelry.png?height=600&width=600&query=golden butterfly necklace detail close up",
      "/luxury-jewelry.png?height=600&width=600&query=golden butterfly necklace on model",
    ],
    details: {
      material: "18k Gold Plated Sterling Silver",
      dimensions: "Pendant: 2.5cm x 2cm, Chain: 45cm",
      weight: "8.5g",
      gemstones: "Cubic Zirconia accents",
    },
    care: "Clean with soft cloth. Avoid contact with perfumes, lotions, and water. Store in provided jewelry box.",
    shipping: "Free shipping on orders over $200. Standard delivery 3-5 business days. Express delivery available.",
    variants: [
      { name: "Material", value: "18k Gold", price: 329.99 },
      { name: "Material", value: "14k Gold", price: 299.99 },
      { name: "Length", value: "45cm" },
    ],
  },
  2: {
    id: 2,
    name: "Pearl Drop Earrings",
    price: 199,
    description: "Elegant pearl drop earrings, perfect for any occasion.",
    images: ["/luxury-jewelry.png"],
    details: {
      material: "Freshwater Pearls, Sterling Silver",
      dimensions: "Length: 3cm",
      weight: "5g",
      gemstones: "N/A",
    },
    care: "Wipe clean with a soft cloth.",
    shipping: "Standard shipping rates apply.",
    variants: [],
  },
  3: {
    id: 3,
    name: "Rose Gold Bracelet",
    price: 249,
    description: "A beautiful rose gold bracelet to complement your style.",
    images: ["/luxury-jewelry.png"],
    details: {
      material: "18k Rose Gold Plated",
      dimensions: "Length: 18cm",
      weight: "12g",
      gemstones: "N/A",
    },
    care: "Avoid contact with harsh chemicals.",
    shipping: "Standard shipping rates apply.",
    variants: [],
  },
  4: {
    id: 4,
    name: "Diamond Stud Earrings",
    price: 399,
    description: "Classic diamond stud earrings for a timeless look.",
    images: ["/luxury-jewelry.png"],
    details: {
      material: "14k White Gold",
      dimensions: "0.5cm diameter",
      weight: "2g",
      gemstones: "0.5ct Diamonds",
    },
    care: "Clean with a specialized jewelry cleaner.",
    shipping: "Insured shipping required.",
    variants: [],
  },
  5: {
    id: 5,
    name: "Emerald Pendant",
    price: 449,
    description: "A stunning emerald pendant that makes a statement.",
    images: ["/luxury-jewelry.png"],
    details: {
      material: "Sterling Silver, Emerald",
      dimensions: "Pendant: 1.5cm, Chain: 40cm",
      weight: "7g",
      gemstones: "Natural Emerald",
    },
    care: "Handle with care.",
    shipping: "Standard shipping rates apply.",
    variants: [],
  },
}

const relatedProducts = [
  { id: 2, name: "Pearl Drop Earrings", price: 199, image: "/luxury-jewelry.png" },
  { id: 3, name: "Rose Gold Bracelet", price: 249, image: "/luxury-jewelry.png" },
  { id: 4, name: "Diamond Stud Earrings", price: 399, image: "/luxury-jewelry.png" },
  { id: 5, name: "Emerald Pendant", price: 449, image: "/luxury-jewelry.png" },
]

interface CartItem {
  id: string; // Composite key: productId-variantValue
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: { name: string; value: string };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = productData[params.id as keyof typeof productData]
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    // Load cart from localStorage to set initial cart count
    const savedCart = localStorage.getItem("monarca-cart")
    if (savedCart) {
      const cartItems: CartItem[] = JSON.parse(savedCart)
      setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0))
    }

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  if (!product) {
    return <div>Product not found</div>
  }

  const handleVariantChange = (value: string) => {
    const variant = product.variants.find((v) => v.value === value)
    setSelectedVariant(variant)
  }

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem("monarca-cart")
    let cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : []

    const price = selectedVariant?.price || product.price
    const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.value}` : product.id.toString()

    const existingItemIndex = cartItems.findIndex(
      (item) => item.id === cartItemId
    )

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += 1
    } else {
      cartItems.push({ 
        id: cartItemId,
        productId: product.id,
        name: product.name, 
        price, 
        quantity: 1, 
        image: product.images[0], 
        variant: selectedVariant 
      })
    }

    localStorage.setItem("monarca-cart", JSON.stringify(cartItems))
    setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0))

    // Dispatch the custom event
    window.dispatchEvent(new CustomEvent("cart-updated"))

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWhatsAppOrder = () => {
    const price = selectedVariant?.price || product.price
    const message = `Hello, I'm interested in the product: ${product.name} - ${price}. ID: ${product.id}. Could you give me more information?`
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailOrder = () => {
    const price = selectedVariant?.price || product.price
    const subject = `Inquiry about ${product.name}`
    const body = `Hello, I'm interested in the product: ${product.name} - ${price}. ID: ${product.id}. Could you give me more information?`
    const emailUrl = `mailto:orders@monarca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = emailUrl
  }

  const displayPrice = selectedVariant?.price || product.price

  return (
    <div className="min-h-screen bg-background">

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed left-0 top-0 h-full w-3/4 max-w-sm border-r border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/monarca-logo.png" alt="MONARCA" width={32} height={32} />
                <span className="text-lg font-serif font-bold">MONARCA</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-8 flex flex-col gap-6">
              <Link
                href="/products"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                All Products
              </Link>
              <a href="#" className="text-lg font-medium hover:text-primary transition-colors" onClick={toggleMobileMenu}>
                About
              </a>
              <a href="#" className="text-lg font-medium hover:text-primary transition-colors" onClick={toggleMobileMenu}>
                Contact
              </a>
            </nav>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid gap-12 lg:grid-cols-2 mb-16">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 lg:group-hover:scale-125"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImageIndex === index ? "border-primary" : "border-border hover:border-primary/50"
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
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">${displayPrice}</p>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Variants</h3>
                <RadioGroup onValueChange={handleVariantChange} className="flex gap-2">
                  {product.variants.map((variant) => (
                    <div key={variant.value}>
                      <RadioGroupItem value={variant.value} id={variant.value} className="peer sr-only" />
                      <Label
                        htmlFor={variant.value}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {variant.name}: {variant.value}
                        {variant.price && <span className="text-xs text-muted-foreground">+${variant.price - product.price}</span>}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Multi-Channel Ordering Module - Structure for next task */}
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
                <TabsTrigger value="care">Care Instructions</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Material:</span>
                    <span className="text-muted-foreground">{product.details.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Dimensions:</span>
                    <span className="text-muted-foreground">{product.details.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Weight:</span>
                    <span className="text-muted-foreground">{product.details.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Gemstones:</span>
                    <span className="text-muted-foreground">{product.details.gemstones}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="care" className="mt-6">
                <p className="text-muted-foreground leading-relaxed">{product.care}</p>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <p className="text-muted-foreground leading-relaxed">{product.shipping}</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* You Might Also Like Section */}
        <section className="border-t border-border pt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-foreground">You Might Also Like</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="group cursor-pointer border-border bg-card hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={`${relatedProduct.image}?height=300&width=300&query=${relatedProduct.name} luxury jewelry`}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 font-serif font-semibold text-card-foreground line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-primary">${relatedProduct.price}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
