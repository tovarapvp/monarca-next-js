"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { loginAdmin } from "@/lib/auth"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple authentication check (in production, this should be server-side)
    if (username === "admin" && password === "monarca2024") {
      loginAdmin(username)

      toast({
        title: "Access Granted / Acceso Concedido",
        description: "Welcome to the admin panel / Bienvenido al panel de administración",
      })

      setTimeout(() => {
        window.location.href = "/admin/dashboard"
      }, 1000)
    } else {
      toast({
        title: "Authentication Error / Error de Autenticación",
        description: "Incorrect username or password / Usuario o contraseña incorrectos",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/monarca-logo.png" alt="MONARCA" width={60} height={60} className="h-15 w-auto" />
          </div>
          <CardTitle className="text-2xl font-serif text-gray-800">Admin Panel / Panel de Administración</CardTitle>
          <CardDescription>
            Enter your credentials to access the system / Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username / Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password / Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password / Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
              {isLoading ? "Logging in... / Iniciando sesión..." : "Login / Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Test credentials / Credenciales de prueba:</p>
            <p>
              Username / Usuario: <code className="bg-gray-100 px-1 rounded">admin</code>
            </p>
            <p>
              Password / Contraseña: <code className="bg-gray-100 px-1 rounded">monarca2024</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
