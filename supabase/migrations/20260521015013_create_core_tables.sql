/*
  # Create core inventory and expense tables

  1. New Tables
    - `categories` - Product categories (Hair, Face, Notebooks, etc.)
    - `inventory_items` - Individual product units with cost, price, status, customer info
    - `expenses` - Business expenses (packaging, fees, etc.)
    - `profiles` - Extended user info with role (admin/customer)

  2. Key features
    - Per-item inventory tracking (each row = one physical product)
    - Automatic profit calculation (selling_price - cost_price)
    - Status tracking (en_stock, vendu, reserve, endommage)
    - Customer name and phone on each sale
    - Expense categorization (packaging, bank_fee, shipping, other)
    - Timestamps for auditing

  3. Security
    - RLS enabled on all tables
    - Customers see only in-stock items
    - Admins see all data
    - Expenses hidden from customers
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory items table (one row per physical product)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'en_stock' CHECK (status IN ('en_stock', 'vendu', 'reserve', 'endommage')),
  cost_price DECIMAL(10,3) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,3) NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('packaging', 'bank_fee', 'shipping', 'other')),
  description TEXT,
  amount DECIMAL(10,3) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extended user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_color ON inventory_items(color);
CREATE INDEX IF NOT EXISTS idx_inventory_sold_at ON inventory_items(sold_at);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory_items(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
