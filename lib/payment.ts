import { supabase } from '@/lib/supabase/client'

export interface PaymentSettings {
    checkout_enabled: boolean
    payment_provider: 'paypal' | 'stripe'
    payment_mode: 'test' | 'live'
    paypal_client_id: string
    paypal_client_secret: string
    stripe_public_key: string
    stripe_secret_key: string
}

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', [
                'checkout_enabled',
                'payment_provider',
                'payment_mode',
                'paypal_client_id',
                'paypal_client_secret',
                'stripe_public_key',
                'stripe_secret_key',
            ])

        if (error) throw error

        const settingsMap = (data || []).reduce((acc, item) => {
            acc[item.key] = item.value
            return acc
        }, {} as Record<string, any>)

        return {
            checkout_enabled: settingsMap.checkout_enabled || false,
            payment_provider: settingsMap.payment_provider || 'paypal',
            payment_mode: settingsMap.payment_mode || 'test',
            paypal_client_id: settingsMap.paypal_client_id || '',
            paypal_client_secret: settingsMap.paypal_client_secret || '',
            stripe_public_key: settingsMap.stripe_public_key || '',
            stripe_secret_key: settingsMap.stripe_secret_key || '',
        }
    } catch (error) {
        console.error('Error fetching payment settings:', error)
        return null
    }
}

// PayPal API helpers
export function getPayPalBaseUrl(mode: 'test' | 'live'): string {
    return mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
}

export async function getPayPalAccessToken(
    clientId: string,
    clientSecret: string,
    mode: 'test' | 'live'
): Promise<string> {
    const baseUrl = getPayPalBaseUrl(mode)
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
        throw new Error('Failed to get PayPal access token')
    }

    const data = await response.json()
    return data.access_token
}

export interface PayPalOrderItem {
    name: string
    quantity: number
    unit_amount: {
        currency_code: string
        value: string
    }
}

export interface CreatePayPalOrderParams {
    items: PayPalOrderItem[]
    total: string
    currency: string
    returnUrl: string
    cancelUrl: string
}

export async function createPayPalOrder(
    accessToken: string,
    params: CreatePayPalOrderParams,
    mode: 'test' | 'live'
): Promise<{ id: string; approvalUrl: string }> {
    const baseUrl = getPayPalBaseUrl(mode)

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: params.currency,
                    value: params.total,
                    breakdown: {
                        item_total: {
                            currency_code: params.currency,
                            value: params.total,
                        }
                    }
                },
                items: params.items,
            }],
            application_context: {
                return_url: params.returnUrl,
                cancel_url: params.cancelUrl,
                brand_name: 'MONARCA',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
            }
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create PayPal order')
    }

    const order = await response.json()
    const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href

    return {
        id: order.id,
        approvalUrl,
    }
}

export async function capturePayPalOrder(
    accessToken: string,
    orderId: string,
    mode: 'test' | 'live'
): Promise<any> {
    const baseUrl = getPayPalBaseUrl(mode)

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to capture PayPal order')
    }

    return response.json()
}
