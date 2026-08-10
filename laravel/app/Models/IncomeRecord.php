<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomeRecord extends Model
{
    protected $fillable = [
        'umkm_preset_id',
        'transaction_id',
        'amount',
        'date',
        'description'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date'
    ];

    /**
     * Get the UMKM that owns this income record
     */
    public function umkmPreset(): BelongsTo
    {
        return $this->belongsTo(UmkmPreset::class);
    }

    /**
     * Get the transaction that owns the income record.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
