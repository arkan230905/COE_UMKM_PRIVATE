/**
 * QUICK RESET SCRIPT - SIUPIN Database Cleaner
 * 
 * CARA PENGGUNAAN:
 * 1. Buka aplikasi di http://localhost:3000
 * 2. Tekan F12 untuk buka Developer Tools
 * 3. Pergi ke tab "Console"
 * 4. Copy-paste SELURUH isi file ini ke console
 * 5. Tekan Enter
 * 6. Halaman akan otomatis refresh dengan database bersih
 */

(function() {
    console.clear();
    console.log('%c🗑️ SIUPIN DATABASE RESET TOOL', 'background: #ef4444; color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
    console.log('');
    
    // Confirm
    const confirmed = confirm(
        '⚠️ RESET DATABASE SIUPIN\n\n' +
        'Script ini akan menghapus SEMUA data di localStorage:\n\n' +
        '• Transaksi & Invoice\n' +
        '• Kategori & Produk\n' +
        '• Pelanggan\n' +
        '• Pengeluaran & Pendapatan\n' +
        '• Pengaturan UMKM\n\n' +
        'Data yang dihapus TIDAK DAPAT dikembalikan!\n\n' +
        'Klik OK untuk melanjutkan.'
    );

    if (!confirmed) {
        console.log('%c❌ Reset dibatalkan', 'color: #f59e0b; font-weight: bold;');
        return;
    }

    console.log('');
    console.log('%c📊 DATA SEBELUM RESET:', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
    
    // Show current data
    const keys = Object.keys(localStorage);
    console.log(`Total items: ${keys.length}`);
    console.log(`Total size: ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`);
    console.log('');
    console.log('Items:');
    keys.forEach((key, index) => {
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        console.log(`  ${index + 1}. ${key} (${size} bytes)`);
    });

    console.log('');
    console.log('%c🔥 MEMULAI PENGHAPUSAN...', 'color: #ef4444; font-weight: bold; font-size: 14px;');
    console.log('');

    // Clear all
    const deletedCount = keys.length;
    localStorage.clear();

    console.log('');
    console.log('%c✓ DATABASE BERHASIL DIRESET!', 'background: #10b981; color: white; font-size: 16px; font-weight: bold; padding: 8px 15px; border-radius: 5px;');
    console.log('');
    console.log('%c📊 DATA SETELAH RESET:', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
    
    const remainingKeys = Object.keys(localStorage);
    console.log(`Total items: ${remainingKeys.length}`);
    console.log(`Items deleted: ${deletedCount}`);
    console.log('');

    if (remainingKeys.length === 0) {
        console.log('%c✓ Database kosong - Reset berhasil 100%!', 'color: #10b981; font-weight: bold;');
    } else {
        console.log('%c⚠️ Masih ada data tersisa:', 'color: #f59e0b; font-weight: bold;');
        remainingKeys.forEach(key => {
            console.log(`  - ${key}`);
        });
    }

    console.log('');
    console.log('%c🔄 Refresh halaman dalam 2 detik...', 'color: #6366f1; font-weight: bold;');
    
    // Show alert
    alert('✓ Database berhasil di-reset!\n\nHalaman akan di-refresh untuk memuat data bersih.');

    // Refresh page
    setTimeout(() => {
        location.reload();
    }, 2000);
})();
