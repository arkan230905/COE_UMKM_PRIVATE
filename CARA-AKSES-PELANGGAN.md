# 🛍️ Cara Mengakses Mode Pelanggan

## 🎯 Cara Akses Mode Pelanggan:

---

## ✅ Akses Via URL Langsung

### Format URL:
```
http://localhost:3001/{NAMA-UMKM}/pelanggan/catalog
```

### Langkah-langkah:

1. **Cari Tahu Nama UMKM Anda**
   - Login sebagai admin
   - Lihat nama bisnis di dashboard (contoh: "ARKAN FOOD")

2. **Format Nama untuk URL**
   - Ganti spasi dengan tanda `-`
   - Huruf besar semua (UPPERCASE)
   - Contoh: "ARKAN FOOD" → `ARKAN-FOOD`

3. **Buat URL Pelanggan**
   ```
   http://localhost:3001/ARKAN-FOOD/pelanggan/catalog
   ```

4. **Akses di Browser Berbeda/Incognito**
   - Tekan `Ctrl + Shift + N` (Chrome) atau `Ctrl + Shift + P` (Firefox)
   - Paste URL pelanggan
   - Sekarang Anda sebagai "pelanggan" yang browse produk

---

## 📝 Contoh URL untuk Berbagai UMKM:

| Nama UMKM di Database | URL Pelanggan |
|-----------|---------------|
| ARKAN FOOD | `http://localhost:3001/ARKAN-FOOD/pelanggan/catalog` |
| Bistara Coffee | `http://localhost:3001/BISTARA-COFFEE/pelanggan/catalog` |
| Toko Elektronik Jaya | `http://localhost:3001/TOKO-ELEKTRONIK-JAYA/pelanggan/catalog` |
| Warung Makan Sederhana | `http://localhost:3001/WARUNG-MAKAN-SEDERHANA/pelanggan/catalog` |

---

## 📱 Fitur Mode Pelanggan:

Saat berhasil masuk sebagai pelanggan, Anda bisa:

### 1. Lihat Katalog Produk
- Browse semua produk yang dijual UMKM
- Lihat harga, deskripsi, stok
- Filter berdasarkan kategori

### 2. Tambah ke Keranjang
- Pilih produk
- Tentukan jumlah
- Masukkan ke keranjang belanja

### 3. Checkout Pesanan
- Pilih metode pembayaran (E-Wallet, Cash, Debit, QRIS)
- Isi data pengiriman (untuk produk fisik)
- Pilih tanggal booking (untuk tiket/wisata)

### 4. Riwayat Pesanan
- Lihat status pesanan
- Track pengiriman
- Konfirmasi barang sampai

---

## ⚠️ Troubleshooting:

### Problem: "Pelanggan tidak ditemukan" atau Error 404

**Solution:**
- Pastikan nama UMKM di URL sama persis dengan nama bisnis Anda
- Periksa ejaan dan spasi (ganti spasi dengan `-`)
- Pastikan huruf besar semua

### Problem: Refresh halaman kembali ke "Sistem UMKM Pintar"

**✅ SUDAH DIPERBAIKI!**
- Session sekarang disimpan di localStorage
- Refresh tidak akan logout otomatis
- UMKM tetap sama setelah refresh

### Problem: Data UMKM lain muncul

**✅ SUDAH DIPERBAIKI!**
- Setiap UMKM punya isolasi data sendiri
- Data tidak akan bocor ke UMKM lain
- Refresh tidak mengubah UMKM aktif

---

## 🔧 Cara Cepat Test:

### Quick Test 1: Admin Dashboard
```bash
# 1. Login admin
http://localhost:3001
# Masuk dengan kode: ARKAN-FOOD-001 (atau kode Anda)

# 2. Cek nama bisnis di dashboard
# Misal: "ARKAN FOOD"

# 3. Buka tab baru/incognito
# URL: http://localhost:3001/ARKAN-FOOD/pelanggan/catalog
```

### Quick Test 2: Check Console
```javascript
// Buka Developer Tools (F12)
// Lihat Console Log:

💾 Saved UMKM session to localStorage: ARKAN FOOD
🔐 Current UMKM ID set: 3
```

Jika muncul log ini, berarti session tersimpan dengan benar!

---

## 📝 Format URL Lengkap:

```
http://localhost:3001/{NAMA-UMKM}/pelanggan/{PAGE}
```

### Parameter `{PAGE}`:
- `catalog` → Halaman katalog produk (default)
- `order-history` → Riwayat pesanan pelanggan

### Contoh URL Lengkap:
```
# Katalog
http://localhost:3001/ARKAN-FOOD/pelanggan/catalog

# Riwayat Pesanan
http://localhost:3001/ARKAN-FOOD/pelanggan/order-history
```

---

## 🎯 Best Practice:

### Untuk Testing:
1. **Tab 1**: Login sebagai Admin
2. **Tab 2**: Buka Incognito, akses sebagai Pelanggan
3. **Tab 3**: Buka Incognito, akses sebagai Pelanggan lain

Dengan cara ini Anda bisa simulasi:
- Admin mengelola produk
- Pelanggan 1 belanja
- Pelanggan 2 belanja
- Lihat real-time update di admin

### Untuk Production:
- Share link pelanggan ke customer: `https://yourdomain.com/NAMA-UMKM/pelanggan/catalog`
- Customer bisa bookmark link tersebut
- Customer bisa langsung akses tanpa login admin

---

## ✅ Checklist Akses Pelanggan:

- [ ] UMKM sudah terdaftar di database
- [ ] Sudah login sebagai admin minimal 1 kali
- [ ] Nama UMKM dicatat dengan benar
- [ ] URL pelanggan sesuai format
- [ ] Buka di tab/browser berbeda untuk test

---

**Dibuat:** 10 Agustus 2026  
**Status:** Session Persistence Fixed ✅  
**Next Update:** Tombol "Lihat Sebagai Pelanggan" di Dashboard
