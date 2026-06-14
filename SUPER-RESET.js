/**
 * ⚡ SUPER RESET - COMPLETE DATABASE WIPE
 * 
 * Script ini akan menghapus SEMUA data dengan sangat menyeluruh
 * 
 * CARA PAKAI:
 * 1. Buka http://localhost:3000
 * 2. Tekan F12 → Tab Console
 * 3. Paste SEMUA script ini
 * 4. Tekan Enter
 */

(function() {
    console.clear();
    console.log('%c⚡ SUPER RESET - COMPLETE WIPE', 'background: #dc2626; color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 8px;');
    console.log('');
    
    const confirmed = confirm(
        '⚡ SUPER RESET - COMPLETE DATABASE WIPE\n\n' +
        'Script ini akan menghapus SEMUA data termasuk:\n\n' +
        '✓ Semua UMKM yang terdaftar\n' +
        '✓ Semua transaksi & invoice\n' +
        '✓ Semua kategori & produk\n' +
        '✓ Semua pelanggan\n' +
        '✓ Semua pengeluaran & pendapatan\n' +
        '✓ Session & login state\n' +
        '✓ Semua pengaturan\n\n' +
        'DATA TIDAK DAPAT DIKEMBALIKAN!\n\n' +
        'Klik OK untuk melanjutkan.'
    );

    if (!confirmed) {
        console.log('%c❌ Reset dibatalkan', 'color: #f59e0b; font-weight: bold; font-size: 14px;');
        return;
    }

    console.log('');
    console.log('%c📊 SCANNING CURRENT DATA...', 'color: #3b82f6; font-weight: bold; font-size: 16px;');
    console.log('');

    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    const totalItems = allKeys.length;
    const totalSize = JSON.stringify(localStorage).length;
    const sizeMB = (totalSize / 1024 / 1024).toFixed(3);

    console.log(`📦 Total Items: ${totalItems}`);
    console.log(`💾 Total Size: ${sizeMB} MB (${totalSize} bytes)`);
    console.log('');

    // Categorize keys
    const keyCategories = {
        umkm: [],
        transactions: [],
        products: [],
        categories: [],
        customers: [],
        expenses: [],
        incomes: [],
        session: [],
        other: []
    };

    allKeys.forEach(key => {
        if (key.includes('umkm') || key.includes('preset')) {
            keyCategories.umkm.push(key);
        } else if (key.includes('transaction')) {
            keyCategories.transactions.push(key);
        } else if (key.includes('product')) {
            keyCategories.products.push(key);
        } else if (key.includes('categor')) {
            keyCategories.categories.push(key);
        } else if (key.includes('customer')) {
            keyCategories.customers.push(key);
        } else if (key.includes('expense')) {
            keyCategories.expenses.push(key);
        } else if (key.includes('income')) {
            keyCategories.incomes.push(key);
        } else if (key.includes('login') || key.includes('session') || key.includes('auth')) {
            keyCategories.session.push(key);
        } else {
            keyCategories.other.push(key);
        }
    });

    console.log('%c📋 DATA BREAKDOWN:', 'color: #6366f1; font-weight: bold; font-size: 14px;');
    console.log('');

    Object.entries(keyCategories).forEach(([category, keys]) => {
        if (keys.length > 0) {
            console.log(`%c${category.toUpperCase()}:`, 'color: #8b5cf6; font-weight: bold;');
            keys.forEach((key, index) => {
                const value = localStorage.getItem(key);
                const size = value ? value.length : 0;
                console.log(`  ${index + 1}. ${key}`);
                console.log(`     └─ Size: ${size} bytes`);
                
                // Show preview of critical data
                if (key.includes('preset') || key.includes('umkm')) {
                    try {
                        const parsed = JSON.parse(value || '[]');
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`     └─ Count: ${parsed.length} item(s)`);
                            parsed.forEach((item, i) => {
                                if (item.businessName) {
                                    console.log(`        ${i + 1}. ${item.businessName} (${item.adminEmail || 'no email'})`);
                                }
                            });
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }
            });
            console.log('');
        }
    });

    console.log('');
    console.log('%c🔥 STARTING COMPLETE WIPE...', 'background: #ef4444; color: white; font-weight: bold; font-size: 16px; padding: 8px 15px; border-radius: 5px;');
    console.log('');

    // Step 1: Clear all localStorage
    console.log('Step 1/4: Clearing localStorage...');
    localStorage.clear();
    console.log('  ✓ localStorage.clear() executed');

    // Step 2: Force remove specific keys (just in case)
    console.log('Step 2/4: Force removing critical keys...');
    const criticalKeys = [
        'umkm_presets',
        'user_umkm_presets', 
        'is_super_admin_logged_in',
        'user_customers',
        'remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d'
    ];
    
    let removedCount = 0;
    criticalKeys.forEach(key => {
        try {
            const before = localStorage.getItem(key);
            localStorage.removeItem(key);
            const after = localStorage.getItem(key);
            if (before !== null && after === null) {
                console.log(`  ✓ Successfully removed: ${key}`);
                removedCount++;
            } else if (before === null) {
                console.log(`  - Key already empty: ${key}`);
            } else {
                console.warn(`  ⚠️ Failed to remove: ${key} (still exists)`);
            }
        } catch (e) {
            console.warn(`  ✗ Error removing: ${key} - ${e.message}`);
        }
    });
    console.log(`  Total critical keys removed: ${removedCount}/${criticalKeys.length}`);

    // Step 3: Clear all UMKM-specific data
    console.log('Step 3/4: Clearing UMKM-specific data...');
    allKeys.forEach(key => {
        if (key.startsWith('umkm_')) {
            try {
                localStorage.removeItem(key);
                console.log(`  ✓ Removed: ${key}`);
            } catch (e) {
                // Silent
            }
        }
    });

    // Step 4: Verify clean state
    console.log('Step 4/4: Verifying clean state...');
    const remainingKeys = Object.keys(localStorage);
    
    console.log('');
    console.log('%c📊 FINAL STATE:', 'color: #10b981; font-weight: bold; font-size: 16px;');
    console.log('');
    console.log(`Remaining items: ${remainingKeys.length}`);
    console.log(`Items deleted: ${totalItems}`);
    console.log(`Space freed: ${sizeMB} MB`);
    console.log('');

    if (remainingKeys.length === 0) {
        console.log('%c✓ PERFECT! Database is completely empty!', 'background: #10b981; color: white; font-size: 18px; font-weight: bold; padding: 12px 20px; border-radius: 8px;');
    } else {
        console.log('%c⚠️ WARNING: Some items remain!', 'background: #f59e0b; color: white; font-weight: bold; padding: 8px 15px; border-radius: 5px;');
        console.log('');
        remainingKeys.forEach((key, index) => {
            console.log(`  ${index + 1}. ${key}`);
        });
        console.log('');
        console.log('Attempting to remove remaining items...');
        remainingKeys.forEach(key => {
            try {
                localStorage.removeItem(key);
                console.log(`  ✓ Removed: ${key}`);
            } catch (e) {
                console.error(`  ✗ Failed: ${key}`);
            }
        });
    }

    console.log('');
    console.log('%c🎉 SUPER RESET COMPLETE!', 'background: #10b981; color: white; font-size: 20px; font-weight: bold; padding: 15px 30px; border-radius: 8px;');
    console.log('');
    console.log('%c📌 NEXT STEPS:', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
    console.log('1. Halaman akan redirect ke /welcome');
    console.log('2. Anda akan melihat halaman kosong');
    console.log('3. Daftarkan UMKM baru');
    console.log('4. Mulai testing dengan data bersih');
    console.log('');

    // Show confirmation alert
    alert(
        '✓ SUPER RESET BERHASIL!\n\n' +
        `Total data dihapus: ${totalItems} item\n` +
        `Space dibebaskan: ${sizeMB} MB\n\n` +
        'Halaman akan di-refresh ke /welcome dalam 2 detik...'
    );

    // Redirect to welcome page
    setTimeout(() => {
        window.location.href = 'http://localhost:3000/welcome';
    }, 2000);

})();
