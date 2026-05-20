import { Category, Product, Transaction, Expense, IncomeRecord, UMKMPreset, User, Customer, TransactionItem } from '../types';

export const UMKM_PRESETS: UMKMPreset[] = [];

export const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: 'Annisa Salma',
    email: 'admin@umkm.com',
    role: 'super_admin',
    phone: '0812-9999-8888',
    address: 'Komp. Admin Utama No. 1',
    createdAt: '2025-01-10T11:00:00Z',
  },
  {
    id: 2,
    name: 'Rian Hidayat',
    email: 'rian@customer.com',
    role: 'customer',
    phone: '0852-3333-2222',
    address: 'Jl. Cemara Gang 4, Jakarta',
    createdAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 3,
    name: 'Dewi Lestari',
    email: 'dewi@customer.com',
    role: 'customer',
    phone: '0878-1111-5555',
    address: 'Komp. Melati Indah C4, Surabaya',
    createdAt: '2025-02-05T09:15:00Z',
  }
];

export const DEFAULT_CUSTOMERS: Customer[] = [];

export const PRESETS_CATEGORIES: Record<string, Category[]> = {
  pharmacy: [
    { id: 1, name: 'Vitamins & Supplements', slug: 'vitamins-supplements', description: 'Vitamins, boosters, and mineral supplements', createdAt: '2025-01-15' },
    { id: 2, name: 'Prescription Medicine', slug: 'prescription-medicine', description: 'Doctors prescription medicines and generic drugs', createdAt: '2025-01-15' },
    { id: 3, name: 'Personal Care', slug: 'personal-care', description: 'Skin products, dental hygiene, and daily toiletries', createdAt: '2025-01-15' },
    { id: 4, name: 'Medical Equipment', slug: 'medical-equipment', description: 'Thermometers, masks, blood pressure checkers', createdAt: '2025-01-15' },
  ],
  cafe: [
    { id: 11, name: 'Coffee & Espresso', slug: 'coffee-espresso', description: 'Hot and cold premium brewed coffee', createdAt: '2025-01-15' },
    { id: 12, name: 'Non-Coffee Brews', slug: 'non-coffee', description: 'Teas, chocolates, and fresh juices', createdAt: '2025-01-15' },
    { id: 13, name: 'Snacks & Pastries', slug: 'snacks-pastries', description: 'Croissants, cakes, and quick bites', createdAt: '2025-01-15' },
  ],
  boutique: [
    { id: 21, name: 'Mens Apparel', slug: 'mens-apparel', description: 'Shirts, trousers, and outer garment for men', createdAt: '2025-01-15' },
    { id: 22, name: 'Womens Collection', slug: 'womens-collection', description: 'Dresses, blouses, and accessories for women', createdAt: '2025-01-15' },
    { id: 23, name: 'Unisex Basics', slug: 'unisex-basics', description: 'T-shirts, hoodies, and comfortable loungewear', createdAt: '2025-01-15' },
  ],
  grocery: [
    { id: 31, name: 'Sembako Pokok', slug: 'sembako-pokok', description: 'Beras, gula, minyak goreng, dan telur', createdAt: '2025-01-15' },
    { id: 32, name: 'Bumbu & Bahan Dapur', slug: 'bumbu-dapur', description: 'Garam, kecap, saus, bumbu instan', createdAt: '2025-01-15' },
    { id: 33, name: 'Camilan & Minuman Kemasan', slug: 'camilan-minuman', description: 'Snack, mi instan, kopi sachet, teh botol', createdAt: '2025-01-15' },
  ]
};

