-- July 2026 catalog correction:
-- Exactly two products. "Epsom Salt" is the product; Rose / Lavender are variants.
-- Price ₹349 (MRP 499) per the owner's instruction — final prices pending.

UPDATE products SET name = 'Rose Epsom Salt',     price = 349 WHERE id = 'rose-magic';
UPDATE products SET name = 'Lavender Epsom Salt', price = 349 WHERE id = 'lavender-bliss';

-- Remove any extra products so exactly two records remain
DELETE FROM products WHERE id NOT IN ('rose-magic', 'lavender-bliss');
