import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Landmark, Sparkles, Filter, Plus, Calendar, Search, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Transaction, Expense, IncomeRecord, UMKMPreset } from '../types';

interface AdminFinancialReportProps {
  transactions: Transaction[];
  expenses: Expense[];
  incomes: IncomeRecord[];
  setIncomes: React.Dispatch<React.SetStateAction<IncomeRecord[]>>;
  currentPreset: UMKMPreset;
}

export default function AdminFinancialReport({
  transactions,
  expenses,
  incomes,
  setIncomes,
  currentPreset
}: AdminFinancialReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpenManualIncome, setIsOpenManualIncome] = useState(false);

  // Manual Income Form states
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');

  const handleAmountChange = (valueStr: string) => {
    const digits = valueStr.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) : 0;
    setAmount(num);
  };

  const formatCurrency = (val: number) => {
    if (currentPreset.currency === '$') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Base mockup statistics
  const baseIncomeValue = currentPreset.id === 'pharmacy' ? 25690 : 0;
  const currentTransactionTotal = transactions.reduce((sum, tx) => sum + (tx.status === 'completed' || tx.status === 'paid' ? tx.totalAmount : 0), 0);

  // 1. Calculate dynamic financial statistics
  const totalIncome = baseIncomeValue + currentTransactionTotal + incomes
    .filter(i => i.transactionId === null) // manual ones
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleAddManualIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const newInc: IncomeRecord = {
      id: incomes.length > 0 ? Math.max(...incomes.map(i => i.id)) + 1 : 1,
      transactionId: null,
      amount,
      date,
      description,
      createdAt: new Date().toISOString()
    };

    setIncomes(prev => [newInc, ...prev]);
    setIsOpenManualIncome(false);
    setAmount(0);
    setDescription('');
  };

  // Aggregate actual monthly data from transactions (sales) and expenses (purchases)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlySales = months.map((_, index) => {
    return transactions
      .filter(t => {
        const txDate = new Date(t.createdAt);
        const isCompleted = t.status === 'completed' || t.status === 'paid';
        return isCompleted && txDate.getMonth() === index;
      })
      .reduce((sum, t) => sum + t.totalAmount, 0);
  });

  const monthlyPurchases = months.map((_, index) => {
    return expenses
      .filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === index;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  });

  const financialFlowData = months.map((month, index) => ({
    name: month,
    Pemasukan: monthlySales[index],
    Pengeluaran: monthlyPurchases[index]
  }));

  // Combined records for list (Transactions + Manual Incomes)
  const combinedIncomesList = [
    ...incomes,
    ...transactions
      .filter(t => t.status === 'completed' || t.status === 'paid')
      .map(t => ({
        id: t.id + 10000,
        transactionId: t.id as number | null,
        amount: t.totalAmount,
        date: t.createdAt.substring(0, 10),
        description: `Penjualan Online Kode #${t.transactionCode}`
      }))
  ].sort((a,b) => b.date.localeCompare(a.date));

  const filteredIncomeList = combinedIncomesList.filter(i =>
    i.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
            Financial Report & Profitability
          </h1>
          <p className="text-xs text-slate-400">Deep check on business earnings, expenditures, and net pocket profitability ratios</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsOpenManualIncome(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-white uppercase tracking-wider font-bold rounded-xl shadow-md cursor-pointer text-center bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <Plus size={15} /> Tambah Pemasukan Manual
          </button>
          <button
            onClick={() => alert('Laporan keuangan berhasil diexport ke format Excel/CSV! (Pelajaran Simulator)')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
          >
            <FileSpreadsheet size={15} /> Export Report
          </button>
        </div>
      </div>

      {/* 3 Core Cards showing Flow parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden group">
          <span className="text-[11px] text-bento-text-muted dark:text-slate-400 font-bold uppercase tracking-wider block">Total Pendapatan (Incomes)</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#1E3A5F] dark:text-white leading-tight">
              {formatCurrency(totalIncome)}
            </span>
            <div className="p-1 px-1.5 bg-bento-light-blue dark:bg-slate-800 text-bento-navy rounded text-[10px] font-bold flex items-center gap-1">
              <TrendingUp size={11} /> +12.5%
            </div>
          </div>
          <span className="text-[11px] text-bento-text-muted dark:text-slate-500 block">Sinkron dengan transaksi lunas & pengisian luar</span>
          <div className="absolute right-4 bottom-4 w-9 h-9 opacity-10 text-bento-navy">
            <Landmark size={36} />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden group">
          <span className="text-[11px] text-bento-text-muted dark:text-slate-400 font-bold uppercase tracking-wider block">Total Pengeluaran (Expenses)</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 leading-tight">
              {formatCurrency(totalExpense)}
            </span>
            <div className="p-1 px-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-650 rounded text-[10px] font-bold flex items-center gap-1">
              <TrendingDown size={11} /> -4.2%
            </div>
          </div>
          <span className="text-[11px] text-bento-text-muted dark:text-slate-500 block">Pembelian stok barang, upah staff, dan listrik air</span>
          <div className="absolute right-4 bottom-4 w-9 h-9 opacity-10 text-rose-500">
            <TrendingDown size={36} />
          </div>
        </div>

        {/* Net Profit card */}
        <div className="bg-gradient-to-br from-bento-navy to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-2 relative overflow-hidden group">
          <span className="text-[11px] text-bento-light-blue font-bold uppercase tracking-wider block">Est. Laba Bersih (Net Pocket Profit)</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold leading-tight text-white">
              {formatCurrency(netProfit)}
            </span>
            <span className="p-1 px-2 bg-white/20 text-bento-light-blue rounded text-[10px] font-bold">Laba Bersih</span>
          </div>
          <span className="text-[11px] text-slate-300 block">Dihitung dari Pemasukan dikurangi Pengeluaran</span>
          <div className="absolute right-4 bottom-3 w-10 h-10 opacity-15 text-white animate-pulse">
            <Sparkles size={40} />
          </div>
        </div>
      </div>

      {/* Comparison Monthly chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-medium">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Cashflow Comparison (Pemasukan vs Pengeluaran)</h3>
            <p className="text-xs text-slate-400">Monthly aggregate cash inflow vs operational outflow analysis</p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialFlowData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="Pemasukan" fill="#1E3A5F" radius={[4, 4, 0, 0]} name="Inflow / Pemasukan" />
                <Bar dataKey="Pengeluaran" fill="#E0F2FE" stroke="#1E3A5F" strokeWidth={1} radius={[4, 4, 0, 0]} name="Outflow / Pengeluaran" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incomes records list ledger right panel */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Income Records (Pemasukan)</h3>
            <p className="text-xs text-slate-400">Ledger of all credit transactions and custom logged entries</p>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari sumber pemasukan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* Records lists */}
          <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-2">
            {filteredIncomeList.length > 0 ? (
              filteredIncomeList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block font-bold text-slate-90s dark:text-white text-xs truncate max-w-[140px]">{item.description}</span>
                    <span className="block text-[9px] text-slate-400 font-semibold">{item.date}</span>
                  </div>
                  <span className="font-black text-emerald-600 text-xs text-right">
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-slate-300 text-[11px] font-semibold">Tidak ada catatan pemasukan.</p>
            )}
          </div>
        </div>
      </div>

      {/* INPUT MANUAL INCOME MODAL */}
      {isOpenManualIncome && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-medium">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpenManualIncome(false)}
              className="absolute top-4 right-4 text-slate-400"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Landmark size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Tambah Pemasukan Manual</h4>
                <p className="text-xs text-slate-400">Catat omset di luar transaksi retail digital</p>
              </div>
            </div>

            <form onSubmit={handleAddManualIncome} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nominal Penerimaan (Rupiah)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={amount === 0 ? '' : amount.toLocaleString('id-ID')}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Contoh: 15.000"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none font-bold"
                  />
                  <div className="absolute left-3 top-2.5 font-bold text-slate-400">
                    Rp
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Tanggal Terima</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1" htmlFor="descr">Deskripsi Penerimaan</label>
                <input
                  id="descr"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Bunga bank bulanan / Setor tunai offline"
                  className="w-full px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsOpenManualIncome(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-bold rounded-lg cursor-pointer"
                  style={{ backgroundColor: currentPreset.primaryColor }}
                >
                  Tambahkan Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
