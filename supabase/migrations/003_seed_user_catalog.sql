-- ==========================================
-- Seed Data: User Catalog Import
-- Run after 001_add_missing_tables.sql
-- ==========================================

-- 1. Categories
INSERT INTO categories (name, description)
VALUES
  ('Hair', 'Hair accessories'),
  ('Face', 'Face products'),
  ('Hand Accessories', 'Bracelets and accessories'),
  ('Satin', 'Satin products'),
  ('Stationery', 'Notebooks and stationery'),
  ('Gifts', 'Gift items')
ON CONFLICT (name) DO NOTHING;

-- 2. Products
INSERT INTO products (
  name,
  description,
  category_id,
  price,
  cost_price,
  profit,
  sku,
  supplier,
  threshold,
  status,
  is_active,
  is_featured
)
VALUES
  ('Clip', 'Hair clip', (SELECT id FROM categories WHERE name = 'Hair'), 2.00, 0.75, 1.25, 'HAIR-CLIP', NULL, 3, 'available', true, false),
  ('Headband', 'Hair headband', (SELECT id FROM categories WHERE name = 'Hair'), 3.00, 0.75, 2.25, 'HAIR-HEADBAND', NULL, 3, 'available', true, false),
  ('Mascara', 'Mascara', (SELECT id FROM categories WHERE name = 'Face'), 18.00, 16.00, 2.00, 'FACE-MASCARA', NULL, 3, 'available', true, false),
  ('Brush', 'Makeup brush', (SELECT id FROM categories WHERE name = 'Face'), 9.00, 5.00, 4.00, 'FACE-BRUSH', NULL, 3, 'available', true, false),
  ('Lip Gloss', 'Lip gloss', (SELECT id FROM categories WHERE name = 'Face'), 10.00, 9.00, 1.00, 'FACE-LIPGLOSS', NULL, 3, 'available', true, false),
  ('Beauty Blender', 'Beauty blender', (SELECT id FROM categories WHERE name = 'Face'), 6.00, 2.00, 4.00, 'FACE-BLENDER', NULL, 3, 'available', true, false),
  ('Eyebrow Pencil', 'Eyebrow pencil', (SELECT id FROM categories WHERE name = 'Face'), 7.00, 3.00, 4.00, 'FACE-BROW', NULL, 3, 'available', true, false),
  ('Mask Tool', 'Mask application tool', (SELECT id FROM categories WHERE name = 'Face'), 4.00, 1.00, 3.00, 'FACE-MASKTOOL', NULL, 3, 'available', true, false),
  ('Strass', 'Face strass', (SELECT id FROM categories WHERE name = 'Face'), 2.00, 1.30, 0.70, 'FACE-STRASS', NULL, 3, 'available', true, false),
  ('Mask Yara', 'Face mask', (SELECT id FROM categories WHERE name = 'Face'), 4.00, 2.00, 2.00, 'FACE-MASKYARA', NULL, 3, 'available', true, false),
  ('Bracelet', 'Bracelet', (SELECT id FROM categories WHERE name = 'Hand Accessories'), 8.00, 5.00, 3.00, 'HAND-BRACELET', NULL, 3, 'available', true, false),
  ('Satin Pack', 'Luxury satin pack', (SELECT id FROM categories WHERE name = 'Satin'), 42.00, 6.10, 35.90, 'SATIN-PACK', NULL, 3, 'available', true, true),
  ('Chouchou', 'Satin scrunchie', (SELECT id FROM categories WHERE name = 'Satin'), 6.00, 0.00, 6.00, 'SATIN-CHOUCHOU', NULL, 3, 'available', true, false),
  ('Notebook', 'Notebook and pads', (SELECT id FROM categories WHERE name = 'Stationery'), 0.00, 0.00, 0.00, 'NOTEBOOK', NULL, 3, 'available', true, false),
  ('Plushie', 'Plush toy', (SELECT id FROM categories WHERE name = 'Gifts'), 10.00, 3.00, 7.00, 'GIFT-PLUSHIE', NULL, 3, 'available', true, false),
  ('Keychain', 'Keychain', (SELECT id FROM categories WHERE name = 'Gifts'), 5.00, 2.00, 3.00, 'GIFT-KEYCHAIN', NULL, 3, 'available', true, false),
  ('Socks', 'Socks', (SELECT id FROM categories WHERE name = 'Gifts'), 5.00, 1.50, 3.50, 'GIFT-SOCKS', NULL, 3, 'available', true, false)
ON CONFLICT (sku) DO NOTHING;

