# Testing Guide: Shipping Tracking Persistence

## ✅ TASK 11 COMPLETED

**Status**: Code implemented, committed, and pushed to GitHub
**Commit**: `a8d3130` - "fix(transactions): persist shipping tracking data to database"

## 🎯 WHAT WAS FIXED

Before this fix, when admin updated shipping information (courier name, tracking number, shipping status), the data was **only stored in browser memory** and would be lost when:
- Browser is refreshed
- Browser cache is cleared
- Viewing from different device
- Session expires

After this fix, all shipping tracking data is **persisted to the database** and remains available across all scenarios above.

## 📋 TESTING CHECKLIST

### ✅ Step 1: Database Migration
**Verify the migration has been applied:**

```bash
cd laravel
php artisan migrate:status
```

**Look for:** `2026_08_12_100000_add_shipping_fields_to_transactions_table` - Should show "Ran"

**Alternative - Check table structure:**
```sql
DESCRIBE transactions;
```

**Expected columns:**
- `courier_name` (varchar, nullable)
- `tracking_number` (varchar, nullable)
- `shipping_status` (varchar, nullable)

### ✅ Step 2: Update Shipping Info (Happy Path)

1. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd laravel
   php artisan serve
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Login as Super Admin**
   - Access: `http://localhost:5173/admin/{umkm-code}`
   - Example: `http://localhost:5173/admin/UMKM001`

3. **Navigate to Transactions:**
   - Click "Transaksi Penjualan" in sidebar
   - Click "🌐 Penjualan Online" tab
   - Find a transaction with status "Pending" or "Paid"

4. **Open Transaction Details:**
   - Click "Invoice" button on any transaction
   - Scroll down to "Sistem Lacak Status Pengiriman" section

5. **Update Shipping Information:**
   - **Pilih Kurir Pengiriman**: Select "J&T Express"
   - **Nomor Resi Pelacakan**: Enter "JT123456789"
   - **Status Pengiriman**: Select "Sedang Dikirim"
   - Click "Perbarui Info Pengiriman" button

6. **Verify Success:**
   - ✅ Alert should show: "Info pengiriman berhasil disimpan ke database!"
   - ✅ Visual tracker should update (step 3 highlighted)
   - ✅ Form fields should retain the values
   - Close the modal

### ✅ Step 3: Verify Database Persistence

**Open MySQL and run:**
```sql
SELECT 
    id,
    transaction_code,
    courier_name,
    tracking_number,
    shipping_status,
    status,
    updated_at
FROM transactions
WHERE courier_name = 'J&T Express'
ORDER BY updated_at DESC
LIMIT 5;
```

**Expected Result:**
```
| id | transaction_code | courier_name | tracking_number | shipping_status | status | updated_at          |
|----|-----------------|--------------|-----------------|-----------------|--------|---------------------|
| 42 | TRX12345678     | J&T Express  | JT123456789     | Sedang Dikirim  | paid   | 2026-08-13 10:30:45 |
```

✅ **Verify:**
- `courier_name` = 'J&T Express'
- `tracking_number` = 'JT123456789'
- `shipping_status` = 'Sedang Dikirim'
- `updated_at` is recent timestamp

### ✅ Step 4: Browser Refresh Test

1. **Stay on the same page**
2. **Refresh browser** (Press F5 or Ctrl+R)
3. **Navigate back to Transactions** → Click "Invoice" on same transaction
4. **Verify shipping info:**
   - ✅ Kurir: "J&T Express" (still there)
   - ✅ Resi: "JT123456789" (still there)
   - ✅ Status: "Sedang Dikirim" (still there)
   - ✅ Visual tracker shows correct step

**Result:** ✅ Data persists after refresh (loaded from database)

### ✅ Step 5: Clear Cache Test

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear all data
   - Firefox: Ctrl+Shift+Delete → Clear Everything
   - Or use Incognito/Private window

2. **Login again** as Super Admin

3. **Navigate to the same transaction** → Click "Invoice"

4. **Verify shipping info:**
   - ✅ All data still present (from database)

**Result:** ✅ Data survives cache clear

### ✅ Step 6: Multi-Device Test

1. **Open different browser** (e.g., if you used Chrome, open Firefox)
2. **Login** as Super Admin
3. **Navigate to the same transaction** → Click "Invoice"
4. **Verify shipping info:**
   - ✅ All data visible (synced from database)

**Result:** ✅ Data accessible from any device

### ✅ Step 7: Update Progression Test

**Test the full shipping flow:**

1. **Initial State:**
   - Status Pengiriman: "Dalam Antrean"
   - Transaction Status: "Pending"

2. **Update 1 - Dikemas:**
   - Change to: "Sedang Dikemas"
   - Click "Perbarui"
   - ✅ Verify: Step 2 highlighted, database updated

3. **Update 2 - Dikirim:**
   - Change to: "Sedang Dikirim"
   - Enter tracking: "JT987654321"
   - Click "Perbarui"
   - ✅ Verify: Step 3 highlighted, resi saved to DB

4. **Update 3 - Sampai (Auto-Complete):**
   - Change to: "Sampai Tujuan"
   - Click "Perbarui"
   - ✅ Verify: 
     - Step 4 completed
     - Transaction status changes to "Completed"
     - Alert success

5. **Check Income Record Created:**
   ```sql
   SELECT * FROM income_records 
   WHERE transaction_id = (
       SELECT id FROM transactions WHERE tracking_number = 'JT987654321'
   );
   ```
   - ✅ Verify: Income record exists with correct amount

