"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useCategories } from "@/hooks/use-categories"
import { Loader2 } from "lucide-react"

interface ProductFiltersProps {
  products: any[]
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  selectedVariants: { [key: string]: string[] }
  setSelectedVariants: (variants: { [key: string]: string[] }) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  onApplyFilters?: () => void
}

export function ProductFilters({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  onApplyFilters,
}: ProductFiltersProps) {
  const { categories, loading } = useCategories()

  const toggleCategory = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categorySlug))
    } else {
      setSelectedCategories([...selectedCategories, categorySlug])
    }
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Categories</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories...
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.slug}`}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={() => toggleCategory(category.slug)}
                />
                <Label
                  htmlFor={`category-${category.slug}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Price Range</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Apply Filters Button (for mobile) */}
      {onApplyFilters && (
        <Button onClick={onApplyFilters} className="w-full">
          Apply Filters
        </Button>
      )}

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([])
          setPriceRange([0, 1000])
        }}
      >
        Reset Filters
      </Button>
    </div>
  )
}
