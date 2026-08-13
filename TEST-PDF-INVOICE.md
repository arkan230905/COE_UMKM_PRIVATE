# Testing Guide: PDF Invoice Download

## 🎯 WHAT WAS FIXED

Added error handling and debugging for PDF invoice generation to identify why PDF is not downloading.

## 🔧 Changes Made

1. **Error Handling**: Wrapped `handlePrintInvoice` in try-catch
2. **Null Checks**: Added optional chaining for `currentUser` fields
3. **Debug Logs**: Added console.log statements to track PDF generation
4. **User Feedback**: Alert message if PDF generation fails

## 🧪 TESTING STEPS

### Test 1: Check Console for Errors

1. **Open Browser DevTools** (F12 or Right-click → Inspect)
2. **Go to Console tab**
3. **Login as Customer**
4. **Navigate to**: "Pesanan Saya"
5. **Click**: "View Invoice" on any transaction
6. **Click**: "🖨️ Cetak Invoice (PDF)"
7. **Watch Console** for these logs:

**Expected Success Logs:**
```
🖨️ Starting PDF generation for transaction: TRX12345678
📦 Transaction items: Array(3) [...]
💾 Saving PDF with filename: Invoice-TRX12345678-Nama-Bisnis.pdf
✅ PDF saved successfully!
```

**If Error Occurs:**
```
❌ Error generating PDF: [error message]
```

### Test 2: Check for Common Errors

**Error 1: "transaction.items is undefined"**
- **Cause**: Transaction tidak punya items array
- **Fix**: Reload transactions from database
- **Solution**: 
  ```javascript
  // Check if items exist
  console.log('Transaction:', transaction);
  console.log('Items:', transaction.items);
  ```

**Error 2: "Cannot read property 'name' of null"**
- **Cause**: currentUser is null
- **Status**: ✅ Already fixed with optional chaining
- **Should not occur** after latest update

**Error 3: "jsPDF is not defined"**
- **Cause**: Import issue
- **Check**: Ensure these imports exist at top of file:
  ```typescript
  import jsPDF from 'jspdf';
  import 'jspdf-autotable';
  ```

### Test 3: Manual PDF Test

If console shows no errors but PDF still doesn't download:

1. **Open Browser Console**
2. **Paste this test code**:
   ```javascript
   import('jspdf').then(({ default: jsPDF }) => {
     const doc = new jsPDF();
     doc.text('Test PDF', 10, 10);
     doc.save('test.pdf');
     console.log('Test PDF created');
   });
   ```
3. **Press Enter**
4. **Check if** `test.pdf` downloads
5. **If YES**: jsPDF is working, issue is in our code
6. **If NO**: Browser might be blocking downloads

### Test 4: Check Browser Download Settings

**Chrome:**
1. Settings → Privacy and security → Site Settings
2. Additional permissions → Automatic downloads
3. Ensure your site is **Allowed**

**Firefox:**
1. Settings → General → Downloads
2. Check "Always ask you where to save files" or "Save files to..."

**Edge:**
1. Settings → Downloads
2. Check download location
3. Ensure downloads are not blocked

### Test 5: Check Browser Console Errors

Look for these specific errors:

