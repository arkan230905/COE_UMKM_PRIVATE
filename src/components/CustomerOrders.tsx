import React, { useState } from 'react';
import { ListOrdered, Search, Eye, FileText, CheckCircle2, Clock, XCircle, ShoppingBag, Landmark, AlertCircle } from 'lucide-react';
import { Transaction, Customer, UMKMPreset } from '../types';

interface CustomerOrdersProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentUser: Customer;
  currentPreset: UMKMPreset;
}

export default function CustomerOrders({
  transactions,
  setTransactions,
  currentUser,
  currentPreset
}: CustomerOrdersProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"><CheckCircle2 size={11} /> Selesai</span>;
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"><CheckCircle2 size={11} /> Dibayar</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"><Clock size={11} /> Menunggu</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"><XCircle size={11} /> Batal</span>;
      default:
        return null;
    }
  };

  // Only load transactions belonging to current logged in customer user
  const userTransactions = transactions.filter(t => t.customerId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Halaman Pelanggan</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ListOrdered size={24} style={{ color: currentPreset.accentColor }} />
          Riwayat Belanja Saya
        </h1>
        <p className="text-xs text-slate-400">Pantau status pengiriman, tagihan kasir, dan cetak invoice pembelian Anda</p>
      </div>

      {userTransactions.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-medium">
          <div className="overflow-x-auto text-xs animate-fade-in divide-y divide-slate-100">
            <table className="w-full text-left text-slate-500">
              <thead className="text-[11px] text-slate-450 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Kode Invoice</th>
                  <th scope="col" className="px-6 py-4">Waktu Pemesanan</th>
                  <th scope="col" className="px-6 py-4">Metode Bayar</th>
                  <th scope="col" className="px-6 py-4 text-right">Total Transaksi</th>
                  <th scope="col" className="px-6 py-4 text-center">Status Pesanan</th>
                  <th scope="col" className="px-6 py-4 text-center">Invoice Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-medium">
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      #{tx.transactionCode}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      {formatCurrency(tx.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-4">
          <ShoppingBag size={48} className="mx-auto text-slate-300" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-405 font-bold">Belum ada riwayat transaksi.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Silakan kunjungi menu "Katalog Produk" untuk mulai berbelanja produk-produk UMKM.</p>
          </div>
        </div>
      )}

      {/* Invoice modal details duplicates */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Rincian Invoice Transaksi #{selectedTx.transactionCode}</h4>
                <p className="text-xs text-slate-400">Log order log detail & kelola status</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block font-bold">Atas Nama Penerima</span>
                  <span className="font-bold text-slate-900 dark:text-white font-serif">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Metode Pembayaran</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTx.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Tanggal Transaksi</span>
                  <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedTx.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Status Pembayaran</span>
                  <span className="pt-0.5 block">{getStatusBadge(selectedTx.status)}</span>
                </div>
              </div>

              {/* Shipping tracker stepper */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 relative">
                <span className="block font-bold text-[10px] uppercase text-indigo-600 dark:text-blue-400">
                  Pelacakan Kondisi Barang / Posisi Kurir
                </span>
                
                {/* Visual Tracker Line & Steps */}
                <div className="flex items-center justify-between relative pt-2">
                  {/* Background Bar */}
                  <div className="absolute left-[8%] right-[8%] top-[18px] h-1 bg-slate-200 dark:bg-slate-700 z-0" />
                  {/* Colored active path bar based on current step */}
                  <div 
                    className="absolute left-[8%] top-[18px] h-1 bg-emerald-500 z-0 transition-all duration-500"
                    style={{
                      width: 
                        selectedTx.shippingStatus === 'Sampai Tujuan' ? '84%' :
                        selectedTx.shippingStatus === 'Sedang Dikirim' ? '56%' :
                        selectedTx.shippingStatus === 'Sedang Dikemas' ? '28%' : '0%'
                    }}
                  />

                  {/* Step 1: Dipesan */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-500 text-white shadow-sm font-sans">1</div>
                    <span className="text-[9px] font-bold text-slate-800 dark:text-gray-200">Dipesan</span>
                  </div>

                  {/* Step 2: Dikemas */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm font-sans ${
                        selectedTx.shippingStatus === 'Sedang Dikemas' || selectedTx.shippingStatus === 'Sedang Dikirim' || selectedTx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >2</div>
                    <span className="text-[9px] font-bold text-slate-800 dark:text-gray-200">Dikemas</span>
                  </div>

                  {/* Step 3: Dikirim */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm font-sans ${
                        selectedTx.shippingStatus === 'Sedang Dikirim' || selectedTx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >3</div>
                    <span className="text-[9px] font-bold text-slate-800 dark:text-gray-200">Dikirim</span>
                  </div>

                  {/* Step 4: Tiba */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm font-sans ${
                        selectedTx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >4</div>
                    <span className="text-[9px] font-bold text-slate-800 dark:text-gray-200">Tiba</span>
                  </div>
                </div>

                {/* Sub status details box */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg space-y-1 text-slate-650 dark:text-slate-350">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-slate-500">Kondisi Pengiriman:</span>
                    <span className="text-emerald-600 dark:text-emerald-450 uppercase">{selectedTx.shippingStatus || 'Dalam Antrean'}</span>
                  </div>
                  {selectedTx.courierName && (
                    <div className="flex justify-between font-medium text-[11px]">
                      <span className="text-slate-500">Expedisi / Kurir:</span>
                      <span className="text-slate-850 dark:text-slate-100 font-bold">{selectedTx.courierName}</span>
                    </div>
                  )}
                  {selectedTx.trackingNumber ? (
                    <div className="flex justify-between font-medium text-[11px]">
                      <span className="text-slate-500">Nomor Resi Pelacakan:</span>
                      <span className="font-mono text-indigo-600 dark:text-blue-400 font-bold">{selectedTx.trackingNumber}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-normal italic pt-1 text-center">
                      Nomor resi atau kurir internal sedang diproses oleh admin toko.
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table container listing */}
              <div>
                <span className="block font-bold text-slate-900 dark:text-white mb-2">Item Terbeli</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold">
                    <span className="flex-[2] text-left">Nama Produk</span>
                    <span className="flex-1 text-center">Qty / Harga</span>
                    <span className="flex-1 text-right">Subtotal</span>
                  </div>
                  <div className="flex items-center justify-between p-3 text-slate-700 dark:text-slate-350 font-medium">
                    <span className="flex-[2] text-left text-slate-950 dark:text-white font-bold">Pembelian Paket Belanja Unit UMKM</span>
                    <span className="flex-1 text-center font-mono">1 x {formatCurrency(selectedTx.totalAmount)}</span>
                    <span className="flex-1 text-right font-black text-slate-950 dark:text-white">{formatCurrency(selectedTx.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedTx.notes && (
                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-100/30 text-slate-600 dark:text-slate-405 flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-400 block">Catatan Pesanan Anda:</span>
                    <span>{selectedTx.notes}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-950 dark:text-white">Grand Total Tagihan</span>
                <span className="text-lg font-extrabold" style={{ color: currentPreset.accentColor }}>
                  {formatCurrency(selectedTx.totalAmount)}
                </span>
              </div>

              {selectedTx.shippingStatus !== 'Sampai Tujuan' && (
                <button
                  type="button"
                  onClick={() => {
                    const newShippingStatus = 'Sampai Tujuan';
                    const newStatus = 'completed';
                    setTransactions(prev => {
                      const updated = prev.map(t => {
                        if (t.id === selectedTx.id) {
                          return {
                            ...t,
                            shippingStatus: newShippingStatus,
                            status: newStatus
                          } as Transaction;
                        }
                        return t;
                      });
                      localStorage.setItem(`umkm_${currentPreset.id}_transactions`, JSON.stringify(updated));
                      return updated;
                    });
                    
                    setSelectedTx(prev => prev ? {
                      ...prev,
                      shippingStatus: newShippingStatus,
                      status: newStatus
                    } : null);
                    
                    alert('Terima kasih! Pesanan Anda telah berhasil dikonfirmasi sampai di tujuan.');
                  }}
                  className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-center cursor-pointer transition shadow-xs text-xs"
                >
                  Konfirmasi Barang Sudah Sampai ✅
                </button>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-705 dark:text-slate-200 font-semibold rounded-lg cursor-pointer"
              >
                Tutup Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
