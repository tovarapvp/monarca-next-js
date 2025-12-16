/* Enhance order_items table to support detailed order information */

-- Add fields to order_items for better tracking
ALTER TABLE public.order_items 
  ADD COLUMN IF NOT EXISTS variant_name TEXT,
  ADD COLUMN IF NOT EXISTS variant_value TEXT,
  ADD COLUMN IF NOT EXISTS unit_type TEXT,
  ADD COLUMN IF NOT EXISTS is_per_unit BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update quantity to allow decimals for per-unit products (meters, etc.)
ALTER TABLE public.order_items 
  ALTER COLUMN quantity TYPE NUMERIC,
  DROP CONSTRAINT IF EXISTS order_items_quantity_check,
  ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0);

COMMENT ON COLUMN public.order_items.variant_name IS 'Name of the variant attribute (e.g., Material, Size)';
COMMENT ON COLUMN public.order_items.variant_value IS 'Value of the variant (e.g., 18k Gold, Large)';
COMMENT ON COLUMN public.order_items.unit_type IS 'Unit of measurement for per-unit products (meter, yard, etc.)';
COMMENT ON COLUMN public.order_items.is_per_unit IS 'Whether this item was sold by unit measurement';
COMMENT ON COLUMN public.order_items.notes IS 'Additional notes about the order item';
