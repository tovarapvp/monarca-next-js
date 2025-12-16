import { NextRequest, NextResponse } from 'next/server'
import {
    getPaymentSettings,
    getPayPalAccessToken,
    createPayPalOrder,
    PayPalOrderItem,
} from '@/lib/payment'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { items, total, currency = 'USD', orderId } = body

        // Get payment settings
        const settings = await getPaymentSettings()

        if (!settings || !settings.checkout_enabled) {
            return NextResponse.json(
                { error: 'Checkout is not enabled' },
                { status: 400 }
            )
        }

        if (settings.payment_provider !== 'paypal') {
            return NextResponse.json(
                { error: 'PayPal is not configured as payment provider' },
                { status: 400 }
            )
        }

        if (!settings.paypal_client_id || !settings.paypal_client_secret) {
            return NextResponse.json(
                { error: 'PayPal credentials not configured' },
                { status: 400 }
            )
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken(
            settings.paypal_client_id,
            settings.paypal_client_secret,
            settings.payment_mode
        )

        // Prepare items for PayPal
        const paypalItems: PayPalOrderItem[] = items.map((item: any) => ({
            name: item.name.substring(0, 127), // PayPal has 127 char limit
            quantity: item.quantity.toString(),
            unit_amount: {
                currency_code: currency,
                value: item.price.toFixed(2),
            },
        }))

        // Get the base URL from the request
        const baseUrl = request.headers.get('origin') || 'http://localhost:3000'

        // Create PayPal order
        const paypalOrder = await createPayPalOrder(
            accessToken,
            {
                items: paypalItems,
                total: parseFloat(total).toFixed(2),
                currency,
                returnUrl: `${baseUrl}/checkout/success?orderId=${orderId}&paypalOrderId=`,
                cancelUrl: `${baseUrl}/checkout/cancel?orderId=${orderId}`,
            },
            settings.payment_mode
        )

        return NextResponse.json({
            paypalOrderId: paypalOrder.id,
            approvalUrl: paypalOrder.approvalUrl,
        })
    } catch (error: any) {
        console.error('PayPal create order error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create payment' },
            { status: 500 }
        )
    }
}
