"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { isAdminAuthenticated, getAdminUser, logoutAdmin } from "@/lib/auth"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Globe, ChevronDown } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

export default function AdminLayout({ children, currentPage = "" }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState("ENG")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const router = useRouter()

  const languages = [
    { code: "ENG", label: "English" },
    { code: "ESP", label: "Español" },
  ]

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
    // Also clear the cookie for middleware
    document.cookie = "monarca_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/admin/login")
  }

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
  }

  const selectLanguage = (langCode: string) => {
    setCurrentLanguage(langCode)
    setIsLanguageDropdownOpen(false)
    console.log("[v0] Admin language switched to:", langCode)
  }

  const navigationItems = [
    {
      href: "/admin/dashboard",
      label: currentLanguage === "ENG" ? "Dashboard" : "Panel de Control",
      icon: LayoutDashboard,
      key: "dashboard",
    },
    {
      href: "/admin/products",
      label: currentLanguage === "ENG" ? "Products" : "Productos",
      icon: Package,
      key: "products",
    },
    {
      href: "/admin/orders",
      label: currentLanguage === "ENG" ? "Orders" : "Pedidos",
      icon: ShoppingCart,
      key: "orders",
    },
    {
      href: "/admin/customers",
      label: currentLanguage === "ENG" ? "Customers" : "Clientes",
      icon: Users,
      key: "customers",
    },
    {
      href: "/admin/settings",
      label: currentLanguage === "ENG" ? "Settings" : "Configuración",
      icon: Settings,
      key: "settings",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/monarca-logo.png" alt="MONARCA" width={60} height={60} className="h-15 w-auto mx-auto mb-4" />
          <p className="text-gray-600">
            {currentLanguage === "ENG" ? "Verifying authentication..." : "Verificando autenticación..."}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b">
            <Image src="/monarca-logo.png" alt="MONARCA" width={40} height={40} className="h-10 w-auto" />
            <div>
              <h1 className="font-serif text-xl text-gray-800">MONARCA</h1>
              <p className="text-sm text-gray-500">{currentLanguage === "ENG" ? "Admin Panel" : "Panel de Admin"}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "text-orange-600 bg-orange-50" : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{adminUser}</p>
                <p className="text-xs text-gray-500">{currentLanguage === "ENG" ? "Administrator" : "Administrador"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguageDropdown}
                className="w-full flex items-center justify-between text-sm bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {currentLanguage}
                </div>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {isLanguageDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        currentLanguage === lang.code ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {lang.code} - {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">{children}</div>
    </div>
  )
}