export const PRESETS_PRODUCTS: Record<string, Product[]> = {
  pharmacy: [
    {
      id: 101,
      categoryId: 1,
      name: 'Multivitamin Complex Gold Edition',
      slug: 'multivitamin-complex-gold',
      description: 'Asupan lengkap vitamin dan mineral untuk menjaga energi tubuh sepanjang hari.',
      price: 225000,
      stock: 85,
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-20',
      barcode: '899123456011'
    },
    {
      id: 102,
      categoryId: 1,
      name: 'Omega-3 Fish Oil 1000mg Premium',
      slug: 'omega-3-fish-oil-1000mg',
      description: 'Mendukung kesehatan jantung, sirkulasi darah, dan kecerdasan otak.',
      price: 270000,
      stock: 54,
      image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-21',
      barcode: '899123456012'
    },
    {
      id: 103,
      categoryId: 4,
      name: 'Digital Blood Pressure Monitor Smart',
      slug: 'blood-pressure-monitor',
      description: 'Tensimeter digital praktis dengan layar LCD lebar dan akurasi tinggi.',
      price: 675000,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-22',
      barcode: '899123456013'
    },
    {
      id: 104,
      categoryId: 3,
      name: 'Organic Aloe Vera Hydrating Gel',
      slug: 'aloe-vera-gel',
      description: 'Pelembab kulit alami dari ekstrak lidah buaya murni tanpa alkohol.',
      price: 180000,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-23',
      barcode: '899123456014'
    },
    {
      id: 105,
      categoryId: 4,
      name: 'Medical Grade Premium Face Mask (Pack of 50)',
      slug: 'medical-face-mask',
      description: 'Masker medis 3 ply dengan perlindungan filtrasi kuman 99%.',
      price: 150000,
      stock: 250,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-24',
      barcode: '899123456015'
    },
    {
      id: 106,
      categoryId: 1,
      name: 'Vitamin C Chewable Orange Tablets (60s)',
      slug: 'vitamin-c-chewables',
      description: 'Tablet isap rasa jeruk lezat untuk kekebalan tubuh harian.',
      price: 105050,
      stock: 62,
      image: 'https://images.unsplash.com/photo-1628243341151-61353f20a02d?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-25',
      barcode: '899123456016'
    }
  ],
  cafe: [
    {
      id: 201,
      categoryId: 11,
      name: 'Es Kopi Kenangan Mantan',
      slug: 'es-kopi-kenangan-mantan',
      description: 'Perpaduan espresso premium, susu segar, dan gula aren asli yang memicu nostalgia mendalam.',
      price: 22000,
      stock: 120,
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-20',
      barcode: '899223456021'
    },
    {
      id: 202,
      categoryId: 11,
      name: 'Classic Caramel Latte Ice',
      slug: 'classic-caramel-latte',
      description: 'Espresso creamy dengan saus karamel lezat yang manis dan harum.',
      price: 32000,
      stock: 90,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a72063e?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-21',
      barcode: '899223456022'
    },
    {
      id: 203,
      categoryId: 13,
      name: 'Premium Butter Croissant',
      slug: 'premium-butter-croissant',
      description: 'Kue khas Perancis yang renyah di luar, empuk dan wangi mentega di dalam.',
      price: 18000,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-22',
      barcode: '899223456023'
    },
    {
      id: 204,
      categoryId: 12,
      name: 'Matcha Sakura Cream Tea',
      slug: 'matcha-sakura-tea',
      description: 'Matcha Jepang asli dipadukan susu premium dan sirup cherry blossom yang menyegarkan.',
      price: 28000,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-23',
      barcode: '899223456024'
    }
  ],
  boutique: [
    {
      id: 301,
      categoryId: 21,
      name: 'Premium Linen Shirt Sage Green',
      slug: 'linen-shirt-sage-green',
      description: 'Kemeja kasual bahan linen premium yang adem, stylish, dan bertekstur elegan.',
      price: 199000,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-20',
      barcode: '899323456031'
    },
    {
      id: 302,
      categoryId: 22,
      name: 'V-Neck Floral Summer Dress',
      slug: 'floral-summer-dress',
      description: 'Gaun musim panas yang flowy dengan motif bunga modern dan fit anggun.',
      price: 285000,
      stock: 22,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-21',
      barcode: '899323456032'
    },
    {
      id: 303,
      categoryId: 23,
      name: 'Essentials Oversized Hoodie Coal Black',
      slug: 'oversized-hoodie-coal-black',
      description: 'Hoodie tebal katun fleece super nyaman untuk udara dingin atau bepergian santai.',
      price: 245000,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-22',
      barcode: '899323456033'
    }
  ],
  grocery: [
    {
      id: 401,
      categoryId: 31,
      name: 'Beras Setra Ramos Super 5kg',
      slug: 'beras-setra-ramos-5kg',
      description: 'Beras putih murni, pulen, wangi pandan alami tanpa pemutih atau pengawet.',
      price: 78000,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-20',
      barcode: '899423456041'
    },
    {
      id: 402,
      categoryId: 31,
      name: 'Minyak Goreng Refill Premium 2 Liter',
      slug: 'minyak-goreng-2l',
      description: 'Minyak kelapa sawit jernih hasil penyaringan 2 kali, kualitas super.',
      price: 36500,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-21',
      barcode: '899423456042'
    },
    {
      id: 403,
      categoryId: 32,
      name: 'Kecap Manis Tradisional 520ml',
      slug: 'kecap-manis-520ml',
      description: 'Kecap manis dari kedelai hitam pilihan dengan rasa legit yang pas di lidah.',
      price: 16000,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?w=500&auto=format&fit=crop&q=60',
      isActive: true,
      createdAt: '2025-01-22',
      barcode: '899423456043'
    }
  ]
};

