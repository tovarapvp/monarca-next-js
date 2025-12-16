/* Create storage bucket for product images */

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated' 
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated' 
);
