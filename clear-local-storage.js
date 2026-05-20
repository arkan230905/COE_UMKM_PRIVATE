// Run this script in the browser console to clear all seeded data from localStorage
// This will remove all categories, products, transactions, expenses, and incomes data

console.log('Clearing localStorage seeded data...');

// Clear all UMKM-related data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.startsWith('umkm_') || key === 'user_customers' || key === 'user_umkm_presets')) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => localStorage.removeItem(key));

console.log(`Cleared ${keysToRemove.length} items from localStorage:`);
console.log(keysToRemove);

// Optional: Clear everything
// localStorage.clear();

console.log('Done! Refresh the page to start with clean data.');
