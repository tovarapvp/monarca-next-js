"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createCategory } from "@/hooks/use-categories"
import { uploadImage } from "@/lib/image-upload"
import Image from "next/image"

interface CreateCategoryDialogProps {
    onCategoryCreated?: (categoryId: string) => void
    trigger?: React.ReactNode
}

export function CreateCategoryDialog({ onCategoryCreated, trigger }: CreateCategoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        display_order: 0,
    })

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
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
    }

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            description: "",
            display_order: 0,
        })
        removeImage()
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
            let imageUrl = ""
            if (imageFile) {
                setIsUploadingImage(true)
                imageUrl = await uploadImage(imageFile, 'category-images', 'categories')
            }

            const newCategory = await createCategory({
                name: formData.name,
                slug: formData.slug,
                description: formData.description || null,
                image_url: imageUrl || null,
                display_order: formData.display_order,
            })

            toast({
                title: "Category created",
                description: `"${formData.name}" has been added successfully.`,
            })

            // Notify parent component
            if (onCategoryCreated && newCategory) {
                onCategoryCreated(newCategory.id)
            }

            // Reset and close
            resetForm()
            setOpen(false)
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
        <Dialog open={open} onOpenChange={(isOpen: boolean) => {
            setOpen(isOpen)
            if (!isOpen) resetForm()
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" type="button" className="h-6 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        New
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>
                            Add a new product category. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g., Necklaces"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="e.g., necklaces"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                URL-friendly identifier (auto-generated from name)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category..."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image (optional)</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            {!imagePreview ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Image
                                </Button>
                            ) : (
                                <div className="relative aspect-video rounded-lg overflow-hidden border">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input
                                id="order"
                                type="number"
                                min="0"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isUploadingImage ? "Uploading..." : "Creating..."}
                                </>
                            ) : (
                                "Create Category"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