export const DEFAULT_EXPENSES: Record<string, Expense[]> = {
  pharmacy: [
    { id: 1, expenseCategory: 'Pembelian Stok', description: 'Restock Multivitamin & supplement batch A', amount: 52500000, date: '2026-05-10', notes: 'Supplier Kimia Farma Group', createdAt: '2026-05-10' },
    { id: 2, expenseCategory: 'Gaji Karyawan', description: 'Gaji Bulanan 2 Apoteker & Kasir', amount: 18000000, date: '2026-05-15', notes: 'Staff asisten apotek', createdAt: '2026-05-15' },
    { id: 3, expenseCategory: 'Tagihan Listrik & Air', description: 'Listrik pendingin kulkas obat & lampu', amount: 6750050, date: '2026-05-18', notes: 'PLN & PDAM', createdAt: '2026-05-18' },
    { id: 4, expenseCategory: 'Lain-lain', description: 'Sewa ruko strategis bulan Mei', amount: 22500000, date: '2026-05-01', notes: 'Pemilik ruko bapak Edi', createdAt: '2026-05-01' }
  ],
  cafe: [
    { id: 11, expenseCategory: 'Pembelian Stok', description: 'Biji kopi arabika 20 kg & Susu Fresh Milk', amount: 4500000, date: '2026-05-12', notes: 'Supplier roastery lokal', createdAt: '2026-05-12' },
    { id: 12, expenseCategory: 'Gaji Karyawan', description: 'Gaji 2 Barista shift pagi & sore', amount: 3800000, date: '2026-05-15', notes: 'Shift Leader', createdAt: '2026-05-15' },
    { id: 13, expenseCategory: 'Tagihan Listrik & Air', description: 'Listrik mesin espresso gilingan & AC', amount: 1200000, date: '2026-05-18', notes: 'Daya 3500 watt', createdAt: '2026-05-18' }
  ],
  boutique: [
    { id: 21, expenseCategory: 'Pembelian Stok', description: 'Bahan linen & impor dress summer', amount: 6400000, date: '2026-05-10', notes: 'Grosir Tanah Abang', createdAt: '2026-05-10' },
    { id: 22, expenseCategory: 'Gaji Karyawan', description: 'Gaji admin sosial media & sales tlp', amount: 3000000, date: '2026-05-15', notes: 'Full-time', createdAt: '2026-05-15' }
  ],
  grocery: [
    { id: 31, expenseCategory: 'Pembelian Stok', description: 'Restock Beras Ramos, Indomie, Minyak goreng', amount: 8400000, date: '2026-05-11', notes: 'Agen Sembako Makmur', createdAt: '2026-05-11' },
    { id: 32, expenseCategory: 'Sewa & Keamanan', description: 'Keamanan pasar bulanan & iuran', amount: 350000, date: '2026-05-14', notes: 'Iuran pengurus pasar', createdAt: '2026-05-14' }
  ]
};

export const DEFAULT_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 203,
    customerId: 390,
    transactionCode: 'TRX203',
    totalAmount: 2250000,
    status: 'completed',
    paymentMethod: 'E-Wallet',
    notes: 'Preserve high potency shelf cold',
    createdAt: '2025-12-20T10:30:00Z',
  },
  {
    id: 221,
    customerId: 390,
    transactionCode: 'TRX221',
    totalAmount: 1620000,
    status: 'completed',
    paymentMethod: 'Cash',
    notes: 'Delivery packaging bubble wrap',
    createdAt: '2025-10-27T16:15:00Z',
  },
  {
    id: 210,
    customerId: 109,
    transactionCode: 'TRX210',
    totalAmount: 3600000,
    status: 'completed',
    paymentMethod: 'Debit Card',
    notes: 'Urgent, prescription attached',
    createdAt: '2025-10-25T14:40:00Z',
  },
  {
    id: 190,
    customerId: 28,
    transactionCode: 'TRX190',
    totalAmount: 2220000,
    status: 'completed',
    paymentMethod: 'QRIS',
    notes: 'Pick up in-store',
    createdAt: '2025-10-24T09:25:00Z',
  },
  {
    id: 199,
    customerId: 190,
    transactionCode: 'TRX199',
    totalAmount: 2040000,
    status: 'completed',
    paymentMethod: 'E-Wallet',
    notes: 'Thank you for the quick service',
    createdAt: '2025-10-23T11:50:00Z',
  },
  {
    id: 297,
    customerId: 315,
    transactionCode: 'TRX297',
    totalAmount: 3300000,
    status: 'completed',
    paymentMethod: 'QRIS',
    notes: 'Check prescription again',
    createdAt: '2025-10-22T17:05:00Z',
  }
];

