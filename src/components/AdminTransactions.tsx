import React, { useState } from 'react';
import { ListOrdered, Search, Edit3, Eye, FileText, CheckCircle2, Clock, XCircle, User, MessageSquare, ShieldAlert, ArrowRight, Plus, ShoppingCart, Barcode, Trash2, X, CheckCircle } from 'lucide-react';
import { Transaction, Customer, UMKMPreset, TransactionStatus, Product } from '../types';
import storageService from '../services/storage';

interface AdminTransactionsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentPreset: UMKMPreset;
}

export default function AdminTransactions({
  transactions,
  setTransactions,
  customers,
  products,
  setProducts,
  currentPreset
}: AdminTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [viewMode, setViewMode] = useState<'online' | 'offline'>('online');
  
  // Kasir Offline states
  const [showKasirModal, setShowKasirModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSearchInput, setProductSearchInput] = useState('');
  const [cartItems, setCartItems] = useState<Array<{
    product: Product;
    quantity: number;
  }>>([]);
  const [kasirPaymentMethod, setKasirPaymentMethod] = useState<'Cash' | 'E-Wallet' | 'Debit Card' | 'QRIS'>('Cash');
  const [kasirNotes, setKasirNotes] = useState('');

  // Log products when kasir modal opens
  React.useEffect(() => {
    if (showKasirModal) {
      console.log('🏪 Kasir Modal Opened');
      console.log('📦 Total products:', products.length);
      console.log('📦 Products with barcode:', products.filter(p => p.barcode).length);
      console.log('📦 Active products:', products.filter(p => p.isActive).length);
      console.log('📦 Sample products:', products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        isActive: p.isActive,
        stock: p.stock
      })));
    }
  }, [showKasirModal, products]);

  // Kasir Functions
  const handleBarcodeSearch = (barcode: string) => {
    console.log('🔍 Searching for barcode:', barcode);
    console.log('📦 Total products available:', products.length);
    console.log('📦 Sample products with barcodes:', products.filter(p => p.barcode).slice(0, 3).map(p => ({ id: p.id, name: p.name, barcode: p.barcode })));
    
    const product = products.find(p => p.barcode && p.barcode.trim() === barcode.trim() && p.isActive);
    if (product) {
      console.log('✅ Product found:', product.name, 'Barcode:', product.barcode);
      addToCart(product);
      setBarcodeInput('');
      setProductSearchInput('');
    } else {
      console.log('❌ Product NOT found for barcode:', barcode);
      alert(`Produk dengan barcode "${barcode}" tidak ditemukan atau tidak aktif.`);
    }
  };

  const handleProductNameSearch = (searchName: string) => {
    console.log('🔍 Searching for product name:', searchName);
    const product = products.find(p => 
      p.name.toLowerCase().includes(searchName.toLowerCase()) && p.isActive
    );
    if (product) {
      console.log('✅ Product found:', product.name);
      addToCart(product);
      setBarcodeInput('');
      setProductSearchInput('');
    } else {
      console.log('❌ Product NOT found for name:', searchName);
      alert(`Produk dengan nama "${searchName}" tidak ditemukan atau tidak aktif.`);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Stok produk habis!');
      return;
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          alert(`Stok tidak cukup! Stok tersedia: ${product.stock}`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (!item) return;

    if (newQuantity > item.product.stock) {
      alert(`Stok tidak cukup! Stok tersedia: ${item.product.stock}`);
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleProcessOfflineTransaction = async () => {
    if (cartItems.length === 0) {
      alert('Keranjang kosong! Tambahkan produk terlebih dahulu.');
      return;
    }

    // Generate transaction code
    const txCode = `TRX${Date.now().toString().slice(-8)}`;
    
    const newTransactionData = {
      umkmPresetId: currentPreset.id, // Link to current UMKM for data isolation
      // ✅ NO customerId for offline transactions - backend will auto-create walk-in customer
      transactionCode: txCode,
      totalAmount: calculateTotal(),
      status: 'completed', // Offline transaction langsung selesai
      paymentMethod: kasirPaymentMethod,
      notes: kasirNotes || 'Transaksi Offline - Kasir Toko',
      createdAt: new Date().toISOString(),
      isOffline: true,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        categoryName: '', // Could be populated from category lookup
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      }))
    };

    try {
      console.log('💾 Saving offline transaction to database...', newTransactionData);
      
      // ✅ SAVE TO DATABASE
      const savedTransaction = await storageService.saveTransaction(newTransactionData);
      
      console.log('✅ Offline transaction saved to database:', savedTransaction);
      
      // ✅ RELOAD PRODUCTS FROM DATABASE (to get updated stock)
      const updatedProducts = await storageService.getProducts();
      setProducts(updatedProducts);
      console.log('✅ Products reloaded from database with updated stock');
      
      // Update local state with saved transaction
      setTransactions(prev => [savedTransaction, ...prev]);

      // Clear kasir
      setCartItems([]);
      setKasirNotes('');
      setBarcodeInput('');
      setProductSearchInput('');
      setShowKasirModal(false);

      alert(`✅ Transaksi berhasil disimpan ke database! Kode: ${txCode}`);
    } catch (error: any) {
      console.error('❌ Error saving offline transaction:', error);
      alert('❌ Gagal menyimpan transaksi: ' + (error.message || 'Unknown error'));
    }
  };

  const resetKasir = () => {
    setCartItems([]);
    setKasirNotes('');
    setBarcodeInput('');
    setProductSearchInput('');
    setKasirPaymentMethod('Cash');
  };

  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const isStatusLocked = (status: TransactionStatus): boolean => {
    // Status is locked if it's completed or cancelled
    return status === 'completed' || status === 'cancelled';
  };

  const updateStatus = async (id: number, newStatus: TransactionStatus) => {
    // Find the transaction to check current status
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
      alert('❌ Transaksi tidak ditemukan');
      return;
    }

    // Check if current status is locked
    if (isStatusLocked(transaction.status)) {
      alert('⚠️ Status transaksi ini sudah terkunci dan tidak bisa diubah lagi.\n\nStatus "Selesai" dan "Dibatalkan" bersifat permanen.');
      return;
    }

    // Confirm if changing to a locked status
    if (isStatusLocked(newStatus)) {
      const statusText = newStatus === 'completed' ? 'Selesai' : 'Dibatalkan';
      const confirmMsg = `⚠️ KONFIRMASI PERUBAHAN STATUS\n\nAnda akan mengubah status ke "${statusText}".\nStatus ini PERMANEN dan tidak bisa diubah lagi setelah dikonfirmasi.\n\nLanjutkan?`;
      
      if (!confirm(confirmMsg)) {
        return; // User cancelled
      }
    }

    try {
      console.log(`📤 Updating transaction ${id} status to: ${newStatus}`);
      
      // ✅ SAVE TO DATABASE via API
      await storageService.updateTransactionStatus(id, newStatus);
      
      console.log('✅ Transaction status updated in database');
      
      // Update local state
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      );
      
      // If selected tx, refresh its details state
      if (selectedTx && selectedTx.id === id) {
        setSelectedTx(prev => (prev ? { ...prev, status: newStatus } : null));
      }
      
      const lockMsg = isStatusLocked(newStatus) ? '\n🔒 Status ini sekarang terkunci dan tidak bisa diubah lagi.' : '';
      alert(`✅ Status transaksi berhasil diubah ke: ${newStatus}${lockMsg}`);
    } catch (error: any) {
      console.error('❌ Error updating status:', error);
      alert('❌ Gagal mengubah status: ' + (error.message || 'Unknown error'));
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
    const customerName = customer ? customer.name.toLowerCase() : 'pelanggan toko';
    const txCode = t.transactionCode.toLowerCase();

    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || txCode.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesViewMode = viewMode === 'online' ? !t.isOffline : t.isOffline;

    return matchesSearch && matchesStatus && matchesViewMode;
  });

  // Statistics
  const onlineTransactions = transactions.filter(t => !t.isOffline);
  const offlineTransactions = transactions.filter(t => t.isOffline);
  const onlineTotal = onlineTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const offlineTotal = offlineTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header sections */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Admin</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
            Transaksi Penjualan
          </h1>
          <p className="text-xs text-slate-400">Halaman untuk melihat dan mengelola data penjualan produk kepada pelanggan</p>
        </div>

        {viewMode === 'offline' && (
          <button
            onClick={() => setShowKasirModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs text-white uppercase tracking-wider font-bold rounded-xl shadow-md transition-transform hover:scale-105 duration-150 cursor-pointer"
            style={{ backgroundColor: currentPreset.primaryColor }}
          >
            <Plus size={16} /> Transaksi Kasir
          </button>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
        <button
          onClick={() => setViewMode('online')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            viewMode === 'online'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🌐 Penjualan Online ({onlineTransactions.length})
        </button>
        <button
          onClick={() => setViewMode('offline')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            viewMode === 'offline'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🏪 Penjualan Offline/Toko ({offlineTransactions.length})
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Penjualan Online</span>
          <div className="text-2xl font-black mt-1">{formatCurrency(onlineTotal)}</div>
          <span className="text-xs opacity-90">{onlineTransactions.length} transaksi</span>
        </div>
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Penjualan Offline</span>
          <div className="text-2xl font-black mt-1">{formatCurrency(offlineTotal)}</div>
          <span className="text-xs opacity-90">{offlineTransactions.length} transaksi</span>
        </div>
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
                  <th scope="col" className="px-6 py-4">Produk</th>
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

                      <td className="px-6 py-4">
                        <div className="text-xs">
                          {tx.items && tx.items.length > 0 ? (
                            <div className="space-y-0.5">
                              {tx.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="text-slate-700 dark:text-slate-300">
                                  <span className="font-semibold">{item.productName}</span>
                                  <span className="text-slate-400 ml-1">x{item.quantity}</span>
                                </div>
                              ))}
                              {tx.items.length > 2 && (
                                <div className="text-slate-400 text-[10px]">+{tx.items.length - 2} produk lainnya</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No items</span>
                          )}
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
                          {isStatusLocked(tx.status) ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">🔒 Terkunci</span>
                            </div>
                          ) : (
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
                          )}
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
              <div className="p-3 bg-indigo-50/40 dark:bg-slate-850 rounded-xl border border-indigo-100/30">
                {isStatusLocked(selectedTx.status) ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">🔒 Status Terkunci</span>
                    <span className="text-[10px] text-slate-400">Status ini tidak dapat diubah lagi</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
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
                )}
              </div>

              {/* OFFLINE TRANSACTION INFO */}
              {selectedTx.isOffline && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle size={18} />
                    <div>
                      <span className="block font-bold text-sm">Transaksi Offline - Kasir Toko</span>
                      <span className="block text-xs">Pembayaran langsung di toko, tidak memerlukan pengiriman</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table container listing */}
              <div>
                <span className="block font-bold text-slate-900 dark:text-white mb-2">Item Terbeli</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold">
                    <span className="flex-[2] text-left">Nama Produk</span>
                    <span className="flex-1 text-center">Qty / Harga</span>
                    <span className="flex-1 text-right">Subtotal</span>
                  </div>
                  {/* Display actual items from transaction */}
                  {selectedTx.items && selectedTx.items.length > 0 ? (
                    selectedTx.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 text-slate-700 dark:text-slate-300">
                        <span className="flex-[2] text-left text-slate-950 dark:text-white">{item.productName}</span>
                        <span className="flex-1 text-center font-mono text-[11px]">{item.quantity} x {formatCurrency(item.price)}</span>
                        <span className="flex-1 text-right font-bold text-slate-950 dark:text-white">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 text-slate-700 dark:text-slate-300">
                      <span className="flex-[2] text-left text-slate-950 dark:text-white">Item Detail Tidak Tersedia</span>
                      <span className="flex-1 text-center font-mono text-[11px]">1 x {formatCurrency(selectedTx.totalAmount)}</span>
                      <span className="flex-1 text-right font-bold text-slate-950 dark:text-white">{formatCurrency(selectedTx.totalAmount)}</span>
                    </div>
                  )}
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

      {/* KASIR OFFLINE MODAL */}
      {showKasirModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowKasirModal(false);
                resetKasir();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md z-10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xl">Sistem Kasir - Penjualan Offline</h4>
                <p className="text-xs text-slate-400">Scan barcode atau cari nama produk untuk menambahkan ke keranjang</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT PANEL - Product Search */}
              <div className="lg:col-span-2 space-y-4">
                {/* Barcode Scanner */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Barcode size={18} className="text-blue-600" />
                    Scan Barcode Produk
                  </label>
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && barcodeInput.trim()) {
                        handleBarcodeSearch(barcodeInput.trim());
                      }
                    }}
                    placeholder="Scan atau ketik barcode produk..."
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Tekan Enter setelah scan barcode</p>
                </div>

                {/* Product Name Search */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Search size={18} className="text-emerald-600" />
                    Cari Nama Produk
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productSearchInput}
                      onChange={(e) => setProductSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && productSearchInput.trim()) {
                          handleProductNameSearch(productSearchInput.trim());
                        }
                      }}
                      placeholder="Ketik nama produk..."
                      className="flex-1 px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <button
                      onClick={() => {
                        if (productSearchInput.trim()) {
                          handleProductNameSearch(productSearchInput.trim());
                        }
                      }}
                      className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Cari
                    </button>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Cari produk berdasarkan nama, otomatis ditambahkan ke keranjang</p>
                </div>

                {/* Quick Product List */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Produk Tersedia (Klik untuk tambah)</h5>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {products.filter(p => p.isActive && p.stock > 0).slice(0, 20).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors text-left"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">{formatCurrency(product.price)}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Stok: {product.stock}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL - Cart */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                    <span>Keranjang Belanja</span>
                    <span className="text-xs text-slate-400">({cartItems.length} item)</span>
                  </h5>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Keranjang masih kosong</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.product.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{item.product.name}</div>
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                {formatCurrency(item.product.price)} / pcs
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex items-center justify-center font-bold text-sm"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                className="w-12 text-center py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                                min="1"
                                max={item.product.stock}
                              />
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex items-center justify-center font-bold text-sm"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {formatCurrency(item.product.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cart Total */}
                  {cartItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-bold text-slate-900 dark:text-white">TOTAL</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>

                      {/* Payment Method */}
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Metode Pembayaran</label>
                        <select
                          value={kasirPaymentMethod}
                          onChange={(e) => setKasirPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-semibold"
                        >
                          <option value="Cash">Cash (Tunai)</option>
                          <option value="E-Wallet">E-Wallet</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="QRIS">QRIS</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Catatan (Opsional)</label>
                        <textarea
                          value={kasirNotes}
                          onChange={(e) => setKasirNotes(e.target.value)}
                          placeholder="Tambahkan catatan transaksi..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={handleProcessOfflineTransaction}
                          className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Proses Transaksi
                        </button>
                        <button
                          onClick={resetKasir}
                          className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm transition-colors"
                        >
                          Reset Keranjang
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
