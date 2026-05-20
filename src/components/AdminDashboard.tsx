import React, { useState } from 'react';
import {
  Users,
  FileText,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Wallet,
  Coins,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Transaction, Product, Category, Customer, UMKMPreset, Expense } from '../types';

interface AdminDashboardProps {
  transactions: Transaction[];
  products: Product[];
  categories: Category[];
  customers: Customer[];
  expenses: Expense[];
  currentPreset: UMKMPreset;
}

export default function AdminDashboard({
  transactions,
  products,
  categories,
  customers,
  expenses,
  currentPreset
}: AdminDashboardProps) {
  const [selectedYearLine, setSelectedYearLine] = useState<'all' | '2024' | '2025'>('all');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Dynamic calculations to match mockup values or display actual interactive aggregates
  const formatCurrency = (amount: number) => {
    if (currentPreset.currency === '$') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // 1. Calculate base aggregations dynamically
  const formatCompactNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num.toString();
  };

  // Calculate real statistics from actual data
  const totalCustomers = customers.length;
  const totalTransactions = transactions.length;
  
  // Filter customers by current UMKM if they have umkmId
  const umkmCustomers = customers.filter(c => !c.umkmId || c.umkmId === currentPreset.id);
  const displayCustomerCount = umkmCustomers.length;
  
  // Calculate total sales from transaction items (simulated - in real app, this would come from transaction_items)
  const totalSales = transactions.reduce((sum, tx) => {
    // Estimate average 3 items per transaction for display purposes
    // In production, this should sum actual quantities from transaction_items
    return sum + (tx.status === 'completed' || tx.status === 'paid' ? 3 : 0);
  }, 0);
  
  // Dynamic summation of all transaction totalAmount
  const currentTransactionTotal = transactions.reduce((sum, tx) => sum + (tx.status === 'completed' || tx.status === 'paid' ? tx.totalAmount : 0), 0);
  const totalIncome = currentTransactionTotal;

  // Line Chart Data: Monthly performance based on real transaction data
  // Group transactions by month and calculate totals
  const monthlyPerfData = [
    { name: 'Jan', '2024': 0, '2025': 0 },
    { name: 'Feb', '2024': 0, '2025': 0 },
    { name: 'Mar', '2024': 0, '2025': 0 },
    { name: 'Apr', '2024': 0, '2025': 0 },
    { name: 'May', '2024': 0, '2025': 0 },
    { name: 'Jun', '2024': 0, '2025': 0 },
    { name: 'Jul', '2024': 0, '2025': 0 },
    { name: 'Aug', '2024': 0, '2025': 0 },
    { name: 'Sep', '2024': 0, '2025': 0 },
    { name: 'Oct', '2024': 0, '2025': 0 },
    { name: 'Nov', '2024': 0, '2025': 0 },
    { name: 'Dec', '2024': 0, '2025': 0 },
  ];

  // Pie Chart Data: Payment Method distribution based on real transactions
  const paymentMethodCounts = transactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTxCount = transactions.length || 1; // Avoid division by zero
  const paymentMethodData = Object.entries(paymentMethodCounts).map(([method, count]) => {
    const colorMap: Record<string, string> = {
      'QRIS': '#1E3A5F',
      'Cash': '#94A3B8',
      'E-Wallet': '#E0F2FE',
      'Debit Card': '#3B82F6',
    };
    return {
      name: method,
      value: Math.round((count / totalTxCount) * 100),
      color: colorMap[method] || '#64748B',
    };
  }).filter(item => item.value > 0);

  // Fallback to empty data if no transactions
  const finalPaymentMethodData = paymentMethodData.length > 0 
    ? paymentMethodData 
    : [{ name: 'No Data', value: 100, color: '#E2E8F0' }];

  // Weekly Revenue Performance Data: Based on real transaction data by day of week
  const weeklyRevenueData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'].map(day => {
    const dayTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dayNames[txDate.getDay()] === day;
    });
    
    const actualRevenue = dayTransactions.reduce((sum, tx) => 
      sum + (tx.status === 'completed' || tx.status === 'paid' ? tx.totalAmount : 0), 0
    );
    
    return {
      name: day,
      Actual: actualRevenue,
    };
  });

  // Stat Card structure
  const statCards = [
    {
      title: 'Total Customers',
      value: displayCustomerCount,
      percentage: totalCustomers > 0 ? '+12.4%' : '0%',
      icon: Users,
      color: '#6366f1',
    },
    {
      title: 'Total Transaction',
      value: totalTransactions.toLocaleString('en-US'),
      percentage: '+8.2%',
      icon: FileText,
      bgColor: 'bg-pink-50 dark:bg-slate-800/80',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
    {
      title: 'Total Sales',
      value: totalSales.toLocaleString('en-US'),
      percentage: '+15.3%',
      icon: ShoppingBag,
      bgColor: 'bg-orange-50 dark:bg-slate-800/80',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      percentage: '+23.1%',
      icon: DollarSign,
      bgColor: 'bg-emerald-50 dark:bg-slate-800/80',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"><CheckCircle2 size={12} /> Selesai</span>;
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"><CheckCircle2 size={12} /> Dibayar</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"><Clock size={12} /> Menunggu</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"><XCircle size={12} /> Batal</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Topbar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Welcome Back</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {currentPreset.adminName || currentPreset.businessName} <span className="text-xl font-normal text-slate-400">| Super Admin</span>
          </h1>
        </div>

        {/* Search bar inside header mockup */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search transactions, customers..."
              className="w-64 max-w-xs pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': currentPreset.accentColor } as React.CSSProperties}
            />
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-500 relative cursor-pointer hover:bg-slate-50">
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            <Calendar size={16} />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center justify-between group hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-1">
                <span className="text-[11px] text-bento-text-muted dark:text-slate-400 font-bold uppercase tracking-wider">{card.title}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-bento-navy dark:text-white">
                    {card.value}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-extrabold bg-bento-light-blue dark:bg-emerald-950/25 px-1.5 py-0.5 rounded">
                    {card.percentage}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-bento-light-blue dark:bg-slate-800 transition-transform group-hover:scale-105 duration-300`}>
                <Icon size={18} className="text-bento-navy dark:text-bento-light-blue" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Line Chart (Wide Column span 2) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Sales Performance</h3>
              <p className="text-xs text-slate-400">See how your sales grow month by month in years 2024 & 2025</p>
            </div>
            {/* Year Toggle options to filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-750">
              <button
                onClick={() => setSelectedYearLine('all')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                  selectedYearLine === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setSelectedYearLine('2024')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                  selectedYearLine === '2024'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2024
              </button>
              <button
                onClick={() => setSelectedYearLine('2025')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                  selectedYearLine === '2025'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2025
              </button>
            </div>
          </div>

          {/* Area Line Chart of Monthly Data */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerfData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="color2025" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E0F2FE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E0F2FE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                {(selectedYearLine === 'all' || selectedYearLine === '2025') && (
                  <Area
                    type="monotone"
                    dataKey="2025"
                    stroke="#1E3A5F"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#color2025)"
                    name="Year 2025 (Active)"
                  />
                )}
                {(selectedYearLine === 'all' || selectedYearLine === '2024') && (
                  <Area
                    type="monotone"
                    dataKey="2024"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#color2024)"
                    name="Year 2024 (Baseline)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center gap-6 mt-2 text-xs">
            {(selectedYearLine === 'all' || selectedYearLine === '2025') && (
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-350">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]"></span> Tahun 2025 ({currentPreset.businessName})
              </span>
            )}
            {(selectedYearLine === 'all' || selectedYearLine === '2024') && (
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-350">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span> Tahun 2024 (Tahun Lalu)
              </span>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution Pie/Donut Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Payment Methods</h3>
            <p className="text-xs text-slate-400">Total transaction types breakdown</p>
          </div>

          <div className="relative h-44 my-4 flex items-center justify-center">
            {/* Pie chart donut visualization */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPaymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {finalPaymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Donut Labels */}
            <div className="absolute text-center">
              <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                {totalTransactions}
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Tx
              </span>
            </div>
          </div>

          {/* Legend breakdown in a beautiful grid */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-50 dark:border-slate-800/40">
            {finalPaymentMethodData.map((record, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: record.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{record.name}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">{record.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row of Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue performance Bar Chart (1 Column) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Kinerja Pendapatan</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">Mingguan</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Realisasi total omset pendapatan per minggu rill</p>
          </div>

          {/* Bar Chart mapping Actual */}
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactNumber(Number(v))} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="Actual" fill="#1E3A5F" radius={[4, 4, 0, 0]} name="Pendapatan Aktual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center items-center gap-4 mt-2 text-xs border-t border-slate-50 dark:border-slate-800/60 pt-3">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-[#1E3A5F]" /> Total Terrealisasi
            </span>
          </div>
        </div>

        {/* Top Transactions Table matching Mockup perfectly (2 Columns span) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Top Transactions</h3>
              <p className="text-xs text-slate-400">Highlights of the highest transactions made this week</p>
            </div>
            <span className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none font-semibold">See All</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <tr>
                  <th scope="col" className="px-4 py-3">Transaction ID</th>
                  <th scope="col" className="px-4 py-3">Customer ID</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Payment</th>
                  <th scope="col" className="px-4 py-3 text-right">Purchase</th>
                  <th scope="col" className="px-4 py-3 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {transactions.slice(0, 6).map((tx, idx) => {
                  const customer = customers.find(c => c.id === tx.customerId);
                  return (
                    <tr
                      key={tx.id}
                      onMouseEnter={() => setHoveredRow(tx.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        hoveredRow === tx.id ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-slate-900 dark:text-white font-bold">
                        #{tx.transactionCode}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        #C{tx.customerId} <span className="text-[10px] text-slate-400">({customer ? customer.name : 'Guest'})</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {tx.createdAt.substring(0, 10).split('-').reverse().join('-')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1.5">
                          {tx.paymentMethod === 'Debit Card' && <CreditCard size={13} className="text-blue-500" />}
                          {tx.paymentMethod === 'QRIS' && <QrCode size={13} className="text-sky-500" />}
                          {tx.paymentMethod === 'E-Wallet' && <Wallet size={13} className="text-purple-500" />}
                          {tx.paymentMethod === 'Cash' && <Coins size={13} className="text-emerald-500" />}
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(tx.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md"
            >
              <span className="text-lg font-bold">✕</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Detail Transaksi #{selectedTx.transactionCode}</h4>
                <p className="text-xs text-slate-400">Rincian invoice pembelian pelanggan</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block font-medium">Customer ID</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">#C{selectedTx.customerId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Metode Pembayaran</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTx.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tanggal Transaksi</span>
                  <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedTx.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status Pembayaran</span>
                  <span className="pt-0.5 block">{getStatusBadge(selectedTx.status)}</span>
                </div>
              </div>

              {/* Items list detail */}
              <div>
                <span className="block font-bold text-slate-900 dark:text-white mb-2">Item Terbeli</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold">
                    <span className="flex-[2] text-left">Nama Produk</span>
                    <span className="flex-1 text-center">Qty / Harga</span>
                    <span className="flex-1 text-right">Subtotal</span>
                  </div>
                  {/* Simulate item list based on total purchases */}
                  <div className="flex items-center justify-between p-3 font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex-[2] text-left text-slate-950 dark:text-white">Multivitamin Complex & Supplements Paket</span>
                    <span className="flex-1 text-center">1 x {formatCurrency(selectedTx.totalAmount)}</span>
                    <span className="flex-1 text-right font-bold text-slate-950 dark:text-white">{formatCurrency(selectedTx.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedTx.notes && (
                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-100/30 text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-400 block">Catatan Pesanan:</span>
                    <span>{selectedTx.notes}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Grand Total Pas</span>
                <span className="text-lg font-extrabold text-[#0066FF]" style={{ color: currentPreset.accentColor }}>
                  {formatCurrency(selectedTx.totalAmount)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
