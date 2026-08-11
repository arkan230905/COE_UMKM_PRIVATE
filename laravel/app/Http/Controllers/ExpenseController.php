<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the expenses.
     * Can filter by umkm_preset_id if provided in query parameter.
     */
    public function index(Request $request)
    {
        $query = Expense::query();
        
        // Filter by umkm_preset_id if provided
        if ($request->has('umkm_preset_id')) {
            $query->where('umkm_preset_id', $request->input('umkm_preset_id'));
        }
        
        $expenses = $query->orderBy('date', 'desc')->get();
        
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
            'umkm_preset_id' => 'required|exists:umkm_presets,id', // Changed from umkmPresetId
            'expense_category' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            // Optional fields for "Pembelian Stok" - accept both camelCase and snake_case
            'material_name' => 'nullable|string|max:255',
            'materialName' => 'nullable|string|max:255',
            'quantity' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'price_per_unit' => 'nullable|numeric|min:0',
            'pricePerUnit' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'shippingCost' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'ppn_percent' => 'nullable|numeric|min:0|max:100',
            'ppnPercent' => 'nullable|numeric|min:0|max:100',
        ]);

        $data = [
            'umkm_preset_id' => $validated['umkm_preset_id'],
            'expense_category' => $validated['expense_category'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'notes' => $validated['notes'] ?? null,
            'material_name' => $validated['material_name'] ?? $validated['materialName'] ?? null,
            'quantity' => $validated['quantity'] ?? null,
            'unit' => $validated['unit'] ?? null,
            'price_per_unit' => $validated['price_per_unit'] ?? $validated['pricePerUnit'] ?? null,
            'shipping_cost' => $validated['shipping_cost'] ?? $validated['shippingCost'] ?? null,
            'discount' => $validated['discount'] ?? null,
            'ppn_percent' => $validated['ppn_percent'] ?? $validated['ppnPercent'] ?? null,
        ];

        $expense = Expense::create($data);

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