-- 3. Variants
INSERT INTO product_variants (product_id, variant_name, variant_type, variant_value)
VALUES
  ((SELECT id FROM products WHERE sku = 'HAIR-CLIP'), 'Color', 'Color', 'White'),
  ((SELECT id FROM products WHERE sku = 'HAIR-CLIP'), 'Color', 'Color', 'Black'),
  ((SELECT id FROM products WHERE sku = 'HAIR-CLIP'), 'Color', 'Color', 'Orange'),
  ((SELECT id FROM products WHERE sku = 'HAIR-CLIP'), 'Color', 'Color', 'Yellow'),
  ((SELECT id FROM products WHERE sku = 'HAIR-CLIP'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'HAIR-CLIP'), 'Color', 'Color', 'Red'),
  ((SELECT id FROM products WHERE sku = 'HAIR-HEADBAND'), 'Color', 'Color', 'White'),
  ((SELECT id FROM products WHERE sku = 'HAIR-HEADBAND'), 'Color', 'Color', 'Black'),
  ((SELECT id FROM products WHERE sku = 'HAIR-HEADBAND'), 'Color', 'Color', 'Blue'),
  ((SELECT id FROM products WHERE sku = 'HAIR-HEADBAND'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'HAIR-HEADBAND'), 'Color', 'Color', 'Beige'),
  ((SELECT id FROM products WHERE sku = 'HAIR-HEADBAND'), 'Color', 'Color', 'Yellow'),
  ((SELECT id FROM products WHERE sku = 'FACE-MASCARA'), 'Color', 'Color', 'Green'),
  ((SELECT id FROM products WHERE sku = 'FACE-MASCARA'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'FACE-BRUSH'), 'Color', 'Color', 'Red'),
  ((SELECT id FROM products WHERE sku = 'FACE-BRUSH'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'FACE-BLENDER'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'FACE-BLENDER'), 'Color', 'Color', 'Yellow'),
  ((SELECT id FROM products WHERE sku = 'FACE-BLENDER'), 'Color', 'Color', 'Purple'),
  ((SELECT id FROM products WHERE sku = 'FACE-BROW'), 'Color', 'Color', 'Black'),
  ((SELECT id FROM products WHERE sku = 'FACE-BROW'), 'Color', 'Color', 'Brown'),
  ((SELECT id FROM products WHERE sku = 'FACE-BROW'), 'Color', 'Color', 'Beige'),
  ((SELECT id FROM products WHERE sku = 'FACE-MASKTOOL'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'FACE-STRASS'), 'Color', 'Color', 'White'),
  ((SELECT id FROM products WHERE sku = 'FACE-MASKYARA'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'HAND-BRACELET'), 'Color', 'Color', 'White'),
  ((SELECT id FROM products WHERE sku = 'SATIN-PACK'), 'Color', 'Color', 'Black'),
  ((SELECT id FROM products WHERE sku = 'SATIN-PACK'), 'Color', 'Color', 'Brown'),
  ((SELECT id FROM products WHERE sku = 'SATIN-PACK'), 'Color', 'Color', 'Grey'),
  ((SELECT id FROM products WHERE sku = 'SATIN-PACK'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'SATIN-PACK'), 'Color', 'Color', 'Purple'),
  ((SELECT id FROM products WHERE sku = 'SATIN-PACK'), 'Color', 'Color', 'Mauve Rose'),
  ((SELECT id FROM products WHERE sku = 'SATIN-CHOUCHOU'), 'Color', 'Color', 'Grey'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Type', 'Type', 'Book C Recto'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Type', 'Type', 'Book P Recto'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Type', 'Type', 'Pad C Recto'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Type', 'Type', 'Pad P Recto'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Type', 'Type', 'Konch'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Pages', 'Pages', '50'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Pages', 'Pages', '80'),
  ((SELECT id FROM products WHERE sku = 'NOTEBOOK'), 'Pages', 'Pages', '96'),
  ((SELECT id FROM products WHERE sku = 'GIFT-PLUSHIE'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'GIFT-PLUSHIE'), 'Color', 'Color', 'White'),
  ((SELECT id FROM products WHERE sku = 'GIFT-PLUSHIE'), 'Color', 'Color', 'Orange'),
  ((SELECT id FROM products WHERE sku = 'GIFT-KEYCHAIN'), 'Color', 'Color', 'Pink'),
  ((SELECT id FROM products WHERE sku = 'GIFT-KEYCHAIN'), 'Color', 'Color', 'Blue'),
  ((SELECT id FROM products WHERE sku = 'GIFT-SOCKS'), 'Color', 'Color', 'Black')
ON CONFLICT DO NOTHING;

-- 4. Inventory rows with a fixed threshold of 3 and no reorder quantity
INSERT INTO inventory_items (product_id, sku, stock_quantity, reorder_level, reorder_quantity)
SELECT p.id, p.sku, 0, 3, 0
FROM products p
WHERE p.sku IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM inventory_items i
    WHERE i.product_id = p.id
  );
