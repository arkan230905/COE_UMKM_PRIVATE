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
     * Can filter by umkm_preset_id if provided in query parameter.
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['customer', 'items.product.category']);
        
        // Filter by umkm_preset_id if provided
        if ($request->has('umkm_preset_id')) {
            $query->where('umkm_preset_id', $request->input('umkm_preset_id'));
        }
        
        $transactions = $query->orderBy('created_at', 'desc')->get();
        
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
            'umkm_preset_id' => 'required|integer|exists:umkm_presets,id',
            'customer_id' => 'nullable|exists:customers,id',
            'transaction_code' => 'required|string|unique:transactions,transaction_code',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,completed,cancelled',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
            'is_offline' => 'nullable|boolean', // ✅ ADDED
            'booking_date' => 'nullable|date', // ✅ ADDED for booking transactions
            'requires_shipping' => 'nullable|boolean', // ✅ ADDED for shipping flag
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_name' => 'nullable|string', // ✅ ADDED snapshot field
            'items.*.product_description' => 'nullable|string', // ✅ ADDED snapshot field
            'items.*.category_name' => 'nullable|string', // ✅ ADDED snapshot field
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // ✅ If customer_id not provided or doesn't exist, create/get walk-in customer
            $customerId = $validated['customer_id'] ?? null;
            
            if (!$customerId) {
                // Find or create walk-in customer for this UMKM
                $walkInCustomer = \App\Models\Customer::firstOrCreate(
                    [
                        'umkm_preset_id' => $validated['umkm_preset_id'],
                        'email' => 'walkin@' . $validated['umkm_preset_id'] . '.local'
                    ],
                    [
                        'name' => 'Walk-in Customer',
                        'phone' => '-',
                        'address' => '-'
                    ]
                );
                $customerId = $walkInCustomer->id;
            }

            // Create transaction
            $transaction = Transaction::create([
                'umkm_preset_id' => $validated['umkm_preset_id'],
                'customer_id' => $customerId,
                'transaction_code' => $validated['transaction_code'],
                'total_amount' => $validated['total_amount'],
                'status' => $validated['status'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'is_offline' => $validated['is_offline'] ?? false, // ✅ ADDED
                'booking_date' => $validated['booking_date'] ?? null, // ✅ ADDED for booking
                'requires_shipping' => $validated['requires_shipping'] ?? false, // ✅ ADDED for shipping flag
            ]);

            // Create transaction items and update stock
            foreach ($validated['items'] as $item) {
                // Get product for snapshot data
                $product = Product::with('category')->findOrFail($item['product_id']);
                
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                    // ✅ Save snapshot data from frontend OR fallback to database
                    'product_name' => $item['product_name'] ?? $product->name,
                    'product_description' => $item['product_description'] ?? $product->description,
                    'category_name' => $item['category_name'] ?? $product->category->name ?? '-',
                ]);

                // Update product stock
                $product->decrement('stock', $item['quantity']);
            }

            // Create income record if transaction is completed
            if ($validated['status'] === 'completed' || $validated['status'] === 'paid') {
                IncomeRecord::create([
                    'umkm_preset_id' => $validated['umkm_preset_id'],
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
                    'umkm_preset_id' => $transaction->umkm_preset_id, // ✅ ADDED for multi-tenant isolation
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
     * Update transaction shipping information.
     */
    public function updateShipping(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'courier_name' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'shipping_status' => 'nullable|string|in:Dalam Antrean,Sedang Dikemas,Sedang Dikirim,Sampai Tujuan',
            'status' => 'nullable|string|in:pending,paid,completed,cancelled',
        ]);

        // Update shipping fields
        $transaction->update($validated);

        // If shipping status is "Sampai Tujuan" and transaction not yet completed
        // Auto-create income record
        if (isset($validated['status']) && $validated['status'] === 'completed' 
            && !in_array($transaction->getOriginal('status'), ['completed', 'paid'])) {
            IncomeRecord::updateOrCreate(
                ['transaction_id' => $transaction->id],
                [
                    'umkm_preset_id' => $transaction->umkm_preset_id,
                    'amount' => $transaction->total_amount,
                    'date' => now()->toDateString(),
                    'description' => 'Penjualan - ' . $transaction->transaction_code,
                ]
            );
        }

        // ✅ Reload transaction with relationships to return fresh data
        $transaction->load(['customer', 'items.product.category']);

        return response()->json([
            'status' => 'success',
            'message' => 'Info pengiriman berhasil diperbarui',
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
