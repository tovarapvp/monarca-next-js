"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, MessageCircle, Loader2 } from "lucide-react"

function CancelContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-10 w-10 text-gray-500" />
                    </div>
                    <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Your payment was cancelled and no charges were made. Your cart items are still saved if you&apos;d like to try again.
                    </p>

                    {orderId && (
                        <p className="text-sm text-muted-foreground">
                            Reference: #{orderId.slice(0, 8)}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link href="/checkout" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to Checkout
                            </Button>
                        </Link>
                        <a
                            href="https://wa.me/1234567890?text=Hi, I need help with my order"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact via WhatsApp
                            </Button>
                        </a>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                            Prefer to pay another way?
                        </p>
                        <Link href="/products">
                            <Button variant="link" className="text-primary">
                                Continue browsing our collection →
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CheckoutCancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
        }>
            <CancelContent />
        </Suspense>
    )
}
