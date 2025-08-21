"use client"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  variants: { name: string; value: string }[]
  inStock: boolean
  createdAt: string
}

const STORAGE_KEY = "monarca_products"

// Initialize with some sample products
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Collar Mariposa Dorado",
    description:
      "Elegante collar con dije de mariposa en oro de 18k, inspirado en la transformación y la belleza natural.",
    price: 299.99,
    category: "necklaces",
    images: ["/placeholder-6mn2g.png"],
    variants: [
      { name: "Material", value: "Oro 18k" },
      { name: "Longitud", value: "45cm" },
    ],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Aretes Cristal Naranja",
    description: "Aretes colgantes con cristales naranjas que capturan la luz, perfectos para ocasiones especiales.",
    price: 189.99,
    category: "earrings",
    images: ["/orange-crystal-earrings.png"],
    variants: [
      { name: "Material", value: "Plata 925" },
      { name: "Piedra", value: "Cristal Naranja" },
    ],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Pulsera Eslabones Oro Rosa",
    description: "Pulsera de eslabones en oro rosa con acabado pulido, diseño atemporal y elegante.",
    price: 249.99,
    category: "bracelets",
    images: ["/rose-gold-chain-bracelet.png"],
    variants: [
      { name: "Material", value: "Oro Rosa 14k" },
      { name: "Talla", value: "Ajustable" },
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
