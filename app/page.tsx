"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Menu, Star, Users, Award, Shield, ChevronDown, Globe } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useFeaturedProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState("ENG")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Fetch featured products and categories from Supabase
  const { products: featuredProducts, loading, error } = useFeaturedProducts(4)
  const { categories, loading: categoriesLoading } = useCategories()

  const languages = [
    { code: "ENG", label: "English" },
    { code: "ESP", label: "Español" },
  ]

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const selectLanguage = (langCode: string) => {
    setCurrentLanguage(langCode)
    setIsLanguageDropdownOpen(false)
    // Here you would implement the actual language switching logic
    console.log("[v0] Language switched to:", langCode)
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

  return (
    <div className="min-h-screen bg-background">

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed left-0 top-0 h-full w-3/4 max-w-sm border-r border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/monarca-logo.png" alt="MONARCA" width={32} height={32} />
                <span className="text-lg font-serif font-bold">MONARCA</span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-8 flex flex-col gap-6">
              <Link
                href="/products?category=necklaces"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                Necklaces
              </Link>
              <Link
                href="/products?category=earrings"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                Earrings
              </Link>
              <Link
                href="/products?category=bracelets"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                Bracelets
              </Link>
              <a
                href="#about"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                About
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/elegant-model-gold-jewelry.png"
            alt="Model wearing MONARCA jewelry"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 flex h-full items-center justify-center text-center text-white">
          <div className="max-w-2xl px-4 animate-fade-in">
            <h1 className="mb-4 text-4xl font-serif font-bold sm:text-5xl md:text-6xl">Transform Your Style</h1>
            <p className="mb-8 text-lg font-light md:text-xl">Discover MONARCA</p>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 h-11 px-6 text-base sm:h-12 sm:px-8 sm:text-lg"
              >
                Shop New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Lifetime Warranty</h3>
              <p className="text-sm text-muted-foreground">Quality guaranteed</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Handcrafted</h3>
              <p className="text-sm text-muted-foreground">By master artisans</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">10K+ Happy Customers</h3>
              <p className="text-sm text-muted-foreground">Worldwide</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <h3 className="font-semibold text-foreground">4.9/5 Rating</h3>
              <p className="text-sm text-muted-foreground">From 2,500+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-serif font-bold text-foreground">Shop by Category</h2>

          {categoriesLoading ? (
            <div className="grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                  <div className="h-80 w-full bg-muted animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {categories.slice(0, 3).map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`} className="group relative overflow-hidden rounded-lg">
                  <img
                    src={category.image_url || "/placeholder-oe5hu.png"}
                    alt={category.name}
                    className="h-80 w-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <h3 className="text-2xl font-serif font-bold text-white">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-muted py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground text-center sm:text-left">New Arrivals</h2>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="border-border bg-card">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted animate-pulse rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-6 bg-muted animate-pulse rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load products at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-0">
                    <Link href={`/products/${product.id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={product.images?.[0] || "/luxury-jewelry.png"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 font-serif font-semibold text-card-foreground line-clamp-2">{product.name}</h3>
                        <p className="text-lg font-bold text-primary">${product.price}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">(24)</span>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Story */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/jewelry-artisan-gold-crafting.png"
                alt="Crafting jewelry"
                className="h-full w-full rounded-lg object-cover shadow-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-6 text-4xl font-serif font-bold text-foreground">Crafted with Passion</h2>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
                Every MONARCA piece tells a story of transformation and elegance. Our master artisans combine
                traditional techniques with contemporary design to create jewelry that celebrates your unique journey.
                Like the monarch butterfly's metamorphosis, each piece represents growth, beauty, and the courage to
                embrace change.
              </p>
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Ethically sourced materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Handcrafted by master artisans</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Lifetime craftsmanship guarantee</span>
                </div>
              </div>
              <Button asChild variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent">
                <Link href="/about">Read Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-muted py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-serif font-bold text-foreground">What Our Customers Say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                review:
                  "The Golden Butterfly Necklace exceeded my expectations. The craftsmanship is incredible and it's become my signature piece.",
                rating: 5,
                image: "/woman-testimonial-portrait.png",
              },
              {
                name: "Maria Rodriguez",
                review:
                  "MONARCA jewelry is simply stunning. Each piece tells a story and the quality is unmatched. Highly recommend!",
                rating: 5,
                image: "/woman-testimonial-2.png",
              },
              {
                name: "Emily Chen",
                review:
                  "I love how unique and elegant these pieces are. The customer service was exceptional too. Will definitely order again!",
                rating: 5,
                image: "/woman-testimonial-3.png",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-border bg-card p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.review}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-foreground">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-serif font-bold text-foreground">@MONARCA on Instagram</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-square overflow-hidden rounded-lg group cursor-pointer">
                <img
                  src={`/jewelry-lifestyle-monarca.png?height=300&width=300&query=instagram post jewelry lifestyle model wearing MONARCA ${item}`}
                  alt={`Instagram post ${item}`}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 group-hover:brightness-110"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              Follow @MONARCA
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <Image src="/monarca-logo.png" alt="MONARCA" width={32} height={32} className="h-8 w-auto" />
                <span className="text-xl font-serif font-bold text-foreground">MONARCA</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Transform your style with luxury jewelry crafted with passion and precision.
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Shop</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/products?category=necklaces" className="hover:text-primary transition-colors">
                    Necklaces
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=earrings" className="hover:text-primary transition-colors">
                    Earrings
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=bracelets" className="hover:text-primary transition-colors">
                    Bracelets
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-primary transition-colors">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Care Instructions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Returns & Exchanges
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Connect</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pinterest
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">© 2024 MONARCA. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
