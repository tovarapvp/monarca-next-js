"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { Filter, X, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductFilters } from "@/components/product-filters"
import { useProducts } from "@/hooks/use-products"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function ProductsPage() {
    const t = useTranslations()
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get('category')

    const { products, loading, error } = useProducts()
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string[] }>({})
    const [priceRange, setPriceRange] = useState([0, 600])
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

    // Set category filter if coming from URL parameter
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam])
        }
    }, [categoryParam])

    const filteredProducts = products.filter((product) => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category || '')
        const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]

        const variantMatch = Object.entries(selectedVariants).every(([name, values]) => {
            if (values.length === 0) return true;
            // Since variants are in a separate table now, we'll handle this differently
            // For now, just return true to allow products through
            return true;
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

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">{t('products.unableToLoad')}</h1>
                    <p className="text-muted-foreground">{t('products.tryAgain')}</p>
                </div>
            </div>
        )
    }

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
                                <h1 className="text-4xl font-serif font-bold text-foreground">{t('products.title')}</h1>
                                <p className="mt-2 text-muted-foreground">
                                    {t('products.showing', { count: filteredProducts.length, total: products.length })}
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
                                        {t('common.filter')}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-6">
                                    <SheetHeader>
                                        <SheetTitle className="text-2xl font-serif font-bold">{t('products.filterProducts')}</SheetTitle>
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
                                            {t('common.clearFilters')}
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
                                                    src={
                                                        product.images && product.images.length > 0
                                                            ? `${product.images[0]}?height=300&width=300&query=${product.name} luxury jewelry`
                                                            : "/placeholder.svg"
                                                    }
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
                                <p className="text-lg text-muted-foreground">{t('products.noProducts')}</p>
                                <Button
                                    variant="outline"
                                    className="mt-4 bg-transparent"
                                    onClick={handleClearFilters}
                                >
                                    {t('common.clearFilters')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
