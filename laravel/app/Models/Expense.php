<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'umkm_preset_id',
        'expense_category',
        'description',
        'amount',
        'date',
        'notes',
        // ✅ ADDED: Fields for "Pembelian Stok" category
        'material_name',
        'quantity',
        'unit',
        'price_per_unit',
        'shipping_cost',
        'discount',
        'ppn_percent'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'price_per_unit' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'ppn_percent' => 'decimal:2',
        'date' => 'date',
        'quantity' => 'integer'
    ];

    /**
     * Get the UMKM that owns this expense
     */
    public function umkmPreset(): BelongsTo
    {
        return $this->belongsTo(UmkmPreset::class);
    }
}
