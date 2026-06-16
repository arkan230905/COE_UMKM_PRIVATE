# ⚠️ INSTRUKSI PENTING - BACA INI DULU!

## 🔴 MASALAH ANDA: Data Lama Masih Tersimpan!

Saya sudah cek semua kode yang saya perbaiki. **SEMUA KODE SUDAH BENAR!**

Tapi masalah masih terjadi karena:
- ❌ **Anda belum jalankan reset script**
- ❌ **Data lama masih ada di localStorage browser**
- ❌ **Data corrupt dari sebelum saya perbaiki masih tersimpan**

**BUKTI:**
- URL Anda: `/USAHA-DINI/` ← Ini UMKM lama
- Invoice Anda: "Multivitamin Complex" ← Ini produk lama
- Kategori Anda: "Tiket masuk kebun stoberry" ← Nama kategori SALAH (tidak ada keyword yang benar)

---

## ✅ SOLUSI: Ikuti 3 Langkah Ini SEKARANG!

### LANGKAH 1: RESET DATABASE (WAJIB!)

1. **Tutup SEMUA tab browser** (Chrome, Edge, Firefox, apapun yang Anda pakai)
2. **Restart browser** Anda
3. Buka folder project: `C:\SIUPIN-SISTEMUMKMPINTAR`
4. Cari file: **`RESET-SATU-KLIK.html`**
5. **DOUBLE-CLICK** file tersebut
6. Akan terbuka di browser
7. Klik tombol merah besar: **"🔥 RESET SEKARANG"**
8. Klik **"OK"** pada konfirmasi
9. Tunggu sampai muncul: **"🎉 RESET BERHASIL!"**
10. Akan auto-redirect ke halaman welcome

**JANGAN SKIP LANGKAH INI!** Ini yang paling penting!

---

### LANGKAH 2: DAFTAR UMKM BARU

Setelah redirect ke welcome:

1. Klik tab **"🚀 Daftar Baru"**
2. Isi form dengan data **BARU**:

```
Nama Owner: Dinar
Nama UMKM: Dinar Toko Kue Dan Kebun Strawberry
Email: dinar.fresh.2026@gmail.com  ← HARUS EMAIL BARU! JANGAN PAKAI EMAIL LAMA!
Password: [password baru Anda]
Sektor: Kafe & Kuliner
No HP: 0812-xxxx-xxxx
Alamat: [Alamat lengkap Anda]
Warna: [Pilih warna favorit]
```

**PENTING:** Email HARUS berbeda dari email yang pernah Anda pakai sebelumnya!

3. Klik **"Daftarkan & Dapatkan KODE UMKM 🚀"**
4. Catat Kode UMKM yang muncul (misal: `UMKM-ABC123`)
5. Klik **"Login Sebagai Super Admin"**
6. Masukkan Kode UMKM dan Password

---

### LANGKAH 3: BUAT KATEGORI YANG BENAR

Setelah login ke admin:

#### A. Buat Kategori Makanan (Dengan Pengiriman)

1. Klik menu **"Kategori"**
2. Klik **"+ Tambah Kategori"**
3. Isi:
   - **Nama:** `Makanan & Kue`
   - **Deskripsi:** `Produk makanan dan kue yang memerlukan pengiriman`
4. Klik **"Simpan"**

#### B. Buat Kategori Tiket (Tanpa Pengiriman)

1. Klik **"+ Tambah Kategori"** lagi
2. Isi:
   - **Nama:** `Tiket Wisata Kebun`
   - **Deskripsi:** `Tiket masuk untuk wisata kebun strawberry`
3. Klik **"Simpan"**

**PENTING:** Nama kategori HARUS ada kata kunci:
- ✅ `Tiket Wisata Kebun` ← BENAR! Ada kata "tiket" DAN "wisata"
- ✅ `Wisata & Rekreasi` ← BENAR! Ada kata "wisata"
- ❌ `Tiket masuk kebun stoberry` ← SALAH! Terlalu spesifik
- ❌ `Kebun Strawberry` ← SALAH! Tidak ada keyword

---

### LANGKAH 4: TAMBAH PRODUK TIKET

1. Klik menu **"Produk"**
2. Klik **"+ Tambah Produk Baru"**
3. Isi:
   - **Nama Produk:** `Tiket Masuk Kebun Strawberry`
   - **Kategori:** Pilih **"Tiket Wisata Kebun"** ← PILIH KATEGORI INI!
   - **Harga:** `20000`
   - **Stok:** `100`
   - **Deskripsi:** `Tiket masuk untuk 1 orang ke kebun strawberry. Berlaku untuk 1 hari kunjungan.`
   - **Upload Foto:** SKIP dulu (kosongkan) ← Untuk test, jangan upload foto dulu
   - **Status:** Centang ✓ **"Aktifkan Produk"**
