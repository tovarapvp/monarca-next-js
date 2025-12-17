"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, X, CreditCard, Shield, ShoppingCart, Mail, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface CartItem {
    id: string;
    productId: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    productVariantId?: string;
    variant?: { name: string; value: string };
    unitType?: string;
    isPerUnit?: boolean;
}

export default function CartPage() {
    const t = useTranslations()
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
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
        window.dispatchEvent(new CustomEvent("cart-updated"))
    }

    const removeItem = (id: string) => {
        const updatedItems = cartItems.filter((item) => item.id !== id)
        setCartItems(updatedItems)
        localStorage.setItem("monarca-cart", JSON.stringify(updatedItems))
        window.dispatchEvent(new CustomEvent("cart-updated"))
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const formatCartItemForMessage = (item: CartItem) => {
        let details = `- ${item.quantity}x ${item.name}`
        if (item.variant && item.variant.value) {
            details += `\n  └ ${item.variant.value}`
        }
        if (item.isPerUnit && item.unitType) {
            details += ` (${item.quantity} ${item.unitType}s)`
        }
        details += `\n  Price: $${item.price.toFixed(2)} each | Subtotal: $${(item.price * item.quantity).toFixed(2)}`
        return details
    }

    const handleWhatsAppCheckout = () => {
        const itemsDetails = cartItems.map(formatCartItemForMessage).join("\n\n")
        const message = `Hello MONARCA! 👋\n\nI would like to place an order with the following items from my cart:\n\n${itemsDetails}\n\n─────────────────\nTotal: $${subtotal.toFixed(2)}\n\nPlease let me know the next steps for payment and shipping. Thank you!`
        const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, "_blank")
    }

    const handleEmailCheckout = () => {
        const today = new Date().toLocaleDateString("en-US")
        const subject = `Order from MONARCA cart - ${today}`
        const itemsDetails = cartItems.map(formatCartItemForMessage).join("\n\n")
        const body = `Hello MONARCA! 👋\n\nI would like to place an order with the following items from my cart:\n\n${itemsDetails}\n\n─────────────────\nTotal: $${subtotal.toFixed(2)}\n\nPlease let me know the next steps for payment and shipping. Thank you!`
        const emailUrl = `mailto:orders@monarca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.location.href = emailUrl
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="text-center max-w-md">
                    <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                    <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">{t('cart.empty')}</h1>
                    <p className="text-lg text-muted-foreground mb-8">{t('cart.emptyDescription')}</p>
                    <Button asChild size="lg">
                        <Link href="/products">{t('cart.continueShopping')}</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-foreground">{t('cart.title')}</h1>

                <div className="grid lg:grid-cols-10 gap-8">
                    {/* Left Column - Product List */}
                    <div className="lg:col-span-7 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                                            <Image
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-foreground mb-1 text-lg">{item.name}</h3>
                                            {item.variant && (
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    <span className="font-medium">{item.variant.name}:</span> {item.variant.value}
                                                </p>
                                            )}
                                            {item.isPerUnit && item.unitType ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                                            {t('product.perUnit', { unit: item.unitType })}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm text-muted-foreground">
                                                            ${item.price.toFixed(2)} per {item.unitType}
                                                        </span>
                                                        <span className="text-sm font-medium text-foreground">
                                                            ${item.price.toFixed(2)} × {item.quantity} {item.unitType}{item.quantity !== 1 ? 's' : ''} = ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-primary font-semibold text-xl">${item.price.toFixed(2)}</p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-sm text-muted-foreground">
                                                            ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 my-3 sm:my-0">
                                            {item.isPerUnit && item.unitType ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, Math.max(0.5, item.quantity - 0.5))}
                                                        className="w-9 h-9 rounded-full"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <div className="min-w-[80px] text-center">
                                                        <span className="font-semibold text-lg block">{item.quantity}</span>
                                                        <span className="text-xs text-muted-foreground">{item.unitType}(s)</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 0.5)}
                                                        className="w-9 h-9 rounded-full"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-9 h-9 rounded-full"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <span className="w-10 text-center font-semibold text-lg">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-9 h-9 rounded-full"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>

                                        <div className="text-right flex-shrink-0 w-24">
                                            <p className="font-semibold text-foreground text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive absolute top-2 right-2 sm:static"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-serif text-xl font-bold mb-6 text-foreground">{t('cart.orderSummary')}</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('cart.shipping')}</span>
                                        <span className="text-sm text-muted-foreground">{t('cart.shippingCalculated')}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>{t('cart.total')}</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button asChild size="lg" className="w-full">
                                        <Link href="/checkout">{t('cart.checkout')}</Link>
                                    </Button>

                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/products">{t('cart.continueShopping')}</Link>
                                    </Button>
                                </div>

                                {/* Conversational Checkout */}
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-muted-foreground mb-3 text-center">{t('cart.secureDescription')}</p>
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 bg-transparent hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                                            onClick={handleWhatsAppCheckout}
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            {t('cart.whatsappCheckout')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 bg-transparent hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
                                            onClick={handleEmailCheckout}
                                        >
                                            <Mail className="h-4 w-4" />
                                            {t('cart.emailCheckout')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Trust Icons */}
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-muted-foreground mb-3 text-center">{t('cart.secureCheckout')}</p>
                                    <div className="flex justify-center gap-3">
                                        <div className="bg-muted px-3 py-2 rounded-md flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium">Visa</span>
                                        </div>
                                        <div className="bg-muted px-3 py-2 rounded-md flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-red-600" />
                                            <span className="text-sm font-medium">Mastercard</span>
                                        </div>
                                        <div className="bg-muted px-3 py-2 rounded-md flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm font-medium">PayPal</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
