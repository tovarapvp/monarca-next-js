"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { Filter, X, Loader2, ShoppingBag, Sparkles, TrendingUp, Package } from "lucide-react"
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
        setIsFilterMenuOpen(false)
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
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                        <X className="h-10 w-10 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('products.unableToLoad')}</h1>
                    <p className="text-muted-foreground">{t('products.tryAgain')}</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <Badge variant="secondary" className="text-xs font-semibold">
                                {products.length} Products Available
                            </Badge>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
                            {t('products.title')}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Discover our curated collection of premium products, handpicked for quality and style.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="lg:flex lg:gap-8">
                    {/* Left Column - Filters (25% width) */}
                    <div className="hidden lg:block lg:w-1/4">
                        <div className="sticky top-8">
                            <Card className="border-2 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Filter className="h-5 w-5 text-primary" />
                                        <h2 className="font-semibold text-lg">Filters</h2>
                                    </div>
                                    <ProductFilters
                                        products={products}
                                        selectedCategories={selectedCategories}
                                        setSelectedCategories={setSelectedCategories}
                                        selectedVariants={selectedVariants}
                                        setSelectedVariants={setSelectedVariants}
                                        priceRange={priceRange}
                                        setPriceRange={setPriceRange}
                                    />
                                    {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 600) && (
                                        <Button
                                            onClick={handleClearFilters}
                                            variant="outline"
                                            className="w-full mt-6"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {t('common.clearFilters')}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Products (75% width) */}
                    <div className="w-full lg:w-3/4 mt-6 lg:mt-0">
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {t('products.showing', { count: filteredProducts.length, total: products.length })}
                                    </p>
                                    {filteredProducts.length !== products.length && (
                                        <p className="text-xs text-muted-foreground">
                                            Filters active
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Filter Button */}
                            <Sheet open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="lg:hidden"
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
                                            onApplyFilters={() => setIsFilterMenuOpen(false)}
                                        />
                                        <Button onClick={handleClearFilters} variant="outline" className="w-full mt-4">
                                            <X className="h-4 w-4 mr-2" />
                                            {t('common.clearFilters')}
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <Link href={`/products/${product.id}`} key={product.id}>
                                        <Card className="group cursor-pointer border-2 hover:border-primary/50 bg-card hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                                            <CardContent className="p-0">
                                                {/* Image Container */}
                                                <div className="relative aspect-square overflow-hidden bg-muted">
                                                    <img
                                                        src={
                                                            product.images && product.images.length > 0
                                                                ? `${product.images[0]}?height=400&width=400&query=${product.name}`
                                                                : "/placeholder.svg"
                                                        }
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {/* Overlay on Hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                    {/* Stock Badge */}
                                                    {product.in_stock ? (
                                                        <Badge className="absolute top-3 right-3 bg-green-500/90 text-white border-0">
                                                            In Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="absolute top-3 right-3">
                                                            Out of Stock
                                                        </Badge>
                                                    )}

                                                    {/* Quick View Button */}
                                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-white text-primary hover:bg-white/90"
                                                        >
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-5 space-y-3">
                                                    <div>
                                                        <h3 className="font-serif font-semibold text-lg text-card-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                                                            {product.name}
                                                        </h3>
                                                        {product.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <div>
                                                            <p className="text-2xl font-bold text-primary">
                                                                ${product.price.toFixed(2)}
                                                            </p>
                                                            {product.pricing_type === 'per_unit' && product.unit_type && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    per {product.unit_type}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-card rounded-lg border-2 border-dashed">
                                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{t('products.noProducts')}</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    No products match your current filters. Try adjusting your search criteria.
                                </p>
                                <Button
                                    variant="default"
                                    onClick={handleClearFilters}
                                >
                                    <X className="h-4 w-4 mr-2" />
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