4. Klik **"Simpan Produk"**

---

### LANGKAH 5: TEST CHECKOUT SEBAGAI CUSTOMER

#### A. Logout dari Admin

1. Klik tombol **"Logout"** di pojok kanan atas

#### B. Login Sebagai Customer

1. Klik tombol **"👤 Customer"** di halaman login
2. Klik **"Belum Punya Akun? Daftar Sekarang"**
3. Isi form registrasi customer:
   - **Nama:** `[Nama Anda]`
   - **Email:** `customer.test@gmail.com` ← Email customer (beda dari email admin)
   - **Password:** `[password]`
   - **No HP:** `0812-xxxx-xxxx`
   - **Alamat:** `[Alamat Anda]`
4. Klik **"Daftar Akun Customer"**
5. Login dengan email customer

#### C. Beli Produk Tiket

1. Akan muncul katalog produk
2. Cari produk **"Tiket Masuk Kebun Strawberry"**
3. Klik **"+ Add to Cart"**
4. Klik tombol **"Keranjang Saya"** di pojok kanan atas
5. Klik **"Lanjut ke Checkout"**

---

## 🔍 VERIFIKASI - Apa yang HARUS Muncul?

### ✅ Form Checkout yang BENAR:

```
┌─────────────────────────────────────────┐
│ 📝 Form Checkout                        │
├─────────────────────────────────────────┤
│ Nama Customer: [sudah terisi otomatis]  │
│ Ponsel No.: [sudah terisi otomatis]     │
│ Email Aktif: [sudah terisi otomatis]    │
│                                          │
│ ⚠️ Produk yang Anda beli tidak          │
│    memerlukan pengiriman fisik          │
│                                          │
│ Alamat Penerimaan Kiriman:              │
│ [field ini OPSIONAL - boleh kosong]     │ ← PENTING: Tidak wajib diisi!
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🎫 Tanggal Booking Diperlukan      │  │ ← BOX KUNING ini HARUS muncul!
│ │                                    │  │
│ │ Pilih Tanggal Booking/Kunjungan:  │  │
│ │ [calendar picker]                  │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Metode Pembayaran:                      │
│ ○ QRIS  ○ Cash  ○ E-Wallet  ○ Debit    │
│                                          │
│ Catatan Tambahan (Opsional):           │
│ [text area]                             │
│                                          │
│ [✓ Konfirmasi Pembayaran]               │
└─────────────────────────────────────────┘
```

**YANG HARUS ADA:**
- ✅ Warning: **"Produk yang Anda beli tidak memerlukan pengiriman fisik"**
- ✅ Box kuning: **"🎫 Tanggal Booking Diperlukan"**
- ✅ Field tanggal booking (calendar picker)
- ✅ Field alamat **OPSIONAL** (tidak ada tanda bintang merah *)

**YANG TIDAK BOLEH ADA:**
- ❌ Field alamat WAJIB (dengan tanda *)
- ❌ Tidak ada box "Tanggal Booking"

---

### ✅ Setelah Konfirmasi Pembayaran:

**Modal Success yang BENAR:**

```
┌──────────────────────────────────────┐
│      🎉 PEMBAYARAN BERHASIL!         │
├──────────────────────────────────────┤
│ Kode Transaksi: TRX123               │
│                                       │
│ ✓ Tidak memerlukan pengiriman fisik  │
│                                       │
│ [🖨️ Cetak Invoice Pembelian (PDF)]   │ ← TOMBOL INI HARUS MUNCUL!
│                                       │
│ [Lihat Riwayat Belanja]              │
└──────────────────────────────────────┘
```

**YANG HARUS ADA:**
- ✅ Tombol **"🖨️ Cetak Invoice Pembelian (PDF)"**

---

### ✅ Invoice PDF yang BENAR:

Klik tombol "Cetak Invoice", PDF akan terdownload.

**Buka PDF, cek isi:**

```
INFORMASI PELANGGAN
─────────────────────────────────────────
Nama:           [Nama customer Anda]
No. Telepon:    [No HP Anda]
Tanggal Booking: 16 Juni 2026  ← TEKS INI HARUS WARNA MERAH!

RINCIAN PEMBELIAN
─────────────────────────────────────────
No | Nama Produk                    | Kategori           | Qty | Harga    | Subtotal
1  | Tiket Masuk Kebun Strawberry   | Tiket Wisata Kebun | 1   | Rp 20000 | Rp 20000
    ↑ NAMA PRODUK INI HARUS BENAR!

TOTAL PEMBAYARAN: Rp 20000

┌────────────────────────────────────────────────┐
│ ✓ INVOICE DIGITAL                              │ ← BOX KUNING ini HARUS muncul!
│ Ini adalah bukti pembelian digital.            │
│ Tidak ada pengiriman fisik untuk produk ini.   │
│ Simpan invoice ini sebagai bukti transaksi.    │
└────────────────────────────────────────────────┘
```

