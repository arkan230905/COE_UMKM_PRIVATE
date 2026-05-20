import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, User, LogOut, CheckCircle, Flame, Sparkles, Receipt, Trash } from 'lucide-react';
import { Product, Customer, Transaction, TransactionItem, UMKMPreset } from '../types';

interface CashierPOSProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
  currentPreset: UMKMPreset;
  onLogout: () => void;
}

interface SelectedPOSItem {
  product: Product;
  quantity: number;
}

export default function CashierPOS({
  products,
  setProducts,
  transactions,
  setTransactions,
  customers,
  currentPreset,
  onLogout
}: CashierPOSProps) {
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedPOSItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('guest');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Debit Card' | 'E-Wallet'>('Cash');
  const [moneyReceived, setMoneyReceived] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<Transaction | null>(null);

  // Search filter for manual search
  const [manualQuery, setManualQuery] = useState('');

  // Barcode Ref for focus simulation
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle Barcode Or Manual Code Enter Key
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;

    // Search by barcode OR by product ID as short code
    const foundProduct = products.find(
      p => 
        (p.barcode && p.barcode.trim() === barcodeSearch.trim()) ||
        String(p.id) === barcodeSearch.trim()
    );

    if (foundProduct) {
      if (foundProduct.stock <= 0) {
        alert(`Maaf, stok ${foundProduct.name} habis.`);
        setBarcodeSearch('');
        return;
      }
      addItemToPOS(foundProduct);
      setBarcodeSearch('');
    } else {
      alert(`Produk dengan Barcode/ID "${barcodeSearch}" tidak ditemukan.`);
      setBarcodeSearch('');
    }
  };

  const addItemToPOS = (product: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stok maksimal untuk ${product.name} telah dicapai.`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      setSelectedItems(prev => prev.filter(item => item.product.id !== productId));
      return;
    }

    if (newQty > product.stock) {
      alert(`Stok hanya tersedia ${product.stock} unit.`);
      return;
    }

    setSelectedItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setSelectedItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Pricing calculations
  const totalAmount = selectedItems.reduce((acc, current) => acc + current.product.price * current.quantity, 0);
  const numericMoneyReceived = Number(moneyReceived) || 0;
  const changeDue = numericMoneyReceived - totalAmount;

  // Manual search filter
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(manualQuery.toLowerCase()) ||
    (p.barcode && p.barcode.includes(manualQuery))
  );

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Keranjang POS masih kosong.');
      return;
    }

    if (paymentMethod === 'Cash' && numericMoneyReceived < totalAmount) {
      alert(`Uang pembayaran kurang dari total tagihan (Rp ${totalAmount.toLocaleString('id-ID')}).`);
      return;
    }

    const newTrxId = Date.now();
    const cleanCustomer = selectedCustomerId !== 'guest' ? Number(selectedCustomerId) : 390; // Fallback to walk-in customer

    const newTransaction: Transaction = {
      id: newTrxId,
      customerId: cleanCustomer,
      transactionCode: `POS${Math.floor(100 + Math.random() * 900)}${Date.now().toString().slice(-4)}`,
      totalAmount: totalAmount,
      status: 'completed',
      paymentMethod: paymentMethod,
      notes: notes || 'Transaksi Kasir Langsung POS',
      createdAt: new Date().toISOString()
    };

    // Deduct stock in parent state
    setProducts(prevProds =>
      prevProds.map(p => {
        const itemInCart = selectedItems.find(item => item.product.id === p.id);
        if (itemInCart) {
          return { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
        }
        return p;
      })
    );

    // Append to transactions list
    setTransactions(prev => [newTransaction, ...prev]);

    // Show receipt dialog
    setSuccessReceipt(newTransaction);
  };

  const resetPOS = () => {
    setSelectedItems([]);
    setMoneyReceived('');
    setNotes('');
    setSuccessReceipt(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased">
      {/* Kasir Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Receipt size={22} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-slate-950 dark:text-white">
              POS Supermarket {currentPreset.businessName}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
              Sektor {currentPreset.industry} • Kode Unit {currentPreset.umkmCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Main welcome gate returner button */}
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 text-red-600 shadow-xs ml-auto transition-transform active:scale-95"
          >
            <LogOut size={14} /> Keluar Kasir POS
          </button>
        </div>
      </header>

      {/* Main Terminal Viewport Grid */}
      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Scanners, Selectors, and Products Directory (Grid 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Standard Barcode Input Panel simulator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <h2 className="text-xs font-extrabold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-505 animate-pulse" /> INPUT SCAN BARCODE / KODE MANUAL
            </h2>

            <form onSubmit={handleBarcodeSubmit} className="flex gap-2.5">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Scan Kode atau Ketik ID (Contoh: 899123456011 atau 101)"
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent font-medium tracking-wide placeholder-slate-400 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all active:scale-98"
              >
                Scan & Tambah
              </button>
            </form>

            <p className="text-[10px] text-slate-400 mt-2 font-medium leading-normal">
              Petunjuk Kasir: Tekan enter atau klik tambah setelah scan. Gunakan kode barcode seperti <strong className="text-indigo-600 dark:text-indigo-400">899123456011</strong> (Multivitamin) atau cukup ketik ID rill produk, misal <strong className="text-indigo-600 dark:text-indigo-400">101</strong> / <strong className="text-indigo-600 dark:text-indigo-400 text-xs">201</strong>.
            </p>
          </div>

          {/* Quick manual selection directory */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                🏷 KATALOG PILIH CEPAT (CEPAT KLIK)
              </h2>
              <input
                type="text"
                placeholder="Cari katalog..."
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs w-full sm:w-48 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => p.stock > 0 && addItemToPOS(p)}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${
                    p.stock <= 0
                      ? 'bg-slate-50 dark:bg-slate-900/40 opacity-50 border-slate-200 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-850">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {p.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-rose-400 uppercase">
                          Stok Habis
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 text-[11px] leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] font-bold text-indigo-650 dark:text-blue-400">
                          Rp {p.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          Stok: {p.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product barcode badge */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[8px] font-mono text-slate-400 text-center flex justify-between">
                    <span>ID: {p.id}</span>
                    <span>BC: {p.barcode || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Active Transaction & Checkout Terminal (Grid 5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
              <ShoppingCart size={16} className="text-indigo-600" /> STRUK TRANSAKSI AKTIF
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded-full">
              {selectedItems.reduce((acc, current) => acc + current.quantity, 0)} Items
            </span>
          </div>

          {/* Active shopping cart items inside POS list */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {selectedItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium space-y-2">
                <p>Belum ada produk yang di-scan.</p>
                <p className="text-[10px] text-slate-300">Gunakan scanner barcode atau masukkan ID produk.</p>
              </div>
            ) : (
              selectedItems.map(item => (
                <div
                  key={item.product.id}
                  className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-transparent flex justify-between items-center text-[11px]"
                >
                  <div className="space-y-0.5 max-w-[50%]">
                    <h5 className="font-bold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-slate-400 font-bold text-[10px]">
                      Rp {item.product.price.toLocaleString('id-ID')} x {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-250 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-105"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-105"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal right side */}
                    <span className="font-black text-slate-950 dark:text-white pr-1 text-right w-16">
                      Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                    </span>

                    {/* Trash delete handler */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md shrink-0 cursor-pointer"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing aggregates summary */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold text-xs">Subtotal Tagihan</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold text-xs">Pajak (0% Sektor UMKM)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs text-right">
                Rp 0 (Subsidi)
              </span>
            </div>
            
            <div className="p-3 bg-indigo-50/40 dark:bg-slate-850 rounded-xl flex justify-between items-center border border-indigo-100/50 dark:border-transparent">
              <span className="text-slate-900 dark:text-slate-200 font-black text-[13px]">TOTAL YANG HARUS DIBAYAR</span>
              <span className="font-black text-indigo-700 dark:text-blue-400 text-lg">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Checkout Checkout actions form payment */}
          <form onSubmit={handleCheckout} className="space-y-3 pt-2">
            <div>
              <label className="block text-slate-500 mb-1">Identitas Kontak Pelanggan *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white cursor-pointer"
              >
                <option value="guest">👤 Pelanggan Umum (Walk-in Guest)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name} - {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Metode Otorisasi Bayar *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value as any);
                    if (e.target.value !== 'Cash') setMoneyReceived(totalAmount);
                    else setMoneyReceived('');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white cursor-pointer"
                >
                  <option value="Cash">💵 Uang Tunai/Cash</option>
                  <option value="QRIS">📱 QRIS Digital</option>
                  <option value="Debit Card">💳 Kartu Debit</option>
                  <option value="E-Wallet">👛 Dompet Digital</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Uang Diterima (Rp) *</label>
                <input
                  type="number"
                  required
                  disabled={paymentMethod !== 'Cash'}
                  placeholder="0"
                  value={moneyReceived}
                  onChange={(e) => setMoneyReceived(e.target.value)}
                  className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white ${
                    paymentMethod !== 'Cash' ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                  }`}
                />
              </div>
            </div>

            {paymentMethod === 'Cash' && totalAmount > 0 && Number(moneyReceived) >= totalAmount && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-800 dark:text-emerald-400 font-black flex justify-between">
                <span>KEMBALIAN UANG TUNAI :</span>
                <span>Rp {changeDue.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-500 mb-1">Catatan Penjualan (Opsional)</label>
              <input
                type="text"
                placeholder="Misal: Nota pesanan langsung meja 4..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={selectedItems.length === 0}
              className={`w-full py-3.5 text-white font-black rounded-xl text-xs tracking-wider uppercase cursor-pointer shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${
                selectedItems.length === 0
                  ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CreditCard size={15} /> CETAK STRUK & SELESAIKAN TRANSAKSI
            </button>
          </form>

        </div>

      </div>

      {/* SUCCESS TRANSACTION STRUK POPUP DIALOG */}
      {successReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-medium animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 items-center justify-center rounded-full text-xl mb-2">✓</div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">TRANSAKSI SUKSES DICETAK</h4>
              <p className="text-[10px] text-slate-400">Kode Struk: {successReceipt.transactionCode}</p>
            </div>

            {/* Printable Area preview mock */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-200 text-xs font-mono space-y-3 text-slate-800 dark:text-slate-300 leading-normal">
              <div className="text-center pb-2 border-b border-dashed border-slate-300/80">
                <p className="font-black text-slate-950 dark:text-white tracking-widest uppercase">{currentPreset.businessName}</p>
                <p className="text-[9px] text-slate-400">{currentPreset.address}</p>
                <p className="text-[9px] text-slate-400">Telp: {currentPreset.phone}</p>
              </div>

              <div className="space-y-1">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-dashed pb-1 text-slate-400 text-left">
                      <th className="font-medium">Item</th>
                      <th className="font-medium text-center">Qty</th>
                      <th className="font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map(item => (
                      <tr key={item.product.id}>
                        <td>{item.product.name.substring(0, 18)}..</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">{(item.product.price * item.quantity).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-slate-300/80 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold text-slate-950 dark:text-white">
                  <span>Total Tagihan:</span>
                  <span>Rp {successReceipt.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Otorisasi:</span>
                  <span>{successReceipt.paymentMethod}</span>
                </div>
                {successReceipt.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>Tunai Diterima:</span>
                      <span>Rp {numericMoneyReceived.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Kembali:</span>
                      <span>Rp {changeDue.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center border-t border-dashed border-slate-300/80 pt-3 text-[9px] text-slate-400">
                <p>--- TERIMA KASIH TELAH BERBELANJA ---</p>
                <p className="mt-0.5">{new Date(successReceipt.createdAt).toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetPOS}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md text-center"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
