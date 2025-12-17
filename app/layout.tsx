import type React from "react"
import "./globals.css"

// Root layout just passes through to locale layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
