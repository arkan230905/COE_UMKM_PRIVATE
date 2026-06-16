# 📊 DIAGRAM: Cara Kerja Keyword Kategori

## 🔍 Sistem Deteksi Keyword

```
                           NAMA KATEGORI
                                 │
                                 ▼
                    ┌────────────┴────────────┐
                    │   Cari Keyword dalam    │
                    │   Nama Kategori         │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐  ┌─────────────┐  ┌──────────────┐
    │ Ada "makanan" /  │  │ Ada "tiket" │  │ Tidak Ada    │
    │ "minuman"?       │  │ "wisata" /  │  │ Keyword?     │
    │                  │  │ "penginapan"│  │              │
    │                  │  │ "hotel"?    │  │              │
    └────────┬─────────┘  └──────┬──────┘  └──────┬───────┘
             │                   │                 │
             ▼                   ▼                 ▼
    ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐
    │ DENGAN          │  │ TANPA        │  │ TANPA       │
    │ PENGIRIMAN      │  │ PENGIRIMAN   │  │ PENGIRIMAN  │
    │                 │  │ +            │  │             │
    │ Form:           │  │ BOOKING DATE │  │ Form:       │
    │ - Alamat WAJIB  │  │              │  │ - Alamat    │
    │ - Kurir         │  │ Form:        │  │   OPSIONAL  │
    │ - Resi          │  │ - Alamat     │  │             │
    │                 │  │   OPSIONAL   │  │ Invoice:    │
    │ Invoice:        │  │ - Booking    │  │ - Digital   │
    │ - Box Hijau     │  │   Date WAJIB │  │   only      │
    │ - "📦 Pengirim" │  │              │  │             │
    │                 │  │ Invoice:     │  │             │
    │                 │  │ - Box Kuning │  │             │
    │                 │  │ - "✓ Digital"│  │             │
    └─────────────────┘  └──────────────┘  └─────────────┘
```

---

## ✅ CONTOH KATEGORI: "Tiket Wisata Kebun"

```
Input: "Tiket Wisata Kebun"
       ↓
Deteksi Keyword:
  ✓ Mengandung "tiket"? → YA
  ✓ Mengandung "wisata"? → YA
       ↓
HASIL:
  → Tanpa Pengiriman
  → Dengan Booking Date
```

**Form Checkout:**
```
┌─────────────────────────────────────┐
│ Nama: [auto]                        │
│ HP: [auto]                          │
│ Email: [auto]                       │
│                                     │
│ ⚠️ Tidak perlu pengiriman fisik     │
│                                     │
│ Alamat: [opsional]                  │ ← Tidak wajib!
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎫 Tanggal Booking Diperlukan   │ │ ← Box ini muncul!
│ │ [calendar picker] *             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [✓ Konfirmasi Pembayaran]           │
└─────────────────────────────────────┘
```

**Invoice PDF:**
```
INFORMASI PELANGGAN
────────────────────────────────────
Nama:           Customer Name
No. Telepon:    08123456789
Tanggal Booking: 16 Juni 2026  ← MERAH!

RINCIAN PEMBELIAN
────────────────────────────────────
Tiket Masuk Kebun Strawberry
Kategori: Tiket Wisata Kebun
Qty: 1 | Rp 20000

┌────────────────────────────────────┐
│ ✓ INVOICE DIGITAL                  │ ← Box kuning!
│ Tidak ada pengiriman fisik         │
└────────────────────────────────────┘
```

---

## ❌ CONTOH SALAH: "Tiket masuk kebun stoberry"

```
Input: "Tiket masuk kebun stoberry"
       ↓
Deteksi Keyword:
  ✓ Mengandung "tiket"? → YA
  ✓ Tapi terlalu SPESIFIK!
  ✓ Bukan nama kategori umum!
       ↓
MASALAH:
  → Sistem mungkin tidak detect dengan benar
  → Nama kategori harus UMUM, bukan spesifik
```

**Yang Benar:**
```
❌ "Tiket masuk kebun stoberry" → Terlalu spesifik
✅ "Tiket Wisata Kebun" → Umum & jelas
✅ "Tiket Wisata & Rekreasi" → Lebih baik lagi
```

---

## 📝 PANDUAN PENAMAAN KATEGORI

### ✅ NAMA KATEGORI YANG BENAR:

#### 1. Kategori Tiket/Wisata:
```
✅ Tiket Wisata Kebun
✅ Wisata & Rekreasi
✅ Tiket Event & Konser
✅ Tiket Masuk Objek Wisata
```

**Ciri:**
- Ada kata "tiket" ATAU "wisata"
- Nama umum, tidak terlalu spesifik
- Bisa untuk banyak jenis produk tiket

#### 2. Kategori Penginapan:
```
✅ Penginapan & Hotel
✅ Hotel & Resort
✅ Penginapan Villa
```

**Ciri:**
- Ada kata "penginapan" ATAU "hotel"
- Nama umum

#### 3. Kategori Makanan/Minuman:
```
✅ Makanan & Kue
✅ Minuman Segar
✅ Makanan Ringan
✅ Minuman & Snack
```

