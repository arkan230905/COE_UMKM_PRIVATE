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

import {
  UMKM_PRESETS,
  DEFAULT_USERS,
  PRESETS_CATEGORIES,
  PRESETS_PRODUCTS,
  DEFAULT_EXPENSES,
  DEFAULT_MOCK_TRANSACTIONS,
  DEFAULT_INCOMES
} from './data/mockData';

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

  // Preferences states
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // App Master Database structures (mirrors MySQL Tables!)
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  
  // Manage customer users in state
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  
  // Manage all registered UMKM presets
  const [allPresets, setAllPresets] = useState<UMKMPreset[]>(() => {
    const stored = localStorage.getItem('umkm_presets');
    return stored ? JSON.parse(stored) : [];
  });
  
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

  // Settings modal dynamic tab
  const [settingsTab, setSettingsTab] = useState<'profile' | 'register' | 'data'>('profile');
  
  // New UMKM Registration form inputs
  const [regUMKMName, setRegUMKMName] = useState('');
  const [regUMKMIndustry, setRegUMKMIndustry] = useState('Kesehatan & Alat Medis');
  const [regUMKMPhone, setRegUMKMPhone] = useState('');
  const [regUMKMAddress, setRegUMKMAddress] = useState('');
  const [regUMKMColor, setRegUMKMColor] = useState('#4f46e5'); // Indigo default

  // Synchronizers of state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('user_umkm_presets', JSON.stringify(allPresets));
  }, [allPresets]);

  useEffect(() => {
    localStorage.setItem('user_customers', JSON.stringify(allCustomers));
  }, [allCustomers]);

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
      localStorage.setItem(`umkm_${currentPreset.id}_products`, JSON.stringify(products));
      console.log('Products saved to localStorage:', products);
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
      localStorage.setItem(`umkm_${currentPreset.id}_customers`, JSON.stringify(allCustomers));
    }
  }, [allCustomers, currentPreset]);

  useEffect(() => {
    localStorage.setItem('umkm_presets', JSON.stringify(allPresets));
  }, [allPresets]);

  // Switch presets gracefully (Pharmacy, Cafe, Boutique, Grocery)
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
            customers={allCustomers.filter(c => c.umkmId === currentPreset.id || (!c.umkmId && currentPreset.id === 'pharmacy'))}
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
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Multi-Tenant Presets & Settings</h4>
                  <p className="text-xs text-slate-400">Konfigurasi profile UMKM - Aplikasi adaptif bagi bidang usaha apapun</p>
                </div>
              </div>

              {/* Settings Tab Selectors */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 mb-4 text-xs font-extrabold gap-4">
                <button
                  type="button"
                  onClick={() => setSettingsTab('profile')}
                  className={`pb-2 transition cursor-pointer ${settingsTab === 'profile' ? 'border-b-2 text-indigo-600 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Profil UMKM
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('register')}
                  className={`pb-2 transition flex items-center gap-1.5 cursor-pointer ${settingsTab === 'register' ? 'border-b-2 text-indigo-600 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  🚀 Daftarkan UMKM Baru (Multi-Tenant)
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('data')}
                  className={`pb-2 transition flex items-center gap-1.5 cursor-pointer ${settingsTab === 'data' ? 'border-b-2 text-rose-600 border-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  🗑️ Hapus Data
                </button>
              </div>

              {settingsTab === 'profile' ? (
                /* Profile Edit View */
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
              ) : (
                /* Dynamic UMKM Registration Form (Multi-Tenant Option) */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!regUMKMName.trim()) return alert('Nama UMKM wajib diisi!');
                    
                    const newId = 'preset_user_' + Date.now();
                    const genCode = `UMKM-${regUMKMName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}-${Math.floor(1000 + Math.random() * 9000)}`;
                    const newPreset: UMKMPreset = {
                      id: newId,
                      umkmCode: genCode,
                      businessName: regUMKMName,
                      industry: regUMKMIndustry,
                      logoText: regUMKMName.substring(0, 3).toUpperCase(),
                      primaryColor: regUMKMColor,
                      accentColor: regUMKMColor,
                      currency: 'Rp',
                      phone: regUMKMPhone || '0812-3456-7890',
                      address: regUMKMAddress || 'Alamat Kantor UMKM Baru'
                    };

                    setAllPresets(prev => [...prev, newPreset]);
                    setCurrentPreset(newPreset);
                    
                    // Reset inputs
                    setRegUMKMName('');
                    setRegUMKMPhone('');
                    setRegUMKMAddress('');
                    
                    setIsOpenSettings(false);
                    setRole('super_admin');
                    setActiveTab('dashboard');
                    
                    alert(`🚀 Berhasil mendaftarkan tenant UMKM "${newPreset.businessName}"! URL Multi-Tenant Anda otomatis terkonfigurasi secara dinamis.`);
                  }}
                  className="space-y-4 text-xs font-semibold"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-500 mb-1 font-bold">Nama UMKM Kebanggaan Anda *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: UMKM ARKAN MEDICAL"
                        value={regUMKMName}
                        onChange={(e) => setRegUMKMName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Kategori / Sektor Industri *</label>
                        <select
                          value={regUMKMIndustry}
                          onChange={(e) => setRegUMKMIndustry(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 font-medium inner-input bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                        >
                          <option value="Kesehatan & Alat Medis">Kesehatan & Alat Medis</option>
                          <option value="Makanan & Minuman / Cafe">Makanan & Minuman / Cafe</option>
                          <option value="Fashion & Boutique">Fashion & Boutique</option>
                          <option value="Pariwisata & Jasa">Pariwisata & Jasa</option>
                          <option value="Manufaktur Kerajinan">Manufaktur Kerajinan</option>
                          <option value="Toko Kelontong & Ritel">Toko Kelontong & Ritel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-[3px] font-bold">Branding Warna Utama</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={regUMKMColor}
                            onChange={(e) => setRegUMKMColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={regUMKMColor}
                            onChange={(e) => setRegUMKMColor(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] focus:outline-none inner-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Nomor Kontak / HP *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 081234567890"
                          value={regUMKMPhone}
                          onChange={(e) => setRegUMKMPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Alamat Kantor UMKM *</label>
                        <input
                          type="text"
                          required
                          placeholder="Alamat Kantor Pusat Tenant..."
                          value={regUMKMAddress}
                          onChange={(e) => setRegUMKMAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      className="w-full py-3 text-white font-bold rounded-xl shadow-lg hover:scale-[1.01] transition focus:outline-none cursor-pointer"
                      style={{ backgroundColor: regUMKMColor }}
                    >
                      Daftarkan & Aktifkan Multi-Tenant Baru 🚀
                    </button>
                  </div>
                </form>
              )}

              {settingsTab === 'data' && (
                /* Data Management View */
                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-black text-rose-900 dark:text-rose-300 text-sm mb-1">Hapus Semua Data UMKM</h5>
                        <p className="text-rose-700 dark:text-rose-400 leading-relaxed">
                          Tindakan ini akan menghapus SEMUA data untuk UMKM <strong>{currentPreset.businessName}</strong> termasuk:
                        </p>
                        <ul className="mt-2 space-y-1 text-rose-700 dark:text-rose-400 list-disc list-inside">
                          <li>Semua Kategori Produk</li>
                          <li>Semua Produk & Inventaris</li>
                          <li>Semua Transaksi Penjualan</li>
                          <li>Semua Pengeluaran Bisnis</li>
                          <li>Semua Catatan Pendapatan</li>
                        </ul>
                        <p className="mt-2 text-rose-800 dark:text-rose-300 font-bold">
                          ⚠️ Tindakan ini TIDAK DAPAT dibatalkan!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={clearCurrentPresetData}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Trash size={14} /> Hapus Semua Data
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 text-xs">
                <button
                  onClick={() => setIsOpenSettings(false)}
                  className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-805 font-semibold rounded-xl cursor-pointer"
                >
                  Kembali
                </button>
                {settingsTab === 'profile' && (
                  <button
                    onClick={() => setIsOpenSettings(false)}
                    className="px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-md cursor-pointer text-center"
                  >
                    Simpan Perubahan
                  </button>
                )}
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsOpenHelp(false)}
                className="absolute top-4 right-4 text-slate-450 hover:text-slate-900 p-1 rounded-md text-sm font-bold"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Panduan & Bantuan (FAQ)</h4>
                  <p className="text-xs text-slate-400">Pahami cara kerja simulator multi-role UMKM ini</p>
                </div>
              </div>

              {/* Help entries lists */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/20">
                  <span className="font-bold text-indigo-900 dark:text-blue-400 block mb-1">Q: Bagaimana cara berbelanja?</span>
                  <span className="text-slate-550 leading-relaxed font-semibold">
                    A: Ganti role Anda ke "Pelanggan" di sidebar badge kiri, pilih menu "Katalog", pilih produk dan klik "Add to Cart". Klik tombol Keranjang di atas, klik checkout, isi data pengantar serta pilih payment gateway, dan klik "Konfirmasi Bayar".
                  </span>
                </div>

                <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/20">
                  <span className="font-bold text-indigo-900 dark:text-blue-400 block mb-1">Q: Bagaimana Admin memantau transaksi masuk?</span>
                  <span className="text-slate-550 leading-relaxed font-semibold">
                    A: Ganti kembali ke role "Admin", kunjungi tab "Transaction". Anda akan melihat transaksi terbaru yang dibuat oleh customer di tabel paling atas dengan status "Dibayar" / "Menunggu". Anda dapat merubah statusnya menjadi "Selesai" jika barang berhasil difoto/dispatch.
                  </span>
                </div>

                <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/20">
                  <span className="font-bold text-indigo-900 dark:text-blue-400 block mb-1">Q: Di mana saya dapat meninjau source code Laravel?</span>
                  <span className="text-slate-550 leading-relaxed font-semibold">
                    A: Berkas migrasi database MySQL rill dan kode sumber program Laravel 11 telah disediakan lengkap di dalam root folder proyek (<code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-600">/laravel/</code>). Anda tinggal menyalin file tersebut ke sistem web Laravel rill Anda!
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsOpenHelp(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                >
                  Paham, Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