export const DEFAULT_MOCK_TRANSACTION_ITEMS: TransactionItem[] = [
  { id: 501, transactionId: 203, productId: 101, quantity: 10, price: 225000, subtotal: 2250000, createdAt: '2025-12-20T10:30:00Z' },
  { id: 502, transactionId: 221, productId: 104, quantity: 9, price: 180000, subtotal: 1620000, createdAt: '2025-10-27T16:15:00Z' },
  { id: 503, transactionId: 210, productId: 103, quantity: 4, price: 675000, subtotal: 2700000, createdAt: '2025-10-25T14:40:00Z' },
  { id: 504, transactionId: 210, productId: 101, quantity: 4, price: 225000, subtotal: 900000, createdAt: '2025-10-25T14:40:00Z' },
  { id: 505, transactionId: 190, productId: 105, quantity: 14, price: 150000, subtotal: 2100000, createdAt: '2025-10-24T09:25:00Z' },
  { id: 506, transactionId: 190, productId: 106, quantity: 1, price: 120000, subtotal: 120000, createdAt: '2025-10-24T09:25:00Z' },
  { id: 507, transactionId: 199, productId: 102, quantity: 7, price: 270000, subtotal: 1890000, createdAt: '2025-10-23T11:50:00Z' },
  { id: 508, transactionId: 199, productId: 105, quantity: 1, price: 150000, subtotal: 150000, createdAt: '2025-10-23T11:50:00Z' },
  { id: 509, transactionId: 297, productId: 101, quantity: 10, price: 225000, subtotal: 2250000, createdAt: '2025-10-22T17:05:00Z' },
  { id: 510, transactionId: 297, productId: 106, quantity: 10, price: 105050, subtotal: 1050500, createdAt: '2025-10-22T17:05:00Z' }
];

export const DEFAULT_INCOMES: Record<string, IncomeRecord[]> = {
  pharmacy: [
    { id: 1, transactionId: 203, amount: 150.00, date: '2025-12-20', description: 'Transaksi TRX203', createdAt: '2025-12-20' },
    { id: 2, transactionId: 221, amount: 108.00, date: '2025-10-27', description: 'Transaksi TRX221', createdAt: '2025-10-27' },
    { id: 3, transactionId: 210, amount: 240.00, date: '2025-10-25', description: 'Transaksi TRX210', createdAt: '2025-10-25' },
    { id: 4, transactionId: 190, amount: 148.00, date: '2025-10-24', description: 'Transaksi TRX190', createdAt: '2025-10-24' },
    { id: 5, transactionId: 199, amount: 136.00, date: '2025-10-23', description: 'Transaksi TRX199', createdAt: '2025-10-23' },
    { id: 6, transactionId: 297, amount: 220.00, date: '2025-10-22', description: 'Transaksi TRX297', createdAt: '2025-10-22' },
    { id: 7, transactionId: null, amount: 24700.00, date: '2026-05-18', description: 'Akumulasi Penjualan retail offline kasir', createdAt: '2026-05-18' }
  ],
  cafe: [
    { id: 11, transactionId: null, amount: 12500000, date: '2026-05-18', description: 'Omset harian Dine-in & Takeaway', createdAt: '2026-05-18' }
  ],
  boutique: [
    { id: 21, transactionId: null, amount: 9800000, date: '2026-05-18', description: 'Order Live Tokopedia & Shopee', createdAt: '2026-05-18' }
  ],
  grocery: [
    { id: 31, transactionId: null, amount: 14200000, date: '2026-05-18', description: 'Setoran toko sembako kasir utama', createdAt: '2026-05-18' }
  ]
};
