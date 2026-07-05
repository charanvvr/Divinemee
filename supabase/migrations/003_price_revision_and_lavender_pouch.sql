-- July 2026 catalog update:
-- 1. Price revision: Rose Magic & Lavender Bliss ₹249 → ₹349 (MRP unchanged ₹499)
-- 2. Lavender Bliss moves to the 500 g pouch packaging
-- (The plain Epsom ₹279 product will be added in a later migration once its
--  pack photography is available.)

UPDATE products SET price = 349 WHERE id IN ('rose-magic', 'lavender-bliss');

UPDATE products
SET weight = '500 g',
    image_url = '/images/cutouts/lavender-pouch.png'
WHERE id = 'lavender-bliss';
