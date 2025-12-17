"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShoppingBag, Trash2, CreditCard, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useSettings } from "@/hooks/use-settings"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface CartItem {
    id: string
    productId: string
    productVariantId?: string
    name: string
    price: number
    image: string
    quantity: number
    variant?: { name: string; value: string }
    unitType?: string
    isPerUnit?: boolean
}

export default function CheckoutPage() {
    const t = useTranslations()
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
    })
    const router = useRouter()
    const { toast } = useToast()
    const { settings } = useSettings()

    const checkoutEnabled = settings?.checkout_enabled || false
    const paymentProvider = settings?.payment_provider || "paypal"

    useEffect(() => {
        loadCart()
    }, [])

    const loadCart = () => {
        const savedCart = localStorage.getItem("monarca-cart")
        if (savedCart) {
            setCartItems(JSON.parse(savedCart))
        }
    }

    const removeItem = (itemId: string) => {
        const updatedCart = cartItems.filter((item) => item.id !== itemId)
        setCartItems(updatedCart)
        localStorage.setItem("monarca-cart", JSON.stringify(updatedCart))
        window.dispatchEvent(new CustomEvent("cart-updated"))

        toast({
            title: t('cart.itemRemoved'),
            description: t('cart.itemRemoved'),
        })
    }

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) return

        const updatedCart = cartItems.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        setCartItems(updatedCart)
        localStorage.setItem("monarca-cart", JSON.stringify(updatedCart))
        window.dispatchEvent(new CustomEvent("cart-updated"))
    }

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    const createOrder = async () => {
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                total: calculateTotal(),
                status: "pending",
                shipping_address: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    phone: formData.phone,
                },
            })
            .select()
            .single()

        if (orderError) throw orderError

        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            product_variant_id: item.productVariantId || null,
            quantity: item.quantity,
            price_at_purchase: item.price,
            variant_name: item.variant?.name || null,
            variant_value: item.variant?.value || null,
            variant_options: item.variant ? { [item.variant.name]: item.variant.value } : null,
            unit_type: item.unitType || null,
            is_per_unit: item.isPerUnit || false,
            notes: formData.notes || null,
        }))

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems)

        if (itemsError) throw itemsError

        return order
    }

    const handleWhatsAppInquiry = async () => {
        if (cartItems.length === 0) {
            toast({
                title: t('checkout.emptyCart'),
                description: t('checkout.addItems'),
                variant: "destructive",
            })
            return
        }

        if (!formData.customerName || !formData.customerEmail) {
            toast({
                title: t('common.error'),
                description: t('checkout.shippingInfo'),
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const order = await createOrder()
            await supabase
                .from("orders")
                .update({ status: "inquiry" })
                .eq("id", order.id)

            const itemsList = cartItems
                .map((item) => {
                    let itemLine = `• ${item.name} x${item.quantity}`
                    if (item.variant && item.variant.value) {
                        itemLine += `\n  └ ${item.variant.value}`
                    }
                    if (item.isPerUnit && item.unitType) {
                        itemLine += ` (${item.quantity} ${item.unitType}s)`
                    }
                    itemLine += `\n  Price: $${(item.price * item.quantity).toFixed(2)}`
                    return itemLine
                })
                .join("\n\n")

            const message = encodeURIComponent(
                `Hi! I'm interested in the following items:\n\n${itemsList}\n\n─────────────────\nTotal: $${calculateTotal().toFixed(2)}\n\nCustomer Info:\nName: ${formData.customerName}\nEmail: ${formData.customerEmail}${formData.phone ? `\nPhone: ${formData.phone}` : ""}${formData.address ? `\nAddress: ${formData.address}, ${formData.city} ${formData.state} ${formData.zipCode}` : ""}${formData.notes ? `\n\nNotes: ${formData.notes}` : ""}\n\nOrder Reference: #${order.id.slice(0, 8)}`
            )

            const whatsappNumber = settings?.contact_phone || "1234567890"
            window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${message}`, "_blank")

            localStorage.removeItem("monarca-cart")
            window.dispatchEvent(new CustomEvent("cart-updated"))

            toast({
                title: t('common.success'),
                description: t('checkout.thankYou'),
            })

            router.push("/")
        } catch (error: any) {
            console.error("Error creating inquiry:", error)
            toast({
                title: t('common.error'),
                description: error.message || t('common.error'),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOnlinePayment = async () => {
        if (cartItems.length === 0) {
            toast({
                title: t('checkout.emptyCart'),
                description: t('checkout.addItems'),
                variant: "destructive",
            })
            return
        }

        if (!formData.customerName || !formData.customerEmail || !formData.address) {
            toast({
                title: t('common.error'),
                description: t('checkout.shippingInfo'),
                variant: "destructive",
            })
            return
        }

        setPaymentLoading(true)

        try {
            const order = await createOrder()

            const response = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cartItems.map((item) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    total: calculateTotal(),
                    currency: settings?.currency || "USD",
                    orderId: order.id,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create payment")
            }

            if (data.approvalUrl) {
                window.location.href = data.approvalUrl
            } else {
                throw new Error("No approval URL returned")
            }
        } catch (error: any) {
            console.error("Error processing payment:", error)
            toast({
                title: t('common.error'),
                description: error.message || t('common.error'),
                variant: "destructive",
            })
        } finally {
            setPaymentLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (checkoutEnabled) {
            handleOnlinePayment()
        } else {
            handleWhatsAppInquiry()
        }
    }

    const total = calculateTotal()

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{t('checkout.title')}</h1>
                    <p className="text-muted-foreground">{t('checkout.orderSummary')}</p>
                </div>

                {cartItems.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">{t('checkout.emptyCart')}</h2>
                            <p className="text-muted-foreground mb-6">
                                {t('checkout.addItems')}
                            </p>
                            <Link href="/products">
                                <Button>{t('cart.startShopping')}</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left side - Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Payment Method Banner */}
                                <Card className={checkoutEnabled ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
                                    <CardContent className="py-4">
                                        <div className="flex items-center gap-3">
                                            {checkoutEnabled ? (
                                                <>
                                                    <CreditCard className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="font-medium text-green-800">
                                                            {t('checkout.paymentMethod')}: {paymentProvider === "paypal" ? "PayPal" : "Stripe"}
                                                        </p>
                                                        <p className="text-sm text-green-700">
                                                            {t('cart.secureCheckout')}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <MessageCircle className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium text-blue-800">
                                                            WhatsApp
                                                        </p>
                                                        <p className="text-sm text-blue-700">
                                                            {t('checkout.inquireViaWhatsApp')}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Customer Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('checkout.shippingInfo')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="customerName">{t('checkout.firstName')} *</Label>
                                                <Input
                                                    id="customerName"
                                                    value={formData.customerName}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, customerName: e.target.value })
                                                    }
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="customerEmail">{t('checkout.email')} *</Label>
                                                <Input
                                                    id="customerEmail"
                                                    type="email"
                                                    value={formData.customerEmail}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, customerEmail: e.target.value })
                                                    }
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">{t('checkout.phone')}</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Shipping Address */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('checkout.address')} {checkoutEnabled && "*"}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="address">{t('checkout.address')} {checkoutEnabled && "*"}</Label>
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="123 Main Street"
                                                required={checkoutEnabled}
                                            />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <Label htmlFor="city">{t('checkout.city')}</Label>
                                                <Input
                                                    id="city"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">{t('checkout.state')}</Label>
                                                <Input
                                                    id="state"
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="zipCode">{t('checkout.zipCode')}</Label>
                                                <Input
                                                    id="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                    placeholder="12345"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right side - Order Summary */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                                <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                                    {item.variant && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.variant.name}: {item.variant.value}
                                                        </p>
                                                    )}
                                                    {item.isPerUnit && item.unitType && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.quantity} {item.unitType}(s)
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => updateQuantity(item.id, item.quantity - (item.isPerUnit ? 0.5 : 1))}
                                                        >
                                                            -
                                                        </Button>
                                                        <span className="text-sm font-medium">{item.quantity}</span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => updateQuantity(item.id, item.quantity + (item.isPerUnit ? 0.5 : 1))}
                                                        >
                                                            +
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 ml-auto text-destructive"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-4 space-y-2">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>{t('cart.total')}</span>
                                                <span className="text-primary">${total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Payment Button */}
                                        {checkoutEnabled ? (
                                            <Button
                                                type="submit"
                                                disabled={isLoading || paymentLoading}
                                                className="w-full"
                                                size="lg"
                                            >
                                                {paymentLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        {t('checkout.processing')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        {t('checkout.placeOrder')} ${total.toFixed(2)}
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                size="lg"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        {t('checkout.processing')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        {t('checkout.inquireViaWhatsApp')}
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        <p className="text-xs text-muted-foreground text-center">
                                            {checkoutEnabled
                                                ? t('cart.secureDescription')
                                                : t('checkout.inquireViaWhatsApp')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
