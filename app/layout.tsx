import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <ConditionalHeader />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
