# 🧪 Panduan Testing Isolasi Data Multi-Tenant

## Tujuan Testing
Memastikan bahwa setiap UMKM **HANYA** dapat melihat dan mengakses data mereka sendiri, dan **TIDAK DAPAT** melihat data UMKM lain.

---

## 🔧 Persiapan Testing

### 1. Pastikan Server Berjalan
```bash
# Terminal 1 - Laravel Backend
cd laravel
php artisan serve
# Output: Server running on http://localhost:8000

# Terminal 2 - React Frontend  
npm run dev
# Output: Local: http://localhost:3001
```

### 2. Data Sample yang Tersedia
Setelah seeding database, Anda memiliki 2 UMKM:

**UMKM 1: Bistara Coffee**
- Kode UMKM: `BISTARA-001`
- Industri: Makanan & Minuman
- Data: Produk kopi, transaksi kopi, dll

**UMKM 2: Toko Elektronik Jaya**
- Kode UMKM: `ELEKT-001`
- Industri: Elektronik
- Data: Produk elektronik, transaksi elektronik, dll

---

## 🎯 Test Case 1: Login dan Verifikasi Data

### Langkah Testing:

#### A. Login sebagai BISTARA-001
1. Buka browser dan akses: `http://localhost:3001`
2. Klik "Masuk sebagai Admin atau Kasir"
3. Masukkan Kode UMKM: `BISTARA-001`
4. Klik "Login Dashboard"

#### B. Verifikasi Console Log
Buka Developer Tools (F12) dan lihat Console:
```
🔐 Current UMKM ID set: 1
🔄 Loading data for UMKM: BISTARA-001
🔐 Filtered 5/12 categories for UMKM 1
🔐 Filtered 8/25 products for UMKM 1
🔐 Filtered 3/15 customers for UMKM 1
🔐 Filtered 10/45 transactions for UMKM 1
🔐 Filtered 7/20 expenses for UMKM 1
✅ Data loaded: { categories: 5, products: 8, ... }
```

**✅ PASS jika:**
- Console menampilkan "Current UMKM ID set: 1"
- Angka filtered lebih kecil dari total (misal: 8/25 products)
- Dashboard menampilkan data BISTARA-001 saja

**❌ FAIL jika:**
- Console tidak ada log filtering
- Angka filtered sama dengan total (berarti tidak difilter)
- Melihat produk elektronik di dashboard

#### C. Cek Halaman Produk
1. Klik menu "Produk" di sidebar
2. Verifikasi: Hanya produk kategori **Makanan & Minuman** yang muncul
3. Contoh: Kopi Arabica, Cappuccino, Tea, dll
4. **TIDAK BOLEH** ada produk elektronik (laptop, mouse, keyboard)

#### D. Cek Transaksi
1. Klik menu "Transaksi" di sidebar
2. Verifikasi: Hanya transaksi terkait produk kopi/minuman
3. Cek detail transaksi → pastikan semua produk adalah kopi/minuman

---

## 🎯 Test Case 2: Switch UMKM dan Verifikasi Isolasi

### Langkah Testing:

#### A. Logout dari BISTARA-001
1. Klik menu "Pengaturan" (Settings icon) di sidebar
2. Scroll ke bawah, klik "Logout"
3. Anda kembali ke halaman login

#### B. Login sebagai ELEKT-001
1. Masukkan Kode UMKM: `ELEKT-001`
2. Klik "Login Dashboard"

#### C. Verifikasi Console Log
```
🔐 Current UMKM ID set: 2
🔄 Loading data for UMKM: ELEKT-001
🔐 Filtered 3/12 categories for UMKM 2
🔐 Filtered 6/25 products for UMKM 2
🔐 Filtered 2/15 customers for UMKM 2
🔐 Filtered 5/45 transactions for UMKM 2
🔐 Filtered 4/20 expenses for UMKM 2
```

**✅ PASS jika:**
- UMKM ID berubah menjadi "2"
- Angka filtered berbeda dari Test Case 1
- Dashboard menampilkan data elektronik

#### D. Cek Halaman Produk
1. Klik menu "Produk"
2. Verifikasi: Hanya produk kategori **Elektronik** yang muncul
3. Contoh: Laptop, Mouse, Keyboard, Monitor
4. **TIDAK BOLEH** ada produk kopi/minuman dari BISTARA-001

#### E. Cross-Check Data Leakage
Pastikan **TIDAK ADA** data dari BISTARA-001 yang muncul:
- ❌ Tidak ada kategori "Makanan & Minuman"
- ❌ Tidak ada produk "Kopi Arabica"
- ❌ Tidak ada transaksi dengan kode "BISTARA-xxx"

**✅ PASS jika:** Semua data adalah data ELEKT-001 saja
**❌ FAIL jika:** Ada data BISTARA-001 yang bocor

---

## 🎯 Test Case 3: Buat Data Baru dan Verifikasi Ownership

