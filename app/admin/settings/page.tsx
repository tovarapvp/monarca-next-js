"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, AlertCircle, CreditCard, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSettings, updateMultipleSettings } from "@/hooks/use-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function AdminSettings() {
  const { settings: dbSettings, loading, error, refetch } = useSettings()
  const [settings, setSettings] = useState({
    site_name: "",
    contact_email: "",
    contact_phone: "",
    currency: "USD",
    tax_rate: 0,
    free_shipping_threshold: 200,
    // Payment settings
    checkout_enabled: false,
    payment_provider: "paypal" as "paypal" | "stripe",
    payment_mode: "test" as "test" | "live",
    paypal_client_id: "",
    paypal_client_secret: "",
    stripe_public_key: "",
    stripe_secret_key: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
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
        // Payment settings
        checkout_enabled: dbSettings.checkout_enabled || false,
        payment_provider: dbSettings.payment_provider || "paypal",
        payment_mode: dbSettings.payment_mode || "test",
        paypal_client_id: dbSettings.paypal_client_id || "",
        paypal_client_secret: dbSettings.paypal_client_secret || "",
        stripe_public_key: dbSettings.stripe_public_key || "",
        stripe_secret_key: dbSettings.stripe_secret_key || "",
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
        // Payment settings
        checkout_enabled: settings.checkout_enabled,
        payment_provider: JSON.stringify(settings.payment_provider),
        payment_mode: JSON.stringify(settings.payment_mode),
        paypal_client_id: JSON.stringify(settings.paypal_client_id),
        paypal_client_secret: JSON.stringify(settings.paypal_client_secret),
        stripe_public_key: JSON.stringify(settings.stripe_public_key),
        stripe_secret_key: JSON.stringify(settings.stripe_secret_key),
      })

      toast({
        title: "Settings saved",
        description: "The changes have been saved successfully.",
      })
      refetch()
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
            <CardTitle>Pricing &amp; Tax</CardTitle>
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

      {/* Payment Settings - Full Width */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Payment & Checkout</CardTitle>
                <CardDescription>Configure online payments for your store</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={settings.checkout_enabled ? "default" : "secondary"}>
                {settings.checkout_enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Badge variant={settings.payment_mode === "live" ? "destructive" : "outline"}>
                {settings.payment_mode === "live" ? "LIVE" : "Test Mode"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Checkout Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
              <Label htmlFor="checkout_enabled" className="text-base font-medium">Enable Online Checkout</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay online. When disabled, only WhatsApp inquiries are available.
              </p>
            </div>
            <Switch
              id="checkout_enabled"
              checked={settings.checkout_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, checkout_enabled: checked })}
            />
          </div>

          {settings.checkout_enabled && (
            <>
              {/* Payment Provider Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="payment_provider">Payment Provider</Label>
                  <Select
                    value={settings.payment_provider}
                    onValueChange={(value: "paypal" | "stripe") => setSettings({ ...settings, payment_provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal (Recommended for Venezuela)</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    PayPal works in more countries. Stripe requires business registration.
                  </p>
                </div>
                <div>
                  <Label htmlFor="payment_mode">Payment Mode</Label>
                  <Select
                    value={settings.payment_mode}
                    onValueChange={(value: "test" | "live") => setSettings({ ...settings, payment_mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">Test Mode (Sandbox)</SelectItem>
                      <SelectItem value="live">Live Mode (Real Payments)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use Test Mode while setting up. Switch to Live for real transactions.
                  </p>
                </div>
              </div>

              {/* Show/Hide Secrets Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showSecrets ? "Hide" : "Show"} API Keys
                </Button>
              </div>

              {/* PayPal Settings */}
              {settings.payment_provider === "paypal" && (
                <div className="border rounded-lg p-4 space-y-4 bg-blue-50/50">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="text-[#003087]">PayPal</span> Configuration
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="paypal_client_id">Client ID</Label>
                      <Input
                        id="paypal_client_id"
                        type={showSecrets ? "text" : "password"}
                        value={settings.paypal_client_id}
                        onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value })}
                        placeholder="Enter PayPal Client ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypal_client_secret">Client Secret</Label>
                      <Input
                        id="paypal_client_secret"
                        type={showSecrets ? "text" : "password"}
                        value={settings.paypal_client_secret}
                        onChange={(e) => setSettings({ ...settings, paypal_client_secret: e.target.value })}
                        placeholder="Enter PayPal Client Secret"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your credentials from{" "}
                    <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      PayPal Developer Dashboard
                    </a>
                  </p>
                </div>
              )}

              {/* Stripe Settings */}
              {settings.payment_provider === "stripe" && (
                <div className="border rounded-lg p-4 space-y-4 bg-purple-50/50">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="text-[#635BFF]">Stripe</span> Configuration
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="stripe_public_key">Publishable Key</Label>
                      <Input
                        id="stripe_public_key"
                        type={showSecrets ? "text" : "password"}
                        value={settings.stripe_public_key}
                        onChange={(e) => setSettings({ ...settings, stripe_public_key: e.target.value })}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripe_secret_key">Secret Key</Label>
                      <Input
                        id="stripe_secret_key"
                        type={showSecrets ? "text" : "password"}
                        value={settings.stripe_secret_key}
                        onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API keys from{" "}
                    <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                      Stripe Dashboard
                    </a>
                  </p>
                </div>
              )}

              {/* Warning for Live Mode */}
              {settings.payment_mode === "live" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Live Mode Active:</strong> Real transactions will be processed. Make sure your API keys are correct before enabling checkout.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
