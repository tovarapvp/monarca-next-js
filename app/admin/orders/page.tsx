"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isAdminAuthenticated } from "@/lib/auth"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Eye, Package2 } from "lucide-react"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
}

// Sample orders data
const sampleOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "María González",
    customerEmail: "maria@email.com",
    items: [
      { name: "Collar Mariposa Dorado", quantity: 1, price: 299.99 },
      { name: "Aretes Cristal Naranja", quantity: 2, price: 189.99 },
    ],
    total: 679.97,
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "ORD-002",
    customerName: "Ana Rodríguez",
    customerEmail: "ana@email.com",
    items: [{ name: "Pulsera Eslabones Oro Rosa", quantity: 1, price: 249.99 }],
    total: 249.99,
    status: "processing",
    createdAt: "2024-01-14T15:45:00Z",
  },
  {
    id: "ORD-003",
    customerName: "Carmen López",
    customerEmail: "carmen@email.com",
    items: [
      { name: "Collar Mariposa Dorado", quantity: 1, price: 299.99 },
      { name: "Pulsera Eslabones Oro Rosa", quantity: 1, price: 249.99 },
    ],
    total: 549.98,
    status: "shipped",
    createdAt: "2024-01-13T09:20:00Z",
  },
]

export default function AdminOrders() {
  const [orders] = useState<Order[]>(sampleOrders)

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage your store's orders</p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order {order.id}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {order.customerName} • {order.customerEmail}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Package2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Change Status
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">Total: ${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders will appear here when customers make purchases.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
