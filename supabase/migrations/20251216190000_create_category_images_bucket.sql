/* Create storage bucket for category images */

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files
CREATE POLICY "Public Access for Category Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'category-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated' 
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete category images"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated' 
);
