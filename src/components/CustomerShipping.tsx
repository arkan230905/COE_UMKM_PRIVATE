import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react';
import { Transaction, Customer, UMKMPreset } from '../types';
import storageService from '../services/storage';

interface CustomerShippingProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentUser: Customer;
  currentPreset: UMKMPreset;
}

export default function CustomerShipping({
  transactions,
  setTransactions,
  currentUser,
  currentPreset
}: CustomerShippingProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // ✅ DEBUG: Log initial data
  React.useEffect(() => {
    console.log('=== CUSTOMER SHIPPING DEBUG ===');
    console.log('📊 Total transactions loaded:', transactions.length);
    console.log('👤 Current user:', currentUser);
    console.log('📦 All transactions:', transactions);
    console.log('===============================');
  }, [transactions, currentUser]);

  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Filter: Show ALL shipping transactions that are not yet completed
  const userShippingTransactions = transactions.filter(t => {
    // ✅ FLEXIBLE TYPE COMPARISON - Handle both number and string IDs
    const customerIdMatch = t.customerId == currentUser.id; // Use == instead of === for type coercion
    const isShippingTransaction = t.requiresShipping === true || !!t.shippingStatus;
    
    // ✅ Show if NOT completed yet (any status except "Sampai Tujuan" and "completed")
    const notYetDelivered = t.shippingStatus !== 'Sampai Tujuan' && t.status !== 'completed';
    
    console.log(`🔍 Transaction #${t.transactionCode}:`, {
      'Transaction customerId': t.customerId,
      'Transaction customerId type': typeof t.customerId,
      'Current user ID': currentUser.id,
      'Current user ID type': typeof currentUser.id,
      'IDs match (==)': customerIdMatch,
      'IDs match (===)': t.customerId === currentUser.id,
      requiresShipping: t.requiresShipping,
      shippingStatus: t.shippingStatus,
      isShippingTransaction,
      status: t.status,
      notYetDelivered,
      '✅ SHOULD_SHOW': customerIdMatch && isShippingTransaction && notYetDelivered
    });
    
    return customerIdMatch && isShippingTransaction && notYetDelivered;
  });

  console.log('📋 Total shipping transactions for this user:', userShippingTransactions.length);
  console.log('📦 Filtered transactions:', userShippingTransactions);

  const handleConfirmDelivery = async (transaction: Transaction) => {
    const confirmMsg = `⚠️ KONFIRMASI PENERIMAAN BARANG\n\nApakah Anda sudah menerima paket pesanan #${transaction.transactionCode}?\n\nDengan mengkonfirmasi, status pesanan akan berubah menjadi "Selesai" dan transaksi akan ditutup.\n\nLanjutkan?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      console.log('📦 Customer confirming delivery for transaction:', transaction.id);
      
      // Update to database via API - returns updated transaction
      const updatedTransaction = await storageService.updateTransactionShipping(transaction.id, {
        shippingStatus: 'Sampai Tujuan',
        status: 'completed'
      });

      console.log('✅ Delivery confirmed in database:', updatedTransaction);

      // ✅ RELOAD ALL TRANSACTIONS FROM DATABASE to get fresh data
      const freshTransactions = await storageService.getTransactions();
      setTransactions(freshTransactions);
      console.log('✅ All transactions reloaded from database');

      // Close modal if open
      if (selectedTx && selectedTx.id === transaction.id) {
        setSelectedTx(null);
      }

      alert('✅ Terima kasih! Pesanan Anda telah dikonfirmasi sebagai "Barang Sampai".\n\nTransaksi telah selesai. Terima kasih telah berbelanja di ' + currentPreset.businessName + '! 🎉');
    } catch (error: any) {
      console.error('❌ Error confirming delivery:', error);
      alert('❌ Gagal konfirmasi penerimaan barang: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Halaman Pelanggan</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
          Pantau Pengiriman Pesanan
        </h1>
        <p className="text-xs text-slate-400">Lacak status pengiriman dan konfirmasi penerimaan barang pesanan Anda</p>
      </div>

      {/* Shipping Cards List */}
      {userShippingTransactions.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {userShippingTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Kode Pesanan:</span>
                    <span className="text-sm font-mono font-black text-slate-900 dark:text-white">#{tx.transactionCode}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Dipesan: {new Date(tx.createdAt).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Belanja</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(tx.totalAmount)}</span>
                </div>
              </div>

              {/* Products List */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Produk yang Dipesan:</span>
                <div className="space-y-1">
                  {tx.items && tx.items.length > 0 ? (
                    tx.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">{item.productName}</span>
                          <span className="text-slate-400 ml-1">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No items</span>
                  )}
                  {tx.items && tx.items.length > 3 && (
                    <div className="text-[10px] text-slate-400 pt-1">+{tx.items.length - 3} produk lainnya</div>
                  )}
                </div>
              </div>

              {/* Visual Tracker Line & Steps */}
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="block font-bold text-xs uppercase text-indigo-600 dark:text-blue-400 mb-4">
                  📦 Status Pengiriman
                </span>
                
                <div className="flex items-center justify-between relative pt-2 pb-6">
                  {/* Background Bar */}
                  <div className="absolute left-[8%] right-[8%] top-[18px] h-1 bg-slate-200 dark:bg-slate-700 z-0" />
                  {/* Colored active path bar based on current step */}
                  <div 
                    className="absolute left-[8%] top-[18px] h-1 bg-emerald-500 z-0 transition-all duration-500"
                    style={{
                      width: 
                        tx.shippingStatus === 'Sampai Tujuan' ? '84%' :
                        tx.shippingStatus === 'Sedang Dikirim' ? '56%' :
                        tx.shippingStatus === 'Sedang Dikemas' ? '28%' : '0%'
                    }}
                  />

                  {/* Step 1: Dipesan */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 flex-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-emerald-500 text-white shadow-sm">1</div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Dipesan</span>
                  </div>

                  {/* Step 2: Dikemas */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 flex-1">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                        tx.shippingStatus === 'Sedang Dikemas' || tx.shippingStatus === 'Sedang Dikirim' || tx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >2</div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Dikemas</span>
                  </div>

                  {/* Step 3: Dikirim */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 flex-1">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                        tx.shippingStatus === 'Sedang Dikirim' || tx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >3</div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Dikirim</span>
                  </div>

                  {/* Step 4: Tiba */}
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 flex-1">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                        tx.shippingStatus === 'Sampai Tujuan'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >4</div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Tiba</span>
                  </div>
                </div>

                {/* Current Status Info */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center font-bold text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Status Saat Ini:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 uppercase font-black">
                      {tx.shippingStatus || 'Dalam Antrean'}
                    </span>
                  </div>
                  {tx.courierName && (
                    <div className="flex justify-between font-medium text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Expedisi / Kurir:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{tx.courierName}</span>
                    </div>
                  )}
                  {tx.trackingNumber ? (
                    <div className="flex justify-between font-medium text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Nomor Resi:</span>
                      <span className="font-mono text-indigo-600 dark:text-blue-400 font-bold">{tx.trackingNumber}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center pt-1">
                      Nomor resi sedang diproses oleh admin toko
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedTx(tx)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Lihat Detail Lengkap
                </button>
                {/* ✅ ONLY show confirm button when status is "Sedang Dikirim" */}
                {tx.shippingStatus === 'Sedang Dikirim' && (
                  <button
                    onClick={() => handleConfirmDelivery(tx)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={16} />
                    Barang Sudah Sampai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-4">
          <Package size={48} className="mx-auto text-slate-300" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">Tidak ada pengiriman aktif</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Pesanan Anda yang memerlukan pengiriman akan muncul di sini.
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Detail Pengiriman</h4>
                  <p className="text-xs text-slate-400">Pesanan #{selectedTx.transactionCode}</p>
                </div>
              </div>

              {/* Customer & Address Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                  <User size={14} />
                  <span>Informasi Penerima</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Nama:</span>
                    <span className="ml-2 text-slate-900 dark:text-white font-bold">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Telepon:</span>
                    <span className="ml-2 text-slate-900 dark:text-white font-bold">{currentUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Alamat:</span>
                    <p className="mt-1 text-slate-900 dark:text-white font-semibold">{currentUser.address}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Status */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Status Pengiriman:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase">
                    {selectedTx.shippingStatus || 'Dalam Antrean'}
                  </span>
                </div>
                {selectedTx.courierName && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Kurir:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedTx.courierName}</span>
                  </div>
                )}
                {selectedTx.trackingNumber && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">No. Resi:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-blue-400">{selectedTx.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="block font-bold text-slate-900 dark:text-white mb-2 text-sm">Produk yang Dikirim</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedTx.items && selectedTx.items.length > 0 ? (
                    selectedTx.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 text-xs">
                        <div className="flex-1">
                          <span className="block text-slate-900 dark:text-white font-bold">{item.productName}</span>
                          <span className="text-slate-400 text-[10px]">{item.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-slate-600 dark:text-slate-400">{item.quantity} x {formatCurrency(item.price)}</span>
                          <span className="block font-black text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 italic">No items</div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(selectedTx.totalAmount)}</span>
              </div>

              {/* Confirm Button - ONLY show when status is "Sedang Dikirim" */}
              {selectedTx.shippingStatus === 'Sedang Dikirim' && selectedTx.status !== 'completed' && (
                <button
                  onClick={() => handleConfirmDelivery(selectedTx)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle size={18} />
                  Konfirmasi: Barang Sudah Sampai
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
