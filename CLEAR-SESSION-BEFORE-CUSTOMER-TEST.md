# 🧹 Clear Session Sebelum Test Customer Access

## ⚠️ PENTING: Clear Session Admin Dulu!

Jika Anda sudah pernah login sebagai admin sebelumnya, localStorage masih menyimpan session admin yang bisa interfere dengan customer access.

---

## 🔧 Cara Clear Session (2 Metode):

### Metode 1: Via Browser Console (TERCEPAT)

1. **Buka Developer Tools** (F12)
2. **Klik tab "Console"**
3. **Paste dan Enter:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

**✅ Done!** Session admin terhapus, halaman reload fresh.

---

### Metode 2: Via Browser Settings

1. **Buka Developer Tools** (F12)
2. **Klik tab "Application"** (Chrome) atau **"Storage"** (Firefox)
3. **Klik "Local Storage"** di sidebar kiri
4. **Klik `http://localhost:3001`**
5. **Klik kanan → "Clear"** atau tekan tombol 🗑️
6. **Refresh halaman** (F5)

---

### Metode 3: Incognito/Private Mode (PALING MUDAH)

1. **Buka Incognito Window:**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. **Akses URL customer:**
   ```
   http://localhost:3001/ARKAN-FOOD/pelanggan/catalog
   ```

**✅ Incognito tidak punya session lama!**

---

## 🧪 Testing Customer Access (Step by Step):

### Step 1: Clear Session
```javascript
// Paste di Console (F12):
localStorage.clear();
console.log('✅ Session cleared!');
```

### Step 2: Reload Halaman
```
F5 atau Ctrl + R
```

### Step 3: Akses URL Customer
```
http://localhost:3001/ARKAN-FOOD/pelanggan/catalog
```

### Step 4: Check Console Log
Anda harus lihat:
```
🔄 Loading UMKM presets from database...
✅ Loaded X UMKM presets from database
🛍️ Customer access detected for: ARKAN FOOD
✅ Matched UMKM from URL: ARKAN FOOD Role: customer
🔐 Data isolation enabled for UMKM: ARKAN FOOD ID: 3
```

**TIDAK BOLEH ADA:**
```
🔄 Updating URL from /ARKAN-FOOD/pelanggan/catalog to: /admin/ARKAN-FOOD/dashboard
```

---

## 🔍 Debugging: Check What's Stored

### Check localStorage:
```javascript
// Paste di Console:
console.log('is_super_admin_logged_in:', localStorage.getItem('is_super_admin_logged_in'));
console.log('current_umkm_preset:', localStorage.getItem('current_umkm_preset'));
console.log('current_umkm_preset_id:', localStorage.getItem('current_umkm_preset_id'));
```

**Untuk customer access, HARUS:**
- `is_super_admin_logged_in`: `null` atau `"false"` sebelum akses
- Setelah akses customer, jadi `"true"` tapi role tetap 'customer'

---

## ⚠️ Kenapa Perlu Clear Session?

### Skenario Masalah:
```
1. User login sebagai admin
   → localStorage.setItem('is_super_admin_logged_in', 'true')
   → role = 'super_admin'

2. User akses URL customer TANPA logout/clear
   → localStorage.getItem('is_super_admin_logged_in') = 'true'
   → role masih 'super_admin' (dari state lama)
   → useEffect URL push triggered
   → URL di-push ke /admin/... ❌

3. SOLUTION: Clear localStorage dulu!
   → State fresh, role = 'customer' dari URL parsing
   → URL tetap di /pelanggan/catalog ✅
```

---

## 🎯 Best Practice Testing:

### Untuk Development:
1. **Tab 1:** Admin (normal browser)
   ```
   http://localhost:3001
   → Login admin → Edit produk
   ```

2. **Tab 2:** Customer (incognito)
   ```
   Ctrl + Shift + N
   → http://localhost:3001/ARKAN-FOOD/pelanggan/catalog
   → Browse products
   ```

**Keuntungan:**
- Admin dan customer terpisah
- Tidak ada session conflict
- Easy testing

---

### Untuk Production:
Customer akan akses direct URL tanpa pernah login admin:
```
https://yourdomain.com/ARKAN-FOOD/pelanggan/catalog
```

Tidak ada session conflict karena mereka tidak pernah login admin!

---

## 🚨 If Still Redirecting to Admin:

### Check Console untuk Log Ini:
```
🔄 Updating URL from /ARKAN-FOOD/pelanggan/catalog to: /admin/...
```

**Jika muncul, berarti:**
1. localStorage belum clear
2. Role masih 'super_admin'
3. useEffect URL push ke-trigger

**Solution:**
```javascript
// Force clear dan reload:
localStorage.clear();
sessionStorage.clear();
location.href = 'http://localhost:3001/ARKAN-FOOD/pelanggan/catalog';
```

---

## ✅ Success Indicators:

### URL Tetap Customer:
```
http://localhost:3001/ARKAN-FOOD/pelanggan/catalog
                                    ↑↑↑↑↑↑↑↑
                                  TIDAK BERUBAH!
```

### Console Log Correct:
```
✅ Matched UMKM from URL: ARKAN FOOD Role: customer
                                              ↑↑↑↑↑↑↑↑
                                            ROLE = CUSTOMER
```

### Page Shows Customer View:
- Katalog produk
- Tombol "Tambah ke Keranjang"
- TIDAK ADA sidebar admin
- TIDAK ADA menu "Dashboard", "Kategori", dll

---

## 📝 Quick Command Reference:

```javascript
// Clear everything
localStorage.clear();

// Check current state
console.log('Session:', localStorage.getItem('is_super_admin_logged_in'));
console.log('Role:', 'check in React DevTools');
console.log('URL:', window.location.href);

// Force reload customer URL
location.href = 'http://localhost:3001/ARKAN-FOOD/pelanggan/catalog';
```

---

**Ingat:** Setiap kali mau test customer access setelah login admin, **CLEAR SESSION DULU!** 🧹

**Cara termudah:** Gunakan Incognito mode untuk customer testing! 🕵️

---

**Updated:** 10 Agustus 2026  
**Status:** Clear Session Required for Clean Testing ✅
