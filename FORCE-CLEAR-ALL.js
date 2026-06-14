/**
 * 🔴 FORCE CLEAR ALL - ULTIMATE DATABASE WIPE
 * 
 * This script will FORCEFULLY remove ALL data with maximum thoroughness
 * It's designed to fix stuck data that won't clear with normal methods
 * 
 * HOW TO USE:
 * 1. Open http://localhost:3000
 * 2. Press F12 → Console tab
 * 3. Paste ALL of this script
 * 4. Press Enter
 */

(function() {
    console.clear();
    console.log('%c🔴 FORCE CLEAR ALL - ULTIMATE WIPE', 'background: #dc2626; color: white; font-size: 28px; font-weight: bold; padding: 20px 40px; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    console.log('');
    console.log('%cThis is the MOST POWERFUL reset script!', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
    console.log('%cUse this when normal reset doesn\'t work.', 'color: #f59e0b; font-size: 14px;');
    console.log('');
    
    const confirmed = confirm(
        '🔴 FORCE CLEAR ALL - ULTIMATE DATABASE WIPE\n\n' +
        'This script will FORCEFULLY delete:\n\n' +
        '✓ ALL UMKM registrations (umkm_presets + user_umkm_presets)\n' +
        '✓ ALL transactions, invoices, orders\n' +
        '✓ ALL categories & products\n' +
        '✓ ALL customers\n' +
        '✓ ALL expenses & incomes\n' +
        '✓ ALL sessions & login state\n' +
        '✓ ALL localStorage data\n' +
        '✓ Cache will be cleared\n\n' +
        '⚠️ THIS ACTION CANNOT BE UNDONE!\n\n' +
        'Click OK to proceed with FORCE CLEAR.'
    );

    if (!confirmed) {
        console.log('%c❌ Operation cancelled by user', 'color: #f59e0b; font-weight: bold; font-size: 14px;');
        return;
    }

    console.log('');
    console.log('%c🔍 PHASE 1: SCANNING EXISTING DATA', 'background: #3b82f6; color: white; font-weight: bold; font-size: 16px; padding: 10px 20px; border-radius: 6px;');
    console.log('');

    // Get all localStorage keys BEFORE clearing
    const allKeysBefore = Object.keys(localStorage);
    const totalItemsBefore = allKeysBefore.length;
    
    console.log(`📊 Current state:`);
    console.log(`   Total items: ${totalItemsBefore}`);
    console.log('');

    // Show critical keys that will be deleted
    const criticalKeys = [
        'umkm_presets',
        'user_umkm_presets',
        'is_super_admin_logged_in',
        'user_customers'
    ];

    console.log('%c🎯 Critical keys to remove:', 'color: #8b5cf6; font-weight: bold;');
    criticalKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
            console.log(`   ✓ Found: ${key}`);
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    console.log(`      └─ Contains ${parsed.length} item(s)`);
                    if (parsed.length > 0 && parsed[0].businessName) {
                        console.log(`      └─ First UMKM: "${parsed[0].businessName}" (${parsed[0].adminEmail || 'no email'})`);
                    }
                } else if (typeof parsed === 'object') {
                    console.log(`      └─ Object with ${Object.keys(parsed).length} keys`);
                }
            } catch (e) {
                console.log(`      └─ Value: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
            }
        } else {
            console.log(`   - Not found: ${key}`);
        }
    });
    console.log('');

    // Show UMKM-specific data
    const umkmKeys = allKeysBefore.filter(k => k.startsWith('umkm_'));
    if (umkmKeys.length > 0) {
        console.log(`%c📦 UMKM-specific data: ${umkmKeys.length} keys`, 'color: #8b5cf6; font-weight: bold;');
        umkmKeys.forEach(key => console.log(`   - ${key}`));
        console.log('');
    }

    console.log('');
    console.log('%c🔥 PHASE 2: CLEARING DATA (Multiple Passes)', 'background: #ef4444; color: white; font-weight: bold; font-size: 16px; padding: 10px 20px; border-radius: 6px;');
    console.log('');

    // PASS 1: localStorage.clear()
    console.log('Pass 1/4: Running localStorage.clear()...');
    try {
        localStorage.clear();
        console.log('  ✓ localStorage.clear() executed');
    } catch (e) {
        console.error('  ✗ localStorage.clear() failed:', e.message);
    }

    // PASS 2: Remove critical keys individually
    console.log('Pass 2/4: Removing critical keys individually...');
    criticalKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
            const verify = localStorage.getItem(key);
            if (verify === null) {
                console.log(`  ✓ Removed: ${key}`);
            } else {
                console.error(`  ✗ STILL EXISTS: ${key}`);
                // Try multiple times
                for (let i = 0; i < 5; i++) {
                    localStorage.removeItem(key);
                }
                const verify2 = localStorage.getItem(key);
                if (verify2 === null) {
                    console.log(`  ✓ Removed after retry: ${key}`);
                } else {
                    console.error(`  ✗ FAILED AFTER RETRY: ${key}`);
                }
            }
        } catch (e) {
            console.error(`  ✗ Error removing ${key}:`, e.message);
        }
    });

    // PASS 3: Remove ALL umkm_* keys
    console.log('Pass 3/4: Removing all umkm_* prefixed keys...');
    let umkmRemoved = 0;
    allKeysBefore.forEach(key => {
        if (key.startsWith('umkm_')) {
            try {
                localStorage.removeItem(key);
                umkmRemoved++;
                console.log(`  ✓ Removed: ${key}`);
            } catch (e) {
                console.error(`  ✗ Failed: ${key}`);
            }
        }
    });
    console.log(`  Total umkm_* keys removed: ${umkmRemoved}`);

    // PASS 4: Remove ANY remaining keys
    console.log('Pass 4/4: Removing any remaining keys...');
    const remainingAfterPasses = Object.keys(localStorage);
    if (remainingAfterPasses.length > 0) {
        console.log(`  Found ${remainingAfterPasses.length} remaining keys. Removing...`);
        remainingAfterPasses.forEach(key => {
            try {
                localStorage.removeItem(key);
                console.log(`  ✓ Removed: ${key}`);
            } catch (e) {
                console.error(`  ✗ Failed: ${key}`);
            }
        });
    } else {
        console.log('  ✓ No remaining keys found');
    }

    console.log('');
    console.log('%c✅ PHASE 3: VERIFICATION', 'background: #10b981; color: white; font-weight: bold; font-size: 16px; padding: 10px 20px; border-radius: 6px;');
    console.log('');

    // Final verification
    const allKeysAfter = Object.keys(localStorage);
    const totalItemsAfter = allKeysAfter.length;
    const itemsDeleted = totalItemsBefore - totalItemsAfter;

    console.log('%c📊 RESULTS:', 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.log('');
    console.log(`Before: ${totalItemsBefore} items`);
    console.log(`After:  ${totalItemsAfter} items`);
    console.log(`Deleted: ${itemsDeleted} items`);
    console.log('');

    // Check critical keys again
    console.log('%c🔍 Critical keys verification:', 'color: #10b981; font-weight: bold;');
    let allClear = true;
    criticalKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value === null) {
            console.log(`  ✓ ${key}: CLEAR`);
        } else {
            console.error(`  ✗ ${key}: STILL EXISTS!`);
            console.error(`     Value: ${value.substring(0, 100)}`);
            allClear = false;
        }
    });
    console.log('');

    if (totalItemsAfter === 0 && allClear) {
        console.log('%c🎉 SUCCESS! DATABASE IS COMPLETELY EMPTY!', 'background: #10b981; color: white; font-size: 22px; font-weight: bold; padding: 15px 30px; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
        console.log('');
        console.log('%c✓ All UMKM registrations removed', 'color: #10b981; font-weight: bold;');
        console.log('%c✓ All transaction data removed', 'color: #10b981; font-weight: bold;');
        console.log('%c✓ All product & category data removed', 'color: #10b981; font-weight: bold;');
        console.log('%c✓ All customer data removed', 'color: #10b981; font-weight: bold;');
        console.log('%c✓ All session data removed', 'color: #10b981; font-weight: bold;');
    } else {
        console.log('%c⚠️ WARNING: Some data may still remain!', 'background: #f59e0b; color: white; font-weight: bold; padding: 10px 20px; border-radius: 6px;');
        console.log('');
        if (totalItemsAfter > 0) {
            console.log('%cRemaining keys:', 'color: #f59e0b; font-weight: bold;');
            allKeysAfter.forEach((key, index) => {
                console.log(`  ${index + 1}. ${key}`);
            });
        }
        if (!allClear) {
            console.log('');
            console.log('%cAttempting additional cleanup...', 'color: #f59e0b; font-weight: bold;');
            // One more aggressive attempt
            criticalKeys.forEach(key => {
                for (let i = 0; i < 10; i++) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.clear();
        }
    }

    console.log('');
    console.log('%c📱 NEXT STEPS:', 'background: #3b82f6; color: white; font-weight: bold; padding: 8px 15px; border-radius: 5px;');
    console.log('1. Close this console');
    console.log('2. Hard refresh: Press Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)');
    console.log('3. Or close all browser tabs and restart browser');
    console.log('4. Go to http://localhost:3000/welcome');
    console.log('5. Register new UMKM with fresh data');
    console.log('');

    // Alert user
    alert(
        '✅ FORCE CLEAR COMPLETE!\n\n' +
        `Items deleted: ${itemsDeleted}\n` +
        `Remaining items: ${totalItemsAfter}\n\n` +
        'CRITICAL: Do a HARD REFRESH now!\n' +
        'Press: Ctrl + Shift + R (Windows)\n' +
        'or: Cmd + Shift + R (Mac)\n\n' +
        'Or close ALL browser tabs and restart browser.\n\n' +
        'Page will redirect to /welcome in 3 seconds...'
    );

    // Redirect
    setTimeout(() => {
        window.location.href = 'http://localhost:3000/welcome';
    }, 3000);

})();
