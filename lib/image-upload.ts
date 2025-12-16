import { supabase } from './supabase/client'
import imageCompression from 'browser-image-compression'

/**
 * Compress and upload image to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @param folder - Optional folder within the bucket
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
    file: File,
    bucket: string = 'product-images',
    folder?: string
): Promise<string> {
    try {
        // Compression options
        const options = {
            maxSizeMB: 0.5, // Max 500KB
            maxWidthOrHeight: 1920, // Max dimension
            useWebWorker: true,
            fileType: 'image/webp', // Convert to WebP for better compression
        }

        // Compress the image
        const compressedFile = await imageCompression(file, options)

        // Generate unique filename
        const fileExt = 'webp'
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path)

        return urlData.publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        throw error
    }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
    files: File[],
    bucket: string = 'product-images',
    folder?: string
): Promise<string[]> {
    const uploadPromises = files.map(file => uploadImage(file, bucket, folder))
    return Promise.all(uploadPromises)
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(
    url: string,
    bucket: string = 'product-images'
): Promise<void> {
    try {
        // Extract file path from URL
        const urlParts = url.split(`/${bucket}/`)
        if (urlParts.length < 2) throw new Error('Invalid URL format')

        const filePath = urlParts[1]

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath])

        if (error) throw error
    } catch (error) {
        console.error('Error deleting image:', error)
        throw error
    }
}