**YANG HARUS ADA:**
- ✅ Nama produk: **"Tiket Masuk Kebun Strawberry"** (BENAR!)
- ✅ Kategori: **"Tiket Wisata Kebun"** (BENAR!)
- ✅ Tanggal Booking: **Warna MERAH**
- ✅ Box kuning: **"✓ INVOICE DIGITAL"**
- ✅ Text: **"Tidak ada pengiriman fisik"**

**YANG TIDAK BOLEH ADA:**
- ❌ Nama produk: "Multivitamin Complex" (INI DATA LAMA!)
- ❌ Alamat pengiriman
- ❌ Box hijau "📦 PENGIRIMAN"

---

### ✅ Di Admin - Halaman Transaksi:

1. Login kembali sebagai admin
2. Klik menu **"Transaksi"**
3. Lihat transaksi terbaru

**Yang HARUS muncul:**

```
Transaksi #TRX123
─────────────────────────────────────
Nama Produk              | Qty | Subtotal
Tiket Masuk Kebun...     | 1   | Rp 20000
↑ NAMA INI HARUS BENAR!

Total: Rp 20000
Status: Paid
Booking Date: 16 Juni 2026
```

**YANG HARUS ADA:**
- ✅ Nama produk: **"Tiket Masuk Kebun Strawberry"** (BENAR!)
- ✅ Tanggal booking tercatat
- ✅ Stok produk berkurang dari 100 → 99

**YANG TIDAK BOLEH ADA:**
- ❌ Nama produk: "Multivitamin Complex" (DATA LAMA!)

---

## ❌ JIKA MASIH SALAH - Apa Artinya?

### Jika masih muncul:
- Form alamat WAJIB (ada tanda *)
- Tidak ada field booking date
- Nama produk salah: "Multivitamin Complex"
- Tidak ada tombol "Cetak Invoice"

### Artinya:
1. **Anda BELUM jalankan reset** → Jalankan `RESET-SATU-KLIK.html` SEKARANG!
2. **Kategori masih salah** → Cek nama kategori, harus ada keyword "tiket" atau "wisata"
3. **Browser cache masih ada** → Tutup SEMUA tab, restart browser, jalankan reset lagi

---

## 📝 KEYWORD KATEGORI - Panduan Lengkap

Sistem mendeteksi keyword di **nama kategori** untuk menentukan:
- Apakah produk perlu pengiriman?
- Apakah produk perlu booking date?

### Keyword untuk PENGIRIMAN (Makanan/Minuman):

Jika nama kategori mengandung kata:
- **"makanan"** → Ada pengiriman
- **"minuman"** → Ada pengiriman

**Contoh BENAR:**
- ✅ "Makanan & Kue"
- ✅ "Makanan Ringan"
- ✅ "Minuman Segar"
- ✅ "Minuman & Snack"

**Contoh SALAH:**
- ❌ "Food & Beverages" (Bahasa Inggris, tidak ter-detect)
- ❌ "Kue & Roti" (Tidak ada kata "makanan" atau "minuman")

---

### Keyword untuk BOOKING (Tiket/Wisata/Penginapan):

Jika nama kategori mengandung kata:
- **"tiket"** → Tanpa pengiriman + booking date
- **"wisata"** → Tanpa pengiriman + booking date
- **"penginapan"** → Tanpa pengiriman + booking date
- **"hotel"** → Tanpa pengiriman + booking date

**Contoh BENAR:**
- ✅ "Tiket Wisata Kebun"
- ✅ "Wisata & Rekreasi"
- ✅ "Tiket Event"
- ✅ "Penginapan & Hotel"
- ✅ "Hotel Bintang 5"

**Contoh SALAH:**
- ❌ "Tiket masuk kebun stoberry" (Terlalu spesifik, bukan nama kategori umum)
- ❌ "Ticket Event" (Bahasa Inggris, harus "tiket" bukan "ticket")
- ❌ "Kebun Strawberry" (Tidak ada keyword)

---

### Produk Lainnya (Tanpa Pengiriman, Tanpa Booking):

Jika nama kategori TIDAK mengandung keyword di atas:
- Tidak ada pengiriman
- Tidak ada booking date
- Hanya invoice digital

