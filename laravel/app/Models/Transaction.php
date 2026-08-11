<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    protected $fillable = [
        'umkm_preset_id',
        'customer_id',
        'transaction_code',
        'total_amount',
        'status',
        'payment_method',
        'notes',
        'is_offline' // ✅ ADDED
    ];

    protected $casts = [
        'total_amount' => 'float', // ✅ Changed from decimal:2 to float
        'is_offline' => 'boolean'
    ];

    /**
     * Get the UMKM that owns this transaction
     */
    public function umkmPreset(): BelongsTo
    {
        return $this->belongsTo(UmkmPreset::class);
    }

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
