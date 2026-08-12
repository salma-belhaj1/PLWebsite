-- Migration: create ecommerce core tables, triggers, and RLS policies
-- Created: 2026-06-18

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Inventory items (stock per product/variant)
CREATE TABLE IF NOT EXISTS inventory_items (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  stock_quantity integer NOT NULL DEFAULT 0
);

-- Carts (persistent per-user cart)
CREATE TABLE IF NOT EXISTS carts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  total numeric(10,2),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id integer REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer REFERENCES products(id),
  inventory_item_id integer REFERENCES inventory_items(id),
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL
);

-- Function: decrement stock when an order_item is inserted
CREATE OR REPLACE FUNCTION fn_decrement_stock()
RETURNS trigger AS $$
BEGIN
  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Invalid quantity for order item';
  END IF;

  -- Try to decrement stock only if enough stock exists
  UPDATE inventory_items
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.inventory_item_id AND stock_quantity >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for inventory_item %', NEW.inventory_item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on order_items BEFORE INSERT
DROP TRIGGER IF EXISTS trg_decrement_stock ON order_items;
CREATE TRIGGER trg_decrement_stock
BEFORE INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_decrement_stock();

-- Row Level Security and policies

-- PRODUCTS: public read
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_products" ON products FOR SELECT USING (true);

-- INVENTORY: public select; updates only by admins
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_inventory" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "admins_update_inventory" ON inventory_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- CARTS: only owner can CRUD
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_cart" ON carts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ORDERS: clients operate on their own orders; admins can manage all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_orders" ON orders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_manage_orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- PROFILES: users can manage their own profile; admins can update role
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins_update_profiles" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_items(product_id);
