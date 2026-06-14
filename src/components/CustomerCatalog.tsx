import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Plus, Minus, X, CheckSquare, Sparkles, MessageSquare, Compass, Phone, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Product, Category, CartItem, PaymentMethod, Customer, Transaction, UMKMPreset, TransactionStatus } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface CustomerCatalogProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  currentPreset: UMKMPreset;
  currentUser: Customer | null;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setActiveTab: (val: string) => void;
  onRequestLogin?: () => void;
  isAdminPreview?: boolean;
  isOpenCart?: boolean;
  setIsOpenCart?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CustomerCatalog({
  products,
  setProducts,
  categories,
  currentPreset,
  currentUser,
  transactions,
  setTransactions,
  cart,
  setCart,
  setActiveTab,
  onRequestLogin,
  isAdminPreview = false,
  isOpenCart: isOpenCartProp,
  setIsOpenCart: setIsOpenCartProp
}: CustomerCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  
  const [localIsOpenCart, setLocalIsOpenCart] = useState(false);
  const isOpenCart = isOpenCartProp !== undefined ? isOpenCartProp : localIsOpenCart;
  const setIsOpenCart = setIsOpenCartProp !== undefined ? setIsOpenCartProp : setLocalIsOpenCart;

  const [isOpenCheckout, setIsOpenCheckout] = useState(false);
  const [bookingDate, setBookingDate] = useState('');

  // Checkout Form States
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [notes, setNotes] = useState('');
  const [checkoutCompletedCode, setCheckoutCompletedCode] = useState<string | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [completedCartItems, setCompletedCartItems] = useState<CartItem[]>([]);

  // Sync state values when currentUser logs/registers
  React.useEffect(() => {
    if (currentUser) {
      setCustName(currentUser.name);
      setCustEmail(currentUser.email);
      setCustPhone(currentUser.phone);
      setCustAddress(currentUser.address);
    }
  }, [currentUser]);

  // Filter products: Only stock > 0 and isActive === true
  const viewableProducts = products.filter(p => p.isActive && p.stock > 0);

  const filteredProducts = viewableProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const addToCart = (prod: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === prod.id);
      if (existing) {
        // limit quantity with stock limits
        if (existing.quantity >= prod.stock) {
          alert('Maaf, tidak dapat menambah item lagi. Batas stok produk tercapai.');
          return prev;
        }
        return prev.map(item => item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const updateCartQuantity = (prodId: number, multiplier: number) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === prodId) {
          const nextQty = item.quantity + multiplier;
          if (nextQty > prod.stock) {
            alert('Stok tidak cukup.');
            return item;
          }
          if (nextQty <= 0) return null;
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Helper: Check if cart contains booking-required categories
  const requiresBookingDate = () => {
    const needsBooking = cart.some(item => {
      const category = categories.find(c => c.id === item.product.categoryId);
      if (!category) return false;
      const catNameLower = category.name.toLowerCase();
      const hasKeyword = catNameLower.includes('tiket') || 
                         catNameLower.includes('wisata') || 
                         catNameLower.includes('penginapan') ||
                         catNameLower.includes('hotel');
      
      console.log(`[Booking Check] Product: ${item.product.name}, Category: ${category.name}, Needs Booking: ${hasKeyword}`);
      return hasKeyword;
    });
    console.log(`[Booking Check] Cart requires booking date: ${needsBooking}`);
    return needsBooking;
  };

  // Helper: Check if cart requires shipping
  const requiresShipping = () => {
    const needsShipping = cart.some(item => {
      const category = categories.find(c => c.id === item.product.categoryId);
      if (!category) return false;
      const catNameLower = category.name.toLowerCase();
      const hasKeyword = catNameLower.includes('makanan') || catNameLower.includes('minuman');
      
      console.log(`[Shipping Check] Product: ${item.product.name}, Category: ${category.name}, Needs Shipping: ${hasKeyword}`);
      return hasKeyword;
    });
    console.log(`[Shipping Check] Cart requires shipping: ${needsShipping}`);
    return needsShipping;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validation for booking date
    if (requiresBookingDate() && !bookingDate) {
      alert('Silakan pilih tanggal booking untuk produk tiket/wisata/penginapan!');
      return;
    }

    // Generate random transaction code TRX-XXXX
    const randCode = 'TRX' + Math.floor(100 + Math.random() * 900);
    const needsShipping = requiresShipping();

    // Create items snapshot
    const itemsSnapshot = cart.map(item => {
      const category = categories.find(c => c.id === item.product.categoryId);
      const snapshot = {
        productId: item.product.id,
        productName: item.product.name,
        categoryName: category?.name || 'Uncategorized',
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      };
      console.log(`[Snapshot] Creating for product:`, snapshot);
      return snapshot;
    });

    console.log('=== CHECKOUT DEBUG ===');
    console.log('Cart items:', cart);
    console.log('Categories available:', categories);
    console.log('Items snapshot:', itemsSnapshot);
    console.log('Needs shipping:', needsShipping);
    console.log('Booking date:', bookingDate);
    console.log('=====================');

    // Create a new transition entry
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 301,
      customerId: currentUser ? currentUser.id : 101, // linked to customer ID log
      transactionCode: randCode,
      totalAmount: totalCartAmount,
      status: paymentMethod === 'Cash' ? 'pending' : 'paid', // Cash starts pending, others paid
      paymentMethod,
      notes: notes || 'Pemesanan katalog digital',
      createdAt: new Date().toISOString(),
      ...(needsShipping && {
        shippingStatus: 'Dalam Antrean',
        courierName: 'J&T Express',
        trackingNumber: ''
      }),
      ...(requiresBookingDate() && { bookingDate }),
      requiresShipping: needsShipping,
      items: itemsSnapshot
    };

    // Update product stock limits after successful purchase
    setProducts(prev => {
      return prev.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
    });

    setTransactions(prev => [newTx, ...prev]);
    setCompletedTransaction(newTx);
    setCompletedCartItems([...cart]); // Save cart items before clearing
    setCart([]);
    setCheckoutCompletedCode(randCode);
    setBookingDate('');
    setIsOpenCheckout(false);
  };

  // Print Invoice Function
  const handlePrintInvoice = (transaction: Transaction, cartItems?: CartItem[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Use transaction.items if available, otherwise use cartItems
    const itemsToUse = transaction.items || (cartItems ? cartItems.map(item => {
      const category = categories.find(c => c.id === item.product.categoryId);
      return {
        productId: item.product.id,
        productName: item.product.name,
        categoryName: category?.name || 'Uncategorized',
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      };
    }) : []);

    // Header with UMKM branding
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(currentPreset.businessName, pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`${currentPreset.address} | ${currentPreset.phone}`, pageWidth / 2, 38, { align: 'center' });
    doc.text(`${currentPreset.industry}`, pageWidth / 2, 44, { align: 'center' });

    yPosition = 60;

    // Invoice Info Box
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(14, yPosition, pageWidth - 28, 35, 2, 2, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NO. TRANSAKSI:', 18, yPosition + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(transaction.transactionCode, 18, yPosition + 14);
    
    doc.setFont('helvetica', 'bold');
    doc.text('TANGGAL:', 18, yPosition + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(transaction.createdAt).toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), 18, yPosition + 28);

    doc.setFont('helvetica', 'bold');
    doc.text('STATUS:', pageWidth - 70, yPosition + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text(transaction.status.toUpperCase(), pageWidth - 70, yPosition + 14);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('METODE BAYAR:', pageWidth - 70, yPosition + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(transaction.paymentMethod, pageWidth - 70, yPosition + 28);

    yPosition += 45;

    // Customer Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMASI PELANGGAN', 14, yPosition);
    yPosition += 6;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Nama:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(custName || currentUser?.name || '-', 45, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('No. Telepon:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(custPhone || currentUser?.phone || '-', 45, yPosition);
    
    if (transaction.requiresShipping) {
      yPosition += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Alamat Kirim:', 14, yPosition);
      doc.setFont('helvetica', 'normal');
      const address = custAddress || currentUser?.address || '-';
      const splitAddress = doc.splitTextToSize(address, pageWidth - 60);
      doc.text(splitAddress, 45, yPosition);
      yPosition += (splitAddress.length - 1) * 5;
    }

    if (transaction.bookingDate) {
      yPosition += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Tanggal Booking:', 14, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(239, 68, 68);
      doc.text(new Date(transaction.bookingDate).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }), 45, yPosition);
      doc.setTextColor(0, 0, 0);
    }

    yPosition += 15;

    // Items Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RINCIAN PEMBELIAN', 14, yPosition);
    yPosition += 6;

    const itemsData = itemsToUse.map((item, index) => {
      return [
        (index + 1).toString(),
        item.productName,
        item.categoryName,
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.subtotal)
      ];
    });

    (doc as any).autoTable({
      startY: yPosition,
      head: [['No', 'Nama Produk', 'Kategori', 'Qty', 'Harga Satuan', 'Subtotal']],
      body: itemsData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Total Box
    doc.setFillColor(30, 58, 95);
    doc.roundedRect(pageWidth - 90, yPosition, 76, 20, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PEMBAYARAN:', pageWidth - 85, yPosition + 8);
    doc.setFontSize(14);
    doc.text(formatCurrency(transaction.totalAmount), pageWidth - 20, yPosition + 15, { align: 'right' });

    yPosition += 30;

    // Notes Section
    if (transaction.notes) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Catatan:', 14, yPosition);
      doc.setFont('helvetica', 'italic');
      doc.text(transaction.notes, 14, yPosition + 5);
      yPosition += 15;
    }

    // Shipping Info or Digital Invoice Info
    yPosition += 10;
    if (transaction.requiresShipping) {
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(14, yPosition, pageWidth - 28, 20, 2, 2, 'F');
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('📦 PENGIRIMAN', 18, yPosition + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text('Pesanan Anda akan segera diproses dan dikirim ke alamat yang tertera.', 18, yPosition + 12);
      doc.text(`Kurir: ${transaction.courierName || 'J&T Express'}`, 18, yPosition + 17);
    } else {
      doc.setFillColor(254, 249, 195);
      doc.roundedRect(14, yPosition, pageWidth - 28, 20, 2, 2, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ INVOICE DIGITAL', 18, yPosition + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text('Ini adalah bukti pembelian digital. Tidak ada pengiriman fisik untuk produk ini.', 18, yPosition + 12);
      doc.text('Simpan invoice ini sebagai bukti transaksi Anda.', 18, yPosition + 17);
    }

    yPosition += 30;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Terima kasih telah berbelanja di ' + currentPreset.businessName,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    );
    doc.text(
      'Invoice ini dicetak otomatis oleh SIUPIN (Sistem Informasi UMKM Pintar)',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    // Save PDF
    const fileName = `Invoice-${transaction.transactionCode}-${currentPreset.businessName.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      {isAdminPreview && (
        <div className="p-4 bg-amber-550/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold font-sans">
          <div className="flex items-center gap-2">
            <span className="text-xl">👁️</span>
            <div>
              <p className="font-extrabold text-[13px] text-slate-900 dark:text-amber-200">Mode Pantau Katalog Aktif</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ini adalah simulasi tampilan menu katalog pelanggan untuk UMKM Anda. Segala perubahan produk di admin super akan langsung tersinkron di sini.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[10px] tracking-wide uppercase font-black text-amber-800 dark:text-amber-300">PREVIEW</span>
        </div>
      )}

      {/* Banner */}
      <div className="relative p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden shadow-md">
        <div className="space-y-1 z-10">
          <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold tracking-widest uppercase px-2 py-0.5 rounded-md">Live Store Storefront</span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            Selamat Datang di <span className="text-amber-400">{currentPreset.businessName}</span> Store!
          </h1>
          <p className="text-xs text-slate-350 max-w-lg">Temukan penawaran terbaik MSME terpercaya. Pesan langsung dari web terintegrasi lunas aman.</p>
        </div>

        {/* Dynamic User Profile and Cart triggers combo */}
        <div className="z-10 flex flex-wrap gap-2 items-center">
          {/* User Authentication Status panel */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-850/90 rounded-xl text-xs font-semibold shrink-0 border border-slate-800 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-400' : 'bg-gray-400'} shrink-0`} />
            <span className="text-slate-300">Status:</span>
            <span className="text-white font-extrabold">{currentUser ? currentUser.name : 'Tamu (Guest)'}</span>
            {!currentUser && onRequestLogin && (
              <button
                onClick={onRequestLogin}
                className="ml-2 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] rounded-lg font-bold transition cursor-pointer"
              >
                Masuk / Daftar
              </button>
            )}
          </div>

          {/* Cart Trigger Badge button inside header */}
          <button
            onClick={() => setIsOpenCart(true)}
            className="p-3.5 bg-white text-slate-950 hover:bg-slate-50 rounded-2xl flex items-center gap-2.5 font-bold text-xs shadow-lg transition-transform hover:scale-105 shrink-0 cursor-pointer"
          >
            <ShoppingCart size={16} style={{ color: currentPreset.accentColor }} />
            Keranjang Saya ({cart.reduce((s, i) => s + i.quantity, 0)})
            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-black text-[10.5px]">
              {formatCurrency(totalCartAmount)}
            </span>
          </button>
        </div>

        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Categories Horizontal filters & search bar combo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
        {/* Horizontal Category Pill List selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
              activeCategory === 'all'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                activeCategory === cat.id
                  ? 'text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
              style={activeCategory === cat.id ? { backgroundColor: currentPreset.primaryColor } : undefined}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Input search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari produk impian Anda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-white rounded-lg focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': currentPreset.accentColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Grid of Catalog Items */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-medium">
          {filteredProducts.map((p) => {
            const cat = categories.find(c => c.id === p.categoryId);
            const cartQty = cart.find(item => item.product.id === p.id)?.quantity || 0;
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-4 group"
              >
                {/* Product image & category top labels */}
                <div className="space-y-3">
                  <div className="h-40 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center relative group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">📦</span>
                    )}
                    {p.stock <= 5 && (
                      <span className="absolute top-2 left-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded shadow-sm">
                        Stok Menipis ({p.stock})
                      </span>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-slate-400 bg-white/70 dark:bg-slate-900/40 px-2 py-0.5 rounded backdrop-blur-xs">
                      {cat ? cat.name : 'Produk'}
                    </span>
                  </div>

                  {/* Body textual content */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-indigo-650 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px] font-normal">
                      {p.description || 'Tidak ada deskripsi detail produk.'}
                    </p>
                  </div>
                </div>

                {/* Pricing & Cart Add controls footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HARGA UNIT</span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-normal">
                      {formatCurrency(p.price)}
                    </span>
                  </div>

                  {/* Increment Add to Cart triggers */}
                  {cartQty > 0 ? (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg select-none">
                      <button
                        onClick={() => updateCartQuantity(p.id, -1)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-650 cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white px-1">
                        {cartQty}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(p.id, 1)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-650 cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-2 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform duration-100 cursor-pointer"
                      style={{ backgroundColor: currentPreset.primaryColor }}
                    >
                      <Plus size={14} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
          <Compass size={40} className="mx-auto text-slate-350" />
          <p className="text-sm text-slate-400 font-medium">Tidak ada produk dalam kategori ini.</p>
        </div>
      )}

      {/* SHOPPING CART DRAWER / MODAL PANEL */}
      {isOpenCart && (
        <div 
          onClick={() => setIsOpenCart(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in font-medium cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 h-full w-full max-w-md p-6 flex flex-col justify-between border-l border-slate-100 dark:border-slate-800 shadow-2xl relative cursor-default"
          >
            <button
              onClick={() => setIsOpenCart(false)}
              className="absolute top-5 left-6 text-slate-400 hover:text-slate-900 p-1 rounded-md cursor-pointer"
            >
              <X size={18} />
            </button>
            
            {/* Top info */}
            <div className="mt-8 border-b border-slate-50 dark:border-slate-850 pb-4">
              <h3 className="text-base font-bold text-slate-905 dark:text-white flex items-center gap-2">
                <ShoppingCart size={18} style={{ color: currentPreset.accentColor }} />
                Daftar Keranjang Belanja Anda
              </h3>
              <p className="text-xs text-slate-400">Pastikan unit barang dan jumlah pesanan Anda sudah sesuai</p>
            </div>

            {/* Cart list elements scroll zone */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div>
                        <span className="block text-slate-900 dark:text-white font-bold text-xs max-w-[160px] truncate">{item.product.name}</span>
                        <span className="block text-[10px] text-slate-450">{formatCurrency(item.product.price)} x {item.quantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="p-0.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-500 cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-black px-1 text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="p-0.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-500 cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white text-right w-16">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <ShoppingBag size={32} className="mx-auto text-slate-300 mb-2" />
                  Keranjang belanja kosong. Silakan belanja produk.
                </div>
              )}
            </div>

            {/* Total aggregation checkout triggers */}
            <div className="border-t border-slate-50 dark:border-slate-850 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">ESTIMASI TOTAL</span>
                <span className="text-lg font-black text-slate-950 dark:text-white">
                  {formatCurrency(totalCartAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsOpenCart(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-center cursor-pointer"
                >
                  Belanja Lagi
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsOpenCart(false);
                    if (!currentUser) {
                      if (onRequestLogin) {
                        onRequestLogin();
                      } else {
                        alert('Silakan login atau daftar terlebih dahulu untuk melakukan checkout belanja.');
                      }
                    } else {
                      setIsOpenCheckout(true);
                    }
                  }}
                  className="px-4 py-2 text-white font-bold rounded-xl text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer transition hover:scale-[1.02]"
                  style={{ backgroundColor: currentPreset.primaryColor }}
                >
                  Lanjut ke Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM CHECKOUT MODAL BOX */}
      {isOpenCheckout && (
        <div 
          onClick={() => setIsOpenCheckout(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin cursor-default"
          >
            <button
              onClick={() => setIsOpenCheckout(false)}
              className="absolute top-4 right-4 text-slate-400 cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <CheckSquare size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Formulir Checkout & Data Pengiriman</h4>
                <p className="text-xs text-slate-400">Verifikasi alamat pengantaran barang belanjaan Anda</p>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Nama Customer</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Ponsel No.</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Email Aktif</label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 inner-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Alamat Penerimaan Kiriman</label>
                <textarea
                  required={requiresShipping()}
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 font-normal inner-input"
                  placeholder={requiresShipping() ? "Alamat lengkap untuk pengiriman" : "Alamat (opsional)"}
                />
                {!requiresShipping() && (
                  <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    Produk yang Anda beli tidak memerlukan pengiriman fisik
                  </p>
                )}
              </div>

              {/* Booking Date for Tickets/Tourism/Hotels */}
              {requiresBookingDate() && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <span className="text-base">🎫</span>
                    <span className="font-bold text-xs">Tanggal Booking Diperlukan</span>
                  </div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 text-xs font-semibold">Pilih Tanggal Booking/Kunjungan *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 font-bold"
                  />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    Untuk produk tiket/wisata/penginapan, silakan tentukan tanggal Anda akan menggunakan layanan ini.
                  </p>
                </div>
              )}

              {/* Payment Methods Options requested */}
              <div>
                <label className="block text-slate-500 mb-1">Form Metode Pembayaran</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['QRIS', 'E-Wallet', 'Debit Card', 'Cash'] as PaymentMethod[]).map((method) => (
                    <div
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer transition select-none ${
                        paymentMethod === method
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-slate-800 dark:text-blue-400'
                          : 'border-slate-150 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="block text-[10px]">{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Titip di satpam depan, obat diminum dlm lemari es..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 dark:bg-slate-90 font-normal inner-input"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850">
                <span className="text-slate-505 font-bold">TOTAL BAYAR</span>
                <span className="text-base font-black text-rose-600 block">
                  {formatCurrency(totalCartAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsOpenCheckout(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-bold rounded-lg shadow-md cursor-pointer text-center"
                  style={{ backgroundColor: currentPreset.primaryColor }}
                >
                  Konfirmasi Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {checkoutCompletedCode && completedTransaction && (
        <div 
          onClick={() => {
            setCheckoutCompletedCode(null);
            setCompletedTransaction(null);
            setCompletedCartItems([]);
            setActiveTab('order-history');
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 text-center shadow-2xl space-y-4 cursor-default"
          >
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Pembayaran Berhasil!</h4>
              <p className="text-xs text-slate-400 mt-0.5">Kode Transaksi invoice Anda telah diterbitkan.</p>
              <span className="inline-block mt-2 font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-900 dark:text-white rounded-lg border text-sm">
                #{checkoutCompletedCode}
              </span>
            </div>

            {/* Info based on shipping requirement */}
            {completedTransaction.requiresShipping ? (
              <p className="text-xs text-slate-400 font-normal">
                Pesanan Anda saat ini tercatat {paymentMethod === 'Cash' ? 'Menunggu Pembayaran' : 'Telah Dibayar'} dan akan segera diproses untuk pengiriman. Lacak pesanan di "Riwayat Pesanan".
              </p>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  📄 Produk yang Anda beli tidak memerlukan pengiriman fisik. Silakan cetak invoice sebagai bukti pembelian Anda.
                </p>
              </div>
            )}

            {completedTransaction.bookingDate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                  🎫 Tanggal Booking: {new Date(completedTransaction.bookingDate).toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div className="pt-2 space-y-2">
              {/* Print Invoice Button for non-shipping products */}
              {!completedTransaction.requiresShipping && (
                <button
                  onClick={() => {
                    handlePrintInvoice(completedTransaction, completedCartItems);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  Cetak Invoice Pembelian (PDF)
                </button>
              )}

              <button
                onClick={() => {
                  setCheckoutCompletedCode(null);
                  setCompletedTransaction(null);
                  setCompletedCartItems([]);
                  setActiveTab('order-history');
                }}
                className="w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                style={{ backgroundColor: currentPreset.primaryColor }}
              >
                {completedTransaction.requiresShipping ? 'Lacak Pesanan di Riwayat' : 'Lihat Riwayat Pembelian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
