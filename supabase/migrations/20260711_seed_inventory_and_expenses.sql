-- Seed Migration: import normalized inventory and expense data
-- Created: 2026-07-11

-- 1. Categories
INSERT INTO categories (name, description)
VALUES
  ('Notebooks', 'Stationery, notebooks and organizers'),
  ('Hair', 'Hair accessories and tools'),
  ('Face', 'Face care and cosmetics'),
  ('HandAcc', 'Hand accessories'),
  ('SatinPack', 'Satin packaging and pillows'),
  ('Gifts', 'Gift products'),
  ('Packaging', 'Packaging materials and supplies')
ON CONFLICT (name) DO NOTHING;

-- 2. Base Products
INSERT INTO products (name, description, category_id, price, cost_price, status, image_url)
VALUES
  ('Hair Clip', 'Decorative hair clip', (SELECT id FROM categories WHERE name='Hair'), 2.50, 0.75, 'available', NULL),
  ('Mascara', 'Volumizing mascara', (SELECT id FROM categories WHERE name='Face'), 18.00, 16.00, 'available', NULL),
  ('Notebook', 'Lined notebook', (SELECT id FROM categories WHERE name='Notebooks'), 5.00, 2.50, 'available', NULL),
  ('Satin Pillowcase', 'Satin pillowcase', (SELECT id FROM categories WHERE name='SatinPack'), 42.00, 6.10, 'available', NULL),
  ('Plushie', 'Gift plush toy', (SELECT id FROM categories WHERE name='Gifts'), 10.00, 3.00, 'available', NULL),
  ('Keychain', 'Gift keychain', (SELECT id FROM categories WHERE name='Gifts'), 5.00, 2.00, 'available', NULL),
  ('Sticker Pack', 'Assorted stickers', (SELECT id FROM categories WHERE name='Packaging'), 0.70, 0.30, 'available', NULL)
ON CONFLICT (name, category_id) DO NOTHING;

-- 3. Variant & inventory data from sample records
INSERT INTO product_variants (product_id, variant_name, variant_value, sku, unit_cost, image_url)
SELECT id, 'color', 'Bleu', 'HAIRCLIP-BLEU', 0.75, NULL FROM products WHERE name = 'Hair Clip'
UNION ALL
SELECT id, 'color', 'Orangé', 'HAIRCLIP-ORANGE', 0.75, NULL FROM products WHERE name = 'Hair Clip'
ON CONFLICT (product_id, variant_name, variant_value) DO NOTHING;

-- 4. Seed inventory items for each product variant
INSERT INTO inventory_items (product_id, product_variant_id, stock_quantity, reorder_level)
SELECT p.id, pv.id, 42, 10 FROM products p
JOIN product_variants pv ON pv.product_id = p.id AND pv.variant_value = 'Bleu'
WHERE p.name = 'Hair Clip'
ON CONFLICT DO NOTHING;

-- 5. Import expenses as unit cost + quantity
INSERT INTO expenses (type, description, unit_cost, quantity, expense_date, notes)
VALUES
  ('packaging', 'Packaging L', 1.16, 1, '2025-10-28', NULL),
  ('packaging', 'Packaging + sticker', 3.66, 1, '2025-10-28', NULL),
  ('packaging', 'Packaging S', 0.76, 1, '2025-10-28', NULL),
  ('packaging', 'TY Card', 0.30, 1, '2025-10-28', NULL),
  ('packaging', 'Stickers', 0.70, 1, '2025-10-28', NULL),
  ('packaging', 'Ribbon', 4.00, 1, '2025-10-28', NULL),
  ('packaging', 'Papier Cadeau', 1.00, 1, '2025-10-28', NULL)
ON CONFLICT DO NOTHING;

-- 6. Create order-level columns if not present and normalize increasing information
UPDATE orders SET customer_name = COALESCE(customer_name, ''), phone = COALESCE(phone, ''), delivery_address = COALESCE(delivery_address, '');

-- 7. A fallback cleanup of duplicate product rows in current data is not performed here.
--    Use a separate import job to merge identical products and move colors/sizes into variants.
