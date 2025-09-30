"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductFilters } from "@/components/product-filters"

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

import { getProducts, type Product } from "@/lib/products"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string[] }>({})
  const [priceRange, setPriceRange] = useState([0, 600])
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  useEffect(() => {
    setProducts(getProducts())
  }, [])

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
    
    const variantMatch = Object.entries(selectedVariants).every(([name, values]) => {
      if (values.length === 0) return true;
      return product.variants.some(variant => variant.name === name && values.includes(variant.value));
    });

    return categoryMatch && priceMatch && variantMatch
  })

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedVariants({})
    setPriceRange([0, 600])
    setIsFilterMenuOpen(false) // Close the sheet after clearing filters
  }

  useEffect(() => {
    if (isFilterMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [isFilterMenuOpen])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Left Column - Filters (25% width) */}
          <div className="hidden lg:block lg:w-1/4">
            <ProductFilters
              products={products}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedVariants={selectedVariants}
              setSelectedVariants={setSelectedVariants}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          {/* Right Column - Products (75% width) */}
          <div className="w-full lg:w-3/4">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground">All Products</h1>
                <p className="mt-2 text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
              {/* Mobile Filter Button */}
              <Sheet open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden bg-transparent"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-6">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-serif font-bold">Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    <ProductFilters
                      products={products}
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      selectedVariants={selectedVariants}
                      setSelectedVariants={setSelectedVariants}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      onApplyFilters={() => setIsFilterMenuOpen(false)} // Close sheet on apply
                    />
                    <Button onClick={handleClearFilters} variant="outline" className="w-full mt-4">
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
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
                          src={`${product.images[0]}?height=300&width=300&query=${product.name} luxury jewelry`}
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
                  onClick={handleClearFilters}
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