### Langkah Testing:

#### A. Login sebagai BISTARA-001
1. Login dengan kode: `BISTARA-001`

#### B. Tambah Kategori Baru
1. Klik menu "Kategori"
2. Klik "+ Tambah Kategori"
3. Nama: "Desserts"
4. Deskripsi: "Kue dan makanan manis"
5. Klik "Simpan Perubahan"

#### C. Verifikasi di Network Tab
1. Buka Developer Tools → Tab "Network"
2. Cari request "POST /api/categories" atau "createCategory"
3. Klik request tersebut → Tab "Payload" atau "Request"
4. **Verifikasi:** Harus ada `umkmPresetId: 1` atau `umkm_preset_id: 1`

**✅ PASS jika:** Request body mengandung UMKM ID
**❌ FAIL jika:** Tidak ada field umkmPresetId di request

#### D. Switch ke ELEKT-001
1. Logout dari BISTARA-001
2. Login dengan kode: `ELEKT-001`

#### E. Cek Kategori
1. Klik menu "Kategori"
2. **Verifikasi:** Kategori "Desserts" **TIDAK MUNCUL**

**✅ PASS jika:** "Desserts" tidak ada di list ELEKT-001
**❌ FAIL jika:** "Desserts" muncul di ELEKT-001

---

## 🎯 Test Case 4: Tambah Produk dan Verifikasi

### Langkah Testing:

#### A. Login sebagai BISTARA-001
1. Login dengan kode: `BISTARA-001`

#### B. Tambah Produk Baru
1. Klik menu "Produk"
2. Klik "+ Tambah Produk"
3. Isi form:
   - Nama: "Latte Special"
   - Kategori: Pilih kategori makanan/minuman
   - Harga: 35000
   - Stok: 50
4. Klik "Simpan Perubahan"

#### C. Verifikasi Console
Lihat console log setelah save:
```
New product created: {
  id: 123,
  umkmPresetId: "1",  // ✅ Harus ada!
  name: "Latte Special",
  ...
}
```

#### D. Reload dan Cek
1. Refresh halaman (F5)
2. Klik menu "Produk"
3. **Verifikasi:** "Latte Special" muncul di list

#### E. Switch ke ELEKT-001
1. Logout dari BISTARA-001
2. Login sebagai ELEKT-001
3. Klik menu "Produk"

**✅ PASS jika:** "Latte Special" **TIDAK MUNCUL** di ELEKT-001
**❌ FAIL jika:** "Latte Special" muncul di ELEKT-001

---

## 🎯 Test Case 5: Transaksi POS/Kasir

### Langkah Testing:

#### A. Login sebagai Kasir BISTARA-001
1. Di halaman login, pilih "Masuk sebagai Kasir"
2. Masukkan kode: `BISTARA-001`
3. Anda masuk ke mode POS

#### B. Buat Transaksi
1. Scan/pilih produk kopi (misal: "Kopi Arabica")
2. Tambah ke keranjang
3. Klik "Bayar"
4. Pilih metode bayar: "Cash"
5. Konfirmasi pembayaran

#### C. Verifikasi di Network
Cek request "POST /api/transactions" atau "createTransaction":
```json
{
  "umkm_preset_id": 1,  // ✅ Harus ada!
  "transaction_code": "POSxxxx",
  "total_amount": 25000,
  ...
}
```

#### D. Logout dan Login sebagai Admin ELEKT-001
1. Keluar dari mode kasir
2. Login admin dengan kode: `ELEKT-001`
3. Klik menu "Transaksi"

**✅ PASS jika:** Transaksi POS BISTARA **TIDAK MUNCUL**
**❌ FAIL jika:** Transaksi BISTARA muncul di ELEKT-001

---

## 🎯 Test Case 6: Pengeluaran (Expenses)

### Langkah Testing:

#### A. Login sebagai BISTARA-001
1. Login dengan kode: `BISTARA-001`

#### B. Tambah Pengeluaran
1. Klik menu "Pengeluaran"
2. Klik "+ Catat Pengeluaran"
3. Isi form:
   - Kategori: "Pembelian Stok"
   - Nama Bahan: "Kopi Beans Premium"
   - Quantity: 10
   - Satuan: kg
   - Harga/Satuan: 50000
4. Klik "Simpan Perubahan"

#### C. Verifikasi Request
Cek Network → POST /api/expenses:
```json
{
  "umkm_preset_id": 1,  // ✅ Harus ada!
  "expense_category": "Pembelian Stok",
  "material_name": "Kopi Beans Premium",
  ...
}
```

#### D. Switch ke ELEKT-001
1. Logout, login sebagai ELEKT-001
2. Klik menu "Pengeluaran"

**✅ PASS jika:** Pengeluaran "Kopi Beans" **TIDAK MUNCUL**
**❌ FAIL jika:** Pengeluaran BISTARA muncul di ELEKT-001

