"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, Package, ArrowRight } from "lucide-react"

function SuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(true)
    const [error, setError] = useState("")
    const [orderDetails, setOrderDetails] = useState<{
        orderId: string
        captureId?: string
    } | null>(null)

    useEffect(() => {
        const orderId = searchParams.get("orderId")
        const paypalOrderId = searchParams.get("token") // PayPal returns the order ID as 'token'

        if (!orderId) {
            setError("Order not found")
            setIsProcessing(false)
            return
        }

        // If we have a PayPal order ID, capture the payment
        if (paypalOrderId) {
            capturePayment(orderId, paypalOrderId)
        } else {
            // Direct success (maybe from WhatsApp order)
            setOrderDetails({ orderId })
            setIsProcessing(false)
            // Clear cart
            localStorage.removeItem("monarca-cart")
            window.dispatchEvent(new CustomEvent("cart-updated"))
        }
    }, [searchParams])

    const capturePayment = async (orderId: string, paypalOrderId: string) => {
        try {
            const response = await fetch("/api/payment/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, paypalOrderId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to process payment")
            }

            setOrderDetails({
                orderId,
                captureId: data.captureId,
            })

            // Clear cart
            localStorage.removeItem("monarca-cart")
            window.dispatchEvent(new CustomEvent("cart-updated"))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-10 pb-10">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
                        <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
                        <p className="text-muted-foreground">
                            Please wait while we confirm your payment.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-10 pb-10">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Error</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Link href="/checkout">
                            <Button>Try Again</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Thank you for your order. We&apos;ve received your payment and will start processing your order right away.
                    </p>

                    {orderDetails && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Order ID</span>
                                <span className="font-mono font-medium">
                                    #{orderDetails.orderId.slice(0, 8)}
                                </span>
                            </div>
                            {orderDetails.captureId && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Transaction ID</span>
                                    <span className="font-mono text-xs">
                                        {orderDetails.captureId.slice(0, 16)}...
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>You&apos;ll receive an email confirmation shortly</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link href="/products" className="flex-1">
                            <Button variant="outline" className="w-full">
                                Continue Shopping
                            </Button>
                        </Link>
                        <Link href="/" className="flex-1">
                            <Button className="w-full">
                                Back to Home
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
