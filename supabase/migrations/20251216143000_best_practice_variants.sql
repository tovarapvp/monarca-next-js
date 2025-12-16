/* 
  Migration: Best Practice Variants Architecture
  
  This migration adds:
  - product_options: Define variant attributes (Color, Size, Material, Width, etc.)
  - product_option_values: Possible values for each option (Red, Blue, S, M, L, 1cm, 5cm)
  - product_variants: SKUs - Each combination with its own price, stock, images
  - variant_option_values: Links variants to their option values
*/

-- 1. Product Options (Define attributes like Color, Size, Width)
CREATE TABLE IF NOT EXISTS public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- "Color", "Size", "Width"
  position INT DEFAULT 0,                 -- Display order
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, name)
);

ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product options are publicly viewable."
  ON public.product_options FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage product options."
  ON public.product_options FOR ALL
  USING (auth.role() = 'authenticated');

-- 2. Product Option Values (Possible values: Red, Blue, S, M, L, 1cm, 5cm)
CREATE TABLE IF NOT EXISTS public.product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,                    -- "Red", "XL", "5cm"
  position INT DEFAULT 0,                 -- Display order
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(option_id, value)
);

ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product option values are publicly viewable."
  ON public.product_option_values FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage product option values."
  ON public.product_option_values FOR ALL
  USING (auth.role() = 'authenticated');

-- 3. Product Variants (SKUs) - Each combination with price, stock, images
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT,                               -- Unique code: "RIBBON-RED-5CM"
  
  -- Pricing
  price NUMERIC NOT NULL CHECK (price >= 0),              -- Final price for this variant
  compare_at_price NUMERIC CHECK (compare_at_price >= 0), -- Original price (for discounts)
  
  -- Per-unit pricing (for products sold by meter, yard, etc.)
  pricing_type TEXT DEFAULT 'fixed',      -- 'fixed' or 'per_unit'
  unit_type TEXT,                         -- 'meter', 'yard', 'foot', 'centimeter'
  price_per_unit NUMERIC CHECK (price_per_unit >= 0),
  min_quantity NUMERIC DEFAULT 1,
  max_quantity NUMERIC,
  
  -- Inventory
  stock_quantity NUMERIC DEFAULT 0,       -- For per-unit: meters available. For fixed: units
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Media
  images TEXT[],                          -- Variant-specific images
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  
  -- Metadata
  weight_grams NUMERIC,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(product_id, sku)
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product variants are publicly viewable."
  ON public.product_variants FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage product variants."
  ON public.product_variants FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Variant Option Values (Links variant to its options)
-- Example: Variant "RIBBON-RED-5CM" links to option_value "Red" AND "5cm"
CREATE TABLE IF NOT EXISTS public.variant_option_values (
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES public.product_option_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, option_value_id)
);

ALTER TABLE public.variant_option_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variant option values are publicly viewable."
  ON public.variant_option_values FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage variant option values."
  ON public.variant_option_values FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON public.product_option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variant_option_values_variant_id ON public.variant_option_values(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_option_values_option_value_id ON public.variant_option_values(option_value_id);

-- 6. Add has_variants flag to products for quick filtering
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

-- 7. Update order_items to reference the new product_variants table
-- Note: We keep variant_id for backward compatibility but add product_variant_id
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES public.product_variants(id);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_options JSONB; -- Store selected options for history

-- 8. Helper function to generate SKU from option values
CREATE OR REPLACE FUNCTION public.generate_variant_sku(
  product_name TEXT,
  option_values TEXT[]
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN UPPER(
    REGEXP_REPLACE(
      CONCAT(
        LEFT(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]', '', 'g'), 10),
        '-',
        ARRAY_TO_STRING(
          ARRAY(
            SELECT LEFT(REGEXP_REPLACE(val, '[^a-zA-Z0-9]', '', 'g'), 5)
            FROM UNNEST(option_values) AS val
          ),
          '-'
        )
      ),
      '-+',
      '-',
      'g'
    )
  );
END;
$$;
