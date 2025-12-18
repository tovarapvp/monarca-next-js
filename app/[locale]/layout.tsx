import type React from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import ConditionalHeader from "@/components/conditional-header"

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ locale: string }>
}>) {
    const { locale } = await params
    setRequestLocale(locale)

    // Get messages for the current locale
    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            <ConditionalHeader />
            {children}
        </NextIntlClientProvider>
    )
}

