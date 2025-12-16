/* Add Categories Table and Update Products */

/**
 * 1. CREATE CATEGORIES TABLE
 */
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);


ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly viewable."
  ON public.categories FOR SELECT USING ( true );

CREATE POLICY "Authenticated users can manage categories."
  ON public.categories FOR ALL
  USING ( auth.role() = 'authenticated' );

/**
 * 2. INSERT DEFAULT CATEGORIES WITH IMAGES
 */
INSERT INTO public.categories (name, slug, description, image_url, display_order) VALUES
  ('Necklaces', 'necklaces', 'Beautiful handcrafted necklaces and pendants', '/placeholder-oe5hu.png', 1),
  ('Earrings', 'earrings', 'Elegant earrings for every occasion', '/gold-earrings-display.png', 2),
  ('Bracelets', 'bracelets', 'Stunning bracelets, bangles and cuffs', '/placeholder-hwi2p.png', 3),
  ('Rings', 'rings', 'Exquisite rings and wedding bands', '/luxury-jewelry.png', 4);

/**
 * 3. ADD CATEGORY FOREIGN KEY TO PRODUCTS
 * Note: This preserves existing data by matching category text to slug
 */
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Update existing products to link with categories
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.slug;

-- Drop old text column and rename new column
ALTER TABLE public.products DROP COLUMN IF EXISTS category;
ALTER TABLE public.products RENAME COLUMN category_id TO category_id_temp;
ALTER TABLE public.products ADD COLUMN category UUID;
UPDATE public.products SET category = category_id_temp;
ALTER TABLE public.products DROP COLUMN category_id_temp;

-- Add foreign key constraint
ALTER TABLE public.products 
  ADD CONSTRAINT products_category_fkey 
  FOREIGN KEY (category) REFERENCES public.categories(id);

-- Create index for better query performance
CREATE INDEX idx_products_category ON public.products(category);
