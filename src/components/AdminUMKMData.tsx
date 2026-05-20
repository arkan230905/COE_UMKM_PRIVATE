import React, { useState } from 'react';
import { Search, Landmark, Phone, MapPin, Tag, CheckCircle, ShieldCheck } from 'lucide-react';
import { UMKMPreset } from '../types';

interface AdminUMKMDataProps {
  allPresets: UMKMPreset[];
  currentPreset: UMKMPreset;
}

export default function AdminUMKMData({ allPresets, currentPreset }: AdminUMKMDataProps) {
  const [search, setSearch] = useState('');

  const filtered = allPresets.filter(
    p =>
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.umkmCode.toLowerCase().includes(search.toLowerCase()) ||
      p.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Banner */}
      <div className="relative p-6 bg-linear-to-r from-slate-900 via-bento-navy to-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden shadow-md">
        <div className="space-y-1 z-10">
          <span className="text-[10px] bg-slate-800 text-amber-400 font-bold tracking-widest uppercase px-2 py-0.5 rounded-md">Regulasi Tenant</span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            Data Registrasi UMKM Nasional
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Daftar seluruh tenant usaha mikro yang terdaftar di dalam sistem database multi-preset terpadu.
          </p>
        </div>
        <div className="z-10 shrink-0 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold border border-white/5">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Sistem Otorisasi Multi-Tenant Aktif</span>
        </div>
      </div>

      {/* Main Registry List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Database Registrasi Tenant</h3>
            <p className="text-xs text-slate-400">Gunakan kolom pencarian untuk menyaring berdasarkan Kode, Sektor, atau Nama Usaha.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari UMKM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 dark:border-slate-800 bg-transparent rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto pr-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">KODE UMKM (LOGIN)</th>
                <th className="py-3 px-2">NAMA USAHA</th>
                <th className="py-3 px-2">SEKTOR INDUSTRI</th>
                <th className="py-3 px-2 flex items-center gap-1"><Phone size={11} /> WHATSAPP HP</th>
                <th className="py-3 px-2"><MapPin size={11} className="inline mr-1" /> ALAMAT TOKO</th>
                <th className="py-3 px-2 text-right">STATUS DB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((item) => {
                const isCurrent = item.id === currentPreset.id;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors ${
                      isCurrent ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-2 font-mono font-black text-indigo-650 dark:text-blue-400">
                      {item.umkmCode}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-850 dark:text-slate-100">
                          {item.businessName}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">
                            Sedang Dikendalikan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-full text-[10px]">
                        {item.industry}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500 dark:text-slate-400">
                      {item.phone}
                    </td>
                    <td className="py-3 px-2 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {item.address}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle size={10} /> Terkoneksi
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-bold">
                    Tidak ada data UMKM yang terdaftar atau cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
