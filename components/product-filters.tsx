
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

interface ProductFiltersProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
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

const colors = [
  { id: "gold", label: "Gold", color: "#FFD700" },
  { id: "silver", label: "Silver", color: "#C0C0C0" },
  { id: "rose-gold", label: "Rose Gold", color: "#E8B4A0" },
  { id: "pearl", label: "Pearl", color: "#F8F8FF" },
]

export function ProductFilters({
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
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

  const handleColorChange = (colorId: string, checked: boolean) => {
    if (checked) {
      setSelectedColors([...selectedColors, colorId])
    } else {
      setSelectedColors(selectedColors.filter((id) => id !== colorId))
    }
  }

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
      {onApplyFilters && (
        <Button className="w-full" onClick={onApplyFilters}>
          Apply Filters
        </Button>
      )}
    </div>
  )
}
