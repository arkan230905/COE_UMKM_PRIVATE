import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import AdminCategories from './components/AdminCategories';
import AdminProducts from './components/AdminProducts';
import AdminTransactions from './components/AdminTransactions';
import AdminCustomers from './components/AdminCustomers';
import AdminExpenses from './components/AdminExpenses';
import AdminFinancialReport from './components/AdminFinancialReport';
import CustomerCatalog from './components/CustomerCatalog';
import CustomerOrders from './components/CustomerOrders';
import SuperAdminWelcome from './components/SuperAdminWelcome';
import AdminShipping from './components/AdminShipping';
import CashierPOS from './components/CashierPOS';
import AdminUMKMData from './components/AdminUMKMData';

import {
  Category,
  Product,
  Transaction,
  Expense,
  IncomeRecord,
  UMKMPreset,
  User,
  Customer,
  CartItem
} from './types';

import storageService from './services/storage';

import { Settings, Shield, Store, HelpCircle, Laptop, Landmark, Receipt, Info, AlertCircle, Trash } from 'lucide-react';

export default function App() {
  // Roles supported: super_admin, customer, or kasir
  const [role, setRole] = useState<'super_admin' | 'customer' | 'kasir'>('super_admin');
  
  // Super Admin Logged in multi-tenant context
  const [isSuperAdminLoggedIn, setIsSuperAdminLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('is_super_admin_logged_in');
    return stored === 'true'; // persists login state for smoother previewing
  });

  useEffect(() => {
    localStorage.setItem('is_super_admin_logged_in', String(isSuperAdminLoggedIn));
  }, [isSuperAdminLoggedIn]);

  // Preferences states - Load dark mode from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState('dashboard');

  const [currentPreset, setCurrentPreset] = useState<UMKMPreset>(() => {
    // Don't auto-select any preset - use default placeholder for UI rendering
    return {
      id: 'placeholder',
      umkmCode: 'PLACEHOLDER',
      businessName: 'Sistem UMKM Pintar',
      industry: 'Multi-Tenant',
      logoText: 'UMKM',
      primaryColor: '#4f46e5',
      accentColor: '#818cf8',
      currency: 'Rp',
      phone: '0000-0000-0000',
      address: 'Default Address',
      adminName: 'Admin',
      adminEmail: 'admin@umkm.com',
    };
  });

  // App Master Database structures - ALL FROM DATABASE!
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  
  // Manage customer users in state
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  
  // Manage all registered UMKM presets - FROM DATABASE!
  const [allPresets, setAllPresets] = useState<UMKMPreset[]>([]);
  
  // Load all UMKM presets from database on mount
  useEffect(() => {
    loadAllDataFromDatabase();
  }, []);

  // Load data when currentPreset changes
  useEffect(() => {
    if (currentPreset.id !== 'placeholder' && isSuperAdminLoggedIn) {
      loadPresetDataFromDatabase();
    }
  }, [currentPreset.id, isSuperAdminLoggedIn]);

  const loadAllDataFromDatabase = async () => {
    try {
      console.log('🔄 Loading UMKM presets from database...');
      const presets = await storageService.getUmkmPresets();
      setAllPresets(presets);
      console.log('✅ Loaded', presets.length, 'UMKM presets from database');
    } catch (error) {
      console.error('❌ Error loading UMKM presets:', error);
    }
  };

  const loadPresetDataFromDatabase = async () => {
    try {
      console.log('🔄 Loading data for UMKM:', currentPreset.umkmCode);
      
      // Load all data from database
      const [cats, prods, custs, exps, trans] = await Promise.all([
        storageService.getCategories(),
        storageService.getProducts(),
        storageService.getCustomers(),
        storageService.getExpenses(),
        storageService.getTransactions()
      ]);

      setCategories(cats);
      setProducts(prods);
      setAllCustomers(custs);
      setExpenses(exps);
      setTransactions(trans);
      
      console.log('✅ Data loaded:', {
        categories: cats.length,
        products: prods.length,
        customers: custs.length,
        expenses: exps.length,
        transactions: trans.length
      });
    } catch (error) {
      console.error('❌ Error loading preset data:', error);
    }
  };
  
  // Logged in customer user context (starts as null / guest!)
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);

  // Customer Shopping basket
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpenCart, setIsOpenCart] = useState(false);

  // Modals management
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isOpenHelp, setIsOpenHelp] = useState(false);
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Settings modal dynamic tab
  const [settingsTab, setSettingsTab] = useState<'profile' | 'register' | 'data'>('profile');
  
  // New UMKM Registration form inputs
  const [regUMKMName, setRegUMKMName] = useState('');
  const [regUMKMIndustry, setRegUMKMIndustry] = useState('Kesehatan & Alat Medis');
  const [regUMKMPhone, setRegUMKMPhone] = useState('');
  const [regUMKMAddress, setRegUMKMAddress] = useState('');
  const [regUMKMColor, setRegUMKMColor] = useState('#4f46e5'); // Indigo default

  // NO MORE localStorage sync - all data from database!

  // Client-Side Routing logic matching requested patterns in prompt
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      if (path === '/welcome') {
        setIsSuperAdminLoggedIn(false);
        return;
      }
      const adminMatch = path.match(/^\/admin\/([^/]+)\/([^/]+)/i);
      const customerMatch = path.match(/^\/([^/]+)\/pelanggan\/(cattalog|catalog|order-history|riwayat-pesanan)/i);
      const kasirMatch = path.match(/^\/kasir\/([^/]+)/i);
      
      let matchedPreset: UMKMPreset | null = null;
      let matchedRole: 'super_admin' | 'customer' | 'kasir' = 'super_admin';
      let matchedTab = 'dashboard';
      
      if (adminMatch) {
        const slug = adminMatch[1];
        const tab = adminMatch[2];
        matchedRole = 'super_admin';
        matchedTab = tab === 'pantau-cattlog' ? 'pantau-catalog' : tab;
        matchedPreset = allPresets.find(p => p.businessName.trim().toUpperCase().replace(/\s+/g, '-') === slug) || null;
      } else if (customerMatch) {
        const slug = customerMatch[1];
        const tab = customerMatch[2];
        matchedRole = 'customer';
        matchedTab = (tab === 'cattalog' || tab === 'catalog') ? 'catalog' : 'order-history';
        matchedPreset = allPresets.find(p => p.businessName.trim().toUpperCase().replace(/\s+/g, '-') === slug) || null;
      } else if (kasirMatch) {
        const slug = kasirMatch[1];
        matchedRole = 'kasir';
        matchedPreset = allPresets.find(p => p.businessName.trim().toUpperCase().replace(/\s+/g, '-') === slug) || null;
      }
      
      if (matchedPreset) {
        setCurrentPreset(matchedPreset);
        setRole(matchedRole);
        setActiveTab(matchedTab);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, [allPresets]);

  useEffect(() => {
    if (!isSuperAdminLoggedIn) {
      if (window.location.pathname !== '/welcome') {
        window.history.pushState(null, '', '/welcome');
      }
      return;
    }
    const slug = currentPreset.businessName.trim().toUpperCase().replace(/\s+/g, '-');
    let path = '';
    if (role === 'kasir') {
      path = `/kasir/${slug}`;
    } else if (role === 'super_admin') {
      const displayTab = activeTab === 'pantau-catalog' ? 'pantau-cattlog' : activeTab;
      path = `/admin/${slug}/${displayTab}`;
    } else {
      const displayTab = activeTab === 'order-history' ? 'order-history' : 'cattalog';
      path = `/${slug}/pelanggan/${displayTab}`;
    }
    
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [role, currentPreset, activeTab, isSuperAdminLoggedIn]);

  // Load state from localStorage on initial boot or preset switch
  // NOTE: No fallback to mock data - starts empty for real UMKM data
  useEffect(() => {
    if (currentPreset.id === 'placeholder') {
      setCategories([]);
      setProducts([]);
      setExpenses([]);
      setTransactions([]);
      setIncomes([]);
      setCart([]);
      return;
    }
    
    const keyPrefix = `umkm_${currentPreset.id}_`;
    
    const storedCats = localStorage.getItem(`${keyPrefix}categories`);
    const storedProds = localStorage.getItem(`${keyPrefix}products`);
    const storedExp = localStorage.getItem(`${keyPrefix}expenses`);
    const storedTx = localStorage.getItem(`${keyPrefix}transactions`);
    const storedInc = localStorage.getItem(`${keyPrefix}incomes`);
    const storedCust = localStorage.getItem(`${keyPrefix}customers`);

    if (storedCats) setCategories(JSON.parse(storedCats));
    else setCategories([]);

    if (storedProds) {
      const parsedProducts = JSON.parse(storedProds);
      console.log('Products loaded from localStorage:', parsedProducts);
      setProducts(parsedProducts);
    }
    else setProducts([]);

    if (storedExp) setExpenses(JSON.parse(storedExp));
    else setExpenses([]);

    if (storedTx) setTransactions(JSON.parse(storedTx));
    else setTransactions([]);

    if (storedInc) setIncomes(JSON.parse(storedInc));
    else setIncomes([]);

    if (storedCust) {
      const parsedCustomers = JSON.parse(storedCust);
      setAllCustomers(parsedCustomers);
    }
    else setAllCustomers([]);

    // Clear client shopping basket on preset shift
    setCart([]);
  }, [currentPreset]);

  // Sync state mutations to localStorage
  useEffect(() => {
    if (currentPreset.id !== 'placeholder') {
      localStorage.setItem(`umkm_${currentPreset.id}_categories`, JSON.stringify(categories));
    }
  }, [categories, currentPreset]);

  useEffect(() => {
    if (currentPreset.id !== 'placeholder') {
      try {
        const productsJson = JSON.stringify(products);
        const sizeKB = new Blob([productsJson]).size / 1024;
        console.log(`Products array size: ${sizeKB.toFixed(2)} KB`);
        
        if (sizeKB > 4000) {
          console.warn('⚠️ Products data is very large (>4MB). Consider reducing image sizes.');
        }
        
        localStorage.setItem(`umkm_${currentPreset.id}_products`, productsJson);
        console.log('✓ Products saved to localStorage:', products.length, 'items');
      } catch (error) {
        console.error('❌ Error saving products to localStorage:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          alert('PERINGATAN: Penyimpanan penuh!\n\nData produk terlalu besar (mungkin karena image).\n\nSolusi:\n1. Hapus beberapa produk\n2. Gunakan image yang lebih kecil\n3. Gunakan URL image eksternal');
        }
      }
    }
  }, [products, currentPreset]);

  useEffect(() => {
    if (currentPreset.id !== 'placeholder') {
      localStorage.setItem(`umkm_${currentPreset.id}_expenses`, JSON.stringify(expenses));
    }
  }, [expenses, currentPreset]);

  useEffect(() => {
    if (currentPreset.id !== 'placeholder') {
      localStorage.setItem(`umkm_${currentPreset.id}_transactions`, JSON.stringify(transactions));
    }
  }, [transactions, currentPreset]);

  useEffect(() => {
    if (currentPreset.id !== 'placeholder') {
      localStorage.setItem(`umkm_${currentPreset.id}_incomes`, JSON.stringify(incomes));
    }
  }, [incomes, currentPreset]);

  useEffect(() => {
    if (currentPreset.id !== 'placeholder') {
      // All customer data now saved to database automatically
      console.log('✅ Customer data will be saved to database');
    }
  }, [allCustomers, currentPreset]);

  // Switch presets gracefully
  const handleSwitchPreset = (presetId: string) => {
    const target = allPresets.find(p => p.id === presetId);
    if (target) {
      setCurrentPreset(target);
      // Switch active tab based on active role
      setActiveTab(role === 'super_admin' ? 'dashboard' : 'catalog');
      setIsOpenSettings(false);
    }
  };

  // Render proper sub-views based on selected Tab
  const renderActiveContent = () => {
    if (role === 'customer') {
      if (activeTab === 'order-history') {
        if (!currentUser) {
          return (
            <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 shadow-md font-medium animate-fade-in relative border-t-4" style={{ borderTopColor: currentPreset.primaryColor }}>
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mx-auto text-lg font-bold">👤</div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Riwayat Pesanan Terkunci</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">Silakan masuk atau daftarkan akun pembeli terlebih dahulu untuk menautkan dan melacak kondisi kiriman barang pesanan Anda.</p>
              </div>
              <button
                onClick={() => {
                  setAuthTab('login');
                  setIsOpenAuthModal(true);
                }}
                className="px-4 py-2.5 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer block w-full transition hover:scale-[1.01]"
                style={{ backgroundColor: currentPreset.primaryColor }}
              >
                Masuk / Daftar Akun
              </button>
            </div>
          );
        }
        return (
          <CustomerOrders
            transactions={transactions}
            setTransactions={setTransactions}
            currentUser={currentUser}
            currentPreset={currentPreset}
          />
        );
      }
      return (
        <CustomerCatalog
          products={products}
          setProducts={setProducts}
          categories={categories}
          currentPreset={currentPreset}
          currentUser={currentUser}
          transactions={transactions}
          setTransactions={setTransactions}
          cart={cart}
          setCart={setCart}
          setActiveTab={setActiveTab}
          isOpenCart={isOpenCart}
          setIsOpenCart={setIsOpenCart}
          onRequestLogin={() => {
            setAuthTab('login');
            setIsOpenAuthModal(true);
          }}
        />
      );
    }

    if (role === 'super_admin' && !isSuperAdminLoggedIn) {
      return (
        <SuperAdminWelcome
          allPresets={allPresets}
          setAllPresets={setAllPresets}
          currentPreset={currentPreset}
          setCurrentPreset={setCurrentPreset}
          setIsSuperAdminLoggedIn={setIsSuperAdminLoggedIn}
          setCategories={setCategories}
          setProducts={setProducts}
          setRole={setRole}
        />
      );
    }

    // Admin Views
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            transactions={transactions}
            products={products}
            categories={categories}
            customers={allCustomers}
            expenses={expenses}
            currentPreset={currentPreset}
          />
        );
      case 'categories':
        return (
          <AdminCategories
            categories={categories}
            setCategories={setCategories}
            currentPreset={currentPreset}
          />
        );
      case 'products':
        return (
          <AdminProducts
            products={products}
            setProducts={setProducts}
            categories={categories}
            currentPreset={currentPreset}
          />
        );
      case 'pantau-catalog':
        return (
          <CustomerCatalog
            products={products}
            setProducts={setProducts}
            categories={categories}
            currentPreset={currentPreset}
            currentUser={null}
            transactions={transactions}
            setTransactions={setTransactions}
            cart={[]}
            setCart={() => {}}
            setActiveTab={() => {}}
            isAdminPreview={true}
          />
        );
      case 'transactions':
        return (
          <AdminTransactions
            transactions={transactions}
            setTransactions={setTransactions}
            customers={allCustomers}
            products={products}
            currentPreset={currentPreset}
          />
        );
      case 'shipping-tracking':
        return (
          <AdminShipping
            transactions={transactions}
            setTransactions={setTransactions}
            customers={allCustomers}
            currentPreset={currentPreset}
          />
        );
      case 'umkm-data':
        return (
          <AdminUMKMData
            allPresets={allPresets}
            currentPreset={currentPreset}
          />
        );
      case 'customers':
        return (
          <AdminCustomers
            customers={allCustomers.filter(c => !c.umkmId || c.umkmId === currentPreset.id)}
            transactions={transactions}
            currentPreset={currentPreset}
          />
        );
      case 'expenses':
        return (
          <AdminExpenses
            expenses={expenses}
            setExpenses={setExpenses}
            currentPreset={currentPreset}
          />
        );
      case 'financial-report':
        return (
          <AdminFinancialReport
            transactions={transactions}
            expenses={expenses}
            incomes={incomes}
            setIncomes={setIncomes}
            currentPreset={currentPreset}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500 font-medium select-none">
            Fitur dalam tahap penyelesaian.
          </div>
        );
    }
  };

  // Edit current profile parameters manually
  const updatePresetDetails = (name: string, currency: string, phone: string, address: string, industry?: string, adminEmail?: string) => {
    // Check if email already exists in other UMKMs (excluding current preset)
    if (adminEmail && adminEmail.trim()) {
      const emailConflict = allPresets.find(p => 
        p.id !== currentPreset.id && 
        p.adminEmail?.trim().toLowerCase() === adminEmail.trim().toLowerCase()
      );
      if (emailConflict) {
        alert(`Email "${adminEmail}" sudah terdaftar untuk UMKM "${emailConflict.businessName}". Setiap admin harus memiliki email yang unik.`);
        return;
      }
    }

    setCurrentPreset(prev => ({
      ...prev,
      businessName: name,
      currency,
      phone,
      address,
      ...(industry && { industry }),
      ...(adminEmail && { adminEmail })
    }));
  };

  // Clear all data for current UMKM preset
  const clearCurrentPresetData = () => {
    if (currentPreset.id === 'placeholder') {
      alert('Tidak dapat menghapus data preset placeholder. Silakan pilih UMKM yang terdaftar terlebih dahulu.');
      return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data (kategori, produk, transaksi, pengeluaran, pendapatan) untuk UMKM ini? Tindakan ini tidak dapat dibatalkan.')) {
      const prefix = `umkm_${currentPreset.id}_`;
      localStorage.removeItem(`${prefix}categories`);
      localStorage.removeItem(`${prefix}products`);
      localStorage.removeItem(`${prefix}expenses`);
      localStorage.removeItem(`${prefix}transactions`);
      localStorage.removeItem(`${prefix}incomes`);
      
      setCategories([]);
      setProducts([]);
      setExpenses([]);
      setTransactions([]);
      setIncomes([]);
      
      alert('Data berhasil dihapus! Halaman akan direfresh.');
      window.location.reload();
    }
  };

  // System-wide Dark Mode Toggle DOM management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Standalone welcome page gate for admin & cashier before logging in
  if (!isSuperAdminLoggedIn) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-bento-bg dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-8 transition-colors duration-300">
          <SuperAdminWelcome
            allPresets={allPresets}
            setAllPresets={setAllPresets}
            currentPreset={currentPreset}
            setCurrentPreset={setCurrentPreset}
            setIsSuperAdminLoggedIn={setIsSuperAdminLoggedIn}
            setCategories={setCategories}
            setProducts={setProducts}
            setRole={setRole}
          />
        </div>
      </div>
    );
  }

  // Dual fullscreen POS experience for cashiers
  if (role === 'kasir') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <CashierPOS
          products={products}
          setProducts={setProducts}
          transactions={transactions}
          setTransactions={setTransactions}
          customers={allCustomers}
          currentPreset={currentPreset}
          onLogout={() => {
            setRole('super_admin');
            setIsSuperAdminLoggedIn(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-bento-bg dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* Persistent Collapsible Sidebar */}
        {!(role === 'customer' && !currentUser) && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            currentPreset={currentPreset}
            onChangePreset={handleSwitchPreset}
            openSettingsModal={() => setIsOpenSettings(true)}
            openHelpModal={() => setIsOpenHelp(true)}
            role={role}
            setRole={setRole}
            isSuperAdminLoggedIn={isSuperAdminLoggedIn}
            onLogoutAdmin={() => setIsSuperAdminLoggedIn(false)}
            onLogoutCustomer={() => {
              setCurrentUser(null);
              setActiveTab('catalog');
            }}
            currentUser={currentUser}
            setIsOpenCart={setIsOpenCart}
            cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          />
        )}

        {/* Primary Page Canvas Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin">
          
          <div className="animate-fade-in">
            {renderActiveContent()}
          </div>
        </main>

        {/* PREFERENCES > SETTINGS MODAL (Switch presets for any UMKM) */}
        {isOpenSettings && (
          <div 
            onClick={() => setIsOpenSettings(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative border-t-4 max-h-[90vh] overflow-y-auto cursor-default scrollbar-thin" 
              style={{ borderTopColor: currentPreset.primaryColor }}
            >
              <button
                onClick={() => setIsOpenSettings(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Settings size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Pengaturan Profil UMKM</h4>
                  <p className="text-xs text-slate-400">Konfigurasi profil UMKM - Aplikasi adaptif bagi bidang usaha apapun</p>
                </div>
              </div>

              {/* Profile Edit View - NO TABS, JUST PROFILE */}
              <div className="space-y-4 text-xs font-semibold">
                  {/* Current UMKM Info */}
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Store size={20} />
                      </div>
                      <div>
                        <h5 className="font-black text-indigo-900 dark:text-indigo-300 text-sm">{currentPreset.businessName}</h5>
                        <p className="text-indigo-700 dark:text-indigo-400 text-[10px]">UMKM yang sedang diakses saat ini</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile detail modifier form inputs */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                    <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-wider">Sesuaikan Keterangan Toko Anda</span>
                    
                    {/* Permanent Kode UMKM Field */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-3 select-none">
                      <div>
                        <span className="block font-bold text-slate-850 dark:text-slate-200 text-[11px]">Kode Unik Database UMKM</span>
                        <span className="block text-[10px] text-slate-400">ID Identitas Utama Multi-Tenant (Permanen & Tidak bisa diubah)</span>
                      </div>
                      <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-amber-400 font-mono font-black text-xs rounded-lg border border-slate-300 dark:border-slate-700 select-all">
                        {currentPreset.umkmCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-500 mb-1">Nama Toko/UMKM</label>
                        <input
                          type="text"
                          value={currentPreset.businessName}
                          onChange={(e) => updatePresetDetails(e.target.value, currentPreset.currency, currentPreset.phone, currentPreset.address)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Sektor Industri</label>
                        <select
                          value={currentPreset.industry}
                          onChange={(e) => updatePresetDetails(currentPreset.businessName, currentPreset.currency, currentPreset.phone, currentPreset.address, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        >
                          <option value="Kesehatan & Apotek">Kesehatan & Apotek</option>
                          <option value="Kafe & Kuliner">Kafe & Kuliner</option>
                          <option value="Boutique & Fashion">Boutique & Fashion</option>
                          <option value="Retail & Grocery">Retail & Grocery</option>
                          <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                          <option value="Jasa & Layanan">Jasa & Layanan</option>
                          <option value="Otomotif">Otomotif</option>
                          <option value="Pendidikan">Pendidikan</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-500 mb-1">Email Admin</label>
                        <input
                          type="email"
                          value={currentPreset.adminEmail || ''}
                          onChange={(e) => updatePresetDetails(currentPreset.businessName, currentPreset.currency, currentPreset.phone, currentPreset.address, currentPreset.industry, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Nomor Kontak Toko</label>
                        <input
                          type="text"
                          value={currentPreset.phone}
                          onChange={(e) => updatePresetDetails(currentPreset.businessName, currentPreset.currency, e.target.value, currentPreset.address)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-500 mb-1">Simbol Mata Uang</label>
                        <input
                          type="text"
                          value={currentPreset.currency}
                          onChange={(e) => updatePresetDetails(currentPreset.businessName, e.target.value, currentPreset.phone, currentPreset.address)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Alamat Kantor Toko</label>
                        <input
                          type="text"
                          value={currentPreset.address}
                          onChange={(e) => updatePresetDetails(currentPreset.businessName, currentPreset.currency, currentPreset.phone, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input font-normal"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              <div className="mt-6 flex justify-end gap-3 text-xs">
                <button
                  onClick={() => setIsOpenSettings(false)}
                  className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-805 font-semibold rounded-xl cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setIsOpenSettings(false)}
                  className="px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-md cursor-pointer text-center"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE CUSTOMER REGISTER & LOGIN MODAL */}
        {isOpenAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium text-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsOpenAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md text-sm font-bold cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2.5 shadow-md text-lg" style={{ backgroundColor: currentPreset.primaryColor + '20', color: currentPreset.primaryColor }}>
                  👤
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Akses Akun Pelanggan</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Masuk atau daftarkan diri untuk menyelesaikan transaksi Anda</p>
              </div>

              {/* Toggle Login vs Register */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-5 font-bold">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Daftar Pembeli Baru
                </button>
              </div>

              {authTab === 'login' ? (
                /* Login Form option (Quick Test List vs Manual Email) */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!loginEmail.trim()) return alert('Masukkan email Anda!');
                    
                    // Identify customer matching email
                    const found = allCustomers.find(c => c.email.trim().toLowerCase() === loginEmail.trim().toLowerCase());
                    if (found) {
                      setCurrentUser(found);
                      setIsOpenAuthModal(false);
                      alert(`Selamat datang kembali, ${found.name}! Belanja Anda siap dikirimkan.`);
                    } else {
                      // Autocreate user for convenience
                      const newCust: Customer = {
                        id: allCustomers.length > 0 ? Math.max(...allCustomers.map(c => c.id)) + 1 : 105,
                        userId: allCustomers.length > 0 ? Math.max(...allCustomers.map(c => c.userId)) + 1 : 205,
                        name: loginEmail.split('@')[0].toUpperCase(),
                        email: loginEmail,
                        phone: '0812-3490-5000',
                        address: 'Alamat Penerima Kiriman Utama',
                        createdAt: new Date().toISOString()
                      };
                      setAllCustomers(prev => [...prev, newCust]);
                      setCurrentUser(newCust);
                      setIsOpenAuthModal(false);
                      alert(`Akun baru dideklarasikan dengan email "${loginEmail}". Silakan lengkapi profil di halaman checkout!`);
                      setLoginPassword('');
                    }
                  }}
                  className="space-y-4 font-semibold"
                >
                  <div>
                    <label className="block text-slate-500 mb-1.5 font-bold">Email Pelanggan</label>
                    <input
                      type="email"
                      required
                      placeholder="Masukkan alamat email..."
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1.5 font-bold">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan password..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                    style={{ backgroundColor: currentPreset.primaryColor }}
                  >
                    Masuk Sekarang
                  </button>
                </form>
              ) : (
                /* Registration option */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!registerName.trim() || !registerEmail.trim() || !registerPhone.trim()) {
                      return alert('Silakan lengkapi formulir wajib bintang!');
                    }

                    // Predefined customer
                    const newCust: Customer = {
                      id: allCustomers.length > 0 ? Math.max(...allCustomers.map(c => c.id)) + 1 : 105,
                      userId: allCustomers.length > 0 ? Math.max(...allCustomers.map(c => c.userId)) + 1 : 205,
                      name: registerName,
                      email: registerEmail,
                      phone: registerPhone,
                      address: registerAddress || 'Alamat Penerimaan Utama',
                      createdAt: new Date().toISOString(),
                      umkmId: currentPreset.id
                    };

                    setAllCustomers(prev => [...prev, newCust]);
                    setCurrentUser(newCust);
                    setIsOpenAuthModal(false);
                    alert(`🎉 Akun Pembeli baru "${newCust.name}" berhasil diregistrasi! Silakan lanjutkan menuju Checkout.`);
                  }}
                  className="space-y-4 font-semibold"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-500 mb-0.5 font-bold">Nama Lengkap Pembeli *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Rian Hidayat"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-0.5 font-bold">Email Aktif *</label>
                        <input
                          type="email"
                          required
                          placeholder="rian@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5 font-bold">No. Kontak HP *</label>
                        <input
                          type="text"
                          required
                          placeholder="0812-xxxx-xxxx"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-0.5 font-bold">Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimal 4 karakter..."
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-0.5 font-bold">Alamat Pengiriman Utama</label>
                      <textarea
                        rows={2}
                        placeholder="Alamat lengkap penerimaan kiriman paket barang..."
                        value={registerAddress}
                        onChange={(e) => setRegisterAddress(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 font-normal inner-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-white font-bold rounded-xl shadow-md cursor-pointer transition text-xs"
                    style={{ backgroundColor: currentPreset.primaryColor }}
                  >
                    Daftar Akun & Simpan Profil 🚀
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PREFERENCES > HELP & FAQ MODAL */}
        {isOpenHelp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium text-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsOpenHelp(false)}
                className="absolute top-4 right-4 text-slate-450 hover:text-slate-900 dark:hover:text-white p-1 rounded-md text-sm font-bold cursor-pointer z-10"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Panduan Penggunaan Sistem SIUPIN</h4>
                  <p className="text-xs text-slate-400">Petunjuk lengkap menggunakan semua fitur aplikasi</p>
                </div>
              </div>

              {/* Help entries lists */}
              <div className="space-y-4">
                {/* Dashboard */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-blue-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📊</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Dashboard</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Halaman utama yang menampilkan ringkasan bisnis Anda: total pendapatan, jumlah produk, transaksi aktif, dan pelanggan. 
                    Gunakan statistik ini untuk memantau performa UMKM secara real-time.
                  </p>
                </div>

                {/* Katalog Produk */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-purple-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🛍️</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Katalog Produk (Customer)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-2">
                    <strong>Untuk Pelanggan:</strong> Ubah role Anda menjadi "Pelanggan" di sidebar. 
                    Browse katalog produk, tambahkan ke keranjang dengan klik "Add to Cart", lalu checkout untuk menyelesaikan pembelian.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Isi data pengiriman, pilih metode pembayaran (COD/Transfer/E-Wallet), dan konfirmasi pesanan Anda.
                  </p>
                </div>

                {/* Kategori */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-green-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏷️</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Kategori</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Kelola kategori produk Anda (contoh: Elektronik, Fashion, Makanan). 
                    Klik "Tambah Kategori Baru" untuk membuat kategori, atau edit/hapus kategori yang sudah ada. 
                    Kategori membantu mengorganisir produk agar mudah dicari pelanggan.
                  </p>
                </div>

                {/* Produk */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-orange-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📦</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Produk</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Kelola semua produk UMKM Anda di sini. Klik "Tambah Produk Baru" untuk menambah item, 
                    isi nama produk, deskripsi, harga, stok, barcode, dan pilih kategori. 
                    Anda bisa edit harga/stok atau hapus produk kapan saja. Stok akan otomatis berkurang saat ada transaksi.
                  </p>
                </div>

                {/* Transaksi Penjualan */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-blue-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💳</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Transaksi Penjualan</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-2">
                    <strong>Penjualan Online:</strong> Lihat semua transaksi dari pelanggan yang order lewat katalog online. 
                    Update status pengiriman (Diproses → Dikirim → Selesai). Cetak invoice untuk setiap transaksi.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <strong>Penjualan Offline (Kasir):</strong> Klik "Transaksi Kasir" untuk mencatat penjualan di toko fisik. 
                    Scan barcode atau ketik nama produk, atur quantity, pilih metode pembayaran, dan selesaikan transaksi langsung.
                  </p>
                </div>

                {/* Pelanggan */}
                <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-pink-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👥</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Daftar Pelanggan</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Database semua pelanggan yang pernah berbelanja di UMKM Anda. 
                    Lihat riwayat transaksi, kontak, dan alamat setiap pelanggan. 
                    Gunakan informasi ini untuk customer relationship management (CRM).
                  </p>
                </div>

                {/* Pengeluaran Kas */}
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-red-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💰</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Pengeluaran Kas</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Catat semua pengeluaran bisnis Anda: Pembelian Stok, Operasional (listrik, sewa), Gaji Karyawan, dan Lainnya. 
                    Untuk Pembelian Stok, isi jumlah, harga, biaya kirim, diskon, dan PPN (%). 
                    Semua pengeluaran akan tercatat dan masuk ke laporan keuangan.
                  </p>
                </div>

                {/* Laporan Keuangan */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-indigo-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📈</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Laporan Keuangan & Profitabilitas</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Analisis keuangan lengkap: total pemasukan (penjualan online + offline), total pengeluaran, dan laba/rugi bersih. 
                    Filter berdasarkan periode waktu. Ekspor laporan ke PDF untuk dokumentasi atau laporan ke stakeholder. 
                    Gunakan data ini untuk pengambilan keputusan bisnis.
                  </p>
                </div>

                {/* Pengaturan */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚙️</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Pengaturan Profil UMKM</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Update informasi bisnis Anda: nama toko, sektor industri, email admin, nomor kontak, mata uang, dan alamat. 
                    Informasi ini akan muncul di invoice dan komunikasi dengan pelanggan. 
                    Kode UMKM bersifat permanen dan tidak bisa diubah (untuk identifikasi multi-tenant).
                  </p>
                </div>

                {/* Kontak Pembuat */}
                <div className="mt-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border-2 border-teal-200 dark:border-teal-900">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📞</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">Butuh Bantuan Lebih Lanjut?</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-3">
                    Hubungi tim pengembang kami untuk dukungan teknis, konsultasi, atau kustomisasi sistem:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a 
                      href="https://wa.me/6289561985919?text=Halo%20Arkan,%20saya%20butuh%20bantuan%20terkait%20SIUPIN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Arkan Abiyyu</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">0895-6198-59193</p>
                      </div>
                    </a>

                    <a 
                      href="https://wa.me/6282118959085?text=Halo%20Nayla,%20saya%20butuh%20bantuan%20terkait%20SIUPIN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Nayla Dzakira</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">0821-1895-9085</p>
                      </div>
                    </a>

                    <a 
                      href="https://wa.me/6281298226841?text=Halo%20Ghitha,%20saya%20butuh%20bantuan%20terkait%20SIUPIN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Ghitha Nadhirah</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">0812-9822-6841</p>
                      </div>
                    </a>

                    <a 
                      href="https://wa.me/6285659739659?text=Halo%20Chindi,%20saya%20butuh%20bantuan%20terkait%20SIUPIN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Chindi Lestari</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">0856-5973-9659</p>
                      </div>
                    </a>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center italic">
                    💡 Klik kartu untuk langsung chat WhatsApp
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsOpenHelp(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Mengerti, Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
