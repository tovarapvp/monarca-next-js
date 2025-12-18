"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { isAdminAuthenticated, getAdminUser, logoutAdmin } from "@/lib/auth"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, Warehouse } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAdminAuthenticated()
      if (!authenticated) {
        router.push("/admin/login")
        return
      }
      setIsAuthenticated(authenticated)
      setAdminUser(getAdminUser())
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    logoutAdmin()
    document.cookie = "monarca_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/admin/login")
  }

  const navigationItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/monarca-logo.png" alt="MONARCA" width={60} height={60} className="h-15 w-auto mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <Image src="/monarca-logo.png" alt="MONARCA" width={32} height={32} />
                <span className="">MONARCA Admin</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === item.href ? "bg-muted text-primary" : ""
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{adminUser}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Image src="/monarca-logo.png" alt="MONARCA" width={32} height={32} />
                    <span className="">MONARCA Admin</span>
                  </Link>
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${pathname === item.href ? "bg-muted text-foreground" : ""
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{adminUser}</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">
                {navigationItems.find(item => item.href === pathname)?.label}
              </h1>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
