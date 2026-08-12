<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id',
        'product_id',
        'quantity',
        'price',
        'subtotal',
        'product_name', // ✅ Snapshot field
        'product_description', // ✅ Snapshot field
        'category_name' // ✅ Snapshot field
    ];

    protected $casts = [
        'price' => 'float', // ✅ Changed from decimal:2 to float
        'subtotal' => 'float', // ✅ Changed from decimal:2 to float
        'quantity' => 'integer'
    ];

    /**
     * Get the transaction that owns the item.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the product that owns the item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
