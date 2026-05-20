import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, ShoppingBag, Eye, EyeOff, AlertCircle, X, DollarSign, Filter, Upload, Image as ImageIcon } from 'lucide-react';
import { Product, Category, UMKMPreset } from '../types';
import JsBarcode from 'jsbarcode';

// Barcode Image Component
const BarcodeImage = ({ value }: { value: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: true,
          fontSize: 10,
          margin: 2,
        });
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }
  }, [value]);

  return <svg ref={svgRef} />;
};

interface AdminProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  currentPreset: UMKMPreset;
}

export default function AdminProducts({
  products,
  setProducts,
  categories,
  currentPreset
}: AdminProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [imageFile, setImageFile] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  // Generate unique barcode
  const generateBarcode = (): string => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const barcode = `899${timestamp}${random}`;
    console.log('Generated barcode:', barcode);
    return barcode;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handlePriceChange = (valueStr: string) => {
    const digits = valueStr.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) : 0;
    setPrice(num);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || 0);
    setDescription('');
    setPrice(0);
    setStock(10);
    setImageFile('');
    setIsActive(true);
    setError('');
    setIsOpenModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setCategoryId(prod.categoryId);
    setDescription(prod.description);
    setPrice(prod.price);
    setStock(prod.stock);
    setImageFile(prod.image || '');
    setIsActive(prod.isActive);
    setError('');
    setIsOpenModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Nama produk wajib diisi.');
    if (!slug.trim()) return setError('Slug url wajib diisi.');
    if (categoryId === 0) return setError('Pilihlah salah satu kategori.');
    if (price <= 0) return setError('Harga produk harus lebih dari 0.');
    if (stock < 0) return setError('Stok produk tidak boleh kurang dari 0.');

    if (editingProduct) {
      // Edit Update
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...p, name, slug, categoryId, description, price, stock, image: imageFile, isActive, barcode: p.barcode || editingProduct.barcode }
            : p
        )
      );
    } else {
      // Create Insert
      const generatedBarcode = generateBarcode();
      const newProd: Product = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 101,
        categoryId,
        name,
        slug,
        description,
        price,
        stock,
        image: imageFile,
        isActive,
        createdAt: new Date().toISOString().substring(0, 10),
        barcode: generatedBarcode, // Auto-generate barcode
      };
      console.log('New product with barcode:', newProd);
      setProducts(prev => [newProd, ...prev]);
    }

    setIsOpenModal(false);
  };

  // Formatting currency
  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multi-level filtering logic
  const filteredProducts = products.filter(p => {
    // 1. Search filter
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category selection filter
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

    // 3. Stock Level filters
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = p.stock > 0 && p.stock <= 10;
    } else if (stockFilter === 'out') {
      matchesStock = p.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
            Products & Inventory
          </h1>
          <p className="text-xs text-slate-400">Total control on catalog items, stock limits, prices, and visibility</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-white uppercase tracking-wider font-bold rounded-xl shadow-md transition-transform hover:scale-105 duration-150 cursor-pointer"
          style={{ backgroundColor: currentPreset.primaryColor }}
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Multi filter & Search layout block */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Main search input */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* Category Filter option */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 shrink-0">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 shrink-0">Stok Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">Semua Persediaan</option>
              <option value="low">Hampir Habis (1 - 10)</option>
              <option value="out">Kosong (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table grid list */}
      {filteredProducts.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Produk</th>
                  <th scope="col" className="px-6 py-4">Kategori</th>
                  <th scope="col" className="px-6 py-4">Barcode</th>
                  <th scope="col" className="px-6 py-4">Harga Unit</th>
                  <th scope="col" className="px-6 py-4">Sisa Stok</th>
                  <th scope="col" className="px-6 py-4">Status Aktif</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-medium">
                {filteredProducts.map((p) => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Product identity info & image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="block text-slate-900 dark:text-white font-bold text-sm">
                              {p.name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-350">
                        {cat ? cat.name : <span className="text-slate-300 italic">Tanpa Kategori</span>}
                      </td>

                      <td className="px-6 py-4">
                        {p.barcode ? (
                          <div className="flex items-center gap-2">
                            <BarcodeImage value={p.barcode} />
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">
                        {formatCurrency(p.price)}
                      </td>

                      {/* Stock warning systems with badges */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-sm font-extrabold ${
                            p.stock === 0 ? 'text-rose-500' : p.stock <= 10 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {p.stock} pcs
                          </span>
                          {p.stock === 0 && (
                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">HABIS TOTAL</span>
                          )}
                          {p.stock > 0 && p.stock <= 10 && (
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">RE-STOCK SEGERA</span>
                          )}
                        </div>
                      </td>

                      {/* Status columns */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/35'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                          {p.isActive ? (
                            <>
                              <Eye size={11} /> Tampil (Aktif)
                            </>
                          ) : (
                            <>
                              <EyeOff size={11} /> Hidden
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <Trash2 size={11} /> Hapus
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
          <ShoppingBag size={40} className="mx-auto text-slate-300" />
          <p className="text-sm text-slate-400 font-medium">Produk tidak bernilai atau tidak ditemukan.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Buat Produk Pertama Anda
          </button>
        </div>
      )}

      {/* CRUD MODAL FOR PRODUCT ADD/EDIT */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                </h4>
                <p className="text-xs text-slate-400">Pastikan stok, harga, dan kategori terisi dengan benar</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 mb-4">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1" htmlFor="name">Nama Produk</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Contoh: Paracetamol 500mg"
                    className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1" htmlFor="slug">Slug URL (Url-Friendly)</label>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                    placeholder="Contoh: paracetamol-500mg"
                    className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Kategori Produk</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value={0}>Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Photo upload for product image */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Foto Produk</label>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {imageFile ? (
                        <img src={imageFile} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Harga Unit (Rupiah)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={price === 0 ? '' : price.toLocaleString('id-ID')}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="Contoh: 15.000"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none font-bold"
                    />
                    <div className="absolute left-3 top-2.5 font-bold text-slate-400">
                      Rp
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Jumlah Stok Fisik</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1" htmlFor="description">Deskripsi Produk</label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Isi deskripsi lengkap khasiat, ukuran, cara pakai, atau info produk detail..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none font-normal"
                />
              </div>

              {/* Toggle isActive button */}
              <div className="flex items-center gap-2 py-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  Aktifkan Produk (Tampilkan produk di katalog halaman pembeli)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-bold rounded-lg cursor-pointer"
                  style={{ backgroundColor: currentPreset.primaryColor }}
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
