-- Clear Duplicate Data and NULL umkm_preset_id Records
-- Run this after migration: php artisan migrate

-- WARNING: This will delete all records without umkm_preset_id
-- Backup your database first!

-- Check current data BEFORE deletion
SELECT 'categories' as table_name, COUNT(*) as total, 
       SUM(CASE WHEN umkm_preset_id IS NULL THEN 1 ELSE 0 END) as null_count
FROM categories
UNION ALL
SELECT 'products', COUNT(*), 
       SUM(CASE WHEN umkm_preset_id IS NULL THEN 1 ELSE 0 END)
FROM products
UNION ALL
SELECT 'customers', COUNT(*), 
       SUM(CASE WHEN umkm_preset_id IS NULL THEN 1 ELSE 0 END)
FROM customers
UNION ALL
SELECT 'expenses', COUNT(*), 
       SUM(CASE WHEN umkm_preset_id IS NULL THEN 1 ELSE 0 END)
FROM expenses
UNION ALL
SELECT 'transactions', COUNT(*), 
       SUM(CASE WHEN umkm_preset_id IS NULL THEN 1 ELSE 0 END)
FROM transactions
UNION ALL
SELECT 'income_records', COUNT(*), 
       SUM(CASE WHEN umkm_preset_id IS NULL THEN 1 ELSE 0 END)
FROM income_records;

-- Delete records with NULL umkm_preset_id
-- NOTE: These deletions cascade, so income_records linked to transactions will be auto-deleted

DELETE FROM income_records WHERE umkm_preset_id IS NULL;
DELETE FROM expenses WHERE umkm_preset_id IS NULL;

-- Delete transaction_items for transactions with NULL umkm_preset_id (manual because no direct FK)
DELETE FROM transaction_items 
WHERE transaction_id IN (SELECT id FROM transactions WHERE umkm_preset_id IS NULL);

-- Delete transactions with NULL umkm_preset_id
DELETE FROM transactions WHERE umkm_preset_id IS NULL;

DELETE FROM customers WHERE umkm_preset_id IS NULL;
DELETE FROM products WHERE umkm_preset_id IS NULL;
DELETE FROM categories WHERE umkm_preset_id IS NULL;

-- Check data AFTER deletion
SELECT 'categories' as table_name, COUNT(*) as total_remaining
FROM categories
UNION ALL
SELECT 'products', COUNT(*)
FROM products
UNION ALL
SELECT 'customers', COUNT(*)
FROM customers
UNION ALL
SELECT 'expenses', COUNT(*)
FROM expenses
UNION ALL
SELECT 'transactions', COUNT(*)
FROM transactions
UNION ALL
SELECT 'income_records', COUNT(*)
FROM income_records;

-- Verify all remaining records have umkm_preset_id
SELECT 'Remaining NULL records' as status,
       (SELECT COUNT(*) FROM categories WHERE umkm_preset_id IS NULL) +
       (SELECT COUNT(*) FROM products WHERE umkm_preset_id IS NULL) +
       (SELECT COUNT(*) FROM customers WHERE umkm_preset_id IS NULL) +
       (SELECT COUNT(*) FROM expenses WHERE umkm_preset_id IS NULL) +
       (SELECT COUNT(*) FROM transactions WHERE umkm_preset_id IS NULL) +
       (SELECT COUNT(*) FROM income_records WHERE umkm_preset_id IS NULL) as total_null_count;

-- If total_null_count = 0, you're good to go! ✅
