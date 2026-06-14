# 🎯 CARA MUDAH RESET DATABASE - TANPA CONSOLE!

## ✅ SUPER GAMPANG - Cukup 3 Langkah!

Tidak perlu pakai console, tidak perlu copy-paste script. **Cukup klik file HTML!**

---

## 📋 LANGKAH 1: Buka File HTML

1. Buka folder project Anda: `C:\SIUPIN-SISTEMUMKMPINTAR`
2. Cari file: **`RESET-SATU-KLIK.html`**
3. **Double-click** file tersebut

File akan terbuka di browser Anda.

---

## 📋 LANGKAH 2: Klik Tombol Reset

Di halaman yang terbuka:

1. Baca peringatan yang muncul
2. Klik tombol besar **"🔥 RESET SEKARANG"**
3. Akan muncul konfirmasi popup:
   ```
   ⚠️ PERINGATAN TERAKHIR!
   
   Semua data akan dihapus PERMANEN!
   
   Lanjutkan?
   ```
4. Klik **"OK"**

---

## 📋 LANGKAH 3: Tunggu Proses Selesai

Anda akan melihat progress:

```
⏳ Memulai proses reset...
✓ Ditemukan X item untuk dihapus
✓ Pass 1: localStorage.clear() berhasil!
✓ Pass 2: Critical keys removed!
✓ Pass 3: umkm_* keys removed!
✓ Pass 4: Final cleanup complete!
✓ VERIFIKASI: Database 100% KOSONG!
```

Setelah selesai:
- Muncul pesan **"🎉 RESET BERHASIL!"**
- Countdown 3... 2... 1...
- **Otomatis redirect** ke halaman welcome

---

## 🎉 SELESAI!

Setelah redirect ke welcome:

1. ✅ Database sudah **benar-benar kosong**
2. ✅ Tidak ada data corrupt lagi
3. ✅ Siap untuk daftar UMKM baru

---

## 🚀 SETELAH RESET - Daftar UMKM Baru

### Step 1: Daftar UMKM Fresh

Di halaman welcome, klik tab **"🚀 Daftar Baru"**

Isi form dengan data BARU:

```
Nama Owner: [Nama Anda]
Nama UMKM: Dinar Toko Kue Dan Kebun Stoberry
Email: dinar.fresh@gmail.com  ← EMAIL BARU!
Sektor: Kafe & Kuliner
Warna: [Pilih warna favorit]
No HP: 0812-xxxx-xxxx
Alamat: [Alamat lengkap]
Password: [Password baru]
```

**PENTING:** Jangan pakai email yang sama dengan sebelumnya!

Klik **"Daftarkan & Dapatkan KODE UMKM 🚀"**

---

### Step 2: Buat Kategori yang BENAR

Setelah berhasil daftar, buat kategori dengan **nama yang tepat**:

#### ✅ CONTOH KATEGORI YANG BENAR:

**Untuk Produk dengan Pengiriman:**
- ✅ **"Makanan & Snack"** ← Ada kata "makanan"
- ✅ **"Minuman Segar"** ← Ada kata "minuman"
- ✅ **"Makanan Ringan"** ← Ada kata "makanan"

**Untuk Produk Tiket/Wisata (Tanpa Pengiriman):**
- ✅ **"Tiket Wisata Kebun"** ← Ada kata "tiket" + "wisata"
- ✅ **"Wisata & Rekreasi"** ← Ada kata "wisata"
- ✅ **"Tiket Event"** ← Ada kata "tiket"

**Untuk Produk Penginapan (Tanpa Pengiriman):**
- ✅ **"Penginapan & Hotel"** ← Ada kata "penginapan" + "hotel"
- ✅ **"Hotel Bintang 5"** ← Ada kata "hotel"

**Untuk Produk Lainnya (Tanpa Pengiriman):**
- ✅ **"Elektronik & Gadget"**
- ✅ **"Fashion & Pakaian"**
- ✅ **"Kesehatan & Suplemen"**

#### ❌ CONTOH KATEGORI YANG SALAH:

- ❌ **"Tiket masuk kebun stoberry"** 
  → Kata "tiket" ada tapi **terlalu spesifik** dan bukan nama kategori umum
  → Seharusnya: "Tiket Wisata" atau "Wisata Kebun"

- ❌ **"Stroberry Farm Tickets"**
  → Bahasa Inggris, keyword "ticket" tidak ter-detect (harus "tiket")

- ❌ **"Produk Digital"**
  → Tidak ada keyword khusus

---

### Step 3: Tambah Produk

Setelah kategori dibuat, tambah produk:

#### Contoh Produk Tiket:

```
Nama Produk: Tiket Masuk Kebun Strawberry
Kategori: Tiket Wisata Kebun  ← PILIH KATEGORI INI
Harga: 20000
Stok: 100
Deskripsi: Tiket masuk untuk 1 orang ke kebun strawberry
[SKIP Foto Produk dulu - test tanpa image]
✓ Aktifkan Produk
```

Klik **"Simpan Produk"**

---

### Step 4: Test Checkout Sebagai Customer

1. **Logout dari admin**
2. **Switch role** ke Customer
3. **Tambah produk tiket ke cart**
4. **Klik "Lanjut ke Checkout"**

---

## 🔍 VERIFIKASI - Apa yang Harus Muncul?

### ✅ Jika Kategori BENAR ("Tiket Wisata Kebun"):

