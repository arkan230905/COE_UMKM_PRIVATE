import React, { useState } from 'react';
import { ListOrdered, Search, Edit3, Eye, FileText, CheckCircle2, Clock, XCircle, User, MessageSquare, ShieldAlert, ArrowRight } from 'lucide-react';
import { Transaction, Customer, UMKMPreset, TransactionStatus } from '../types';

interface AdminTransactionsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
  currentPreset: UMKMPreset;
}

export default function AdminTransactions({
  transactions,
  setTransactions,
  customers,
  currentPreset
}: AdminTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Shipping details management states
  const [courierName, setCourierName] = useState('J&T Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingStatus, setShippingStatus] = useState<'Dalam Antrean' | 'Sedang Dikemas' | 'Sedang Dikirim' | 'Sampai Tujuan'>('Dalam Antrean');

  React.useEffect(() => {
    if (selectedTx) {
      setCourierName(selectedTx.courierName || 'J&T Express');
      setTrackingNumber(selectedTx.trackingNumber || '');
      setShippingStatus(selectedTx.shippingStatus || 'Dalam Antrean');
    }
  }, [selectedTx]);

  const handleUpdateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    setTransactions(prev =>
      prev.map(t =>
        t.id === selectedTx.id
          ? {
              ...t,
              courierName,
              trackingNumber,
              shippingStatus,
              status: shippingStatus === 'Sampai Tujuan' ? 'completed' : t.status
            }
          : t
      )
    );

    // Update locally too
    setSelectedTx(prev =>
      prev
        ? {
            ...prev,
            courierName,
            trackingNumber,
            shippingStatus,
            status: shippingStatus === 'Sampai Tujuan' ? 'completed' : prev.status
          }
        : null
    );
  };

  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const updateStatus = (id: number, newStatus: TransactionStatus) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
    // If selected tx, refresh its details state
    if (selectedTx && selectedTx.id === id) {
      setSelectedTx(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"><CheckCircle2 size={11} /> Selesai</span>;
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"><CheckCircle2 size={11} /> Dibayar</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"><Clock size={11} /> Menunggu</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"><XCircle size={11} /> Batal</span>;
      default:
        return null;
    }
  };

  // Filter lists based on keys strings and selections
  const filteredTransactions = transactions.filter(t => {
    const customer = customers.find(c => c.id === t.customerId);
    const customerName = customer ? customer.name.toLowerCase() : 'pembeli umum';
    const txCode = t.transactionCode.toLowerCase();

    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || txCode.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header sections */}
      <div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ListOrdered className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
          Transactions Log
        </h1>
        <p className="text-xs text-slate-400">View real-time purchase details, dispatch statuses, and change payment records</p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan ID kode, nama pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
          />
        </div>

        {/* Status filter selection Dropdown list */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="font-bold text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Dibayar</option>
            <option value="completed">Selesai (Diambil/Terkirim)</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Main transactions grid index list */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in font-medium">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Kode Transaksi</th>
                  <th scope="col" className="px-6 py-4">Nama Pelanggan</th>
                  <th scope="col" className="px-6 py-4">Waktu Pesan</th>
                  <th scope="col" className="px-6 py-4">Metode Bayar</th>
                  <th scope="col" className="px-6 py-4 text-right">Total Tagihan</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-center font-bold">Ubah Status / Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const customer = customers.find(c => c.id === tx.customerId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                        #{tx.transactionCode}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-sm bg-slate-50 dark:bg-slate-800 items-center justify-center flex text-slate-500 font-bold uppercase text-[10px]">
                            {customer ? customer.name.substring(0,2) : 'EM'}
                          </div>
                          <div>
                            <span className="block text-slate-900 dark:text-white font-bold">{customer ? customer.name : 'Guest User'}</span>
                            <span className="block text-[10px] text-slate-400">{customer ? customer.phone : 'Toko Retail'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-450">
                        {new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-350">
                        {tx.paymentMethod}
                      </td>

                      <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(tx.totalAmount)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(tx.status)}
                      </td>

                      {/* Dropdown status toggler or view invoice */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={tx.status}
                            onChange={(e) => updateStatus(tx.id, e.target.value as TransactionStatus)}
                            className="text-[10px] px-1.5 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="pending">Menunggu</option>
                            <option value="paid">Dibayar</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Batal</option>
                          </select>
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md cursor-pointer text-[10px] font-bold inline-flex items-center gap-0.5"
                          >
                            <Eye size={11} /> Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
          <ListOrdered size={40} className="mx-auto text-slate-350" />
          <p className="text-sm text-slate-400 font-medium">Log pesanan tidak dijumpai.</p>
        </div>
      )}

      {/* Transaction Details Modal Box duplicate */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md"
            >
              <span className="text-lg font-bold">✕</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
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
                  <span className="text-slate-400 block font-bold">Customer ID</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">#C{selectedTx.customerId}</span>
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

              {/* Status Action controls inside modal */}
              <div className="p-3 bg-indigo-50/40 dark:bg-slate-850 rounded-xl border border-indigo-100/30 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-350">Ubah Status Cepat:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateStatus(selectedTx.id, 'paid')}
                    className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Set Lunas
                  </button>
                  <button
                    onClick={() => updateStatus(selectedTx.id, 'completed')}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Set Selesai
                  </button>
                  <button
                    onClick={() => updateStatus(selectedTx.id, 'cancelled')}
                    className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Set Batalkan
                  </button>
                </div>
              </div>

              {/* Shipping & Delivery Tracker read-only display */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 relative">
                <span className="block font-bold text-[10px] uppercase text-indigo-600 dark:text-blue-400">
                  Status Pengiriman Barang (Penerimaan Pelanggan)
                </span>
                
                {/* Visual Tracker Line & Steps */}
                <div className="flex items-center justify-between relative pt-2">
                  <div className="absolute left-[8%] right-[8%] top-[18px] h-1 bg-slate-200 dark:bg-slate-700 z-0" />
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
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 font-medium">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-500 text-white shadow-xs">1</div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">Dipesan</span>
                  </div>

                  {/* Step 2: Dikemas */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 font-medium">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ${
                        selectedTx.shippingStatus === 'Sedang Dikemas' || selectedTx.shippingStatus === 'Sedang Dikirim' || selectedTx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >2</div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">Dikemas</span>
                  </div>

                  {/* Step 3: Dikirim */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 font-medium">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ${
                        selectedTx.shippingStatus === 'Sedang Dikirim' || selectedTx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >3</div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">Dikirim</span>
                  </div>

                  {/* Step 4: Tiba */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 font-medium">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ${
                        selectedTx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >4</div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">Tiba</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-350 select-none">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>Status Lokasi / Kondisi:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 uppercase font-black">
                      {selectedTx.shippingStatus || 'Dalam Antrean'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal italic pt-1.5 text-center leading-normal">
                    💡 Status ini hanya dapat diubah menjadi "Sampai Tujuan" oleh konfirmasi langsung pelanggan via portal pelanggan mereka.
                  </div>
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
                  {/* Mock item list */}
                  <div className="flex items-center justify-between p-3 text-slate-700 dark:text-slate-300">
                    <span className="flex-[2] text-left text-slate-950 dark:text-white">Multivitamin Complex & Supplements Paket</span>
                    <span className="flex-1 text-center font-mono text-[11px]">1 x {formatCurrency(selectedTx.totalAmount)}</span>
                    <span className="flex-1 text-right font-bold text-slate-950 dark:text-white">{formatCurrency(selectedTx.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedTx.notes && (
                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-100/30 text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <MessageSquare size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-400 block">Catatan Pesanan:</span>
                    <span>{selectedTx.notes}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Grand Total Tagihan</span>
                <span className="text-lg font-extrabold" style={{ color: currentPreset.accentColor }}>
                  {formatCurrency(selectedTx.totalAmount)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
