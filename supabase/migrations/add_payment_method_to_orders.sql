-- Add payment_method and inventory_reduced columns to orders table

-- Add payment_method column (only stripe, paypal, manual)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'manual'));

-- Add inventory_reduced flag to track if stock was already reduced
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS inventory_reduced BOOLEAN DEFAULT FALSE;

-- Add notes column for manual orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Set default for existing orders
UPDATE orders 
SET payment_method = 'manual' 
WHERE payment_method IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_inventory_reduced ON orders(inventory_reduced);

-- Comment on columns
COMMENT ON COLUMN orders.payment_method IS 'Payment method: stripe (automatic), paypal (automatic), or manual (created by admin)';
COMMENT ON COLUMN orders.inventory_reduced IS 'Flag to indicate if inventory was already reduced for this order';
COMMENT ON COLUMN orders.notes IS 'Admin notes for manual orders or special instructions';
