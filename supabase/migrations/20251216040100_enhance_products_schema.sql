/* Enhance products table with materials, attributes, and unit pricing */

/**
 * 1. ADD MATERIAL AND ATTRIBUTE FIELDS
 */
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS weight_grams NUMERIC;

/**
 * 2. ADD UNIT-BASED PRICING SUPPORT
 * For products sold by measurement (meters, yards, etc.)
 */
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'per_unit')),
  ADD COLUMN IF NOT EXISTS unit_type TEXT CHECK (unit_type IN (NULL, 'meter', 'yard', 'foot', 'centimeter')),
  ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC CHECK (price_per_unit >= 0),
  ADD COLUMN IF NOT EXISTS min_quantity NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_quantity NUMERIC;

COMMENT ON COLUMN public.products.pricing_type IS 'Type of pricing: fixed (default) or per_unit (for ribbons, fabrics, etc.)';
COMMENT ON COLUMN public.products.unit_type IS 'Unit of measurement when pricing_type is per_unit';
COMMENT ON COLUMN public.products.price_per_unit IS 'Price per unit when pricing_type is per_unit';
COMMENT ON COLUMN public.products.min_quantity IS 'Minimum quantity that can be ordered';
COMMENT ON COLUMN public.products.max_quantity IS 'Maximum quantity that can be ordered (NULL = unlimited)';

/**
 * 3. CREATE INDEXES FOR BETTER FILTERING
 */
CREATE INDEX IF NOT EXISTS idx_products_material ON public.products(material);
CREATE INDEX IF NOT EXISTS idx_products_color ON public.products(color);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_pricing_type ON public.products(pricing_type);
