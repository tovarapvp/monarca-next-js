"use client"

export interface Variant {
  name: string;
  value: string;
  price?: number; // Optional price for the variant
}

export interface Product {
  id: string
  name: string
  description: string
  price: number // Base price
  category: string
  images: string[]
  variants: Variant[]
  inStock: boolean
  createdAt: string
}

const STORAGE_KEY = "monarca_products"

// Initialize with some sample products
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Golden Butterfly Necklace",
    description:
      "Elegant necklace with an 18k gold butterfly pendant, inspired by transformation and natural beauty.",
    price: 299.99,
    category: "necklaces",
    images: ["/placeholder-6mn2g.png"],
    variants: [
      { name: "Material", value: "18k Gold", price: 329.99 },
      { name: "Material", value: "14k Gold", price: 299.99 },
      { name: "Length", value: "45cm" },
    ],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Orange Crystal Earrings",
    description: "Hanging earrings with orange crystals that capture the light, perfect for special occasions.",
    price: 189.99,
    category: "earrings",
    images: ["/orange-crystal-earrings.png"],
    variants: [
      { name: "Material", value: "925 Silver" },
      { name: "Stone", value: "Orange Crystal" },
    ],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Rose Gold Link Bracelet",
    description: "Link bracelet in rose gold with a polished finish, a timeless and elegant design.",
    price: 249.99,
    category: "bracelets",
    images: ["/rose-gold-chain-bracelet.png"],
    variants: [
      { name: "Material", value: "14k Rose Gold" },
      { name: "Size", value: "Adjustable" },
    ],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
]

export const getProducts = (): Product[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Initialize with sample products
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProducts))
    return sampleProducts
  }

  return JSON.parse(stored)
}

export const addProduct = (product: Omit<Product, "id">): Product => {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
  }

  products.push(newProduct)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))

  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)

  if (index === -1) return null

  products[index] = { ...products[index], ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))

  return products[index]
}

export const deleteProduct = (id: string): boolean => {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)

  if (filtered.length === products.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export const getProduct = (id: string): Product | null => {
  const products = getProducts()
  return products.find((p) => p.id === id) || null
}