---

## 🎯 Test Case 7: Laporan Keuangan

### Langkah Testing:

#### A. Login sebagai BISTARA-001
1. Klik menu "Laporan Keuangan"
2. Catat angka:
   - Total Pendapatan: X
   - Total Pengeluaran: Y
   - Laba Bersih: Z
   - Jumlah Transaksi: N

#### B. Switch ke ELEKT-001
1. Logout, login sebagai ELEKT-001
2. Klik menu "Laporan Keuangan"
3. Catat angka:
   - Total Pendapatan: A
   - Total Pengeluaran: B
   - Laba Bersih: C
   - Jumlah Transaksi: M

**✅ PASS jika:** 
- Semua angka berbeda (X ≠ A, Y ≠ B, Z ≠ C, N ≠ M)
- Laporan hanya menampilkan data UMKM masing-masing

**❌ FAIL jika:** 
- Angka sama atau agregat dari 2 UMKM

---

## 🎯 Test Case 8: Database Direct Check

### Langkah Testing (Manual DB Check):

#### A. Buka phpMyAdmin atau MySQL Client
1. Akses: `http://localhost/phpmyadmin`
2. Login dengan credentials di `.env`
3. Pilih database: `umkm_sumedang`

#### B. Check Categories Table
```sql
SELECT id, name, umkm_preset_id FROM categories;
```

**Verifikasi:**
- Setiap kategori punya `umkm_preset_id`
- Tidak ada row dengan `umkm_preset_id` NULL

#### C. Check Products Table
```sql
SELECT id, name, umkm_preset_id FROM products;
```

**Verifikasi:**
- Setiap produk punya `umkm_preset_id`
- Produk BISTARA punya `umkm_preset_id = 1`
- Produk ELEKT punya `umkm_preset_id = 2`

#### D. Check Transactions Table
```sql
SELECT id, transaction_code, umkm_preset_id FROM transactions;
```

**Verifikasi:**
- Setiap transaksi punya `umkm_preset_id`
- Tidak ada transaksi orphan

**✅ PASS jika:** Semua data punya owner UMKM yang jelas
**❌ FAIL jika:** Ada data dengan umkm_preset_id NULL

---

## 📊 Checklist Hasil Testing

Gunakan checklist ini untuk tracking testing:

### Frontend Filtering:
- [ ] Console log menampilkan "🔐 Current UMKM ID set"
- [ ] Console log menampilkan filtered counts (X/Y format)
- [ ] Login BISTARA → hanya data BISTARA yang muncul
- [ ] Login ELEKT → hanya data ELEKT yang muncul
- [ ] Switch UMKM → data berubah sesuai UMKM

### Data Creation:
- [ ] Kategori baru punya umkmPresetId di request
- [ ] Produk baru punya umkmPresetId di request
- [ ] Transaksi baru punya umkmPresetId di request
- [ ] Pengeluaran baru punya umkmPresetId di request

### Data Isolation:
- [ ] Data baru BISTARA tidak muncul di ELEKT
- [ ] Data baru ELEKT tidak muncul di BISTARA
- [ ] Laporan keuangan terpisah per UMKM
- [ ] Tidak ada data leakage antar UMKM

### Database:
- [ ] Semua table punya kolom umkm_preset_id
- [ ] Tidak ada row dengan umkm_preset_id NULL
- [ ] Data terlink dengan benar ke UMKM owner

---

## ❌ Troubleshooting

### Problem: Console tidak ada log filtering
**Solution:**
- Pastikan sudah login (bukan di halaman welcome)
- Refresh halaman setelah login
- Cek `storage.ts` - pastikan console.log ada

### Problem: Semua data muncul tanpa filter
**Solution:**
- Cek `App.tsx` - pastikan `setCurrentUmkmId()` dipanggil
- Cek console - pastikan ada "Current UMKM ID set: X"
- Cek `storage.ts` - pastikan filter logic aktif

### Problem: Data baru tidak ada umkmPresetId
**Solution:**
- Cek komponen yang buat data (AdminCategories, AdminProducts, dll)
- Pastikan ada: `umkmPresetId: currentPreset.id`
- Cek Network tab untuk verify request payload

### Problem: TypeScript error
**Solution:**
- Pastikan `types.ts` punya `umkmPresetId?: number | string`
- Run: `npm run build` untuk cek compile errors

---

## ✅ Kesimpulan Testing

Jika semua test case di atas **PASS**, maka sistem isolasi data multi-tenant **BERHASIL** dan:

✅ Setiap UMKM hanya melihat data mereka sendiri  
✅ Data baru otomatis ter-link ke UMKM owner  
✅ Tidak ada data leakage antar UMKM  
✅ Sistem aman untuk production  

**PRIVASI DATA TERJAMIN!** 🔒

---

**Dibuat:** 10 Agustus 2026  
**Status:** Ready for Testing ✅
