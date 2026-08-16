import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Landmark, Sparkles, Filter, Plus, Calendar, Search, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Transaction, Expense, IncomeRecord, UMKMPreset } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
        description: `Penjualan ${t.isOffline ? 'Offline/Toko' : 'Online'}`
      }))
  ].sort((a,b) => b.date.localeCompare(a.date));

  const filteredIncomeList = combinedIncomesList.filter(i =>
    i.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export PDF Function with detailed report
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    
    try {
      console.log('🚀 Starting PDF generation...');
      
      // Validate data
      if (!currentPreset || !currentPreset.businessName) {
        throw new Error('Data UMKM tidak lengkap');
      }
      
      console.log('📊 Data validation passed');
      console.log('Income records:', combinedIncomesList.length);
      console.log('Expenses:', expenses.length);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📄 Creating PDF document...');
      
      // Import jsPDF fresh to ensure autoTable is attached
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      console.log('✅ jsPDF and autoTable loaded');
      
      const doc = new jsPDF() as any;
      
      // Verify autoTable is available
      if (typeof doc.autoTable !== 'function') {
        throw new Error('autoTable plugin tidak ter-load dengan benar. Silakan refresh halaman dan coba lagi.');
      }
      
      console.log('✅ autoTable verified as function');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to check if we need a new page
      const checkAddPage = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

    // Header
    doc.setFillColor(30, 58, 95); // Navy blue
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN KEUANGAN', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(currentPreset.businessName || 'UMKM', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`Sektor: ${currentPreset.industry || '-'}`, pageWidth / 2, 32, { align: 'center' });

    yPosition = 50;

    // Report Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, yPosition);
    doc.text(`Waktu: ${new Date().toLocaleTimeString('id-ID')}`, 14, yPosition + 5);
    doc.text(`Alamat: ${currentPreset.address || '-'}`, 14, yPosition + 10);
    doc.text(`Telepon: ${currentPreset.phone || '-'}`, 14, yPosition + 15);
    
    yPosition += 25;

    // Section 1: RINGKASAN KEUANGAN
    checkAddPage(60);
    doc.setFillColor(30, 58, 95);
    doc.rect(14, yPosition, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN KEUANGAN', 16, yPosition + 5.5);
    
    yPosition += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    // Financial Summary Boxes
    const boxHeight = 20;
    const boxWidth = (pageWidth - 42) / 3;
    
    // Total Income Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, yPosition, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL PENDAPATAN', 16, yPosition + 5);
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(formatCurrency(totalIncome), 16, yPosition + 13);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('(Income)', 16, yPosition + 17);

    // Total Expense Box
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14 + boxWidth + 4, yPosition, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL PENGELUARAN', 16 + boxWidth + 4, yPosition + 5);
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text(formatCurrency(totalExpense), 16 + boxWidth + 4, yPosition + 13);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('(Expense)', 16 + boxWidth + 4, yPosition + 17);

    // Net Profit Box
    doc.setFillColor(30, 58, 95);
    doc.roundedRect(14 + (boxWidth + 4) * 2, yPosition, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(224, 242, 254);
    doc.text('LABA BERSIH', 16 + (boxWidth + 4) * 2, yPosition + 5);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(formatCurrency(netProfit), 16 + (boxWidth + 4) * 2, yPosition + 13);
    doc.setFontSize(7);
    doc.text('(Net Profit)', 16 + (boxWidth + 4) * 2, yPosition + 17);

    yPosition += boxHeight + 15;

    // Section 2: DETAIL PENDAPATAN (INCOME RECORDS)
    checkAddPage(80);
    doc.setFillColor(16, 185, 129);
    doc.rect(14, yPosition, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL PENDAPATAN (INCOME)', 16, yPosition + 5.5);
    
    yPosition += 12;

    // Income Table
    const incomeTableData = combinedIncomesList.map((item, index) => {
      // Check if it's a transaction by looking at the description pattern
      const isTransaction = item.transactionId !== null;
      const isOffline = isTransaction && item.description && item.description.includes('Offline/Toko');
      
      return [
        (index + 1).toString(),
        item.date || '-',
        item.description || '-',
        formatCurrency(item.amount || 0),
        isTransaction ? (isOffline ? 'Penjualan Offline' : 'Penjualan Online') : 'Manual'
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['No', 'Tanggal', 'Deskripsi', 'Jumlah', 'Sumber']],
      body: incomeTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 80 },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 30, halign: 'center' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data: any) => {
        yPosition = data.cursor.y;
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Income Summary
    checkAddPage(20);
    doc.setFillColor(240, 253, 244);
    doc.rect(14, yPosition, pageWidth - 28, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text('TOTAL PENDAPATAN:', pageWidth - 80, yPosition + 8);
    doc.text(formatCurrency(totalIncome), pageWidth - 20, yPosition + 8, { align: 'right' });
    
    yPosition += 20;

    // Section 3: DETAIL PENGELUARAN (EXPENSES)
    checkAddPage(80);
    doc.setFillColor(239, 68, 68);
    doc.rect(14, yPosition, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL PENGELUARAN (EXPENSES)', 16, yPosition + 5.5);
    
    yPosition += 12;

    // Separate Stock Purchases and Other Expenses
    const stockPurchases = expenses.filter(e => e.expenseCategory === 'Pembelian Stok');
    const otherExpenses = expenses.filter(e => e.expenseCategory !== 'Pembelian Stok');

    // Stock Purchases Table (if any)
    if (stockPurchases.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('A. Pembelian Stok Bahan', 14, yPosition);
      yPosition += 5;

      const stockTableData = stockPurchases.map((exp, index) => [
        (index + 1).toString(),
        exp.date || '-',
        exp.materialName || '-',
        `${exp.quantity || 0} ${exp.unit || ''}`.trim(),
        formatCurrency(exp.pricePerUnit || 0),
        formatCurrency(exp.amount || 0),
        exp.notes || '-'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['No', 'Tanggal', 'Nama Bahan', 'Qty', 'Harga/Unit', 'Total', 'Catatan']],
        body: stockTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 40 },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 37 }
        },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 8;
      
      // Stock Subtotal
      const stockTotal = stockPurchases.reduce((sum, e) => sum + e.amount, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Subtotal Pembelian Stok:', pageWidth - 70, yPosition);
      doc.setTextColor(239, 68, 68);
      doc.text(formatCurrency(stockTotal), pageWidth - 20, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    }

    // Other Expenses Table
    checkAddPage(80);
    if (otherExpenses.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('B. Pengeluaran Operasional Lainnya', 14, yPosition);
      yPosition += 5;

      const expenseTableData = otherExpenses.map((exp, index) => [
        (index + 1).toString(),
        exp.date || '-',
        exp.expenseCategory || '-',
        exp.description || '-',
        formatCurrency(exp.amount || 0),
        exp.notes || '-'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['No', 'Tanggal', 'Kategori', 'Deskripsi', 'Jumlah', 'Catatan']],
        body: expenseTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 35 },
          3: { cellWidth: 55 },
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
          5: { cellWidth: 28 }
        },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 8;
      
      // Other Expenses Subtotal
      const otherTotal = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Subtotal Pengeluaran Lainnya:', pageWidth - 70, yPosition);
      doc.setTextColor(239, 68, 68);
      doc.text(formatCurrency(otherTotal), pageWidth - 20, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    }

    // Total Expense Summary
    checkAddPage(20);
    doc.setFillColor(254, 242, 242);
    doc.rect(14, yPosition, pageWidth - 28, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(239, 68, 68);
    doc.text('TOTAL PENGELUARAN:', pageWidth - 80, yPosition + 8);
    doc.text(formatCurrency(totalExpense), pageWidth - 20, yPosition + 8, { align: 'right' });
    
    yPosition += 20;

    // Section 4: ANALISIS LABA RUGI
    checkAddPage(50);
    doc.setFillColor(30, 58, 95);
    doc.rect(14, yPosition, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALISIS LABA RUGI', 16, yPosition + 5.5);
    
    yPosition += 15;
    doc.setTextColor(0, 0, 0);

    // Profit/Loss Table
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : '0.00';
    const profitStatus = netProfit >= 0 ? 'LABA' : 'RUGI';
    
    doc.autoTable({
      startY: yPosition,
      body: [
        ['Total Pendapatan (Income)', formatCurrency(totalIncome)],
        ['Total Pengeluaran (Expense)', formatCurrency(totalExpense)],
        ['', ''],
        [{ content: 'LABA BERSIH (Net Profit)', styles: { fontStyle: 'bold', fontSize: 10 } }, 
         { content: formatCurrency(netProfit), styles: { fontStyle: 'bold', fontSize: 10, textColor: netProfit >= 0 ? [16, 185, 129] : [239, 68, 68] } }],
        ['Margin Laba', `${profitMargin}%`],
        ['Status', profitStatus]
      ],
      theme: 'plain',
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Halaman ${i} dari ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Dicetak oleh ${currentPreset.businessName} - BISTARA (Solusi Digital untuk UMKM Indonesia)`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `Laporan-Keuangan-${(currentPreset.businessName || 'UMKM').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF berhasil dibuat:', fileName);
    
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Terjadi kesalahan saat membuat PDF:\n${errorMessage}\n\nSilakan cek browser console (F12) untuk detail lebih lanjut.`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Admin</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-slate-450" size={24} style={{ color: currentPreset.accentColor }} />
            Laporan Keuangan & Profitabilitas
          </h1>
          <p className="text-xs text-slate-400">Analisis mendalam pendapatan bisnis, pengeluaran, dan rasio profitabilitas bersih</p>
        </div>

        <div className="flex gap-2">
          {/* HIDDEN: Manual income button - not needed as income auto-syncs from transactions
          <button
            onClick={() => setIsOpenManualIncome(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-white uppercase tracking-wider font-bold rounded-xl shadow-md cursor-pointer text-center bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <Plus size={15} /> Tambah Pemasukan Manual
          </button>
          */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-700"></div>
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={15} /> Export Laporan PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Core Cards showing Flow parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden group">
          <span className="text-[11px] text-bento-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Total Pendapatan</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#1E3A5F] dark:text-white leading-tight">
              {formatCurrency(totalIncome)}
            </span>
            <div className="p-1 px-1.5 bg-bento-light-blue dark:bg-slate-800 text-bento-navy rounded text-[10px] font-bold flex items-center gap-1">
              <TrendingUp size={11} /> +12.5%
            </div>
          </div>
          <span className="text-[11px] text-bento-text-muted dark:text-slate-500 block font-semibold">Sinkron dengan transaksi lunas & pengisian luar</span>
          <div className="absolute right-4 bottom-4 w-9 h-9 opacity-10 text-bento-navy">
            <Landmark size={36} />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden group">
          <span className="text-[11px] text-bento-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Total Pengeluaran</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 leading-tight">
              {formatCurrency(totalExpense)}
            </span>
            <div className="p-1 px-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-650 rounded text-[10px] font-bold flex items-center gap-1">
              <TrendingDown size={11} /> -4.2%
            </div>
          </div>
          <span className="text-[11px] text-bento-text-muted dark:text-slate-500 block font-semibold">Pembelian stok barang, upah staff, dan listrik air</span>
          <div className="absolute right-4 bottom-4 w-9 h-9 opacity-10 text-rose-500">
            <TrendingDown size={36} />
          </div>
        </div>

        {/* Net Profit card */}
        <div className="bg-gradient-to-br from-bento-navy to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-2 relative overflow-hidden group">
          <span className="text-[11px] text-bento-light-blue font-bold uppercase tracking-wider block">Laba Bersih</span>
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
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Perbandingan Arus Kas (Pemasukan vs Pengeluaran)</h3>
            <p className="text-xs text-slate-400">Analisis agregat bulanan pemasukan kas vs pengeluaran operasional</p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialFlowData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  contentStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="Pemasukan" fill="#1E3A5F" radius={[4, 4, 0, 0]} name="Pemasukan" />
                <Bar dataKey="Pengeluaran" fill="#DC2626" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 'bold' }} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incomes records list ledger right panel */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Catatan Pemasukan</h3>
            <p className="text-xs text-slate-400">Buku besar semua transaksi kredit dan entri kustom yang dicatat</p>
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
                  className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <span className="block font-bold text-slate-900 dark:text-white text-xs break-words leading-tight">{item.description}</span>
                    <span className="block text-[9px] text-slate-400 font-semibold">{item.date}</span>
                  </div>
                  <span className="font-black text-emerald-600 text-xs text-right whitespace-nowrap shrink-0">
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



