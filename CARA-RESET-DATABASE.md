# 🗑️ Cara Reset Database SIUPIN

## ⚠️ PENTING!
Reset database akan menghapus **SEMUA DATA** termasuk:
- ✓ UMKM yang terdaftar (registrasi admin)
- ✓ Transaksi & Invoice
- ✓ Kategori & Produk  
- ✓ Pelanggan
- ✓ Pengeluaran & Pendapatan
- ✓ Pengaturan UMKM
- ✓ Session login

Data yang dihapus **TIDAK DAPAT** dikembalikan!

---

## 🚨 MASALAH: "Email sudah terdaftar" padahal database kosong?

Jika Anda mendapat error **"Email sudah terdaftar untuk UMKM..."** meskipun yakin database sudah kosong:

**PENYEBAB:**
- Data masih tersimpan di localStorage browser (key `umkm_presets` atau `user_umkm_presets`)
- Cache browser belum dibersihkan
- Browser masih menyimpan data lama

**SOLUSI TERBAIK:** 
✅ Gunakan **CARA 3: FORCE CLEAR** (script paling powerful) - Lihat di bawah!

---

## 🎯 4 Cara Reset Database

### **CARA 1: Menggunakan File HTML (PALING MUDAH)** ⭐

1. **Buka file** `RESET-DATABASE.html` dengan double-click
2. **Klik tombol** "🔥 Hapus Semua Data"
3. **Konfirmasi** dengan klik OK
4. **Tunggu** sampai muncul pesan sukses
5. **Otomatis redirect** ke aplikasi dengan database bersih

✅ **Keuntungan:** Interface visual yang mudah, tidak perlu buka console

---

### **CARA 2: Menggunakan Browser Console (CEPAT)** ⚡

1. **Buka aplikasi** di http://localhost:3000
2. **Tekan F12** untuk buka Developer Tools
3. **Pergi ke tab "Console"**
4. **Copy-paste script berikut:**

```javascript
// QUICK RESET - Paste di Console
localStorage.clear();
alert('✓ Database berhasil di-reset!');
location.reload();
```

5. **Tekan Enter**
6. **Halaman otomatis refresh**

✅ **Keuntungan:** Paling cepat, hanya 1 line command

---

### **CARA 3: FORCE CLEAR (PALING KUAT)** 🔴 **← GUNAKAN INI JIKA ADA ERROR EMAIL**

**File:** `FORCE-CLEAR-ALL.js`

**Gunakan ini jika:**
- ❌ Reset normal tidak berhasil
- ❌ Masih ada error "Email sudah terdaftar"
- ❌ Data seperti tidak terhapus sempurna
- ❌ UMKM lama masih muncul

**Langkah:**
1. **Buka aplikasi** di http://localhost:3000
2. **Tekan F12** → Pergi ke tab "Console"
3. **Buka file** `FORCE-CLEAR-ALL.js` dengan text editor
4. **Copy SEMUA isi** file tersebut (dari awal sampai akhir)
5. **Paste ke Console**
6. **Tekan Enter**
7. **Klik OK** untuk konfirmasi
8. **⚠️ PENTING:** Setelah selesai, lakukan **HARD REFRESH:**
   - **Windows:** Tekan `Ctrl + Shift + R`
   - **Mac:** Tekan `Cmd + Shift + R`
9. **Atau:** Tutup **SEMUA tab** browser yang buka aplikasi, lalu restart browser

✅ **Keuntungan:**
- **Paling powerful dan thorough**
- Multiple passes untuk memastikan data benar-benar terhapus
- Verifikasi lengkap setelah reset (menampilkan detail di console)
- Cocok untuk fix masalah stuck data
- Menghapus KEDUA key: `umkm_presets` DAN `user_umkm_presets`

---

### **CARA 4: Menggunakan Script SUPER-RESET (DETAIL LOG)** 📋

**File:** `SUPER-RESET.js`

1. **Buka aplikasi** di http://localhost:3000
2. **Tekan F12** → Pergi ke tab "Console"
3. **Buka file** `SUPER-RESET.js` dengan text editor
4. **Copy SEMUA isi** file tersebut
5. **Paste ke Console**
6. **Tekan Enter**
7. **Ikuti instruksi** yang muncul

✅ **Keuntungan:** Menampilkan log detail data yang dihapus dengan kategorisasi

---

## 🔧 Troubleshooting

### Problem: Data masih muncul setelah reset

**Solusi:**
1. Gunakan **CARA 3: FORCE CLEAR** (script paling kuat)
2. Setelah run script, **WAJIB** hard refresh:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. Atau tutup **SEMUA tab** browser
4. Restart browser
5. Buka **Private/Incognito window**
6. Akses http://localhost:3000/welcome

---

### Problem: Error "Email sudah terdaftar" setelah reset

**Penyebab:**
- Ada 2 localStorage keys yang menyimpan UMKM: `umkm_presets` dan `user_umkm_presets`
- Reset biasa kadang hanya clear satu key

**Solusi:**
1. **WAJIB gunakan CARA 3: FORCE CLEAR** (bukan cara lain!)
2. Setelah selesai, buka DevTools (F12)
3. Pergi ke tab **Application** (Chrome) atau **Storage** (Firefox)
4. Klik **Local Storage** → `http://localhost:3000`
5. **VERIFIKASI** bahwa keys ini benar-benar KOSONG:
   - ❌ `umkm_presets` → harus TIDAK ADA
   - ❌ `user_umkm_presets` → harus TIDAK ADA
   - ❌ `is_super_admin_logged_in` → harus TIDAK ADA
