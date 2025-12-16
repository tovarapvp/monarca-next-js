/* Create settings table for application configuration */

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Settings are publicly viewable."
  ON public.settings FOR SELECT
  USING ( true );

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update settings."
  ON public.settings FOR ALL
  USING ( auth.role() = 'authenticated' );

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('site_name', '"MONARCA"', 'Name of the website'),
  ('contact_email', '"contact@monarca.com"', 'Contact email address'),
  ('contact_phone', '"+1234567890"', 'Contact phone number (WhatsApp)'),
  ('currency', '"USD"', 'Default currency'),
  ('tax_rate', '0', 'Tax rate percentage'),
  ('shipping_enabled', 'true', 'Enable shipping options'),
  ('free_shipping_threshold', '200', 'Free shipping for orders over this amount')
ON CONFLICT (key) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();
