-- July 2026 catalog update:
-- 1. New product: Epsom Salt Soak (500 g pouch) at ₹279
-- 2. Price revision: Rose Magic & Lavender Bliss ₹249 → ₹349 (MRP unchanged ₹499)

INSERT INTO products (id, name, price, mrp, weight, image_url) VALUES
  ('epsom-soak', 'Epsom Salt Soak', 279, 499, '500 g', '/images/cutouts/epsom-soak.png')
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      price = EXCLUDED.price,
      mrp = EXCLUDED.mrp,
      weight = EXCLUDED.weight,
      image_url = EXCLUDED.image_url;

UPDATE products SET price = 349 WHERE id IN ('rose-magic', 'lavender-bliss');
