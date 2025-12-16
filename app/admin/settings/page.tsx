"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSettings, updateMultipleSettings } from "@/hooks/use-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminSettings() {
  const { settings: dbSettings, loading, error } = useSettings()
  const [settings, setSettings] = useState({
    site_name: "",
    contact_email: "",
    contact_phone: "",
    currency: "USD",
    tax_rate: 0,
    free_shipping_threshold: 200,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (dbSettings && Object.keys(dbSettings).length > 0) {
      setSettings({
        site_name: dbSettings.site_name || "MONARCA",
        contact_email: dbSettings.contact_email || "",
        contact_phone: dbSettings.contact_phone || "",
        currency: dbSettings.currency || "USD",
        tax_rate: dbSettings.tax_rate || 0,
        free_shipping_threshold: dbSettings.free_shipping_threshold || 200,
      })
    }
  }, [dbSettings])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateMultipleSettings({
        site_name: JSON.stringify(settings.site_name),
        contact_email: JSON.stringify(settings.contact_email),
        contact_phone: JSON.stringify(settings.contact_phone),
        currency: JSON.stringify(settings.currency),
        tax_rate: settings.tax_rate,
        free_shipping_threshold: settings.free_shipping_threshold,
      })

      toast({
        title: "Settings saved",
        description: "The changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "There was an error saving the settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading settings: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your store configuration</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="MONARCA"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                placeholder="USD"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default currency for prices
              </p>
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
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="contact@monarca.com"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone / WhatsApp</Label>
              <Input
                id="contactPhone"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for WhatsApp inquiries
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage added to product prices
              </p>
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
              <Label htmlFor="freeShipping">Free Shipping Threshold ({settings.currency})</Label>
              <Input
                id="freeShipping"
                type="number"
                min="0"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseInt(e.target.value) || 0 })}
                placeholder="200"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Free shipping for orders over this amount
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Settings are stored in Supabase</p>
              <p className="text-sm text-blue-700">
                These settings are saved to your database and will persist across sessions.
                Changes take effect immediately after saving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
