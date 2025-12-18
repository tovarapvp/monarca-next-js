"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { useEffect } from "react"

interface Customer {
    id: string
    full_name: string | null
    role: string
    email?: string
    order_count?: number
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchCustomers()
    }, [])

    async function fetchCustomers() {
        try {
            setLoading(true)
            setError(null)

            // Fetch profiles with user email from auth.users
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .order('full_name', { ascending: true })

            if (fetchError) throw fetchError

            setCustomers(data || [])
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching customers:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredCustomers = customers.filter((customer) =>
        customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading customers: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-600 mt-1">View and manage customer profiles</p>
                </div>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Customers Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                </div>
            ) : filteredCustomers.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600">
                            {searchQuery ? "No customers match your search." : "No customers found."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {customer.full_name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {customer.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                                                    {customer.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link href={`/admin/customers/${customer.id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
