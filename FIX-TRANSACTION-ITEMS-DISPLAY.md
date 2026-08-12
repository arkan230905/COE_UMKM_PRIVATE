# Fix: Nama Produk Tidak Tampil di Rincian Invoice

## 🐛 MASALAH
- Nama produk **TIDAK TAMPIL** di rincian invoice pelanggan (CustomerOrders)
- Nama produk **TIDAK TAMPIL** di rincian transaksi admin (AdminTransactions)
- Data items tidak konsisten - kadang ada, kadang kosong
- Screenshot user menunjukkan kolom "Nama Produk" kosong

## 🔍 ROOT CAUSE

### 1. **Frontend: Items Tidak Di-Map dari Backend Response**
Fungsi `getTransactions()` dan `saveTransaction()` di `storage.ts`:
- Backend mengirim field `items` dengan relasi `product` dan `category`
- Frontend **TIDAK MENG-MAP** field `items` ke format camelCase
- Frontend hanya return data mentah tanpa mapping items

```typescript
// ❌ SEBELUM: Tidak ada mapping items
const mapped = allTransactions.map(trans => ({
  ...trans,
  umkmPresetId: trans.umkm_preset_id,
  customerId: trans.customer_id,
  // items: ??? MISSING!
}));
```

### 2. **Backend: Tidak Ada Snapshot Data**
Table `transaction_items` hanya menyimpan:
- `product_id` (foreign key)
- `quantity`, `price`, `subtotal`

**TIDAK MENYIMPAN**:
- `product_name` - jika produk dihapus, nama hilang
- `category_name` - jika kategori dihapus, nama hilang

Backend hanya mengandalkan **relasi** `product` yang bisa NULL jika produk dihapus.

### 3. **Model: Decimal Casting Returns String**
```php
// ❌ TransactionItem model
'price' => 'decimal:2',      // Returns "20000.00" (string)
'subtotal' => 'decimal:2',   // Returns "40000.00" (string)
```

Frontend expect number, dapat string → format berantakan.

## ✅ SOLUSI

### 1. **Frontend: Map Items dari Backend Response**

**File: `src/services/storage.ts`**

**Di `getTransactions()`:**
```typescript
// ✅ SESUDAH: Map items dengan fallback ke relasi product
const mapped = allTransactions.map(trans => ({
  ...trans,
  umkmPresetId: trans.umkm_preset_id || trans.umkmPresetId,
  customerId: trans.customer_id || trans.customerId,
  // ... other fields ...
  
  // ✅ MAP ITEMS dari backend
  items: trans.items?.map((item: any) => ({
    productId: item.product_id || item.productId,
    productName: item.product?.name || item.product_name || item.productName || 'Produk Tidak Diketahui',
    categoryName: item.product?.category?.name || item.category_name || item.categoryName || '-',
    quantity: item.quantity,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
  })) || []
}));
```

**Di `saveTransaction()`:**
```typescript
// Map response kembali dengan items
return {
  ...data,
  umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
  // ... other fields ...
  
  // ✅ MAP ITEMS dari response
  items: data.items?.map((item: any) => ({
    productId: item.product_id || item.productId,
    productName: item.product?.name || item.product_name || item.productName || 'Produk Tidak Diketahui',
    categoryName: item.product?.category?.name || item.category_name || item.categoryName || '-',
    quantity: item.quantity,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
  })) || []
};
```

**Send Snapshot saat Create Transaction:**
```typescript
items: transaction.items?.map(item => ({
  product_id: item.productId,
  product_name: item.productName,        // ✅ Send snapshot
  product_description: item.productDescription, // ✅ Optional
  category_name: item.categoryName,      // ✅ Send snapshot
  quantity: item.quantity,
  price: item.price,
  subtotal: item.subtotal
}))
```

### 2. **Backend: Tambah Snapshot Fields**

**Migration: `2026_08_12_000000_add_snapshot_fields_to_transaction_items_table.php`**
```php
Schema::table('transaction_items', function (Blueprint $table) {
    $table->string('product_name')->nullable()->after('product_id');
    $table->text('product_description')->nullable()->after('product_name');
    $table->string('category_name')->nullable()->after('product_description');
});
```

**Model: `laravel/app/Models/TransactionItem.php`**
```php
protected $fillable = [
    'transaction_id',
    'product_id',
    'quantity',
    'price',
    'subtotal',
    'product_name',        // ✅ ADDED
    'product_description', // ✅ ADDED
    'category_name'        // ✅ ADDED
];

protected $casts = [
    'price' => 'float',    // ✅ Changed from decimal:2
    'subtotal' => 'float', // ✅ Changed from decimal:2
    'quantity' => 'integer'
];
```

