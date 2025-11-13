/* supabase/migrations/00000000000000_monarca_schema_init.sql */

/**
 * 1. ADMIN PROFILES 
 */
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage profiles."
  ON public.profiles FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

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
  shipping_info TEXT
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly viewable."
  ON public.products FOR SELECT USING ( true );
CREATE POLICY "Admins can manage products."
  ON public.products FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

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
  ON public.variants FOR SELECT USING ( true );
CREATE POLICY "Admins can manage variants."
  ON public.variants FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

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
CREATE POLICY "Admins can manage all orders."
  ON public.orders FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Allow public inserts for orders."
  ON public.orders FOR INSERT
  WITH CHECK ( true );

/**
 * 5. ORDERS ITEMS 
 */
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.variants(id),
  quantity INT NOT NULL,
  price_at_purchase NUMERIC NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all order items."
  ON public.order_items FOR SELECT
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Allow public inserts for order_items."
  ON public.order_items FOR INSERT
  WITH CHECK ( true );

/**
 * 6.RPC FUNCTION FOR INQUIRIES 
 * (This is the secure function for  WhatsApp/Email)
 */
CREATE FUNCTION public.create_inquiry_order(
  cart_items JSONB,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_id UUID;
  order_total NUMERIC := 0;
  item RECORD;
  variant_price NUMERIC;
  base_price NUMERIC;
  product_id_cache UUID;
BEGIN
  INSERT INTO public.orders (customer_name, customer_email, total, status, shipping_address)
  VALUES (customer_name, customer_email, 0, 'inquiry', jsonb_build_object('phone', customer_phone))
  RETURNING id INTO new_order_id;

  FOR item IN SELECT * FROM jsonb_to_recordset(cart_items) AS x(variant_id UUID, quantity INT)
  LOOP
    SELECT 
      p.price,
      v.price,
      p.id
    INTO base_price, variant_price, product_id_cache
    FROM public.variants v
    JOIN public.products p ON v.product_id = p.id
    WHERE v.id = item.variant_id;

    IF variant_price IS NULL THEN
      variant_price := base_price;
    END IF;

    INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, price_at_purchase)
    VALUES (new_order_id, product_id_cache, item.variant_id, item.quantity, variant_price);

    order_total := order_total + (variant_price * item.quantity);
  END LOOP;

  UPDATE public.orders
  SET total = order_total
  WHERE id = new_order_id;

  RETURN new_order_id;
END;
$$;
