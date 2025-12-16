"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { useCategories, deleteCategory } from "@/hooks/use-categories"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function CategoriesPage() {
    const { categories, loading, error, refetch } = useCategories()
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
            return
        }

        try {
            await deleteCategory(id)
            toast({
                title: "Category deleted",
                description: `"${name}" has been removed.`,
            })
            refetch()
        } catch (error) {
            console.error("Error deleting category:", error)
            toast({
                title: "Error",
                description: "Failed to delete category. It may still have associated products.",
                variant: "destructive",
            })
        }
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading categories: {error.message}
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
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Categories</h1>
                    <p className="text-gray-600 mt-1">Manage product categories</p>
                </div>
                <Link href="/admin/categories/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Category
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Categories List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400" />        </div>
            ) : filteredCategories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600">
                            {searchQuery ? "No categories match your search." : "No categories yet. Create one to get started!"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => (
                        <Card key={category.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{category.name}</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">/{category.slug}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        Order: {category.display_order}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {category.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                                        <Button variant="outline" className="w-full gap-2">
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="gap-2 text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(category.id, category.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
