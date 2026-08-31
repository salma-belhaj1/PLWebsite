-- ============================================================================
-- Peace & Love Migration
-- File: 20260831_admin_crud_rls_and_catalog_cleanup.sql
-- Description:
--   1. Grant full Admin CRUD permissions (RLS) on products, variants, inventory,
--      categories, expenses, and order items.
--   2. Ensure foreign key ON DELETE CASCADE on child product tables.
--   3. Remove unwanted 'Classic T-Shirt' items from catalog and inventory.
--   4. Hide packaging products (Packaging Box Large & Small) from public shop.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENSURE is_admin() FUNCTION EXISTS (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS TABLE COLUMNS & RLS POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Ensure essential columns exist safely
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category_id INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP POLICY IF EXISTS "public_select_products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

-- Public can view active products; Admins can view all products
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (
  is_active = true
  OR public.is_admin()
);

-- Admin CRUD
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (
  public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 3. PRODUCT_VARIANTS TABLE RLS POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can insert variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can update variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can delete variants" ON public.product_variants;

CREATE POLICY "Variants are viewable by everyone"
ON public.product_variants
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert variants"
ON public.product_variants
FOR INSERT
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can update variants"
ON public.product_variants
FOR UPDATE
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can delete variants"
ON public.product_variants
FOR DELETE
USING (
  public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 4. INVENTORY_ITEMS TABLE RLS POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Customers see available inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Only admins can insert inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Only admins can update inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Only admins can delete inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "admins_update_inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Inventory is viewable by everyone" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can insert inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can update inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory_items;

CREATE POLICY "Inventory is viewable by everyone"
ON public.inventory_items
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert inventory"
ON public.inventory_items
FOR INSERT
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can update inventory"
ON public.inventory_items
FOR UPDATE
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can delete inventory"
ON public.inventory_items
FOR DELETE
USING (
  public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 5. CATEGORIES TABLE RLS POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are public" ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

CREATE POLICY "Categories are public"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (
  public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 6. EXPENSES & OTHER_EXPENSES TABLE RLS POLICIES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'other_expenses') THEN
    ALTER TABLE public.other_expenses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins can select other_expenses" ON public.other_expenses;
    DROP POLICY IF EXISTS "Admins can insert other_expenses" ON public.other_expenses;
    DROP POLICY IF EXISTS "Admins can update other_expenses" ON public.other_expenses;
    DROP POLICY IF EXISTS "Admins can delete other_expenses" ON public.other_expenses;

    CREATE POLICY "Admins can select other_expenses" ON public.other_expenses FOR SELECT USING (public.is_admin());
    CREATE POLICY "Admins can insert other_expenses" ON public.other_expenses FOR INSERT WITH CHECK (public.is_admin());
    CREATE POLICY "Admins can update other_expenses" ON public.other_expenses FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "Admins can delete other_expenses" ON public.other_expenses FOR DELETE USING (public.is_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
    ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Only admins can select expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Only admins can insert expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Only admins can update expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Only admins can delete expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Admins can select expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Admins can insert expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Admins can update expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Admins can delete expenses" ON public.expenses;

    CREATE POLICY "Admins can select expenses" ON public.expenses FOR SELECT USING (public.is_admin());
    CREATE POLICY "Admins can insert expenses" ON public.expenses FOR INSERT WITH CHECK (public.is_admin());
    CREATE POLICY "Admins can update expenses" ON public.expenses FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (public.is_admin());
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. ENSURE FOREIGN KEYS HAVE ON DELETE CASCADE FOR SEAMLESS DELETION
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Re-link inventory_items.product_id -> products(id) ON DELETE CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'inventory_items' AND constraint_name = 'inventory_items_product_id_fkey'
  ) THEN
    ALTER TABLE public.inventory_items DROP CONSTRAINT inventory_items_product_id_fkey;
  END IF;
  
  ALTER TABLE public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

  -- Re-link product_variants.product_id -> products(id) ON DELETE CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'product_variants' AND constraint_name = 'product_variants_product_id_fkey'
  ) THEN
    ALTER TABLE public.product_variants DROP CONSTRAINT product_variants_product_id_fkey;
  END IF;

  ALTER TABLE public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

EXCEPTION WHEN OTHERS THEN
  -- Soft ignore if table structure differs
  RAISE NOTICE 'Constraint update notice: %', SQLERRM;
END $$;

-- ----------------------------------------------------------------------------
-- 8. CATALOG CLEANUP: REMOVE T-SHIRT & HIDE PACKAGING BOXES
-- ----------------------------------------------------------------------------

-- 8a. Delete 'Classic T-Shirt' items & their child rows
DO $$
DECLARE
  shirt_rec RECORD;
BEGIN
  FOR shirt_rec IN
    SELECT id FROM public.products
    WHERE name ILIKE '%Classic T-Shirt%'
       OR sku IN ('SHIRT-001', 'SKU-1')
  LOOP
    DELETE FROM public.inventory_items WHERE product_id = shirt_rec.id;
    DELETE FROM public.product_variants WHERE product_id = shirt_rec.id;
    DELETE FROM public.cart_items WHERE product_id = shirt_rec.id;
    DELETE FROM public.products WHERE id = shirt_rec.id;
  END LOOP;
END $$;

-- 8b. Hide packaging items from customer shop (set is_active = false)
UPDATE public.products
SET is_active = false
WHERE name ILIKE '%Packaging%'
   OR sku IN ('SKU-36', 'SKU-37')
   OR category_id IN (SELECT id FROM public.categories WHERE name ILIKE '%Packaging%');

-- ----------------------------------------------------------------------------
-- MIGRATION COMPLETE
-- ----------------------------------------------------------------------------
