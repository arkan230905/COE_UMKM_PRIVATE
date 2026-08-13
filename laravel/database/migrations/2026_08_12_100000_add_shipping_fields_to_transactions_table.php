<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add shipping tracking fields to transactions table for admin shipping management.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('courier_name')->nullable()->after('notes');
            $table->string('tracking_number')->nullable()->after('courier_name');
            $table->string('shipping_status')->nullable()->after('tracking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['courier_name', 'tracking_number', 'shipping_status']);
        });
    }
};
