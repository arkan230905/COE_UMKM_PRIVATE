import React, { useState } from 'react';
import { Truck, Search, CheckCircle2, Package, MapPin, Phone, MessageSquare, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Transaction, Customer, UMKMPreset } from '../types';

interface AdminShippingProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
  currentPreset: UMKMPreset;
}

export default function AdminShipping({
  transactions,
  setTransactions,
  customers,
  currentPreset
}: AdminShippingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Dalam Antrean' | 'Sedang Dikemas' | 'Sedang Dikirim' | 'Sampai Tujuan'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Editing form states
  const [courierName, setCourierName] = useState('J&T Express');
  const [shippingStatus, setShippingStatus] = useState<'Dalam Antrean' | 'Sedang Dikemas' | 'Sedang Dikirim'>('Dalam Antrean');
  const [trackingNumber, setTrackingNumber] = useState('');

  const formatCurrency = (val: number) => {
    if (currentPreset.currency === '$') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Find linked customer profile
  const getCustomer = (customerId: number) => {
    return customers.find(c => c.id === customerId);
  };

  // Filter transactions with shipping status defined (or all transactions)
  const shippingTransactions = transactions.filter(t => t.shippingStatus);

  const filteredTrans = shippingTransactions.filter(t => {
    const cust = getCustomer(t.customerId);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = t.transactionCode.toLowerCase().includes(searchLower) || (cust && cust.name.toLowerCase().includes(searchLower));
    const matchesFilter = statusFilter === 'all' || t.shippingStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate quick stats of current preset's categories
  const statTotal = shippingTransactions.length;
  const statPending = shippingTransactions.filter(t => t.shippingStatus === 'Dalam Antrean').length;
  const statPacking = shippingTransactions.filter(t => t.shippingStatus === 'Sedang Dikemas').length;
  const statInTransit = shippingTransactions.filter(t => t.shippingStatus === 'Sedang Dikirim').length;
  const statDelivered = shippingTransactions.filter(t => t.shippingStatus === 'Sampai Tujuan').length;

  const handleUpdateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    const newStatus = shippingStatus;

    setTransactions(prev => {
      const updated = prev.map(t => {
        if (t.id === selectedTx.id) {
          return {
            ...t,
            shippingStatus: newStatus,
            courierName: courierName || t.courierName,
            trackingNumber: trackingNumber || t.trackingNumber
          } as Transaction;
        }
        return t;
      });
      localStorage.setItem(`umkm_${currentPreset.id}_transactions`, JSON.stringify(updated));
      return updated;
    });

    alert(`Informasi pengiriman untuk ${selectedTx.transactionCode} berhasil diperbarui!`);
    setSelectedTx(null);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setCourierName(tx.courierName || 'J&T Express');
    setShippingStatus(tx.shippingStatus !== 'Sampai Tujuan' ? (tx.shippingStatus || 'Dalam Antrean') as any : 'Dalam Antrean');
    setTrackingNumber(tx.trackingNumber || '');
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs gap-4 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Truck size={18} />
            </span>
            <span className="text-[10px] bg-indigo-150/10 text-indigo-700 dark:text-indigo-300 font-extrabold uppercase px-2.5 py-0.5 rounded-full">Sistem Manajemen Logistik</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pantau Pengiriman Produk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor status pengiriman pesanan pelanggan dan masukkan nomor resi real-time bagi UMKM {currentPreset.businessName}.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 font-bold">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Total Logistik</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-1">{statTotal}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-amber-550 dark:text-amber-400 uppercase">Dalam Antrean</span>
          <span className="text-2xl font-black text-amber-550 dark:text-amber-400 leading-tight mt-1">{statPending}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase">Sedang Dikemas</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-tight mt-1">{statPacking}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-blue-500 uppercase">Sedang Dikirim</span>
          <span className="text-2xl font-black text-blue-550 dark:text-blue-400 leading-tight mt-1">{statInTransit}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black">Sampai Tujuan</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight mt-1">{statDelivered}</span>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs font-semibold">
        {/* Horizontal Filters list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
            }`}
          >
            Semua ({statTotal})
          </button>
          <button
            onClick={() => setStatusFilter('Dalam Antrean')}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition whitespace-nowrap ${
              statusFilter === 'Dalam Antrean'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
            }`}
          >
            Antrean ({statPending})
          </button>
          <button
            onClick={() => setStatusFilter('Sedang Dikemas')}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition whitespace-nowrap ${
              statusFilter === 'Sedang Dikemas'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
            }`}
          >
            Dikemas ({statPacking})
          </button>
          <button
            onClick={() => setStatusFilter('Sedang Dikirim')}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition whitespace-nowrap ${
              statusFilter === 'Sedang Dikirim'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
            }`}
          >
            Dikirim ({statInTransit})
          </button>
          <button
            onClick={() => setStatusFilter('Sampai Tujuan')}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition whitespace-nowrap ${
              statusFilter === 'Sampai Tujuan'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
            }`}
          >
            Sampai Tujuan ({statDelivered})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari transaksi / pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-white rounded-lg focus:outline-none focus:ring-1"
          />
        </div>
      </div>

      {/* Main Grid List of Shipments */}
      {filteredTrans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrans.map((tx) => {
            const cust = getCustomer(tx.customerId);
            return (
              <div
                key={tx.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative"
              >
                {/* Header Information */}
                <div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded">
                        {tx.transactionCode}
                      </span>
                      <p className="text-[10px] text-slate-400 pt-1">{formatDate(tx.createdAt)}</p>
                    </div>
                    <div>
                      {tx.shippingStatus === 'Sampai Tujuan' ? (
                        <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-emerald-50 dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={11} /> Sampai Tujuan
                        </span>
                      ) : tx.shippingStatus === 'Sedang Dikirim' ? (
                        <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-blue-400 rounded-lg flex items-center gap-1 animate-pulse">
                          <Package size={11} /> Sedang Dikirim
                        </span>
                      ) : tx.shippingStatus === 'Sedang Dikemas' ? (
                        <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-indigo-50 dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 rounded-lg flex items-center gap-1">
                          <Package size={11} /> Sedang Dikemas
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-amber-50 dark:bg-slate-850 text-amber-550 dark:text-amber-400 rounded-lg flex items-center gap-1">
                          <Package size={11} /> Dalam Antrean
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Block info */}
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center text-slate-800 dark:text-slate-100">
                      <span>Penerima:</span>
                      <span className="font-extrabold">{cust ? cust.name : 'Unknown Customer'}</span>
                    </div>
                    {cust && (
                      <div className="flex justify-between items-center text-slate-550 dark:text-slate-300">
                        <span>WhatsApp:</span>
                        <a
                          href={`https://wa.me/${cust.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline"
                        >
                          <Phone size={11} /> {cust.phone} <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                    <div className="text-[11px] leading-normal text-slate-400 dark:text-slate-400 font-normal pt-1 flex items-start gap-1">
                      <MapPin size={11} className="shrink-0 text-slate-400 mt-0.5" />
                      <span>{cust ? cust.address : 'Alamat belum diinput'}</span>
                    </div>
                  </div>

                  {/* Courier selection view parameters */}
                  {tx.courierName && (
                    <div className="mt-3.5 flex items-center justify-between text-[11px] bg-slate-100/55 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-150/40 dark:border-slate-800 font-bold">
                      <div className="text-slate-400">Ekspedisi: <span className="text-slate-800 dark:text-slate-200">{tx.courierName}</span></div>
                      {tx.trackingNumber ? (
                        <div className="text-slate-400">No. Resi: <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{tx.trackingNumber}</span></div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Resi belum diinput</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit triggers */}
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800">
                  {tx.shippingStatus === 'Sampai Tujuan' ? (
                    <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 rounded-xl border border-emerald-550/20 text-[10.5px] text-emerald-600 dark:text-emerald-400 leading-normal">
                      <Info size={13} className="shrink-0" />
                      <span>Selesai! Pengiriman telah dikonfirmasi sampai di tujuan dengan selamat oleh pembeli.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenEdit(tx)}
                      className="w-full py-2 bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-750 text-white rounded-xl text-xs font-bold cursor-pointer transition select-none shadow-xs text-center border border-slate-200 dark:border-slate-755"
                    >
                      Proses & Update Pengiriman 🛠️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3 font-semibold text-xs">
          <Truck size={40} className="mx-auto text-slate-350" />
          <p className="text-slate-400">Tidak ada pengiriman yang sesuai dengan kriteria filter.</p>
        </div>
      )}

      {/* PROCESS SHIPMENT DIALOG MODAL BOX */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-850 dark:hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Proses Pengiriman Barang</h4>
                <p className="text-xs text-slate-405">{selectedTx.transactionCode}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateShipping} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Pilih Ekspedisi</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="J&T Express">J&T Express</option>
                  <option value="JNE Reguler">JNE Reguler</option>
                  <option value="SiCepat Express">SiCepat Express</option>
                  <option value="GoSend Instant">GoSend Instant</option>
                  <option value="GrabExpress">GrabExpress</option>
                  <option value="Kurir Toko (Internal)">Kurir Toko (Internal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Status Lokasi</label>
                <select
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Dalam Antrean">1. Dalam Antrean (Belum Dikemas)</option>
                  <option value="Sedang Dikemas">2. Sedang Dikemas (Sedang Dipacking)</option>
                  <option value="Sedang Dikirim">3. Sedang Dikirim (Sudah di Kurir)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nomor Resi / Bukti Antar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JT19802837492"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-mono"
                />
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-550/20 text-slate-650 dark:text-amber-400 leading-normal font-normal text-[10.5px]">
                <div className="flex gap-1.5 items-start">
                  <AlertCircle size={14} className="shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <strong>Informasi Logistik:</strong> Status "Sampai Tujuan" tidak tersedia di menu admin. Pelanggan wajib mengonfirmasi langsung penerimaan mereka jika barang telah terkirim dengan baik.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 rounded-xl text-center cursor-pointer select-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer text-center"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
