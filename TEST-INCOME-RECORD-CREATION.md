# Test: Income Record Auto-Creation

## 🎯 TUJUAN TEST
Memastikan bahwa ketika **customer konfirmasi barang sudah sampai** (status transaksi berubah ke `completed`), sistem **OTOMATIS membuat income record** di tabel `income_records` untuk keperluan **Laporan Keuangan Pendapatan**.

## 📋 PRE-REQUISITES

### Database Setup
Pastikan tabel `income_records` sudah ada dengan struktur:
```sql
CREATE TABLE income_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    umkm_preset_id BIGINT NOT NULL,
    transaction_id BIGINT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (umkm_preset_id) REFERENCES umkm_presets(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

### Backend Must Be Running
```bash
cd laravel
php artisan serve
# Server running at http://localhost:8000
```

## 🧪 TEST STEPS

### Step 1: Buat Transaksi Baru (Setup)

1. **Login sebagai Customer**
   - URL: `http://127.0.0.1:3000/ARKAN-JAYA/pelanggan/catalog`
   - Klik "Masuk / Daftar"
   - Login atau register customer baru

2. **Add Produk ke Cart**
   - Pilih produk (misal: "Multivitamin C Plus")
   - Klik "Add to Cart"
   - Qty: 2

3. **Checkout**
   - Klik "Keranjang Saya"
   - Klik "Lanjut ke Checkout"
   - Isi data:
     - Metode Bayar: Cash
     - Catatan: "Test Income Record"
   - Submit

4. **Catat Transaction Code**
   - Screenshot transaction code (misal: `TRX881`)
   - **VERIFY**: Status = "Menunggu" (pending)

### Step 2: Check Database Before Confirmation

```sql
-- Check transaction status
SELECT id, transaction_code, status, total_amount, umkm_preset_id
FROM transactions 
WHERE transaction_code = 'TRX881';

-- Check income_records (should be EMPTY for this transaction)
SELECT * FROM income_records 
WHERE transaction_id = (
    SELECT id FROM transactions WHERE transaction_code = 'TRX881'
);
```

**Expected Result:**
- ✅ Transaction exists with `status = 'pending'`
- ✅ Income record **TIDAK ADA** (0 rows)

### Step 3: Customer Konfirmasi Barang Sampai

1. **Buka "Pesanan Saya"**
   - URL: `http://127.0.0.1:3000/ARKAN-JAYA/pelanggan/orders`
   - Lihat transaksi TRX881

2. **View Invoice**
   - Klik "View Invoice" pada transaksi
   - Status pengiriman: "Dalam Antrean"

3. **Konfirmasi Barang Sudah Sampai**
   - Klik tombol hijau: **"Konfirmasi Barang Sudah Sampai ✅"**
   - **VERIFY**: Alert muncul: "✅ Pesanan Anda telah berhasil dikonfirmasi... tersimpan di database"
   - **VERIFY**: Status berubah ke "Selesai" (completed)
   - **VERIFY**: Shipping tracker step 4 "Tiba" berwarna hijau

4. **Check Browser Console**
   ```
   📤 Updating transaction status to completed: {id}
   ✅ Transaction status updated in database
   ```

### Step 4: Verify Database After Confirmation

```sql
-- 1. Check transaction status (should be 'completed')
SELECT id, transaction_code, status, total_amount, umkm_preset_id, updated_at
FROM transactions 
WHERE transaction_code = 'TRX881';

-- 2. Check income_records (should NOW EXIST)
SELECT 
    ir.id,
    ir.umkm_preset_id,
    ir.transaction_id,
    ir.amount,
    ir.date,
    ir.description,
    ir.created_at,
    t.transaction_code,
    t.total_amount
FROM income_records ir
JOIN transactions t ON ir.transaction_id = t.id
WHERE t.transaction_code = 'TRX881';

-- 3. Verify amounts match
SELECT 
    t.transaction_code,
    t.total_amount AS transaction_amount,
    ir.amount AS income_amount,
    (t.total_amount = ir.amount) AS amounts_match
FROM transactions t
LEFT JOIN income_records ir ON ir.transaction_id = t.id
WHERE t.transaction_code = 'TRX881';
```

**Expected Results:**
- ✅ Transaction `status = 'completed'`
- ✅ Income record **EXISTS** (1 row)
- ✅ `income_records.umkm_preset_id` = `transactions.umkm_preset_id`
- ✅ `income_records.amount` = `transactions.total_amount`
- ✅ `income_records.description` = `"Penjualan - TRX881"`
- ✅ `income_records.date` = today's date
- ✅ `income_records.created_at` ≈ konfirmasi timestamp

### Step 5: Verify in Admin Panel

1. **Login sebagai Super Admin**
   - URL: `http://127.0.0.1:3000/ARKAN-JAYA/superadmin`

2. **Check Laporan Keuangan**
   - Menu: "Laporan Keuangan"
   - Tab: "Pendapatan"
   - **VERIFY**: Ada entry baru:
     - Tanggal: Hari ini
     - Deskripsi: "Penjualan - TRX881"
     - Jumlah: Rp 200.000 (sesuai total transaksi)
     - Sumber: "Transaksi Penjualan"

3. **Check Total Pendapatan**
   - **VERIFY**: Total pendapatan bertambah sesuai amount transaksi

### Step 6: Test Refresh Browser Persistence

