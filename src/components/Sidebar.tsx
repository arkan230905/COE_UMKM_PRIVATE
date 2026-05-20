import React from 'react';
import {
  LayoutDashboard,
  FolderTree,
  ShoppingBag,
  ListOrdered,
  Users,
  Receipt,
  BarChart3,
  Moon,
  Sun,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Store,
  LogOut,
  Truck,
  ShoppingCart,
  MessageSquare
} from 'lucide-react';
import { UMKMPreset, Customer } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  currentPreset: UMKMPreset;
  onChangePreset: (presetId: string) => void;
  openSettingsModal: () => void;
  openHelpModal: () => void;
  role: 'super_admin' | 'customer' | 'kasir';
  setRole: (role: 'super_admin' | 'customer' | 'kasir') => void;
  isSuperAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  onLogoutCustomer?: () => void;
  currentUser?: Customer | null;
  setIsOpenCart?: (val: boolean) => void;
  cartCount?: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  currentPreset,
  openSettingsModal,
  openHelpModal,
  role,
  setRole,
  isSuperAdminLoggedIn,
  onLogoutAdmin,
  onLogoutCustomer,
  currentUser,
  setIsOpenCart,
  cartCount = 0
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Dynamic Icon for the current preset industry
  const getPresetIcon = () => {
    switch (currentPreset.id) {
      case 'pharmacy':
        // Heartbeat pulse simulation
        return (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'cafe':
        return <span className="text-xl">☕</span>;
      case 'boutique':
        return <span className="text-xl">👗</span>;
      case 'grocery':
        return <span className="text-xl">🛒</span>;
      default:
        return <Store className="w-6 h-6 text-white" />;
    }
  };

  const getPrimaryHexColor = () => {
    return currentPreset.primaryColor;
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, section: 'MENU' },
    { id: 'categories', name: 'Kategori Produk', icon: FolderTree, section: 'MENU' },
    { id: 'products', name: 'Kelola Produk', icon: ShoppingBag, section: 'MENU' },
    { id: 'pantau-catalog', name: 'Pantau Katalog', icon: Store, section: 'MENU' },
    { id: 'transactions', name: 'Transaksi Penjualan', icon: ListOrdered, section: 'MENU' },
    { id: 'shipping-tracking', name: 'Pantau Pengiriman', icon: Truck, section: 'MENU' },
    { id: 'customers', name: 'Daftar Pelanggan', icon: Users, section: 'OTHERS' },
    { id: 'expenses', name: 'Pengeluaran Kas', icon: Receipt, section: 'OTHERS' },
    { id: 'financial-report', name: 'Laporan Keuangan', icon: BarChart3, section: 'OTHERS' },
  ];

  return (
    <aside
      className={`relative h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header with Brand Logo */}
      <div className="p-5 flex items-center justify-between border-b border-bento-navy/10 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-colors duration-300 bg-bento-navy"
          >
            {getPresetIcon()}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-lg text-bento-navy dark:text-white tracking-tight leading-tight">
                {currentPreset.businessName}
              </span>
              <span className="text-xs text-bento-text-muted dark:text-slate-500 font-medium tracking-wide prose uppercase">
                {currentPreset.industry}
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Collapse controller */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer hover:shadow-sm"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Menu / Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {role === 'super_admin' ? (
          <>
            {/* Menu Section */}
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Menu Utama
                </p>
              )}
              <div className="space-y-1">
                {menuItems
                  .filter((item) => item.section === 'MENU')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const disabled = !isSuperAdminLoggedIn;
                    return (
                      <button
                        key={item.id}
                        disabled={disabled}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-bento-navy text-white shadow-md'
                            : 'text-bento-text-muted dark:text-slate-400 hover:text-bento-navy dark:hover:text-white hover:bg-bento-light-blue/50 dark:hover:bg-slate-800/40'
                        } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                      >
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-bento-navy dark:group-hover:text-white'} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Others Section */}
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Eksternal & Keuangan
                </p>
              )}
              <div className="space-y-1">
                {menuItems
                  .filter((item) => item.section === 'OTHERS')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const disabled = !isSuperAdminLoggedIn;
                    return (
                      <button
                        key={item.id}
                        disabled={disabled}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-bento-navy text-white shadow-md'
                            : 'text-bento-text-muted dark:text-slate-400 hover:text-bento-navy dark:hover:text-white hover:bg-bento-light-blue/50 dark:hover:bg-slate-800/40'
                        } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                      >
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-bento-navy dark:group-hover:text-white'} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </button>
                    );
                  })}
              </div>
            </div>
          </>
        ) : (
          /* Customer Mode Sidebar Menus */
          <div className="space-y-6">
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Belanja Online
                </p>
              )}
              <div className="space-y-1">
                {/* 1. Produk */}
                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    if (setIsOpenCart) setIsOpenCart(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                    activeTab === 'catalog'
                      ? 'bg-bento-navy text-white shadow-md'
                      : 'text-bento-text-muted dark:text-slate-400 hover:text-bento-navy dark:hover:text-white hover:bg-bento-light-blue/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <ShoppingBag size={18} />
                  {!isCollapsed && <span>Produk Yang Dijual</span>}
                </button>

                {/* 2. Keranjang */}
                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    if (setIsOpenCart) setIsOpenCart(true);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer text-bento-text-muted dark:text-slate-400 hover:text-bento-navy dark:hover:text-white hover:bg-bento-light-blue/50 dark:hover:bg-slate-800/40`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={18} />
                    {!isCollapsed && <span>Keranjang Belanja</span>}
                  </div>
                  {!isCollapsed && cartCount > 0 && (
                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full shrink-0 animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* 3. Riwayat Pesanan */}
                 <button
                  onClick={() => {
                    setActiveTab('order-history');
                    if (setIsOpenCart) setIsOpenCart(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                    activeTab === 'order-history'
                      ? 'bg-bento-navy text-white shadow-md'
                      : 'text-bento-text-muted dark:text-slate-400 hover:text-bento-navy dark:hover:text-white hover:bg-bento-light-blue/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <ListOrdered size={18} />
                  {!isCollapsed && <span>Riwayat Pesanan</span>}
                </button>
              </div>
            </div>

            {/* Sub-section: Layanan Pelanggan */}
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Hubungi Dukungan
                </p>
              )}
              <div className="space-y-1">
                <a
                  href={`https://wa.me/${currentPreset.phone.replace(/\D/g, '')}?text=Halo%20Admin%2520${encodeURIComponent(currentPreset.businessName)},%20saya%20mengalami%20kendala%20mengenai%20pesanan%20saya.%20Mohon%20bantuannya%20untuk%20pelacakan%20atau%20pengurusan%20kendala%20ini.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-bento-text-muted dark:text-slate-400 block cursor-pointer group"
                >
                  <MessageSquare size={18} className="text-slate-400 group-hover:text-emerald-500" />
                  {!isCollapsed && <span>Hubungi Admin WA</span>}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Section Bottom Left */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
        {role === 'super_admin' ? (
          <>
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Sistem & Pengaturan
              </p>
            )}

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium cursor-pointer"
                title="Toggle Theme"
              >
                {isDarkMode ? (
                  <>
                    <Sun size={15} className="text-amber-500" />
                    {!isCollapsed && <span>Light Mode</span>}
                  </>
                ) : (
                  <>
                    <Moon size={15} />
                    {!isCollapsed && <span>Dark Mode</span>}
                  </>
                )}
              </button>
              {!isCollapsed && (
                <div
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-indigo-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300" />
                </div>
              )}
            </div>

            {/* Settings button */}
            <button
              onClick={openSettingsModal}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium text-left cursor-pointer group"
            >
              <Settings size={15} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
              {!isCollapsed && <span className="flex-1">Settings</span>}
              {!isCollapsed && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-md">Edit ID</span>}
            </button>

            {/* Help button */}
            <button
              onClick={openHelpModal}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium text-left cursor-pointer group"
            >
              <HelpCircle size={15} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
              {!isCollapsed && <span>Help & FAQ</span>}
            </button>

            {/* Admin Logout button */}
            <button
              onClick={onLogoutAdmin}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left cursor-pointer group border border-dashed border-red-200/60 mt-2"
            >
              <LogOut size={15} className="text-red-500" />
              {!isCollapsed && <span>Keluar Admin</span>}
            </button>
          </>
        ) : (
          /* Customer Mode - Hide preferensi/dark mode, only render Keluar Akun custom button if logged in */
          currentUser && (
            <button
              onClick={onLogoutCustomer}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-left cursor-pointer group border border-dashed border-red-200/80"
            >
              <LogOut size={15} className="text-red-500" />
              {!isCollapsed && <span>Keluar Akun</span>}
            </button>
          )
        )}
      </div>
    </aside>
  );
}
