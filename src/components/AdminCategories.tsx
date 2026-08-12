import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FolderTree, AlertCircle, X, AlignLeft } from 'lucide-react';
import { Category, UMKMPreset } from '../types';
import storageService from '../services/storage';

interface AdminCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  currentPreset: UMKMPreset;
}

export default function AdminCategories({
  categories,
  setCategories,
  currentPreset
}: AdminCategoriesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Handle category name typing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setError('');
    setIsOpenModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setError('');
    setIsOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua produk dalam kategori ini mungkin akan kehilangan referensi.')) {
      try {
        await storageService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        console.log('✅ Category deleted from database:', id);
      } catch (err: any) {
        console.error('❌ Error deleting category:', err);
        alert('Gagal menghapus kategori: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate UMKM is selected
    if (!currentPreset || currentPreset.id === 'placeholder') {
      return setError('UMKM belum dipilih. Silakan login sebagai admin UMKM terlebih dahulu.');
    }

    if (!name.trim()) return setError('Nama kategori wajib diisi.');

    // Auto-generate slug dari nama (untuk keperluan internal saja)
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    try {
      if (editingCategory) {
        // Update - Save to database via API
        const updatedCategory = await storageService.updateCategory(editingCategory.id, {
          name,
          slug: generatedSlug,
          description
        });
        
        // Update local state
        setCategories(prev =>
          prev.map(c =>
            c.id === editingCategory.id ? updatedCategory : c
          )
        );
        
        console.log('✅ Category updated in database:', updatedCategory);
      } else {
        // Create - Save to database via API
        const newCatData = {
          umkmPresetId: currentPreset.id, // Link to current UMKM
          name,
          slug: generatedSlug,
          description,
          createdAt: new Date().toISOString().substring(0, 10),
        };
        
        const savedCategory = await storageService.saveCategory(newCatData);
        
        // Add to local state
        setCategories(prev => [...prev, savedCategory]);
        
        console.log('✅ Category saved to database:', savedCategory);
      }

      setIsOpenModal(false);
    } catch (err: any) {
      console.error('❌ Error saving category:', err);
      setError(err.message || 'Gagal menyimpan kategori. Cek koneksi database.');
    }
  };

  const filteredCategories = categories.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Admin</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
            Manajemen Kategori
          </h1>
          <p className="text-xs text-slate-400">Kelola kategori untuk mengklasifikasikan produk UMKM secara efisien</p>
        </div>

        {/* Add Product Category Button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-white uppercase tracking-wider font-bold rounded-xl shadow-md transition-transform hover:scale-105 duration-150 cursor-pointer align-middle shrink-0"
          style={{ backgroundColor: currentPreset.primaryColor }}
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {/* Filter and Search Layout bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari kategori berdasarkan nama & deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': currentPreset.accentColor } as React.CSSProperties}
          />
        </div>
        <div className="text-xs text-slate-400 font-bold">
          Total: <span className="text-slate-900 dark:text-white font-black">{filteredCategories.length} Items</span>
        </div>
      </div>

      {/* Categories Table or Grid view */}
      {filteredCategories.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Nama Kategori</th>
                  <th scope="col" className="px-6 py-4">Deskripsi Singkat</th>
                  <th scope="col" className="px-6 py-4">Tanggal Ditambah</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-medium">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold text-sm">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 max-w-xs text-slate-400 truncate">
                      {cat.description || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                    </td>
                    <td className="px-6 py-4">
                      {cat.createdAt}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Edit2 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
          <FolderTree size={40} className="mx-auto text-slate-300" />
          <p className="text-sm text-slate-400 font-medium">Kategori tidak ditemukan.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Buat Kategori Baru
          </button>
        </div>
      )}

      {/* ADD/EDIT MODAL COVERS */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FolderTree size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingCategory ? 'Edit Kategori Produk' : 'Tambah Kategori Baru'}
                </h4>
                <p className="text-xs text-slate-400">Kelompokkan produk agar mudah dijelajahi pelanggan</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 mb-4">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="name">Nama Kategori</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Contoh: Makanan & Minuman, Pakaian, Elektronik"
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="description">Deskripsi</label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan jenis-jenis produk yang termasuk dalam kategori ini..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none font-normal"
                />
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