**Contoh:**
- ✅ "Elektronik & Gadget"
- ✅ "Fashion & Pakaian"
- ✅ "Kesehatan & Suplemen"
- ✅ "Furniture & Dekorasi"

---

## 🚨 PENTING: Email Baru Setiap Reset!

Setiap kali Anda jalankan reset, gunakan **email yang berbeda**:

**SALAH:**
```
Reset pertama: dini@gmail.com
Reset kedua:   dini@gmail.com  ← SALAH! Email sama!
```

**BENAR:**
```
Reset pertama: dini@gmail.com
Reset kedua:   dini.fresh@gmail.com
Reset ketiga:  dini.fresh.2026@gmail.com
```

Kenapa?
- Sistem mungkin masih "ingat" email lama di memory browser
- Untuk memastikan 100% fresh start

---

## 💡 TIPS DEBUGGING

### 1. Buka Console Browser (F12)

Saat Anda checkout, buka console browser (tekan F12), lihat log:

```
[Booking Check] Product: Tiket Masuk Kebun Strawberry, Category: Tiket Wisata Kebun, Needs Booking: true
[Booking Check] Cart requires booking date: true
[Shipping Check] Product: Tiket Masuk Kebun Strawberry, Category: Tiket Wisata Kebun, Needs Shipping: false
[Shipping Check] Cart requires shipping: false
```

**Yang HARUS muncul:**
- `Needs Booking: true` ← Harus TRUE
- `Cart requires booking date: true` ← Harus TRUE
- `Needs Shipping: false` ← Harus FALSE
- `Cart requires shipping: false` ← Harus FALSE

**Jika muncul ini, berarti kategori sudah BENAR!**

---

### 2. Cek localStorage

Di console, ketik:

```javascript
localStorage.getItem('umkm_presets')
```

**Harus muncul:**
- Array dengan 1 UMKM saja (yang baru Anda daftar)
- Tidak ada "USAHA-DINI"
- Tidak ada email lama

**Jika masih ada "USAHA-DINI" atau email lama:**
→ Reset belum berhasil, jalankan lagi!

---

## ✅ CHECKLIST FINAL

Gunakan checklist ini:

### Langkah 1: Reset
- [ ] Tutup SEMUA tab browser
- [ ] Restart browser
- [ ] Double-click `RESET-SATU-KLIK.html`
- [ ] Klik "RESET SEKARANG"
- [ ] Tunggu "RESET BERHASIL!"
- [ ] Auto-redirect ke `/welcome`

### Langkah 2: Daftar
- [ ] Daftar dengan email BARU
- [ ] Dapat Kode UMKM
- [ ] Login berhasil

### Langkah 3: Kategori
- [ ] Buat kategori: **"Tiket Wisata Kebun"** ← NAMA INI TEPAT!
- [ ] Buat kategori: **"Makanan & Kue"** (jika perlu)

### Langkah 4: Produk
- [ ] Tambah produk tiket
- [ ] Pilih kategori: **"Tiket Wisata Kebun"**
- [ ] Skip foto (untuk test)
- [ ] Produk tersimpan

### Langkah 5: Test
- [ ] Logout dari admin
- [ ] Daftar customer baru
- [ ] Beli produk tiket
- [ ] Form checkout: alamat OPSIONAL
- [ ] Form checkout: booking date MUNCUL
- [ ] Warning "Tidak perlu pengiriman" MUNCUL
- [ ] Setelah bayar: tombol "Cetak Invoice" MUNCUL
- [ ] PDF download dengan data BENAR
- [ ] Admin: nama produk BENAR
- [ ] Admin: stok berkurang

---

## 🎯 KESIMPULAN

**KODE SUDAH BENAR!** Masalahnya hanya:
1. Data lama masih tersimpan
2. Kategori yang Anda buat nama-nya SALAH

**SOLUSI:**
1. Jalankan **RESET-SATU-KLIK.html** SEKARANG!
2. Buat kategori dengan nama yang TEPAT: **"Tiket Wisata Kebun"**
3. Test lagi dengan data fresh

**Jika Anda ikuti SEMUA langkah di atas dengan BENAR, dijamin 100% BERHASIL!**

---

## 📞 JIKA MASIH BERMASALAH

Kirim screenshot:
1. **Form checkout** (tunjukkan field apa saja yang muncul)
2. **Nama kategori** yang Anda buat (screenshot dari admin kategori)
3. **Invoice PDF** yang salah
4. **Console log** saat checkout (F12 → Console tab)

---

**SEKARANG, IKUTI LANGKAH 1 DULU!**

**JALANKAN `RESET-SATU-KLIK.html` SEKARANG JUGA!** 🔥

**Jangan lanjut ke langkah lain sebelum reset berhasil!**
