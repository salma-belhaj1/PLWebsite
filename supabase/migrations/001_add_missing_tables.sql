-- ==========================================
-- Phase 1: Database Schema Update
-- Peace & Love E-commerce System
-- ==========================================

-- 0. Ensure legacy products table has an integer primary key named id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'id'
    ) THEN
      ALTER TABLE products ADD COLUMN id SERIAL PRIMARY KEY;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 1. Create product_variants table (must exist before cart_items references it)
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(100),
  variant_value VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS variant_type VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_unique ON product_variants(product_id, variant_name, variant_value);

-- 1. Update products table with new fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
ADD COLUMN IF NOT EXISTS threshold INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 2. Update orders table with more tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Update order_items with cost tracking
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0;

-- 4. Create carts table for persistence
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- 5. Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- 6. Create other_expenses table (for non-product business expenses)
CREATE TABLE IF NOT EXISTS other_expenses (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  supplier VARCHAR(255),
  description VARCHAR(500),
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  expense_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, archived
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON other_expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON other_expenses(expense_date);

-- 7. Create inventory_items table (if it doesn't exist yet)
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 3,
  reorder_quantity INTEGER DEFAULT 0,
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS product_id INTEGER,
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE inventory_items
  ALTER COLUMN reorder_level SET DEFAULT 3,
  ALTER COLUMN reorder_quantity SET DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);

-- 8. Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer', -- customer, admin
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 9. Create audit table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ==========================================
-- Summary of changes:
-- ✅ Created product_variants table (for color/size options)
-- ✅ Added cost tracking to products
-- ✅ Added cart persistence tables
-- ✅ Added expenses management table
-- ✅ Added inventory tracking
-- ✅ Added user profiles table
-- ✅ Added audit logging
-- ✅ All with proper indexes for performance
-- ==========================================
