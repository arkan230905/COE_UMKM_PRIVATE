<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // UMKM Presets/Tenants Table
        Schema::create('umkm_presets', function (Blueprint $table) {
            $table->id();
            $table->string('umkm_code')->unique(); // e.g., BISTARA-001
            $table->string('business_name'); // e.g., Bistara Coffee
            $table->string('industry'); // e.g., Food & Beverage
            $table->string('logo_text')->nullable(); // e.g., BC
            $table->string('primary_color')->default('#1E3A5F'); // Theme color
            $table->string('accent_color')->default('#3B82F6');
            $table->string('currency')->default('Rp');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('admin_name');
            $table->string('admin_email')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Link categories to UMKM
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('umkm_preset_id')->nullable()->after('id')->constrained('umkm_presets')->onDelete('cascade');
        });

        // Link products to UMKM
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('umkm_preset_id')->nullable()->after('id')->constrained('umkm_presets')->onDelete('cascade');
        });

        // Link customers to UMKM
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('umkm_preset_id')->nullable()->after('id')->constrained('umkm_presets')->onDelete('cascade');
        });

        // Link transactions to UMKM
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('umkm_preset_id')->nullable()->after('id')->constrained('umkm_presets')->onDelete('cascade');
        });

        // Link expenses to UMKM
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('umkm_preset_id')->nullable()->after('id')->constrained('umkm_presets')->onDelete('cascade');
        });

        // Link income_records to UMKM
        Schema::table('income_records', function (Blueprint $table) {
            $table->foreignId('umkm_preset_id')->nullable()->after('id')->constrained('umkm_presets')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign keys first
        Schema::table('income_records', function (Blueprint $table) {
            $table->dropForeign(['umkm_preset_id']);
            $table->dropColumn('umkm_preset_id');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['umkm_preset_id']);
            $table->dropColumn('umkm_preset_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['umkm_preset_id']);
            $table->dropColumn('umkm_preset_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['umkm_preset_id']);
            $table->dropColumn('umkm_preset_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['umkm_preset_id']);
            $table->dropColumn('umkm_preset_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['umkm_preset_id']);
            $table->dropColumn('umkm_preset_id');
        });

        Schema::dropIfExists('umkm_presets');
    }
};
