# Phase 1: Database Setup Instructions

## How to Run Migrations on Supabase

### Step 1: Access Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your **peace&love** project
3. Click **SQL Editor** on the left sidebar
4. Click **New Query**

### Step 2: Run Migration 1 (Schema Updates)
1. Copy all content from `supabase/migrations/001_add_missing_tables.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Wait for confirmation (should show "Success")

**What this does:**
- Adds cost tracking to products (cost_price, profit, sku)
- Creates cart persistence tables
- Creates expenses management table
- Creates inventory tracking
- Creates user profiles table
- Sets up audit logging

### Step 3: Run Migration 2 (Seed Data)
1. Create a NEW Query
2. Copy all content from `supabase/migrations/002_seed_initial_data.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. Wait for confirmation

**What this does:**
- Creates 6 product categories
- Seeds 12 initial products with realistic data
- Creates product variants
- Initializes inventory items
- Calculates profit margins

### Step 4: Verify Tables Exist
In SQL Editor, run this to check:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- ✅ carts
- ✅ cart_items
- ✅ other_expenses
- ✅ inventory_items
- ✅ profiles
- ✅ audit_logs
- ✅ categories (already existed)
- ✅ products (updated)
- ✅ orders (updated)
- ✅ users (already existed)

### Step 5: Check Initial Data
Run this in SQL Editor:
```sql
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_variants FROM product_variants;
```

Should show:
- 6 categories
- 12 products
- 2+ variants

---

## What to do if you get errors:

### Error: "table already exists"
- This is fine! The `IF NOT EXISTS` clause prevents duplicates
- Just ignore and continue

### Error: "column already exists"
- This is also fine! The `IF NOT EXISTS` clause on ALTER TABLE handles this
- Just ignore and continue

### Error: "UNIQUE constraint failed"
- This happens if you run the seed twice
- Run this to clear and re-seed:
  ```sql
  DELETE FROM product_variants;
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM inventory_items;
  ```
- Then run Migration 2 again

---

## ✅ PHASE 1 COMPLETE

After running both migrations, your database will have:
- ✅ All necessary tables created
- ✅ Initial categories (Hair, Face, Satin Pillows, Notebooks, Gifts, Packaging)
- ✅ 12 seed products with realistic pricing
- ✅ Proper indexes for performance
- ✅ Ready for Phase 2 (Supabase service layer)

**Next Steps:** 
Move to Phase 2 - Create the frontend service layer to connect to Supabase