### ✅ Step 8: Customer View Test

1. **Logout** from Admin
2. **Login as Customer** (the one who made the order)
3. **Navigate to:** "Pesanan Saya"
4. **Find the transaction** → Click "View Invoice"
5. **Verify shipping info visible:**
   - ✅ Kurir: Displayed correctly
   - ✅ Resi: Displayed correctly
   - ✅ Status: Displayed correctly
   - ✅ Visual tracker shows progress

**Result:** ✅ Customer sees real-time shipping updates from database

### ✅ Step 9: API Endpoint Test (Optional - For Developers)

**Test the API directly using cURL or Postman:**

```bash
# Update shipping info
curl -X PUT http://localhost:8000/api/transactions/42/shipping \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "courier_name": "JNE Express",
    "tracking_number": "JNE555666777",
    "shipping_status": "Sedang Dikirim",
    "status": "paid"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Info pengiriman berhasil diperbarui",
  "data": {
    "id": 42,
    "transaction_code": "TRX12345678",
    "courier_name": "JNE Express",
    "tracking_number": "JNE555666777",
    "shipping_status": "Sedang Dikirim",
    "status": "paid",
    "updated_at": "2026-08-13T10:45:30.000000Z"
  }
}
```

### ✅ Step 10: Console Log Verification

**Open Browser DevTools (F12) → Console Tab**

**When updating shipping info, you should see:**
```
📤 Updating shipping info to database:
{
  transactionId: 42,
  courierName: "J&T Express",
  trackingNumber: "JT123456789",
  shippingStatus: "Sedang Dikirim"
}

✅ Shipping info saved to database
```

**If there's an error, you'll see:**
```
❌ Error updating shipping info: [error message]
```

## 🐛 TROUBLESHOOTING

### Issue 1: "Migration not found"

**Symptom:** Migration file doesn't appear in migrate:status

**Solution:**
```bash
cd laravel
composer dump-autoload
php artisan migrate:refresh --path=/database/migrations/2026_08_12_100000_add_shipping_fields_to_transactions_table.php
```

### Issue 2: "Column not found" error

**Symptom:** SQL error "Unknown column 'courier_name'"

**Solution:**
```bash
# Run the specific migration
php artisan migrate --path=/database/migrations/2026_08_12_100000_add_shipping_fields_to_transactions_table.php
```

### Issue 3: Alert shows but data doesn't persist

**Symptom:** Success alert appears, but refresh loses data

**Diagnosis:**
1. Check browser console for API errors
2. Check Laravel logs: `laravel/storage/logs/laravel.log`
3. Verify API endpoint is reachable

**Solution:**
```bash
# Test API endpoint manually
curl http://localhost:8000/api/transactions/1/shipping
```

### Issue 4: "Transaction not found"

**Symptom:** 404 error when updating

**Diagnosis:** Transaction ID might be invalid

**Solution:**
1. Check transaction exists: `SELECT * FROM transactions WHERE id = ?`
2. Verify transaction belongs to correct UMKM
3. Check transaction wasn't deleted

### Issue 5: Changes visible in one browser but not another

**Symptom:** Update works in Chrome but not Firefox

**Diagnosis:** Different sessions or API caching

**Solution:**
1. Ensure both browsers logged into same UMKM
2. Clear all browser cache
3. Check API is returning latest data:
   ```bash
   curl http://localhost:8000/api/transactions?umkm_preset_id=1
   ```

## 📊 EXPECTED BEHAVIOR SUMMARY

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Update shipping info | ❌ Lost on refresh | ✅ Persists in database |
| Browser refresh | ❌ Data disappears | ✅ Data remains |
| Clear cache | ❌ Data lost | ✅ Data safe in DB |
| Different device | ❌ Not synced | ✅ Synced from DB |
| Customer view | ❌ Outdated/missing | ✅ Real-time from DB |
| "Sampai Tujuan" | ❌ Manual status update | ✅ Auto-complete + income |

## ✅ SUCCESS CRITERIA

All of the following must be TRUE:

- ✅ Database columns created successfully
- ✅ Admin can update shipping info
- ✅ Data persists after browser refresh
- ✅ Data survives cache clear
- ✅ Data visible from multiple devices
- ✅ Customer sees shipping updates
- ✅ "Sampai Tujuan" auto-creates income record
- ✅ No console errors during update
- ✅ Success/error alerts display correctly
- ✅ Visual tracker updates properly

## 🎓 NEXT STEPS

After confirming all tests pass:

1. **Inform Users:**
   - ✅ Shipping tracking now persists reliably
   - ✅ Safe to use across devices
   - ✅ Data won't be lost

2. **Monitor Production:**
   - Check Laravel logs for any API errors
   - Monitor database for correct data
   - Gather user feedback

3. **Optional Enhancements:**
   - Add shipping history log
   - Email notifications on status changes
   - SMS alerts for customers
   - Integration with real courier APIs

## 📞 SUPPORT

If you encounter any issues during testing:

1. Check browser console (F12) for errors
2. Check Laravel logs: `laravel/storage/logs/laravel.log`
3. Verify database migration ran successfully
4. Test API endpoint directly with cURL
5. Review this testing guide step-by-step

---

**Task Status:** ✅ COMPLETED & READY FOR TESTING
**Date:** 2026-08-13
**Priority:** 🔴 HIGH (Data Integrity)
**Testing Required:** Yes - All steps above
**Migration:** Executed ✅
