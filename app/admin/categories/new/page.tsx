"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import { createCategory } from "@/hooks/use-categories"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/image-upload"
import Image from "next/image"

export default function NewCategory() {
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        display_order: "0",
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { toast } = useToast()

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        })
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }
        setImageFile(null)
        setImagePreview("")
        setFormData({ ...formData, image_url: "" })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast({
                title: "Validation Error",
                description: "Category name is required",
                variant: "destructive",
            })
            return
        }

        if (!formData.slug.trim()) {
            toast({
                title: "Validation Error",
                description: "Category slug is required",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            // Upload image if selected
            let imageUrl = formData.image_url
            if (imageFile) {
                setIsUploadingImage(true)
                toast({
                    title: "Uploading image...",
                    description: "Compressing and uploading category image",
                })
                imageUrl = await uploadImage(imageFile, 'product-images', 'categories')
            }

            await createCategory({
                name: formData.name,
                slug: formData.slug,
                description: formData.description || null,
                image_url: imageUrl || null,
                display_order: parseInt(formData.display_order) || 0,
            })

            toast({
                title: "Category created",
                description: `"${formData.name}" has been added successfully.`,
            })

            router.push("/admin/categories")
        } catch (error: any) {
            console.error("Error creating category:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to create category. The slug may already exist.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsUploadingImage(false)
        }
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/categories">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Add New Category</h1>
                    <p className="text-gray-600">Create a new product category with image</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g., Necklaces"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="e.g., necklaces"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    URL-friendly version of the name (auto-generated)
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this category..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Category Image</Label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    <div className="mt-2">
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                                            <Image
                                                src={imagePreview}
                                                alt="Category preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full mt-2"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Image
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    Image will be automatically compressed to WebP format
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Lower numbers appear first
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Link href="/admin/categories" className="flex-1">
                            <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isLoading || isUploadingImage} className="flex-1">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isUploadingImage ? "Uploading..." : "Creating..."}
                                </>
                            ) : (
                                "Create Category"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
