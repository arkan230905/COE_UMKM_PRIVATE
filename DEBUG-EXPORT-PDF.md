# DEBUG: Export PDF Laporan Keuangan

## Perbaikan yang Dilakukan

### 1. **Data Validation & Null Safety** ✅
Menambahkan fallback untuk semua data yang mungkin null/undefined:

```typescript
// Income Table
item.date || '-'
item.description || '-'
item.amount || 0

// Expense Table  
exp.date || '-'
exp.materialName || '-'
exp.quantity || 0
exp.unit || ''
exp.pricePerUnit || 0
exp.amount || 0
exp.notes || '-'
exp.expenseCategory || '-'
exp.description || '-'

// Header Info
currentPreset.businessName || 'UMKM'
currentPreset.industry || '-'
currentPreset.address || '-'
currentPreset.phone || '-'
```

### 2. **Pre-validation Check** ✅
```typescript
// Validate data sebelum generate PDF
if (!currentPreset || !currentPreset.businessName) {
  throw new Error('Data UMKM tidak lengkap');
}
```

### 3. **Console Logging untuk Debugging** ✅
```typescript
console.log('🚀 Starting PDF generation...');
console.log('📊 Data validation passed');
console.log('Income records:', combinedIncomesList.length);
console.log('Expenses:', expenses.length);
console.log('📄 Creating PDF document...');
console.log('✅ PDF berhasil dibuat:', fileName);
```

### 4. **Better Error Messages** ✅
```typescript
catch (error) {
  console.error('❌ Error generating PDF:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  alert(`Terjadi kesalahan saat membuat PDF:\n${errorMessage}\n\nSilakan cek browser console (F12) untuk detail lebih lanjut.`);
}
```

## Cara Testing Setelah Perbaikan

### 1. **Jalankan Development Server**
```bash
npm run dev
```

### 2. **Buka Browser Console**
- Tekan `F12` atau `Ctrl+Shift+I`
- Tab "Console"

### 3. **Test Export PDF**
1. Login sebagai Admin
2. Buka halaman "Laporan Keuangan"
3. Klik "Export Laporan PDF"
4. **Perhatikan Console** - akan muncul log:

#### Jika Berhasil:
```
🚀 Starting PDF generation...
📊 Data validation passed
Income records: 4
Expenses: 2
📄 Creating PDF document...
✅ PDF berhasil dibuat: Laporan-Keuangan-UMKM-Jaya-2026-07-05.pdf
```
✅ PDF akan terdownload otomatis

#### Jika Ada Error:
```
🚀 Starting PDF generation...
❌ Error generating PDF: [error message]
```
❌ Alert akan muncul dengan detail error

### 4. **Common Error Messages**

| Error Message | Penyebab | Solusi |
|--------------|----------|---------|
| "Data UMKM tidak lengkap" | currentPreset kosong/null | Check localStorage, reload page |
| "Cannot read property 'map' of undefined" | Data array tidak ada | Pastikan ada data transaksi/pengeluaran |
| "doc.autoTable is not a function" | jspdf-autotable tidak terinstall | Run `npm install jspdf-autotable` |
| "Failed to execute 'atob'" | Base64 encoding issue | Clear browser cache |

## Troubleshooting Steps

### Error Masih Muncul?

#### Step 1: Check Console Log
```javascript
// Lihat di console browser
// Catat error message yang muncul
```

#### Step 2: Check Data
```javascript
// Di console browser, ketik:
localStorage.getItem('umkm_transactions_preset_telkom_medical_center')
localStorage.getItem('umkm_expenses_preset_telkom_medical_center')
localStorage.getItem('umkm_incomes_preset_telkom_medical_center')

// Pastikan return value bukan null
```

#### Step 3: Check Dependencies
```bash
# Di terminal
npm list jspdf jspdf-autotable

# Harus muncul:
# ├── jspdf@4.2.1
# └── jspdf-autotable@5.0.8
```

#### Step 4: Rebuild
```bash
# Clear cache dan rebuild
npm run build
npm run dev
```

#### Step 5: Test dengan Data Minimal
1. Reset database (gunakan clear-database.html)
2. Buat 1 transaksi baru
3. Buat 1 pengeluaran baru
4. Test export PDF lagi

### Still Not Working?

#### Check Browser Compatibility
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Edge 90+
- ❌ Internet Explorer (Not supported)

#### Check Browser Settings
1. **Allow Downloads**
   - Chrome: Settings → Privacy → Downloads → Allow
   - Firefox: Options → Files and Applications
   
2. **Disable Popup Blocker** for localhost
   - Chrome: Settings → Privacy → Site Settings → Pop-ups

3. **Clear Browser Cache**
   - Ctrl+Shift+Delete → Clear cached images and files

## Validation Checklist

Sebelum export PDF, pastikan:

- [x] Ada data UMKM (currentPreset tidak null)
- [x] Nama bisnis UMKM terisi
- [x] Ada minimal 1 transaksi ATAU 1 pengeluaran
- [x] Browser console tidak ada error sebelum klik export
- [x] Browser allow downloads dari localhost
- [x] Disk space cukup untuk save PDF

## Expected Console Output (Success)

```
🚀 Starting PDF generation...
📊 Data validation passed
Income records: 4
Expenses: 2
📄 Creating PDF document...
✅ PDF berhasil dibuat: Laporan-Keuangan-UMKM-Jaya-2026-07-05.pdf
```

## PDF File Location

PDF akan tersimpan di:
- **Windows**: `C:\Users\[YourName]\Downloads\`
- **Format nama**: `Laporan-Keuangan-[Nama-UMKM]-[YYYY-MM-DD].pdf`
- **Contoh**: `Laporan-Keuangan-UMKM-Jaya-2026-07-05.pdf`

## Changelog

### Version 2.0 (5 Juli 2026)
- ✅ Added null safety for all data fields
- ✅ Added pre-validation checks
- ✅ Added comprehensive console logging
- ✅ Improved error messages
- ✅ Added data fallbacks (|| '-' atau || 0)
- ✅ Better error handling with try-catch-finally

### Version 1.0 (Awal)
- ✅ Basic PDF export functionality
- ✅ Multi-page support
- ✅ autoTable integration
- ❌ No error handling
- ❌ No data validation

---

**Status**: ✅ IMPROVED & DEBUGGABLE  
**Tanggal**: 5 Juli 2026

## Quick Fix Commands

```bash
# If everything fails, try this:
npm run build
rm -rf node_modules
npm install
npm run dev
```

## Contact Support

Jika masih ada masalah setelah semua troubleshooting:
1. Screenshot console error
2. Screenshot halaman laporan keuangan
3. Hubungi tim developer (lihat Help & FAQ)