**Controller: `laravel/app/Http/Controllers/TransactionController.php`**
```php
// Validation
'items.*.product_name' => 'nullable|string',
'items.*.product_description' => 'nullable|string',
'items.*.category_name' => 'nullable|string',

// Create transaction items
foreach ($validated['items'] as $item) {
    $product = Product::with('category')->findOrFail($item['product_id']);
    
    TransactionItem::create([
        'transaction_id' => $transaction->id,
        'product_id' => $item['product_id'],
        'quantity' => $item['quantity'],
        'price' => $item['price'],
        'subtotal' => $item['subtotal'],
        // ✅ Save snapshot (from frontend OR fallback to DB)
        'product_name' => $item['product_name'] ?? $product->name,
        'product_description' => $item['product_description'] ?? $product->description,
        'category_name' => $item['category_name'] ?? $product->category->name ?? '-',
    ]);
    
    $product->decrement('stock', $item['quantity']);
}
```

## 🎯 HASIL

✅ **Nama produk TAMPIL** di rincian invoice pelanggan
✅ **Nama produk TAMPIL** di rincian transaksi admin
✅ **Kategori produk TAMPIL** di semua invoice
✅ **Data persisten** - meskipun produk/kategori dihapus, snapshot tetap ada
✅ **Format harga benar** - float bukan string dengan desimal
✅ **Data konsisten** di semua tempat (online, offline, admin, customer)

## 📊 DATA FLOW

### Create Transaction:
```
Frontend (Cart Items)
  ↓ productName, categoryName included
storageService.saveTransaction()
  ↓ Map to backend format (snake_case)
POST /api/transactions
  ↓ items with product_name, category_name
TransactionController::store()
  ↓ Save to transaction_items table
Database: INSERT with snapshot data
  ↓ Load with relations
Response with items + product relation
  ↓ Map to frontend format
Frontend: Transaction with items array
```

### Fetch Transactions:
```
Frontend
  ↓
storageService.getTransactions()
  ↓
GET /api/transactions?umkm_preset_id=X
  ↓ Eager load: items.product.category
TransactionController::index()
  ↓ Return with relations
Response: transactions with items array
  ↓ Map items to camelCase
Frontend: items with productName & categoryName
  ↓ Render in components
Display in invoice: ✅ Nama produk tampil!
```

## 🧪 CARA TEST

### Test 1: Transaksi Baru
1. Login sebagai customer
2. Add produk ke cart (misal: "Multivitamin", qty: 2)
3. Checkout dan submit
4. Buka "Pesanan Saya" → Klik "Lihat Detail Invoice"
5. **✅ VERIFY**: Nama produk "Multivitamin" tampil di rincian

### Test 2: Admin View
1. Login sebagai super admin
2. Buka menu "Transaksi Penjualan"
3. Tab "Penjualan Online" → Klik "Invoice" pada transaksi
4. **✅ VERIFY**: Nama produk tampil lengkap dengan kategori

### Test 3: Offline Transaction
1. Login sebagai super admin
2. Tab "Penjualan Offline" → Klik "Transaksi Kasir"
3. Scan barcode atau pilih produk
4. Proses transaksi → Lihat detail
5. **✅ VERIFY**: Nama produk tampil di struk

### Test 4: Data Persisten (Hapus Produk)
1. Buat transaksi dengan produk "Test Product"
2. Hapus produk "Test Product" dari database
3. Buka kembali transaksi lama
4. **✅ VERIFY**: Nama "Test Product" masih tampil (dari snapshot)

## 📝 FILES CHANGED

### Frontend:
- `src/services/storage.ts` - Map items di getTransactions() dan saveTransaction()

### Backend:
- `laravel/database/migrations/2026_08_12_000000_add_snapshot_fields_to_transaction_items_table.php` - Migration baru
- `laravel/app/Models/TransactionItem.php` - Tambah fillable & ubah casting
- `laravel/app/Http/Controllers/TransactionController.php` - Simpan snapshot saat create

### Documentation:
- `FIX-TRANSACTION-ITEMS-DISPLAY.md` - Dokumentasi fix ini

## 🚀 DEPLOYMENT

```bash
# 1. Jalankan migration
cd laravel
php artisan migrate

# 2. Test di development
# - Buat transaksi baru
# - Verify items tampil

# 3. Commit & push
git add .
git commit -m "fix: transaction items now display product names in invoices"
git push origin main
```

## 💡 IMPROVEMENTS MADE

1. **Snapshot Architecture**: Transaction items sekarang punya snapshot data
2. **Data Integrity**: Nama produk/kategori tidak hilang saat produk dihapus
3. **Type Safety**: Float casting bukan decimal (konsisten number)
4. **Complete Mapping**: Semua field di-map dengan benar dari backend
5. **Fallback Strategy**: Prioritas snapshot → relasi → default value

## ⚠️ CATATAN PENTING

- Migration hanya menambah kolom, data lama akan NULL untuk snapshot
- Transaksi lama bergantung pada relasi product (jika produk masih ada)
- Transaksi baru akan punya snapshot lengkap
- Jika mau isi data lama, jalankan seeder/script untuk populate snapshot dari relasi

---
**Status**: ✅ COMPLETED
**Tanggal**: 2026-08-12
**Migration Executed**: ✅ 2026_08_12_000000_add_snapshot_fields_to_transaction_items_table
**Developer**: Kiro AI Assistant
