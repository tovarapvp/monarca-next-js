"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isAdminAuthenticated } from "@/lib/auth"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "MONARCA",
    siteDescription: "Joyería artesanal inspirada en la transformación",
    contactEmail: "info@monarca.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Jewelry Street, City, State 12345",
    socialMedia: {
      instagram: "@monarca_jewelry",
      facebook: "MonarcaJewelry",
      whatsapp: "+1555123456",
    },
    shipping: {
      freeShippingThreshold: "100",
      standardShippingCost: "15",
      expressShippingCost: "25",
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const authenticated = isAdminAuthenticated()
    if (!authenticated) {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(authenticated)
    loadSettings()
  }, [router])

  const loadSettings = () => {
    // In a real app, this would load from a database
    const savedSettings = localStorage.getItem("monarca_settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would save to a database
      localStorage.setItem("monarca_settings", JSON.stringify(settings))

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Verificando autenticación...</div>
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
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Package className="h-5 w-5" />
              Productos
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Users className="h-5 w-5" />
              Clientes
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2 text-orange-600 bg-orange-50 rounded-lg"
            >
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Configuración</h1>
            <p className="text-gray-600">Administra la configuración general de tu tienda</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Nombre del Sitio</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Descripción</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={settings.socialMedia.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, instagram: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={settings.socialMedia.facebook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, facebook: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={settings.socialMedia.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, whatsapp: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="freeShipping">Envío Gratis a partir de (USD)</Label>
                <Input
                  id="freeShipping"
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, freeShippingThreshold: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="standardShipping">Costo Envío Estándar (USD)</Label>
                <Input
                  id="standardShipping"
                  type="number"
                  value={settings.shipping.standardShippingCost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, standardShippingCost: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="expressShipping">Costo Envío Express (USD)</Label>
                <Input
                  id="expressShipping"
                  type="number"
                  value={settings.shipping.expressShippingCost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, expressShippingCost: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