**Form Checkout:**
- ✅ Field **"Nama Customer"** (wajib)
- ✅ Field **"Ponsel No."** (wajib)
- ✅ Field **"Email Aktif"** (wajib)
- ✅ Field **"Alamat Penerimaan Kiriman"** → **OPSIONAL** (tidak wajib)
- ✅ Warning: **"⚠️ Produk yang Anda beli tidak memerlukan pengiriman fisik"**
- ✅ Box kuning: **"🎫 Tanggal Booking Diperlukan"**
- ✅ Field **"Pilih Tanggal Booking/Kunjungan"** (wajib)
- ✅ Payment method selection
- ✅ Catatan tambahan (opsional)

**Setelah Checkout:**
- ✅ Modal success: Info **"Tidak memerlukan pengiriman fisik"**
- ✅ Tombol **"🖨️ Cetak Invoice Pembelian (PDF)"** muncul
- ✅ Klik tombol → PDF terdownload

**Di Invoice PDF:**
- ✅ Nama produk: **"Tiket Masuk Kebun Strawberry"** ← BENAR!
- ✅ Kategori: **"Tiket Wisata Kebun"**
- ✅ Tanggal booking: **Merah** (highlight)
- ✅ Box kuning: **"✓ INVOICE DIGITAL"**
- ✅ Text: **"Tidak ada pengiriman fisik"**

**Di Admin:**
- ✅ Transaksi tercatat dengan produk yang BENAR
- ✅ Stok produk berkurang
- ✅ Customer info tersimpan

---

### ❌ Jika Masih Salah:

**Jika masih muncul:**
- Form pengiriman wajib
- Nama produk salah
- Tidak ada field booking date

**Berarti:**
1. Nama kategori masih salah (tidak ada keyword)
2. Atau masih ada data lama yang belum ke-clear

**Solusi:**
1. Jalankan **RESET-SATU-KLIK.html** lagi
2. Tutup **SEMUA tab** browser
3. Restart browser
4. Buka aplikasi lagi
5. Daftar UMKM dengan **email yang berbeda**
6. Buat kategori dengan **nama yang TEPAT** (lihat contoh di atas)

---

## 💡 TIPS PENTING:

### 1. **Nama Kategori Harus Mengandung Keyword**

Keywords yang di-detect sistem:
- **"makanan"** → Ada pengiriman
- **"minuman"** → Ada pengiriman
- **"tiket"** → Tanpa pengiriman + booking date
- **"wisata"** → Tanpa pengiriman + booking date
- **"penginapan"** → Tanpa pengiriman + booking date
- **"hotel"** → Tanpa pengiriman + booking date

Contoh BENAR:
- ✅ "Tiket Wisata" → Ada "tiket" DAN "wisata"
- ✅ "Wisata Alam" → Ada "wisata"
- ✅ "Penginapan Hotel" → Ada "penginapan" DAN "hotel"

Contoh SALAH:
- ❌ "Kebun Strawberry" → Tidak ada keyword
- ❌ "Ticket Event" → Bahasa Inggris, tidak ter-detect

---

### 2. **Gunakan Email Baru Setiap Reset**

Jangan gunakan email yang sama dengan sebelumnya:

SALAH:
```
Reset → Daftar dengan "Dini@gmail.com" lagi
```

BENAR:
```
Reset → Daftar dengan "dini.fresh2026@gmail.com"
```

---

### 3. **Test Tanpa Image Dulu**

Untuk test awal, **SKIP upload image** dulu:
- Lebih cepat
- Tidak ada masalah storage penuh
- Fokus test logic checkout

Setelah logic bekerja, baru tambahkan image kecil (<200KB).

---

## 📞 JIKA MASIH BERMASALAH

Jika setelah ikuti semua langkah masih bermasalah, kirim screenshot:

1. **Halaman form checkout** (tunjukkan field apa saja yang muncul)
2. **Nama kategori yang digunakan** (screenshot dari admin kategori)
3. **Invoice yang salah** (screenshot modal invoice atau admin transaction)

---

## ✅ CHECKLIST FINAL

Gunakan checklist ini untuk memastikan semua benar:

### Setelah Reset:
- [ ] Jalankan **RESET-SATU-KLIK.html**
- [ ] Tunggu sampai muncul "RESET BERHASIL!"
- [ ] Otomatis redirect ke `/welcome`
- [ ] Halaman welcome muncul (kosong, tidak ada UMKM)

### Daftar UMKM Baru:
- [ ] Daftar dengan **email BARU**
- [ ] Dapat Kode UMKM
- [ ] Berhasil login

### Buat Kategori:
- [ ] Kategori makanan: Ada kata **"makanan"** atau **"minuman"**
- [ ] Kategori tiket: Ada kata **"tiket"** atau **"wisata"**
- [ ] Kategori penginapan: Ada kata **"penginapan"** atau **"hotel"**

### Tambah Produk:
- [ ] Pilih kategori yang BENAR
- [ ] Skip image dulu (untuk test)
- [ ] Produk berhasil tersimpan

### Test Checkout:
- [ ] Beli produk tiket/wisata
- [ ] Form checkout:
  - [ ] Alamat **OPSIONAL** (tidak wajib)
  - [ ] Field booking date **MUNCUL**
  - [ ] Warning "Tidak perlu pengiriman" **MUNCUL**
- [ ] Setelah bayar:
  - [ ] Tombol "Cetak Invoice" **MUNCUL**
  - [ ] PDF terdownload dengan data **BENAR**
- [ ] Di admin:
  - [ ] Nama produk **BENAR**
  - [ ] Stok **BERKURANG**

---

**Selamat mencoba!** 🚀

Jika ada pertanyaan, tunjukkan screenshot-nya ya!
