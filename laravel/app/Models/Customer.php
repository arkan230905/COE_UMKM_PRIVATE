<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'umkm_preset_id',
        'user_id',
        'name',
        'email',
        'phone',
        'address'
    ];

    /**
     * Get the UMKM that owns this customer
     */
    public function umkmPreset(): BelongsTo
    {
        return $this->belongsTo(UmkmPreset::class);
    }

    /**
     * Get the user associated with the customer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for the customer.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
