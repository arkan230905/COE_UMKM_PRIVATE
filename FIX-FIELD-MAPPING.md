# FIX: Field Name Mapping (camelCase ↔ snake_case)

## 🔍 MASALAH

Saat menambah kategori/produk, muncul error:
```
"The category id field is required"
"The umkm preset id field is required"
```

### Root Cause:
- **Frontend mengirim:** `categoryId`, `umkmPresetId` (camelCase)
- **Backend mengharapkan:** `category_id`, `umkm_preset_id` (snake_case)
- **Validation Laravel gagal** karena field name tidak match

## ✅ SOLUSI YANG DITERAPKAN

### Updated `storage.ts` - Bidirectional Field Mapping

Semua method save dan update sekarang melakukan mapping:

#### 1. **REQUEST (Frontend → Backend)** - camelCase to snake_case
```typescript
// Frontend format (camelCase)
const product = {
  umkmPresetId: 1,
  categoryId: 2,
  name: "Tiket Wisata",
  price: 20000,
  isActive: true
};

// Map to backend format (snake_case)
const backendData = {
  umkm_preset_id: 1,
  category_id: 2,
  name: "Tiket Wisata",
  price: 20000,
  is_active: true
};
```

#### 2. **RESPONSE (Backend → Frontend)** - snake_case to camelCase
```typescript
// Backend response (snake_case)
const response = {
  id: 1,
  umkm_preset_id: 1,
  category_id: 2,
  is_active: true,
  created_at: "2026-08-11"
};

// Map to frontend format (camelCase)
const mapped = {
  id: 1,
  umkmPresetId: 1,
  categoryId: 2,
  isActive: true,
  createdAt: "2026-08-11"
};
```

### Methods Updated:

#### Categories:
- ✅ `saveCategory()` - Maps request & response
- ✅ `updateCategory()` - Maps request & response

#### Products:
- ✅ `saveProduct()` - Maps request & response
- ✅ `updateProduct()` - Maps request & response

#### Customers:
- ✅ `saveCustomer()` - Maps request & response
- ✅ `updateCustomer()` - Maps request & response

#### Expenses:
- ✅ `saveExpense()` - Maps request & response
- ✅ `updateExpense()` - Maps request & response

#### Transactions:
- ✅ `saveTransaction()` - Maps request & response

### Field Mapping Reference:

| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| `umkmPresetId` | `umkm_preset_id` |
| `categoryId` | `category_id` |
| `customerId` | `customer_id` |
| `userId` | `user_id` |
| `transactionCode` | `transaction_code` |
| `totalAmount` | `total_amount` |
| `paymentMethod` | `payment_method` |
| `isActive` | `is_active` |
| `expenseCategory` | `expense_category` |
| `materialName` | `material_name` |
| `pricePerUnit` | `price_per_unit` |
| `shippingCost` | `shipping_cost` |
| `ppnPercent` | `ppn_percent` |
| `createdAt` | `created_at` |

## 🚀 TESTING

### Test 1: Add Category
1. Login sebagai admin UMKM
2. Buka "Admin > Kategori Produk"
3. Klik "Tambah Kategori"
4. Isi form:
   - Nama: "Minuman"
   - Deskripsi: "Jus dan minuman segar"
5. Klik "Simpan Perubahan"
6. **Harus berhasil tanpa error**
7. **Console harus menampilkan:** `✅ Category saved to database:`

### Test 2: Add Product
1. Buka "Admin > Produk"
2. Klik "Tambah Produk"
3. Isi form:
   - Nama: "Tiket Wisata"
   - Kategori: "Tiket Wisata" (pilih dari dropdown)
   - Harga: 20000
   - Stok: 10000
4. Klik "Simpan Perubahan"
5. **Harus berhasil tanpa error**
6. **Console harus menampilkan:** `✅ Product saved to database:`

### Test 3: Verify Database
```bash
php artisan tinker

# Check category saved correctly
DB::table('categories')->latest()->first();
# umkm_preset_id should NOT be null
# category_id should NOT be null

# Check product saved correctly
DB::table('products')->latest()->first();
# umkm_preset_id should NOT be null
# category_id should NOT be null
# is_active should be 1 or 0 (not null)
```

### Test 4: Check Network Request (F12)
1. Buka browser DevTools (F12)
2. Klik tab "Network"
3. Try adding a product
4. Click on the POST request to `/api/products`
5. **Payload tab should show:**
   ```json
   {
     "umkm_preset_id": 1,
     "category_id": 7,
     "name": "Tiket Wisata",
     "is_active": true
   }
   ```
6. **NOT:**
   ```json
   {
     "umkmPresetId": 1,  // ❌ Wrong
     "categoryId": 7,    // ❌ Wrong
   }
   ```

## 🆘 TROUBLESHOOTING

### Error: "The category id field is required"

**Penyebab:** Dropdown kategori tidak memilih value, atau value tidak dikirim

**Solusi:**
1. Pastikan kategori sudah dibuat terlebih dahulu
2. Pilih kategori dari dropdown
3. Jangan klik "Simpan" jika kategori masih "Pilih Kategori"

**Jika masih error, check console:**
```javascript
// Should show:
categoryId: 7 // ✅ Correct
// NOT:
categoryId: 0 // ❌ Wrong - means not selected
```

### Error: "The umkm preset id field is required"

**Penyebab:** `currentPreset.id` tidak tersedia

**Solusi:** Check console, harus ada:
```
🔐 Current UMKM ID set: 1
```

Jika tidak ada, problem di `App.tsx` - `storageService.setCurrentUmkmId()` tidak dipanggil.

### Error: "Column 'umkm_preset_id' cannot be null"

**Penyebab:** Mapping tidak berfungsi atau `umkmPresetId` undefined

**Check console log saat save:**
```javascript
console.log('Saving with umkmPresetId:', currentPreset.id);
// Should show actual ID, not undefined
```

### Data Tersimpan tapi Field NULL di Database

**Penyebab:** Backend controller tidak menerima field yang dikirim

**Check Laravel log:**
```bash
tail -f laravel/storage/logs/laravel.log
```

**Verify payload received:**
```php
// Add to controller store method:
\Log::info('Received data:', $request->all());
```

## ✅ HASIL AKHIR

Setelah fix ini:
- ✅ Frontend mengirim field dalam format snake_case ke backend
- ✅ Backend validation Laravel berhasil (field name match)
- ✅ Response dari backend di-map kembali ke camelCase untuk frontend
- ✅ Kategori tersimpan dengan benar
- ✅ Produk tersimpan dengan benar (termasuk category_id)
- ✅ Semua field ter-map dengan benar (umkm_preset_id, is_active, dll)

---

**Related Fixes:**
- `FIX-UMKM-PRESET-ID-DATABASE.md` - Database schema
- `FIX-BACKEND-FILTER.md` - API filtering
- **`FIX-FIELD-MAPPING.md`** - Field name mapping (THIS FIX)
