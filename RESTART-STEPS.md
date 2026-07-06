# ⚠️ PENTING: Langkah Restart Setelah Fix

## Masalah
Perubahan kode sudah dibuat dan build berhasil, tapi browser masih menggunakan **cached version lama** yang error.

## ✅ LANGKAH WAJIB (IKUTI URUTAN)

### 1. **Stop Development Server**
Di terminal yang menjalankan `npm run dev`:
- Tekan `Ctrl + C`
- Tunggu sampai server benar-benar stop

### 2. **Clear Node Modules Cache (Optional tapi Recommended)**
```bash
# Di terminal, jalankan:
rm -rf node_modules/.vite
```

Atau manual:
- Buka folder `node_modules`
- Hapus folder `.vite` di dalamnya

### 3. **Rebuild Application**
```bash
npm run build
```

Tunggu sampai selesai dengan message:
```
✓ built in XX.XXs
Exit Code: 0
```

### 4. **Start Development Server Lagi**
```bash
npm run dev
```

Tunggu sampai muncul:
```
VITE v6.4.2  ready in XXX ms

  ➜  Local:   http://127.0.0.1:3000/
  ➜  Network: use --host to expose
```

### 5. **Clear Browser Cache**

#### Chrome:
1. Buka DevTools (`F12` atau `Ctrl+Shift+I`)
2. **Klik kanan** tombol Refresh (↻) di browser
3. Pilih "**Empty Cache and Hard Reload**"

Atau:
1. `Ctrl + Shift + Delete`
2. Pilih "Cached images and files"
3. Time range: "All time"
4. Clear data

#### Firefox:
1. `Ctrl + Shift + Delete`
2. Check "Cache"
3. Time range: "Everything"
4. Clear Now

#### Edge:
1. `Ctrl + Shift + Delete`
2. Check "Cached images and files"
3. Time range: "All time"
4. Clear now

### 6. **Hard Refresh Page**
- `Ctrl + F5` (Windows)
- Atau `Ctrl + Shift + R`

### 7. **Verify JavaScript Loaded**
1. Buka DevTools (`F12`)
2. Tab "Network"
3. Filter: "JS"
4. Refresh page
5. Pastikan ada file `index-[hash].js` yang **baru** (lihat hash nya berubah)

### 8. **Test Export PDF**
1. Login sebagai Admin
2. Buka "Laporan Keuangan"
3. Buka Console tab (`F12` → Console)
4. Klik "Export Laporan PDF"
5. **PERHATIKAN CONSOLE LOG**

## ✅ Expected Console Output (Jika Berhasil)

```
🚀 Starting PDF generation...
📊 Data validation passed
Income records: 4
Expenses: 2
📄 Creating PDF document...
✅ PDF berhasil dibuat: Laporan-Keuangan-UMKM-Jaya-2026-07-05.pdf
```

## ❌ Jika Masih Error

### Check 1: Apakah Bundle Hash Berubah?
Di DevTools Network tab, lihat file JS yang diload.

**Before:** `index-ajnWc0Oa.js`  
**After:** Harus berbeda, misalnya `index-BxYzAb12.js`

Jika **MASIH SAMA** = browser menggunakan cache lama!

**Solusi:**
1. Close browser completely
2. Reopen browser
3. Go to localhost:3000
4. Test lagi

### Check 2: Apakah jspdf-autotable Terinstall?
```bash
npm list jspdf-autotable
```

Harus muncul:
```
└── jspdf-autotable@5.0.8
```

Jika NOT FOUND:
```bash
npm install jspdf-autotable
npm run build
npm run dev
```

### Check 3: Test di Incognito/Private Window
1. Buka browser Incognito/Private mode
2. Go to `http://127.0.0.1:3000`
3. Login dan test export PDF

Incognito mode tidak menggunakan cache, jadi ini test yang clean.

### Check 4: Verify Import Statement
Pastikan file `src/components/AdminFinancialReport.tsx` line 5-6:
```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';
```

**BUKAN:**
```typescript
import autoTable from 'jspdf-autotable';  // ❌ SALAH untuk versi ini
```

### Check 5: Console Error Message
Jika masih error, screenshot:
1. Full alert error message
2. Full console log (F12 → Console tab)
3. Network tab showing loaded JS files

## 🔄 Complete Clean Restart (Nuclear Option)

Jika semua gagal, lakukan full reset:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Remove all caches
rm -rf node_modules/.vite
rm -rf dist

# 3. Reinstall (optional)
npm install

# 4. Build fresh
npm run build

# 5. Start dev
npm run dev
```

Lalu:
1. Close ALL browser windows
2. Reopen browser
3. Go to localhost:3000
4. Hard refresh (`Ctrl+F5`)
5. Test export PDF

## 📊 Debugging Checklist

Sebelum test, verify:

- [ ] Dev server stopped dan restarted
- [ ] Browser cache cleared (hard reload)
- [ ] Console shows new bundle loaded
- [ ] No old error messages in console
- [ ] jspdf-autotable installed (`npm list`)
- [ ] Build successful (Exit Code: 0)
- [ ] Tested in incognito mode

## 🎯 Success Criteria

✅ No error alert  
✅ Console shows success logs  
✅ PDF file downloads  
✅ PDF opens and displays correctly  
✅ PDF contains all data from website  

---

**CRITICAL NOTE:**

Browser caching is **VERY AGGRESSIVE** dengan Vite HMR. Anda **HARUS**:
1. Stop server
2. Clear cache
3. Restart server
4. Hard refresh

Jangan skip steps ini!

---

**Last Updated:** 5 Juli 2026  
**Status:** Kode sudah fix, tinggal restart & clear cache
