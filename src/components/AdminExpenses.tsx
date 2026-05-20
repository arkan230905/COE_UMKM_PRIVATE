import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Receipt, AlertCircle, X, DollarSign } from 'lucide-react';
import { Expense, UMKMPreset } from '../types';

interface AdminExpensesProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  currentPreset: UMKMPreset;
}

export default function AdminExpenses({
  expenses,
  setExpenses,
  currentPreset
}: AdminExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states
  const [expenseCategory, setExpenseCategory] = useState('Pembelian Stok');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const categories = ['Pembelian Stok', 'Gaji Karyawan', 'Tagihan Listrik & Air', 'Sewa & Keamanan', 'Lain-lain'];

  const formatCurrency = (val: number) => {
    if (currentPreset.currency === '$') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const handleAmountChange = (valueStr: string) => {
    const digits = valueStr.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) : 0;
    setAmount(num);
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setExpenseCategory('Pembelian Stok');
    setDescription('');
    setAmount(0);
    setDate(new Date().toISOString().substring(0, 10));
    setNotes('');
    setError('');
    setIsOpenModal(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseCategory(exp.expenseCategory);
    setDescription(exp.description);
    setAmount(exp.amount);
    setDate(exp.date);
    setNotes(exp.notes);
    setError('');
    setIsOpenModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengeluaran ini?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) return setError('Deskripsi pengeluaran wajib diisi.');
    if (amount <= 0) return setError('Nominal pengeluaran harus lebih dari 0.');

    if (editingExpense) {
      // Edit
      setExpenses(prev =>
        prev.map(e =>
          e.id === editingExpense.id
            ? { ...e, expenseCategory, description, amount, date, notes }
            : e
        )
      );
    } else {
      // Create
      const newExp: Expense = {
        id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
        expenseCategory,
        description,
        amount,
        date,
        notes,
        createdAt: new Date().toISOString(),
      };
      setExpenses(prev => [newExp, ...prev]);
    }

    setIsOpenModal(false);
  };

  // Filter listings
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.expenseCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const aggregateExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header and sums */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
            Expenses Management
          </h1>
          <p className="text-xs text-slate-400">Track and log business expenditures and stock purchase bills</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-white uppercase tracking-wider font-bold rounded-xl shadow-md transition-transform hover:scale-105 duration-150 cursor-pointer shrink-0"
          style={{ backgroundColor: currentPreset.primaryColor }}
        >
          <Plus size={16} /> Catat Pengeluaran
        </button>
      </div>

      {/* Aggregate Spend bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 p-5 bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-750 text-white rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider block">Total Pengeluaran Saring</span>
          <span className="text-2xl font-black block tracking-tight">{formatCurrency(aggregateExpenses)}</span>
          <span className="text-[11px] font-semibold text-rose-100 block">Dari {filteredExpenses.length} transaksi pengeluaran</span>
        </div>

        {/* Filter bar */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari pengeluaran berdasarkan nama & info catat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
            <span className="font-bold text-slate-400 select-none">Kategori Cost:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none"
            >
              <option value="all">Semua Pengeluaran</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table list */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden font-medium">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">ID Cost</th>
                  <th scope="col" className="px-6 py-4">Kategori Cost</th>
                  <th scope="col" className="px-6 py-4">Deskripsi Pembayaran</th>
                  <th scope="col" className="px-6 py-4">Tanggal Pembulatan</th>
                  <th scope="col" className="px-6 py-4 text-right">Nominal</th>
                  <th scope="col" className="px-6 py-4">Catatan Supplier</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">
                      #EXP0{exp.id}
                    </td>

                    <td className="px-6 py-4 text-slate-950 dark:text-white font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold block w-fit text-slate-700 dark:text-slate-300">
                        {exp.expenseCategory}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                      {exp.description}
                    </td>

                    <td className="px-6 py-4">
                      {exp.date}
                    </td>

                    <td className="px-6 py-4 text-right font-black text-rose-600">
                      {formatCurrency(exp.amount)}
                    </td>

                    <td className="px-6 py-4 max-w-xs text-slate-400 truncate">
                      {exp.notes || <span className="italic text-slate-300">Kosong</span>}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1 px-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1 px-2 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 size={12} />
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
          <Receipt size={40} className="mx-auto text-slate-305" />
          <p className="text-sm text-slate-400 font-medium">Pengeluaran tidak ditemukan atau belum dicatatkan.</p>
        </div>
      )}

      {/* CREATE / EDIT MODAL FOR EXPENDITURE */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-xl">
                <Receipt size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingExpense ? 'Ubah Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
                </h4>
                <p className="text-xs text-slate-400">Catat setiap pengeluaran kas operasional agar laporan keuangan rapi</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 rounded-xl text-xs flex items-center gap-2 mb-4">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Kategori Pengeluaran</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-white focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1" htmlFor="description">Deskripsi Pengeluaran</label>
                <input
                  id="description"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Belanja 5 dus paracetamol / Tagihan PLN Juni"
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Nominal (Rupiah)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={amount === 0 ? '' : amount.toLocaleString('id-ID')}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Contoh: 15.000"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-white focus:outline-none font-bold"
                    />
                    <div className="absolute left-3 top-2.5 font-bold text-slate-400">
                      Rp
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Tanggal Keluar</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1" htmlFor="notes">Catatan & Supplier</label>
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Dibeli dari agen sehat sejahtera dpt diskon 5%"
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-bold rounded-lg cursor-pointer animate-pulse"
                  style={{ backgroundColor: currentPreset.primaryColor }}
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
