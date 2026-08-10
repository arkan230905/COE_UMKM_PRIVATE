<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\IncomeRecord;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     */
    public function index()
    {
        $transactions = Transaction::with(['customer', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'transaction_code' => 'required|string|unique:transactions,transaction_code',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,completed,cancelled',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Create transaction
            $transaction = Transaction::create([
                'customer_id' => $validated['customer_id'],
                'transaction_code' => $validated['transaction_code'],
                'total_amount' => $validated['total_amount'],
                'status' => $validated['status'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create transaction items and update stock
            foreach ($validated['items'] as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Update product stock
                $product = Product::findOrFail($item['product_id']);
                $product->decrement('stock', $item['quantity']);
            }

            // Create income record if transaction is completed
            if ($validated['status'] === 'completed' || $validated['status'] === 'paid') {
                IncomeRecord::create([
                    'transaction_id' => $transaction->id,
                    'amount' => $validated['total_amount'],
                    'date' => now()->toDateString(),
                    'description' => 'Penjualan - ' . $validated['transaction_code'],
                ]);
            }

            DB::commit();

            $transaction->load(['customer', 'items.product']);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dibuat',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show($id)
    {
        $transaction = Transaction::with(['customer', 'items.product'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $transaction
        ]);
    }

    /**
     * Update transaction status.
     */
    public function updateStatus(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,paid,completed,cancelled',
        ]);

        $oldStatus = $transaction->status;
        $transaction->update(['status' => $validated['status']]);

        // Create income record if status changed to completed/paid
        if (($validated['status'] === 'completed' || $validated['status'] === 'paid') 
            && !in_array($oldStatus, ['completed', 'paid'])) {
            IncomeRecord::updateOrCreate(
                ['transaction_id' => $transaction->id],
                [
                    'amount' => $transaction->total_amount,
                    'date' => now()->toDateString(),
                    'description' => 'Penjualan - ' . $transaction->transaction_code,
                ]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status transaksi berhasil diperbarui',
            'data' => $transaction
        ]);
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $transaction = Transaction::with('items')->findOrFail($id);

            // Restore product stock
            foreach ($transaction->items as $item) {
                $product = Product::findOrFail($item->product_id);
                $product->increment('stock', $item->quantity);
            }

            // Delete related income record
            IncomeRecord::where('transaction_id', $id)->delete();

            // Delete transaction (items will be cascaded)
            $transaction->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
