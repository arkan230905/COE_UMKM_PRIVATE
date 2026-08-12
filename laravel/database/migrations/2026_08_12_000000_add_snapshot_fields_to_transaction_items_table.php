<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add snapshot fields to transaction_items so product data persists even if product is deleted.
     */
    public function up(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('product_id');
            $table->text('product_description')->nullable()->after('product_name');
            $table->string('category_name')->nullable()->after('product_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn(['product_name', 'product_description', 'category_name']);
        });
    }
};
