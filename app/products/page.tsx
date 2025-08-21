"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const products = [
  {
    id: 1,
    name: "Golden Butterfly Necklace",
    price: 299,
    category: "necklaces",
    color: "gold",
    image: "/luxury-jewelry.png",
  },
  {
    id: 2,
    name: "Pearl Drop Earrings",
    price: 199,
    category: "earrings",
    color: "pearl",
    image: "/luxury-jewelry.png",
  },
  {
    id: 3,
    name: "Rose Gold Bracelet",
    price: 249,
    category: "bracelets",
    color: "rose-gold",
    image: "/luxury-jewelry.png",
  },
  {
    id: 4,
    name: "Diamond Stud Earrings",
    price: 399,
    category: "earrings",
    color: "silver",
    image: "/luxury-jewelry.png",
  },
  { id: 5, name: "Emerald Pendant", price: 449, category: "necklaces", color: "gold", image: "/luxury-jewelry.png" },
  {
    id: 6,
    name: "Silver Chain Bracelet",
    price: 179,
    category: "bracelets",
    color: "silver",
    image: "/luxury-jewelry.png",
  },
  { id: 7, name: "Ruby Statement Ring", price: 599, category: "rings", color: "gold", image: "/luxury-jewelry.png" },
  {
    id: 8,
    name: "Sapphire Hoop Earrings",
    price: 329,
    category: "earrings",
    color: "gold",
    image: "/luxury-jewelry.png",
  },
]

const categories = [
  { id: "necklaces", label: "Necklaces" },
  { id: "earrings", label: "Earrings" },
  { id: "bracelets", label: "Bracelets" },
  { id: "rings", label: "Rings" },
]

const colors = [
  { id: "gold", label: "Gold", color: "#FFD700" },
  { id: "silver", label: "Silver", color: "#C0C0C0" },
  { id: "rose-gold", label: "Rose Gold", color: "#E8B4A0" },
  { id: "pearl", label: "Pearl", color: "#F8F8FF" },
]

export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 600])

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    const colorMatch = selectedColors.length === 0 || selectedColors.includes(product.color)
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
    return categoryMatch && colorMatch && priceMatch
  })

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  const handleColorChange = (colorId: string, checked: boolean) => {
    if (checked) {
      setSelectedColors([...selectedColors, colorId])
    } else {
      setSelectedColors(selectedColors.filter((id) => id !== colorId))
    }
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
            <Link href="/products" className="text-sm font-medium text-primary">
              All Products
            </Link>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
          <Button variant="outline" size="sm">
            Cart (0)
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Column - Filters (25% width) */}
          <div className="w-1/4 space-y-8">
            <div>
              <h2 className="mb-6 text-2xl font-serif font-bold text-foreground">Filter By</h2>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Category</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <label htmlFor={category.id} className="text-sm font-medium text-foreground cursor-pointer">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Price</h3>
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={600}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Color</h3>
                <div className="space-y-3">
                  {colors.map((color) => (
                    <div key={color.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={color.id}
                        checked={selectedColors.includes(color.id)}
                        onCheckedChange={(checked) => handleColorChange(color.id, checked as boolean)}
                      />
                      <div
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: color.color }}
                      />
                      <label htmlFor={color.id} className="text-sm font-medium text-foreground cursor-pointer">
                        {color.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Products (75% width) */}
          <div className="w-3/4">
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground">All Products</h1>
              <p className="mt-2 text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid gap-8 md:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer border-border bg-card hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <Link href={`/products/${product.id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={`${product.image}?height=300&width=300&query=${product.name} luxury jewelry`}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 font-serif font-semibold text-card-foreground line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-primary">${product.price}</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products match your current filters.</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSelectedCategories([])
                    setSelectedColors([])
                    setPriceRange([0, 600])
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
