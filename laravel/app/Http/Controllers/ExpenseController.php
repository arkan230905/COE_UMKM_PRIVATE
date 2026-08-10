<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the expenses.
     */
    public function index()
    {
        $expenses = Expense::orderBy('date', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $expenses
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_category' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $expense = Expense::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengeluaran berhasil ditambahkan',
            'data' => $expense
        ], 201);
    }

    /**
     * Display the specified expense.
     */
    public function show($id)
    {
        $expense = Expense::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $expense
        ]);
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'expense_category' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $expense->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengeluaran berhasil diperbarui',
            'data' => $expense
        ]);
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengeluaran berhasil dihapus'
        ]);
    }
}
