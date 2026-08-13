# Fix: PDF autoTable is not a function

## 🐛 ERROR

```
Gagal membuat PDF: doc.autoTable is not a function
```

## 🔍 ROOT CAUSE

**Wrong Import Method**:
```typescript
// ❌ SALAH - Side-effect import
import 'jspdf-autotable';

// Usage:
(doc as any).autoTable({ ... });  // ERROR: autoTable is not a function
```

**Penjelasan**:
- `import 'jspdf-autotable'` hanya load library tanpa import fungsinya
- `doc.autoTable()` tidak ada di jsPDF instance
- TypeScript casting `(doc as any)` bypass type checking tapi runtime tetap error

## ✅ SOLUTION

**Correct Import Method**:
```typescript
// ✅ BENAR - Named import
import autoTable from 'jspdf-autotable';

// Usage:
autoTable(doc, { ... });  // ✅ Works!
```

## 📝 CHANGES MADE

### File 1: `src/components/CustomerOrders.tsx`

**Before:**
```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ...

(doc as any).autoTable({
  startY: yPosition,
  head: [['No', 'Nama Produk', 'Kategori', 'Qty', 'Harga Satuan', 'Subtotal']],
  body: itemsData,
  // ... options
});

yPosition = (doc as any).lastAutoTable.finalY + 10;
```

**After:**
```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ...

autoTable(doc, {
  startY: yPosition,
  head: [['No', 'Nama Produk', 'Kategori', 'Qty', 'Harga Satuan', 'Subtotal']],
  body: itemsData,
  // ... options
});

yPosition = (doc as any).lastAutoTable.finalY + 10;
```

### File 2: `src/components/CustomerCatalog.tsx`

**Same changes applied**:
- Changed import from `import 'jspdf-autotable'` → `import autoTable from 'jspdf-autotable'`
- Changed usage from `(doc as any).autoTable(...)` → `autoTable(doc, ...)`

## 🎯 RESULT

### Before Fix:
```
User clicks "Cetak Invoice (PDF)"
  ↓
JavaScript error: "doc.autoTable is not a function"
  ↓
Alert: "Gagal membuat PDF: doc.autoTable is not a function"
  ↓
PDF tidak ter-download ❌
```

### After Fix:
```
User clicks "Cetak Invoice (PDF)"
  ↓
autoTable(doc, options) executes successfully
  ↓
PDF table generated correctly
  ↓
doc.save(filename) downloads PDF
  ↓
PDF ter-download ke folder Downloads ✅
```

## 🧪 TESTING

### Test 1: Basic PDF Download

1. **Login as Customer**
2. **Navigate to**: "Pesanan Saya"
3. **Click**: "View Invoice" on any transaction
4. **Click**: "🖨️ Cetak Invoice (PDF)"
5. **✅ VERIFY**: 
   - No error in console
   - PDF downloads successfully
   - PDF opens and shows table correctly

### Test 2: Check Console Logs

**Expected Output:**
```
🖨️ Starting PDF generation for transaction: TRX12345678
📦 Transaction items: Array(3) [...]
💾 Saving PDF with filename: Invoice-TRX12345678-Nama-Bisnis.pdf
✅ PDF saved successfully!
```

**No More Error:**
~~❌ Error generating PDF: doc.autoTable is not a function~~

### Test 3: Verify PDF Content

**Open downloaded PDF and verify:**
- ✅ Header with UMKM info
- ✅ Invoice details (transaction code, date, status)
- ✅ Customer information
- ✅ **Items table** (this uses autoTable)
- ✅ Total amount
- ✅ Footer

**The table should display:**
| No | Nama Produk | Kategori | Qty | Harga Satuan | Subtotal |
|----|-------------|----------|-----|--------------|----------|
| 1  | Product A   | Food     | 2   | Rp 10.000    | Rp 20.000|

## 📚 TECHNICAL EXPLANATION

### Why the Error Occurred

**jspdf-autotable** provides a function that **extends** jsPDF, but the extension only happens when you **import the function**.

**Side-effect import** (`import 'jspdf-autotable'`):
- Loads the library
- But doesn't give you access to the function
- `doc.autoTable` remains undefined

**Named import** (`import autoTable from 'jspdf-autotable'`):
- Imports the actual function
- You call it as `autoTable(doc, options)`
- This properly extends the doc and creates the table

### API Difference

**Old API (v3.x)** - Side-effect import worked:
```typescript
import 'jspdf-autotable';
doc.autoTable({ ... });  // Worked in old version
```

**New API (v4.x+)** - Named import required:
```typescript
import autoTable from 'jspdf-autotable';
autoTable(doc, { ... });  // Required in new version
```

### Type Safety

**With Named Import:**
```typescript
import autoTable from 'jspdf-autotable';

autoTable(doc, {
  startY: 100,
  head: [['Column 1', 'Column 2']],
  body: [['Data 1', 'Data 2']]
});
// ✅ TypeScript knows the function signature
```

**With Side-Effect Import:**
```typescript
import 'jspdf-autotable';

(doc as any).autoTable({ ... });
// ❌ TypeScript can't verify
// ❌ Runtime error: autoTable is not a function
```

## 🔑 KEY POINTS

1. ✅ **Use named import**: `import autoTable from 'jspdf-autotable'`
2. ✅ **Call as function**: `autoTable(doc, options)`
3. ✅ **Don't use**: `doc.autoTable()` or `(doc as any).autoTable()`
4. ✅ **Works with jspdf-autotable v4.x and above**
5. ✅ **Type-safe and runtime-safe**

## 📦 PACKAGE VERSIONS

Current versions (verified working):
```json
{
  "jspdf": "^4.2.1",
  "jspdf-autotable": "^5.0.8"
}
```

## ⚠️ IMPORTANT NOTES

- **lastAutoTable** still accessed via `(doc as any).lastAutoTable.finalY`
- This is because jsPDF TypeScript definitions don't include autoTable extension
- But the actual autoTable function should be imported and called properly

## 🎓 RELATED ISSUES

This error commonly occurs when:
1. Upgrading jspdf-autotable from v3.x to v4.x+
2. Copy-pasting code from old tutorials
3. Using side-effect import instead of named import

## ✅ SUCCESS CRITERIA

**PDF Generation is working when:**
- ✅ No "autoTable is not a function" error
- ✅ Console shows success logs
- ✅ PDF downloads successfully
- ✅ Table renders correctly in PDF
- ✅ All invoice data visible

---

**Status**: ✅ FIXED
**Date**: 2026-08-13
**Issue**: autoTable is not a function
**Solution**: Use named import instead of side-effect import
**Files Changed**: CustomerOrders.tsx, CustomerCatalog.tsx
**Commit**: bd4ac43
