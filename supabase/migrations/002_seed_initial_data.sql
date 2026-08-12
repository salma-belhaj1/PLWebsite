-- ==========================================
-- Seed Data: Categories and Initial Products
-- Peace & Love E-commerce System
-- ==========================================

-- 1. Insert Categories (based on your spreadsheets)
INSERT INTO categories (name, description) VALUES
  ('Hair', 'Hair care products and accessories'),
  ('Face', 'Face care and cosmetics'),
  ('Satin Pillows', 'Satin pillowcases and bedding'),
  ('Notebooks', 'Stationery and notebooks'),
  ('Gifts', 'Gift sets and bundles'),
  ('Packaging', 'Packaging materials and supplies')
ON CONFLICT DO NOTHING;

-- 2. Insert base products for each category
-- Hair Category
INSERT INTO products (name, description, category_id, price, cost_price, status, is_active, is_featured) VALUES
  (
    'Hair Clip Deluxe',
    'Premium hair clip with secure grip',
    (SELECT id FROM categories WHERE name = 'Hair'),
    5.00,
    2.50,
    'available',
    true,
    true
  ),
  (
    'Hair Brush Set',
    'Professional hair brush collection',
    (SELECT id FROM categories WHERE name = 'Hair'),
    12.00,
    5.00,
    'available',
    true,
    false
  )
ON CONFLICT DO NOTHING;

-- Face Category
INSERT INTO products (name, description, category_id, price, cost_price, status, is_active, is_featured) VALUES
  (
    'Mascara Pro',
    'Waterproof mascara with volumizing formula',
    (SELECT id FROM categories WHERE name = 'Face'),
    16.00,
    8.00,
    'available',
    true,
    true
  ),
  (
    'Face Mask Sheet',
    'Hydrating face mask for all skin types',
    (SELECT id FROM categories WHERE name = 'Face'),
    9.00,
    3.50,
    'available',
    true,
    false
  )
ON CONFLICT DO NOTHING;

-- Satin Pillows Category
INSERT INTO products (name, description, category_id, price, cost_price, status, is_active, is_featured) VALUES
  (
    'Satin Pillowcase Standard',
    'Luxury satin pillowcase 50x75cm',
    (SELECT id FROM categories WHERE name = 'Satin Pillows'),
    35.00,
    15.00,
    'available',
    true,
    true
  ),
  (
    'Satin Pillowcase Queen',
    'Extra-large satin pillowcase 51x76cm',
    (SELECT id FROM categories WHERE name = 'Satin Pillows'),
    40.00,
    18.00,
    'available',
    true,
    false
  )
ON CONFLICT DO NOTHING;

-- Notebooks Category
INSERT INTO products (name, description, category_id, price, cost_price, status, is_active, is_featured) VALUES
  (
    'Notebook Recto A5',
    'Lined notebook 80 pages A5 size',
    (SELECT id FROM categories WHERE name = 'Notebooks'),
    6.00,
    2.00,
    'available',
    true,
    false
  ),
  (
    'Notebook Bleu A4',
    'Premium blue notebook 100 pages A4',
    (SELECT id FROM categories WHERE name = 'Notebooks'),
    8.00,
    3.00,
    'available',
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- Gifts Category
INSERT INTO products (name, description, category_id, price, cost_price, status, is_active, is_featured) VALUES
  (
    'Gift Set Plushie',
    'Cute plushie collection in gift box',
    (SELECT id FROM categories WHERE name = 'Gifts'),
    40.00,
    18.00,
    'available',
    true,
    true
  ),
  (
    'Gift Set Keychain',
    'Assorted keychains in premium packaging',
    (SELECT id FROM categories WHERE name = 'Gifts'),
    40.00,
    15.00,
    'available',
    true,
    false
  )
ON CONFLICT DO NOTHING;

-- Packaging Category
INSERT INTO products (name, description, category_id, price, cost_price, status, is_active, is_featured) VALUES
  (
    'Packaging Box Large',
    'Corrugated shipping box 20x15x10cm',
    (SELECT id FROM categories WHERE name = 'Packaging'),
    1.16,
    0.50,
    'available',
    true,
    false
  ),
  (
    'Packaging Box Small',
    'Small gift box 10x10x5cm',
    (SELECT id FROM categories WHERE name = 'Packaging'),
    0.76,
    0.30,
    'available',
    true,
    false
  )
ON CONFLICT DO NOTHING;

-- 3. Create product variants for some products
-- Add colors and sizes to Hair products
INSERT INTO product_variants (product_id, variant_name, variant_value, stock_quantity) 
SELECT id, 'color', 'Rose', 42 FROM products WHERE name = 'Hair Clip Deluxe'
UNION ALL
SELECT id, 'color', 'Noir', 42 FROM products WHERE name = 'Hair Clip Deluxe'
ON CONFLICT DO NOTHING;

-- 4. Initialize inventory_items for each product
INSERT INTO inventory_items (product_id, sku, stock_quantity, reorder_level)
SELECT id, CONCAT('SKU-', id), 0, 10 FROM products
ON CONFLICT DO NOTHING;

-- 5. Calculate profit for all products
UPDATE products 
SET profit = price - cost_price 
WHERE profit = 0 OR profit IS NULL;

-- ==========================================
-- Summary:
-- ✅ 6 categories created
-- ✅ 12 base products seeded
-- ✅ Product variants added
-- ✅ Inventory items initialized
-- ✅ Profit automatically calculated
-- 
-- Next: Update stock quantities based on your actual inventory
-- ==========================================
