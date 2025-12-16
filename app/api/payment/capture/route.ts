import { NextRequest, NextResponse } from 'next/server'
import {
    getPaymentSettings,
    getPayPalAccessToken,
    capturePayPalOrder,
} from '@/lib/payment'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { paypalOrderId, orderId } = body

        if (!paypalOrderId || !orderId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Get payment settings
        const settings = await getPaymentSettings()

        if (!settings) {
            return NextResponse.json(
                { error: 'Payment settings not found' },
                { status: 400 }
            )
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken(
            settings.paypal_client_id,
            settings.paypal_client_secret,
            settings.payment_mode
        )

        // Capture the PayPal order
        const captureResult = await capturePayPalOrder(
            accessToken,
            paypalOrderId,
            settings.payment_mode
        )

        // Check if payment was successful
        if (captureResult.status === 'COMPLETED') {
            // Update order status in database
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status: 'processing',
                    // Store PayPal transaction info
                })
                .eq('id', orderId)

            if (updateError) {
                console.error('Error updating order:', updateError)
            }

            return NextResponse.json({
                success: true,
                captureId: captureResult.purchase_units[0]?.payments?.captures[0]?.id,
                status: captureResult.status,
            })
        } else {
            return NextResponse.json(
                { error: 'Payment was not completed', status: captureResult.status },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('PayPal capture error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to capture payment' },
            { status: 500 }
        )
    }
}
