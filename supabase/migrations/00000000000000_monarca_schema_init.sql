/* supabase/migrations/00000000000000_monarca_schema_init.sql */

/**
 * 1. ADMIN PROFILES 
 */
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT
);

-- RLS for profiles - NO recursion, simple auth check
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users."
  ON public.profiles FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

/**
 * 2. PRODUCTS
 */
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT,
  images TEXT[],
  in_stock BOOLEAN DEFAULT true,
  details JSONB,
  care_instructions TEXT,
  shipping_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view all products
CREATE POLICY "Products are publicly viewable."
  ON public.products FOR SELECT 
  USING ( true );

-- Authenticated users can manage products (we'll add role check later via app logic)
CREATE POLICY "Authenticated users can manage products."
  ON public.products FOR ALL
  USING ( auth.role() = 'authenticated' );

/**
 * 3. VARIANTS
 */
CREATE TABLE public.variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  price NUMERIC CHECK (price >= 0)
);

ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variants are publicly viewable."
  ON public.variants FOR SELECT 
  USING ( true );

CREATE POLICY "Authenticated users can manage variants."
  ON public.variants FOR ALL
  USING ( auth.role() = 'authenticated' );

/**
 * 4. ORDERS
 */
CREATE TYPE order_status AS ENUM ('inquiry', 'pending', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  status order_status DEFAULT 'pending',
  total NUMERIC NOT NULL,
  shipping_address JSONB NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all orders."
  ON public.orders FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Anyone can create orders."
  ON public.orders FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Authenticated users can update orders."
  ON public.orders FOR UPDATE
  USING ( auth.role() = 'authenticated' );

/**
 * 5. ORDER ITEMS 
 */
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.variants(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items viewable by authenticated users."
  ON public.order_items FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Anyone can insert order items."
  ON public.order_items FOR INSERT
  WITH CHECK ( true );

/**
 * 6. RPC FUNCTION FOR CREATING INQUIRY ORDERS
 */
CREATE OR REPLACE FUNCTION public.create_inquiry_order(
  customer_name_input TEXT,
  customer_email_input TEXT,
  shipping_address_input JSONB,
  items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
  total_amount NUMERIC := 0;
BEGIN
  -- Calculate total from items
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    total_amount := total_amount + ((item->>'price')::NUMERIC * (item->>'quantity')::INT);
  END LOOP;

  -- Create order
  INSERT INTO public.orders (status, total, shipping_address, customer_email, customer_name)
  VALUES ('inquiry', total_amount, shipping_address_input, customer_email_input, customer_name_input)
  RETURNING id INTO new_order_id;

  -- Create order items
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, price_at_purchase)
    VALUES (
      new_order_id,
      (item->>'product_id')::UUID,
      (item->>'variant_id')::UUID,
      (item->>'quantity')::INT,
      (item->>'price')::NUMERIC
    );
  END LOOP;

  RETURN new_order_id;
END;
$$;
