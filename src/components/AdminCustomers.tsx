import React, { useState } from 'react';
import { Users, Search, ShoppingBag, Eye, Calendar, MapPin, Phone, Mail, Award } from 'lucide-react';
import { Customer, Transaction, UMKMPreset } from '../types';

interface AdminCustomersProps {
  customers: Customer[];
  transactions: Transaction[];
  currentPreset: UMKMPreset;
}

export default function AdminCustomers({
  customers,
  transactions,
  currentPreset
}: AdminCustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Search filter
  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  // Calculate stats for a customer (order count, total spend)
  const getCustomerStats = (customerId: number) => {
    const customerTx = transactions.filter(t => t.customerId === customerId);
    const completedTx = customerTx.filter(t => t.status === 'completed' || t.status === 'paid');
    const totalSpend = completedTx.reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      orderCount: customerTx.length,
      completedCount: completedTx.length,
      totalSpend
    };
  };

  return (
    <div className="space-y-6">
      {/* Header and totals */}
      <div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
          Customers History Log
        </h1>
        <p className="text-xs text-slate-400">Track registered buyers, shopping frequencies, average spending index, and invoices</p>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, email, nomor ponsel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Layout Grid: Column 1 is customer list, Column 2 is chosen customer detail history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-medium">
        {/* Customer List Card */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Registered Customers</h3>
            {filteredCustomers.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredCustomers.map((cust) => {
                  const stats = getCustomerStats(cust.id);
                  const isSelected = selectedCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none rounded-xl transition-colors mt-1 ${
                        isSelected
                          ? 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-755'
                          : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 font-bold text-sm tracking-wide flex items-center justify-center uppercase shrink-0">
                          {cust.name.substring(0, 2)}
                        </div>
                        <div>
                          <span className="block text-slate-900 dark:text-white font-bold text-sm">{cust.name}</span>
                          <span className="block text-xs text-slate-400">{cust.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 sm:ml-auto">
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">TOTAL BELANJA</span>
                          <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                            {formatCurrency(stats.totalSpend)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">TRANSAKSI</span>
                          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            {stats.orderCount} Kali ({stats.completedCount} Lunas)
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-0.5"
                        >
                          <Eye size={12} /> Detail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-8 text-center text-slate-400 text-xs font-semibold">Pelanggan tidak ditemukan.</p>
            )}
          </div>
        </div>

        {/* Selected Customer History Profiler */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-5 sticky top-4 animate-fade-in">
              <div className="text-center pb-5 border-b border-slate-50 dark:border-slate-850 space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-white font-extrabold text-xl tracking-wide flex items-center justify-center uppercase mx-auto border-2 border-indigo-100">
                  {selectedCustomer.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-base leading-tight">
                    {selectedCustomer.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full inline-block mt-1">
                    Customer ID: #C{selectedCustomer.id}
                  </span>
                </div>
              </div>

              {/* Information lists */}
              <div className="space-y-3 text-xs">
                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Kontak & Alamat</span>
                <div className="space-y-2.5 font-medium text-slate-600 dark:text-slate-350">
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-slate-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                </div>
              </div>

              {/* Aggregates stats details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Total Belanja</span>
                  <span className="text-sm font-extrabold text-indigo-650" style={{ color: currentPreset.accentColor }}>
                    {formatCurrency(getCustomerStats(selectedCustomer.id).totalSpend)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Rasio Sukses</span>
                  <span className="text-sm font-extrabold text-slate-850 dark:text-white">
                    {getCustomerStats(selectedCustomer.id).completedCount} / {getCustomerStats(selectedCustomer.id).orderCount} order
                  </span>
                </div>
              </div>

              {/* Historic transaction invoices list */}
              <div className="space-y-2 text-xs">
                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Invoices History</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {transactions
                    .filter(t => t.customerId === selectedCustomer.id)
                    .map(tx => (
                      <div
                        key={tx.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-900 dark:text-white font-mono">#{tx.transactionCode}</span>
                          <span className="block text-[10px] text-slate-400">
                            {tx.createdAt.substring(0, 10).split('-').reverse().join('-')}
                          </span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="block font-black text-slate-855 dark:text-slate-200">{formatCurrency(tx.totalAmount)}</span>
                          <span className={`block text-[9px] uppercase font-bold ${
                            tx.status === 'completed' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-slate-400'
                          }`}>{tx.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center text-slate-400 text-xs font-semibold sticky top-4">
              <Award size={36} className="mx-auto text-slate-300 mb-2" />
              Pilih salah satu pelanggan di daftar untuk memuat profil riwayat berbelanja lengkap mereka.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
