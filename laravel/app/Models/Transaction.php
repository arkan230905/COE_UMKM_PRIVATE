<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    protected $fillable = [
        'customer_id',
        'transaction_code',
        'total_amount',
        'status',
        'payment_method',
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2'
    ];

    /**
     * Get the customer associated with the transaction.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the itemized lines for this transaction.
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Get the accompanying income record bookkeeping entry.
     */
    public function incomeRecord(): HasOne
    {
        return $this->hasOne(IncomeRecord::class);
    }
}
