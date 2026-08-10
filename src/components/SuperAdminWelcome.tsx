import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, Landmark, HelpCircle, User, Key, ArrowRight, Activity, Loader } from 'lucide-react';
import { UMKMPreset, Category, Product } from '../types';
import storageService from '../services/storage';

interface SuperAdminWelcomeProps {
  allPresets: UMKMPreset[];
  setAllPresets: React.Dispatch<React.SetStateAction<UMKMPreset[]>>;
  currentPreset: UMKMPreset;
  setCurrentPreset: (preset: UMKMPreset) => void;
  setIsSuperAdminLoggedIn: (val: boolean) => void;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setRole: (role: 'super_admin' | 'customer' | 'kasir') => void;
}

export default function SuperAdminWelcome({
  allPresets,
  setAllPresets,
  currentPreset,
  setCurrentPreset,
  setIsSuperAdminLoggedIn,
  setCategories,
  setProducts,
  setRole
}: SuperAdminWelcomeProps) {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login Form States
  const [loginRole, setLoginRole] = useState<'admin' | 'kasir'>('admin');
  const [inputUmkmCode, setInputUmkmCode] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [adminName, setAdminName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Load UMKM presets from database on mount
  useEffect(() => {
    loadPresetsFromDatabase();
  }, []);

  const loadPresetsFromDatabase = async () => {
    try {
      const presets = await storageService.getUmkmPresets();
      if (presets && presets.length > 0) {
        setAllPresets(presets);
        console.log('✅ Loaded UMKM presets from database:', presets.length);
      }
    } catch (error) {
      console.error('Error loading UMKM presets:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!inputUmkmCode.trim()) {
        setErrorMsg('Pemberitahuan: Kode UMKM wajib dimasukkan.');
        setIsLoading(false);
        return;
      }

      // Try to find from database first
      const preset = await storageService.getUmkmPresetByCode(inputUmkmCode.trim().toUpperCase());

      if (!preset) {
        // Fallback to allPresets array
        const localPreset = allPresets.find(
          p => p.umkmCode.trim().toUpperCase() === inputUmkmCode.trim().toUpperCase()
        );
        
        if (!localPreset) {
          setErrorMsg('Kode UMKM tidak valid atau belum terdaftar di sistem.');
          setIsLoading(false);
          return;
        }
        
        // Use local preset if database fails
        proceedWithLogin(localPreset);
      } else {
        // Use database preset
        proceedWithLogin(preset);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('Terjadi kesalahan saat login. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const proceedWithLogin = (preset: UMKMPreset) => {
    if (loginRole === 'admin') {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        setErrorMsg('Pemberitahuan: Email dan Sandi Admin wajib diisi untuk masuk sebagai Admin.');
        setIsLoading(false);
        return;
      }
      // Success Admin Login
      setCurrentPreset(preset);
      setRole('super_admin');
      setIsSuperAdminLoggedIn(true);
      setSuccessMsg('Login Admin Berhasil! Mengalihkan ke Dashboard...');
    } else {
      // Success Cashier Login (No email/password check)
      setCurrentPreset(preset);
      setRole('kasir');
      setIsSuperAdminLoggedIn(true);
      setSuccessMsg('Login Kasir Berhasil! Mengalihkan ke POS Supermarket...');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!adminName.trim()) {
        setErrorMsg('Nama Lengkap Owner wajib diisi.');
        setIsLoading(false);
        return;
      }
      if (!brandName.trim()) {
        setErrorMsg('Nama UMKM wajib diisi.');
        setIsLoading(false);
        return;
      }
      if (!regEmail.trim()) {
        setErrorMsg('Email Admin wajib diisi.');
        setIsLoading(false);
        return;
      }
      if (!regPassword.trim() || regPassword.length < 4) {
        setErrorMsg('Kata Sandi minimal 4 karakter.');
        setIsLoading(false);
        return;
      }

      // Check if email already exists
      const emailConflict = allPresets.find(p => p.adminEmail?.trim().toLowerCase() === regEmail.trim().toLowerCase());
      if (emailConflict) {
        setErrorMsg(`Email "${regEmail}" sudah terdaftar untuk UMKM "${emailConflict.businessName}". Setiap admin harus memiliki email yang unik.`);
        setIsLoading(false);
        return;
      }

      const slug = brandName.trim().toUpperCase().replace(/\s+/g, '-');
      const nameConflict = allPresets.find(p => p.businessName.trim().toUpperCase().replace(/\s+/g, '-') === slug);

      if (nameConflict) {
        setErrorMsg(`Nama UMKM "${brandName}" sudah terdaftar di sistem. Ganti nama usaha Anda.`);
        setIsLoading(false);
        return;
      }

      // Auto generate a unique alphanumeric UMKM Code
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const shortPrefix = brandName.trim().substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
      const generatedCode = `${shortPrefix}-${randomSuffix}`;

      // Set default values
      const defaultBrandColor = '#1E3A5F'; // Deep Navy as default
      const defaultIndustry = 'Umum'; // Default industry

      const newPreset: Omit<UMKMPreset, 'id'> = {
        umkmCode: generatedCode,
        businessName: brandName.trim(),
        industry: defaultIndustry,
        logoText: brandName.trim().substring(0, 3).toUpperCase(),
        primaryColor: defaultBrandColor,
        accentColor: '#3B82F6', // Blue accent, proper hex code
        currency: 'Rp',
        phone: phone || '0812-9988-1122',
        address: address || 'Alamat Utama UMKM Terdaftar',
        adminName: adminName.trim(),
        adminEmail: regEmail.trim(),
      };

      // Save to database
      const savedPreset = await storageService.saveUmkmPreset(newPreset);

      // Update local state
      setAllPresets(prev => [...prev, savedPreset]);
      setCurrentPreset(savedPreset);

      // Show success message with code
      setSuccessMsg(
        `Pendaftaran Berhasil! Kode UMKM Anda adalah: ${generatedCode}. Simpan kode ini untuk login!`
      );

      // Reset fields
      setAdminName('');
      setBrandName('');
      setPhone('');
      setAddress('');
      setRegEmail('');
      setRegPassword('');

      setIsLoading(false);

      // After 4 seconds, direct them to log in automatically as Admin
      setTimeout(() => {
        setRole('super_admin');
        setIsSuperAdminLoggedIn(true);
      }, 4500);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message in Indonesian
      let errorMessage = 'Gagal mendaftar UMKM. Silakan coba lagi.';
      
      if (error?.message) {
        // If error message is in English, translate to Indonesian
        const msg = error.message;
        if (msg.includes('accent color field must not be greater')) {
          errorMessage = 'Kode warna accent terlalu panjang (maksimal 20 karakter)';
        } else if (msg.includes('primary color field must not be greater')) {
          errorMessage = 'Kode warna primary terlalu panjang (maksimal 20 karakter)';
        } else if (msg.includes('email has already been taken')) {
          errorMessage = 'Email sudah terdaftar. Gunakan email lain.';
        } else if (msg.includes('umkm_code has already been taken')) {
          errorMessage = 'Kode UMKM sudah terdaftar.';
        } else {
          // Use the original message if it's already in Indonesian
          errorMessage = msg;
        }
      }
      
      setErrorMsg(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center"
      style={{ backgroundImage: 'url(/latar_belakang_webbistara.png)' }}
    >
      <div className="max-w-4xl w-full py-6 px-4 font-semibold text-xs font-sans relative">
        {/* Logo Section - Fixed pojok kanan atas */}
        <div className="fixed top-6 right-6 flex gap-4 z-50">
          <img src="/Logo_WEBBISTARA.png" alt="BISTARA Logo" className="h-14 object-contain bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2" />
          <img src="/logo_telkom.png" alt="Telkom Logo" className="h-14 object-contain bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
          {/* BISTARA Branding Block */}
          <div className="md:col-span-5 space-y-4 text-slate-700 dark:text-slate-300">
          <div className="p-6 bg-linear-to-b from-[#1E3A5F] to-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10">
              <Shield size={100} />
            </div>
            
            <div className="p-2 w-fit bg-white/10 rounded-lg text-amber-400 font-bold border border-white/5 uppercase tracking-widest text-[9px]">
              Platform Digital
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-tight">BISTARA</h2>
              <span className="text-xs text-amber-300 font-bold block mt-1">Solusi Digital untuk UMKM Indonesia</span>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Platform digital cerdas terpadu yang dirancang khusus untuk memodernisasi tata kelola operasional, transaksi Point-of-Sale (POS), dan kepatuhan administrasi UMKM Indonesia secara real-time.
              </p>
            </div>

            <div className="pt-3 border-t border-white/15 space-y-3">
              <div className="flex items-start gap-2.5 text-[11px] text-slate-300">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Dashboard Admin lengkap untuk melacak keuangan, manajemen inventaris, dan kepatuhan hukum UMKM.</span>
              </div>
              <div className="flex items-start gap-2.5 text-[11px] text-slate-300">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Sistem Kasir POS terpadu dengan integrasi pencarian cepat barcode barang.</span>
              </div>
              <div className="flex items-start gap-2.5 text-[11px] text-slate-300">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Katalog Interaktif Mandiri untuk memudahkan pelanggan memesan barang secara langsung.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xl overflow-hidden">
          
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { setActiveMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-4 text-center font-bold text-xs uppercase cursor-pointer border-b-2 transition-all ${
                activeMode === 'login'
                  ? 'border-[#1E3A5F] text-[#1E3A5F] dark:text-white bg-[#1E3A5F]/5 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              💼 Masuk Portal
            </button>
            <button
              onClick={() => { setActiveMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-4 text-center font-bold text-xs uppercase cursor-pointer border-b-2 transition-all ${
                activeMode === 'register'
                  ? 'border-[#1E3A5F] text-[#1E3A5F] dark:text-white bg-[#1E3A5F]/5 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              🚀 Daftar Baru
            </button>
          </div>

          <div className="p-6">
            {errorMsg && (
              <div className="p-3 mb-4 bg-rose-50 text-rose-600 dark:bg-rose-950/25 dark:text-rose-400 border border-rose-100 dark:border-transparent rounded-xl flex items-center gap-2">
                <span className="text-sm">⚠</span>
                <span className="font-bold">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 mb-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-transparent rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-500" />
                  <span className="font-bold">Berhasil!</span>
                </div>
                <p className="text-xs leading-normal">{successMsg}</p>
              </div>
            )}

            {/* LOGIN PANEL FORM */}
            {activeMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-slate-500">Pilih Role Akses *</label>
                  <select
                    value={loginRole}
                    onChange={(e) => {
                      setLoginRole(e.target.value as 'admin' | 'kasir');
                      setErrorMsg('');
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="admin">💼 Admin Toko (Full Dashboard)</option>
                    <option value="kasir">🛒 Kasir Toko (Supermarket Scan POS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Masukan Kode UMKM (Dari Sistem) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: FARM-9901"
                    value={inputUmkmCode}
                    onChange={(e) => setInputUmkmCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white uppercase tracking-wider font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {loginRole === 'admin' && (
                  <div className="space-y-4 animate-fade-in border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kredensial Otorisasi Admin</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1">Email Admin *</label>
                        <input
                          type="email"
                          required
                          placeholder="admin@mail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Password Admin *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-white font-bold bg-[#1E3A5F] hover:bg-[#14263f] hover:scale-[1.01] transition rounded-lg text-xs tracking-wider cursor-pointer shadow-md mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Memuat...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={14} /> Masuk Untuk Mengelola {loginRole === 'admin' ? 'Dashboard' : 'Kasir POS'}
                    </>
                  )}
                </button>
              </form>
            ) : (
              
              /* REGISTER PANEL FORM */
              <form onSubmit={handleRegister} className="space-y-4 text-slate-650">
                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-2 block">Daftar Tenant UMKM Baru</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">Nama Owner / Pengurus *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Anda..."
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-500 mb-1">Nama UMKM / Usaha Dagang *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Apotek Arkan Medical"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">No. HP UMKM (WhatsApp) *</label>
                    <input
                      type="text"
                      required
                      placeholder="0812-xxxx-xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Alamat Utama Usaha *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jalan Sudirman No. 25, Jakarta"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <label className="block text-slate-500 mb-1">E-mail Kontak Admin *</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@mail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Password Login Admin *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 4 digit..."
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] transition rounded-lg text-xs tracking-wider cursor-pointer shadow-md mt-4 flex items-center justify-center gap-2"
                >
                  Daftarkan & Dapatkan KODE UMKM 🚀
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
