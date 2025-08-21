"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, X, CreditCard, Shield } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("monarca-cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    setIsLoading(false)
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }

    const updatedItems = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setCartItems(updatedItems)
    localStorage.setItem("monarca-cart", JSON.stringify(updatedItems))
  }

  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedItems)
    localStorage.setItem("monarca-cart", JSON.stringify(updatedItems))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Image src="/monarca-logo.png" alt="MONARCA" width={120} height={120} className="mx-auto mb-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-4 text-gray-900">Tu Carrito / Your Cart</h1>
          <p className="text-lg text-gray-600 mb-8">Tu carrito está vacío.</p>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/products">Ir a la Tienda</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-gray-900">Tu Carrito / Your Cart</h1>

        <div className="grid lg:grid-cols-10 gap-8">
          {/* Left Column - Product List (70% width) */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    {item.variant && <p className="text-sm text-gray-500 mb-2">Color: {item.variant}</p>}
                    <p className="text-orange-600 font-semibold text-lg">${item.price}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Order Summary (30% width) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="font-serif text-xl font-bold mb-6 text-gray-900">Order Summary / Resumen del Pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-sm text-gray-500">Los costos de envío se calcularán en el siguiente paso.</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg">
                  Finalizar Compra / Proceed to Checkout
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/products">Seguir Comprando / Continue Shopping</Link>
                </Button>
              </div>

              {/* Trust Icons */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3 text-center">Secure Payment Methods</p>
                <div className="flex justify-center gap-3">
                  <div className="bg-gray-50 px-3 py-2 rounded-md flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Visa</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-md flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">Mastercard</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-md flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
