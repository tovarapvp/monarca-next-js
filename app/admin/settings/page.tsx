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
  const [settings, setSettings] = useState({
    siteName: "MONARCA",
    siteDescription: "Handcrafted jewelry inspired by transformation",
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
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

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
        title: "Settings saved",
        description: "The changes have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your store's general settings</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Description</Label>
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
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
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
            <CardTitle>Social Media</CardTitle>
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
            <CardTitle>Shipping Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="freeShipping">Free Shipping Threshold (USD)</Label>
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
              <Label htmlFor="standardShipping">Standard Shipping Cost (USD)</Label>
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
              <Label htmlFor="expressShipping">Express Shipping Cost (USD)</Label>
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
  )
}
