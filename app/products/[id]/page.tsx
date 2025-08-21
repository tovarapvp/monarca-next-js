"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Mail, MessageCircle, ShoppingCart } from "lucide-react"

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
  },
}

const relatedProducts = [
  { id: 2, name: "Pearl Drop Earrings", price: 199, image: "/luxury-jewelry.png" },
  { id: 3, name: "Rose Gold Bracelet", price: 249, image: "/luxury-jewelry.png" },
  { id: 4, name: "Diamond Stud Earrings", price: 399, image: "/luxury-jewelry.png" },
  { id: 5, name: "Emerald Pendant", price: 449, image: "/luxury-jewelry.png" },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = productData[1] // In a real app, use params.id to fetch the right product
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  if (!product) {
    return <div>Product not found</div>
  }

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWhatsAppOrder = () => {
    const message = `Hi! I'm interested in ordering the ${product.name} for $${product.price}. Can you help me with the purchase?`
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailOrder = () => {
    const subject = `Order Inquiry: ${product.name}`
    const body = `Hello,\n\nI'm interested in purchasing the ${product.name} for $${product.price}.\n\nPlease let me know about availability and next steps.\n\nThank you!`
    const emailUrl = `mailto:orders@monarca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = emailUrl
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/monarca-logo.png" alt="MONARCA" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-serif font-bold text-foreground">MONARCA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              All Products
            </Link>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ShoppingCart className="h-4 w-4" />
            Cart ({cartCount})
          </Button>
        </div>
      </nav>

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
            <div
              className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className={`h-full w-full object-cover transition-transform duration-300 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors ${
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
              <p className="text-3xl font-bold text-primary mb-6">${product.price}</p>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

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

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2 bg-transparent hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                  onClick={handleWhatsAppOrder}
                >
                  <MessageCircle className="h-4 w-4" />
                  Order via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2 bg-transparent hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
                  onClick={handleEmailOrder}
                >
                  <Mail className="h-4 w-4" />
                  Order via Email
                </Button>
              </div>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
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
