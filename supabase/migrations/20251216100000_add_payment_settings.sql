/* Add payment settings to existing settings table */

-- Add payment-related settings
INSERT INTO public.settings (key, value, description) VALUES
  ('checkout_enabled', 'false', 'Enable/disable the checkout functionality'),
  ('payment_provider', '"paypal"', 'Active payment provider: paypal or stripe'),
  ('payment_mode', '"test"', 'Payment mode: test or live'),
  -- PayPal settings
  ('paypal_client_id', '""', 'PayPal Client ID'),
  ('paypal_client_secret', '""', 'PayPal Client Secret (encrypted)'),
  -- Stripe settings  
  ('stripe_public_key', '""', 'Stripe Publishable Key'),
  ('stripe_secret_key', '""', 'Stripe Secret Key (encrypted)')
ON CONFLICT (key) DO NOTHING;

-- Note: In production, secrets should be stored encrypted
-- Consider using Supabase Vault for sensitive data
