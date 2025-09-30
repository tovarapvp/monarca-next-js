
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Product } from "@/lib/products"

interface ProductFiltersProps {
  products: Product[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedVariants: { [key: string]: string[] };
  setSelectedVariants: (variants: { [key: string]: string[] }) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  onApplyFilters?: () => void; // Optional: for mobile sheet to close
}

const categories = [
  { id: "necklaces", label: "Necklaces" },
  { id: "earrings", label: "Earrings" },
  { id: "bracelets", label: "Bracelets" },
  { id: "rings", label: "Rings" },
]

export function ProductFilters({
  products,
  selectedCategories,
  setSelectedCategories,
  selectedVariants,
  setSelectedVariants,
  priceRange,
  setPriceRange,
  onApplyFilters,
}: ProductFiltersProps) {

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  const handleVariantChange = (variantName: string, value: string, checked: boolean) => {
    const newSelectedVariants = { ...selectedVariants };
    if (checked) {
      newSelectedVariants[variantName] = [...(newSelectedVariants[variantName] || []), value];
    } else {
      newSelectedVariants[variantName] = newSelectedVariants[variantName].filter((v) => v !== value);
    }
    setSelectedVariants(newSelectedVariants);
  }

  const allVariants = products.reduce((acc, product) => {
    product.variants.forEach(variant => {
      if (!acc[variant.name]) {
        acc[variant.name] = new Set();
      }
      acc[variant.name].add(variant.value);
    });
    return acc;
  }, {} as { [key: string]: Set<string> });

  return (
    <div className="space-y-8">
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

        {/* Variant Filters */}
        {Object.entries(allVariants).map(([name, values]) => (
          <div key={name} className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-foreground">{name}</h3>
            <div className="space-y-3">
              {Array.from(values).map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${name}-${value}`}
                    checked={selectedVariants[name]?.includes(value) || false}
                    onCheckedChange={(checked) => handleVariantChange(name, value, checked as boolean)}
                  />
                  <label htmlFor={`${name}-${value}`} className="text-sm font-medium text-foreground cursor-pointer">
                    {value}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {onApplyFilters && (
        <Button className="w-full" onClick={onApplyFilters}>
          Apply Filters
        </Button>
      )}
    </div>
  )
}