**Ciri:**
- Ada kata "makanan" ATAU "minuman"
- Nama umum

---

## ❌ NAMA KATEGORI YANG SALAH:

```
❌ "Tiket masuk kebun stoberry"
   Kenapa salah? → Terlalu spesifik, hanya untuk 1 produk

❌ "Kebun Strawberry"
   Kenapa salah? → Tidak ada keyword "tiket" atau "wisata"

❌ "Ticket Event"
   Kenapa salah? → Bahasa Inggris, harus "tiket"

❌ "Tourism & Travel"
   Kenapa salah? → Bahasa Inggris, harus "wisata"

❌ "Kue & Roti"
   Kenapa salah? → Tidak ada kata "makanan" atau "minuman"
```

---

## 🎯 PRINSIP PENAMAAN KATEGORI:

### 1. **Gunakan Bahasa Indonesia**
```
✅ "Tiket Wisata" → Bahasa Indonesia
❌ "Tourism Ticket" → Bahasa Inggris
```

### 2. **Nama Harus Umum, Bukan Spesifik**
```
✅ "Tiket Wisata" → Umum, bisa untuk berbagai tiket
❌ "Tiket Masuk Kebun Strawberry" → Terlalu spesifik
```

### 3. **Sertakan Keyword yang Relevan**
```
✅ "Tiket Wisata Kebun" → Ada "tiket" + "wisata"
✅ "Wisata & Rekreasi" → Ada "wisata"
❌ "Rekreasi Keluarga" → Tidak ada keyword
```

### 4. **Bisa Menampung Banyak Produk**
```
✅ "Tiket Wisata" → Bisa untuk:
   - Tiket masuk kebun
   - Tiket museum
   - Tiket taman
   - Tiket pantai

❌ "Tiket Masuk Kebun Strawberry XYZ" → Hanya untuk 1 produk
```

---

## 🔧 CARA PERBAIKI KATEGORI ANDA:

### Jika Anda Sudah Buat Kategori Salah:

**Langkah 1: Reset Database**
```
Double-click: RESET-SATU-KLIK.html
```

**Langkah 2: Daftar UMKM Baru**
```
Email baru: [email berbeda]
```

**Langkah 3: Buat Kategori dengan Nama BENAR**
```
UNTUK TIKET:
  Nama: Tiket Wisata Kebun
  Desc: Produk tiket wisata dan rekreasi

UNTUK MAKANAN:
  Nama: Makanan & Kue
  Desc: Produk makanan dan kue yang dikirim

UNTUK PENGINAPAN:
  Nama: Penginapan & Hotel
  Desc: Booking penginapan dan hotel
```

---

## 📊 DECISION TREE: Pilih Nama Kategori

```
Produk Anda apa?
│
├─ Tiket (masuk, event, konser, dll)
│  → Nama: "Tiket Wisata [Jenis]"
│  → Contoh: "Tiket Wisata Kebun", "Tiket Event"
│
├─ Wisata (tour, paket wisata, dll)
│  → Nama: "Wisata & [Tambahan]"
│  → Contoh: "Wisata & Rekreasi", "Wisata Alam"
│
├─ Penginapan (hotel, villa, homestay)
│  → Nama: "Penginapan & [Tambahan]"
│  → Contoh: "Penginapan & Hotel", "Hotel & Resort"
│
├─ Makanan (kue, snack, nasi, dll)
│  → Nama: "Makanan & [Tambahan]"
│  → Contoh: "Makanan & Kue", "Makanan Ringan"
│
├─ Minuman (jus, kopi, teh, dll)
│  → Nama: "Minuman [Tambahan]"
│  → Contoh: "Minuman Segar", "Minuman & Snack"
│
└─ Lainnya (elektronik, fashion, dll)
   → Nama: Bebas (tidak ada keyword)
   → Contoh: "Elektronik", "Fashion", "Kesehatan"
```

---

## 🎓 KESIMPULAN:

### Kunci Sukses:
1. ✅ **Nama kategori HARUS mengandung keyword**
2. ✅ **Keyword HARUS bahasa Indonesia**
3. ✅ **Nama harus UMUM, bukan spesifik**
4. ✅ **Bisa menampung banyak produk sejenis**

### Keyword yang Dikenali:
- **"makanan"** → Dengan pengiriman
- **"minuman"** → Dengan pengiriman
- **"tiket"** → Tanpa pengiriman + booking
- **"wisata"** → Tanpa pengiriman + booking
- **"penginapan"** → Tanpa pengiriman + booking
- **"hotel"** → Tanpa pengiriman + booking

### Jika Tidak Ada Keyword:
→ Tanpa pengiriman, tanpa booking, invoice digital only

---

**INGAT:** Nama kategori adalah KUNCI sistem untuk menentukan:
- Apakah perlu pengiriman?
- Apakah perlu booking date?
- Apa yang ditampilkan di invoice?

**Jadi pastikan nama kategori TEPAT!** ✨