1. **Refresh halaman Customer Orders** (F5)
   - **VERIFY**: Status TETAP "Selesai" (tidak balik pending)

2. **Logout & Login kembali**
   - **VERIFY**: Status TETAP "Selesai"

3. **Query database lagi**
   ```sql
   SELECT COUNT(*) as total_income_records
   FROM income_records 
   WHERE transaction_id = (
       SELECT id FROM transactions WHERE transaction_code = 'TRX881'
   );
   ```
   - **VERIFY**: `total_income_records = 1` (tidak duplicate)

## ✅ SUCCESS CRITERIA

Semua kondisi berikut HARUS terpenuhi:

| No | Kondisi | Status |
|----|---------|--------|
| 1 | Transaction status berubah dari `pending` ke `completed` | ✅ |
| 2 | Income record otomatis tercreate di database | ✅ |
| 3 | `income_records.umkm_preset_id` match dengan transaction | ✅ |
| 4 | `income_records.amount` = `transactions.total_amount` | ✅ |
| 5 | `income_records.description` = "Penjualan - {code}" | ✅ |
| 6 | Income record muncul di Laporan Keuangan admin | ✅ |
| 7 | Status persisten setelah refresh browser | ✅ |
| 8 | Tidak ada duplicate income records | ✅ |

## 🐛 TROUBLESHOOTING

### Issue: Income Record Tidak Tercreate

**Check 1: Backend Response**
```javascript
// Browser console setelah klik konfirmasi
// Should see:
✅ Transaction status updated in database
```

**Check 2: Laravel Logs**
```bash
cd laravel
tail -f storage/logs/laravel.log
```

Look for errors during `updateStatus` API call.

**Check 3: API Endpoint**
```bash
# Test manual dengan curl
curl -X PUT http://localhost:8000/api/transactions/123/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

**Check 4: Database Migration**
```sql
-- Verify income_records table exists
SHOW TABLES LIKE 'income_records';

-- Verify columns
DESCRIBE income_records;
```

### Issue: Status Balik ke Pending Setelah Refresh

**Cause:** Frontend tidak call API, hanya update localStorage

**Solution:** Sudah diperbaiki di `CustomerOrders.tsx` dengan:
```typescript
await storageService.updateTransactionStatus(selectedTx.id, 'completed');
```

### Issue: Duplicate Income Records

**Check:**
```sql
SELECT transaction_id, COUNT(*) as count
FROM income_records
GROUP BY transaction_id
HAVING count > 1;
```

**Cause:** `updateOrCreate` seharusnya prevent duplicate. Check jika ada multiple API calls.

**Prevention:** Backend uses `updateOrCreate` dengan key `transaction_id`:
```php
IncomeRecord::updateOrCreate(
    ['transaction_id' => $transaction->id], // ← Prevents duplicate
    [...]
);
```

## 📊 DATA FLOW DIAGRAM

```
Customer: "Konfirmasi Barang Sudah Sampai" ✅
            ↓
    async onClick handler
            ↓
storageService.updateTransactionStatus(id, 'completed')
            ↓
    PUT /api/transactions/{id}/status
            ↓
TransactionController::updateStatus()
            ↓
    UPDATE transactions SET status='completed'
            ↓
    Check: if (status == 'completed' && oldStatus != 'completed')
            ↓
    IncomeRecord::updateOrCreate([
        'transaction_id' => $id
    ], [
        'umkm_preset_id' => $umkm_id,
        'amount' => $total_amount,
        'date' => today(),
        'description' => 'Penjualan - TRX123'
    ])
            ↓
    INSERT INTO income_records (...)
            ↓
    Response 200 OK
            ↓
    Frontend: Update React state
            ↓
    UI: Status = "Selesai" ✅
            ↓
Admin Panel → Laporan Keuangan → Pendapatan
            ↓
    Display: "Penjualan - TRX123" | Rp 200.000
```

## 📝 VERIFICATION CHECKLIST

Sebelum deploy ke production, pastikan:

- [ ] Backend API endpoint `/api/transactions/{id}/status` berfungsi
- [ ] Model `IncomeRecord` punya `umkm_preset_id` di `$fillable`
- [ ] Table `income_records` punya kolom `umkm_preset_id`
- [ ] Frontend call `storageService.updateTransactionStatus()`
- [ ] CustomerOrders.tsx import `storageService`
- [ ] Backend `updateStatus()` method create income record
- [ ] Status persisten setelah refresh
- [ ] Income record muncul di Laporan Keuangan
- [ ] No duplicate income records
- [ ] Multi-tenant isolation work (umkm_preset_id filter)

## 🚀 PRODUCTION READINESS

### Before Deploy:
```bash
# 1. Run tests
cd laravel
php artisan test

# 2. Check migrations
php artisan migrate:status

# 3. Verify table structure
php artisan tinker
> Schema::hasTable('income_records')
> Schema::hasColumn('income_records', 'umkm_preset_id')

# 4. Test API endpoint
curl -X PUT http://localhost:8000/api/transactions/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### After Deploy:
1. Test dengan 1 transaksi real
2. Verify di database: income record tercreate
3. Check Laporan Keuangan admin: entry muncul
4. Monitor Laravel logs untuk errors

---
**Test Status**: ✅ READY FOR EXECUTION
**Last Updated**: 2026-08-12
**Priority**: 🔴 CRITICAL (Affects financial reporting)
**Tester**: Manual testing required