6. Jika masih ada, **klik kanan → Delete** secara manual
7. **Hard refresh:** `Ctrl + Shift + R`
8. Coba daftar lagi

---

### Problem: Error saat reset

**Solusi:**
1. Clear cache browser (**Ctrl + Shift + Delete**)
2. Pilih "Cached images and files"
3. Klik "Clear data"
4. Restart browser
5. Gunakan **CARA 3: FORCE CLEAR**

---

## ✅ Verifikasi Reset Berhasil

### Cek di Browser:
1. **Buka DevTools** (F12)
2. **Tab Application** → Local Storage
3. **Pastikan KOSONG** atau tidak ada key:
   - `umkm_presets`
   - `user_umkm_presets`
   - `is_super_admin_logged_in`
   - Key yang dimulai dengan `umkm_*`

### Cek di Aplikasi:
1. **Halaman Welcome** muncul tanpa UMKM terdaftar
2. **Tidak ada** transaksi
3. **Tidak ada** produk
4. **Tidak ada** kategori
5. Bisa daftar UMKM baru **tanpa error email**

---

## 🚀 Setelah Reset - Testing Ulang

### Langkah Testing yang Benar:

#### 1️⃣ **Daftar UMKM Baru**
- Buka http://localhost:3000/welcome
- Klik tab "🚀 Daftar Baru"
- Isi data UMKM dengan **email yang BARU** (belum pernah dipakai)
- Simpan Kode UMKM yang diberikan

#### 2️⃣ **Buat Kategori**
Contoh untuk testing:
- ✓ **Makanan & Snack** (ada keyword "makanan" → akan ada pengiriman)
- ✓ **Minuman Segar** (ada keyword "minuman" → akan ada pengiriman)
- ✓ **Tiket Wisata Kebun** (ada keyword "tiket" + "wisata" → tanpa pengiriman + input booking)
- ✓ **Penginapan Hotel** (ada keyword "penginapan" → tanpa pengiriman + input booking)
- ✓ **Elektronik Gadget** (tidak ada keyword apapun → tanpa pengiriman, tanpa booking)

#### 3️⃣ **Tambah Produk**
Untuk setiap kategori, tambahkan produk dengan:
- ✅ **Nama produk yang jelas dan benar**
- ✅ Pilih kategori yang sesuai
- ✅ Harga
- ✅ Stok
- ✅ Deskripsi

#### 4️⃣ **Testing Checkout sebagai Customer**
Test setiap jenis kategori:

**A. Kategori "Makanan & Snack":**
- ✓ Form alamat **WAJIB** muncul
- ✓ Status pengiriman muncul setelah checkout
- ✓ Tidak ada field tanggal booking
- ✓ Invoice menampilkan info pengiriman (box hijau)
- ✓ Nama produk di invoice: **"[Nama produk yang benar]"**

**B. Kategori "Tiket Wisata":**
- ✓ Field **tanggal booking WAJIB** muncul
- ✓ Tidak ada form alamat wajib (opsional)
- ✓ Tidak ada status pengiriman
- ✓ Tombol **"Cetak Invoice"** muncul di success modal
- ✓ Invoice menampilkan tanggal booking dengan **highlight merah**
- ✓ Invoice menampilkan **box kuning** "Invoice Digital"
- ✓ Nama produk di invoice: **"Tiket masuk kebun strawberry"** (BUKAN nama produk lain!)

**C. Kategori "Elektronik":**
- ✓ Tidak ada field tanggal booking
- ✓ Alamat opsional (tidak wajib)
- ✓ Tidak ada pengiriman
- ✓ Tombol "Cetak Invoice" muncul
- ✓ Invoice digital (box kuning)

---

## 🐛 Jika Masih Ada Masalah

### Cek di Console (F12):
1. Lihat console log saat checkout
2. Cari pesan: `=== CHECKOUT DEBUG ===`
3. Pastikan:
   - `Cart items` berisi produk yang benar
   - `Items snapshot` sama dengan cart items
   - `Product name` di snapshot benar
   - `Category name` di snapshot benar
   - `Needs shipping` = true jika makanan/minuman, false jika lainnya
   - `Booking date` terisi jika kategori tiket/wisata

### Jika Nama Produk Masih Salah:
Kemungkinan besar ini karena **data lama masih tersimpan** di localStorage. Solusi:

1. **Stop server** (Ctrl+C di terminal)
2. Run **FORCE-CLEAR-ALL.js** lagi
3. **Hard refresh browser** (`Ctrl + Shift + R`)
4. **Restart server** (`npm run dev`)
5. Buka **Incognito/Private window**
6. Daftar UMKM baru dengan data fresh

---

## 📞 Support

Jika masalah tetap terjadi setelah **FORCE CLEAR**, berikan informasi:
1. Screenshot hasil run **FORCE-CLEAR-ALL.js** di console
2. Screenshot tab **Application → Local Storage** (untuk verifikasi benar-benar kosong)
3. Screenshot error yang muncul
4. Data produk & kategori yang ditest

---

**Happy Testing! 🎉**
