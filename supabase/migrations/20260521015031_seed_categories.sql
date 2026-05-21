/*
  # Seed initial categories

  1. Categories added
    - Hair (clips, headbands, accessories)
    - Face (makeup, beauty products)
    - Stationery (notebooks, books, pads)
    - Satin (satin products, accessories)
    - Gifts (gift items and collections)

  2. Each category has
    - Unique slug for routing
    - Display name
    - Icon emoji
    - Sort order for UI display
*/

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Hair Accessories', 'hair', '✨', 1),
  ('Face & Beauty', 'face', '💄', 2),
  ('Stationery', 'stationery', '📓', 3),
  ('Satin Products', 'satin', '🎀', 4),
  ('Gifts & Collections', 'gifts', '🎁', 5)
ON CONFLICT (name) DO NOTHING;
