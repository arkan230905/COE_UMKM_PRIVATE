<?php

namespace App\Http\Controllers;

use App\Models\IncomeRecord;
use App\Models\Expense;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialReportController extends Controller
{
    /**
     * Get financial report summary.
     */
    public function index(Request $request)
    {
        // Get filter parameters
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Build queries with date filters
        $incomeQuery = IncomeRecord::query();
        $expenseQuery = Expense::query();
        $transactionQuery = Transaction::with(['customer', 'items.product']);

        if ($startDate) {
            $incomeQuery->where('date', '>=', $startDate);
            $expenseQuery->where('date', '>=', $startDate);
            $transactionQuery->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $incomeQuery->where('date', '<=', $endDate);
            $expenseQuery->where('date', '<=', $endDate);
            $transactionQuery->where('created_at', '<=', $endDate);
        }

        // Get data
        $incomes = $incomeQuery->orderBy('date', 'desc')->get();
        $expenses = $expenseQuery->orderBy('date', 'desc')->get();
        $transactions = $transactionQuery->orderBy('created_at', 'desc')->get();

        // Calculate totals
        $totalIncome = $incomes->sum('amount');
        $totalExpense = $expenses->sum('amount');
        $netProfit = $totalIncome - $totalExpense;

        // Calculate transaction stats
        $totalTransactions = $transactions->count();
        $completedTransactions = $transactions->where('status', 'completed')->count();
        $pendingTransactions = $transactions->where('status', 'pending')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'net_profit' => $netProfit,
                    'total_transactions' => $totalTransactions,
                    'completed_transactions' => $completedTransactions,
                    'pending_transactions' => $pendingTransactions,
                ],
                'incomes' => $incomes,
                'expenses' => $expenses,
                'transactions' => $transactions,
            ]
        ]);
    }

    /**
     * Get dashboard statistics.
     */
    public function dashboard()
    {
        // Get current month data
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $monthlyIncome = IncomeRecord::whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount');
        $monthlyExpense = Expense::whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount');
        $monthlyProfit = $monthlyIncome - $monthlyExpense;

        // Get all-time data
        $totalIncome = IncomeRecord::sum('amount');
        $totalExpense = Expense::sum('amount');
        $totalProfit = $totalIncome - $totalExpense;

        // Transaction stats
        $totalTransactions = Transaction::count();
        $completedTransactions = Transaction::where('status', 'completed')->count();
        $pendingTransactions = Transaction::where('status', 'pending')->count();

        // Product stats
        $totalProducts = \App\Models\Product::count();
        $lowStockProducts = \App\Models\Product::where('stock', '<', 10)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'monthly' => [
                    'income' => $monthlyIncome,
                    'expense' => $monthlyExpense,
                    'profit' => $monthlyProfit,
                ],
                'all_time' => [
                    'income' => $totalIncome,
                    'expense' => $totalExpense,
                    'profit' => $totalProfit,
                ],
                'transactions' => [
                    'total' => $totalTransactions,
                    'completed' => $completedTransactions,
                    'pending' => $pendingTransactions,
                ],
                'products' => [
                    'total' => $totalProducts,
                    'low_stock' => $lowStockProducts,
                ],
            ]
        ]);
    }
}
