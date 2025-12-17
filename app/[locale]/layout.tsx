import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import "../globals.css"
import ConditionalHeader from "@/components/conditional-header"

const playfair = Playfair_Display({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-playfair",
})

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
})

export const metadata: Metadata = {
    title: "MONARCA - Transform Your Style",
    description:
        "Discover luxury jewelry that transforms your style. Shop necklaces, earrings, and bracelets crafted with passion.",
    generator: "v0.app",
}

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
        <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
            <body className="antialiased">
                <NextIntlClientProvider messages={messages}>
                    <ConditionalHeader />
                    {children}
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