**Network Errors:**
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```
→ Ad blocker or security extension blocking download

**Security Errors:**
```
Download blocked by browser security policy
```
→ Check site permissions

**Font Errors:**
```
Cannot load font: helvetica
```
→ Should not block download, but might affect PDF appearance

### Test 6: Test with Different Transaction

1. **Try with booking transaction** (has booking_date)
2. **Try with shipping transaction** (has courierName)
3. **Try with simple transaction** (no special fields)

Each should generate PDF successfully.

### Test 7: Verify PDF Content

If PDF downloads successfully:

1. **Open the PDF file**
2. **Check sections present**:
   - ✅ Header with UMKM name
   - ✅ Invoice number (transaction code)
   - ✅ Date
   - ✅ Customer info (name, phone)
   - ✅ Items table
   - ✅ Total amount
   - ✅ Footer

3. **For booking transactions**, also check:
   - ✅ "Tanggal Booking: [date]" line
   - ✅ Red color for booking date

4. **For shipping transactions**, check:
   - ✅ Shipping address
   - ✅ Courier name

## 🐛 TROUBLESHOOTING

### Issue 1: Nothing happens when clicking button

**Check:**
1. Open Console → Check for JavaScript errors
2. Check if button has `onClick` handler
3. Verify `selectedTx` is not null

**Debug:**
```javascript
// In browser console, check:
console.log('Selected transaction:', selectedTx);
console.log('Handle function exists:', typeof handlePrintInvoice);
```

### Issue 2: Error "Cannot read property 'items'"

**Cause**: Transaction doesn't have items array

**Solution:**
1. Reload transactions: `const txs = await storageService.getTransactions()`
2. Check database: `SELECT * FROM transaction_items WHERE transaction_id = ?`
3. Verify mapping in `storage.ts` includes items

### Issue 3: PDF generates but is blank/corrupted

**Causes:**
- Font loading issue
- Data formatting issue
- Memory issue with large transactions

**Debug:**
```javascript
// Check data before PDF generation
console.log('Transaction:', transaction);
console.log('Items count:', transaction.items?.length);
console.log('Business name:', currentPreset.businessName);
```

### Issue 4: Download blocked by browser

**Symptoms:**
- Console shows "✅ PDF saved successfully!"
- But no download appears

**Solutions:**
1. Check browser download icon (top-right) → Might be in blocked downloads
2. Allow automatic downloads for this site
3. Temporarily disable ad blocker
4. Try different browser

### Issue 5: "jsPDF is not a constructor"

**Cause**: Import issue with jsPDF

**Fix:**
```typescript
// Ensure correct import at top of file:
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// NOT:
// import * as jsPDF from 'jspdf'; ❌
// const jsPDF = require('jspdf'); ❌
```

## 📝 EXPECTED BEHAVIOR AFTER FIX

### Successful PDF Generation:

1. **User clicks** "Cetak Invoice (PDF)"
2. **Console logs**:
   ```
   🖨️ Starting PDF generation for transaction: TRX...
   📦 Transaction items: [...]
   💾 Saving PDF with filename: Invoice-TRX...pdf
   ✅ PDF saved successfully!
   ```
3. **Browser downloads** PDF file
4. **Filename format**: `Invoice-TRX12345678-Nama-Bisnis.pdf`
5. **PDF opens** successfully with all content

### If Error Occurs:

1. **Console shows**: 
   ```
   ❌ Error generating PDF: [specific error]
   ```
2. **Alert pops up**: "Gagal membuat PDF: [error message]"
3. **User knows** what went wrong

## 🎓 DEVELOPER NOTES

### Code Structure:

```typescript
const handlePrintInvoice = (transaction: Transaction) => {
  try {
    // 1. Validation
    console.log('Starting...');
    if (!transaction.items) return;
    
    // 2. Initialize jsPDF
    const doc = new jsPDF();
    
    // 3. Build PDF content
    // - Header
    // - Info boxes
    // - Customer details
    // - Items table
    // - Total
    // - Footer
    
    // 4. Save PDF
    doc.save(filename);
    console.log('Success!');
    
  } catch (error) {
    // 5. Error handling
    console.error('Error:', error);
    alert('Failed: ' + error.message);
  }
};
```

### Debug Checklist:

- [ ] Console shows "Starting PDF generation"
- [ ] Console shows transaction items array
- [ ] No JavaScript errors in console
- [ ] Console shows "Saving PDF with filename"
- [ ] Console shows "PDF saved successfully"
- [ ] Browser download starts
- [ ] PDF file appears in downloads folder
- [ ] PDF opens without errors
- [ ] All content renders correctly

## ✅ SUCCESS CRITERIA

**PDF Generation is working when:**

1. ✅ Button click triggers function
2. ✅ Console logs appear in correct order
3. ✅ No JavaScript errors
4. ✅ Browser initiates download
5. ✅ PDF file downloads to computer
6. ✅ PDF opens successfully
7. ✅ All transaction data appears in PDF
8. ✅ Formatting is correct (tables, fonts, colors)
9. ✅ Booking date shows for booking transactions
10. ✅ Shipping info shows for shipping transactions

---

**Status**: ✅ Error handling added, ready for testing
**Date**: 2026-08-13
**Next**: Test in browser with DevTools Console open
**Priority**: 🔴 HIGH (User-facing feature)
