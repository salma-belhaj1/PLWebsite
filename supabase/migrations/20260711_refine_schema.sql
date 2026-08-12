-- Migration: refine Supabase ecommerce schema for normalized inventory and expenses
-- Created: 2026-07-11

-- 1. Product-level image metadata
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE products
  DROP COLUMN IF EXISTS profit;

-- 2. Product variants now carry SKU, unit cost, image, and attributes
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT;

ALTER TABLE product_variants
  DROP COLUMN IF EXISTS stock_quantity;

-- 3. Inventory items are assigned to product variants instead of duplicating products
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS product_variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS sku;

-- 4. Normalize expense tracking on the existing expenses table
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC(12,2) GENERATED ALWAYS AS (unit_cost * quantity) STORED;

ALTER TABLE expenses
  DROP COLUMN IF EXISTS amount;

-- 5. Orders should capture customer and delivery metadata
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- 6. Use descriptive inventory columns and preserve reorder metadata
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10,
  DROP COLUMN IF EXISTS reorder_quantity,
  ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ;

-- 7. Optional updated_at for inventory items
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 8. Remove the old unique product constraint on inventory items so variant-level stock works
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_product_id_key;

-- 9. Create missing indexes and ensure referential performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_variant_id ON inventory_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_total_cost ON expenses(total_cost);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- 10. Keep variant uniqueness for normalized options
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_unique ON product_variants(product_id, variant_name, variant_value);
