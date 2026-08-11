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
        // 1. Modify existing Users Table to add additional fields (only if not exists)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['super_admin', 'customer'])->default('customer')->after('password');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after(Schema::hasColumn('users', 'role') ? 'role' : 'password');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('phone');
            }
        });

        // 1.5. UMKM Presets/Tenants Table (CREATE FIRST before other tables)
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

        // 2. Categories Table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_preset_id')->constrained('umkm_presets')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unique(['umkm_preset_id', 'slug']); // Make slug unique per UMKM
            $table->timestamps();
        });

        // 3. Products Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_preset_id')->constrained('umkm_presets')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->integer('stock')->default(0);
            $table->longText('image')->nullable(); // Changed from string to longText for base64 images
            $table->boolean('is_active')->default(true);
            $table->string('barcode', 50)->nullable();
            $table->unique(['umkm_preset_id', 'slug']); // Make slug unique per UMKM
            $table->timestamps();
        });

        // 4. Customers Table (Links to users)
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_preset_id')->constrained('umkm_presets')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // 5. Transactions Table
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_preset_id')->constrained('umkm_presets')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('transaction_code');
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'paid', 'completed', 'cancelled'])->default('pending');
            $table->string('payment_method'); // E-Wallet, Cash, Debit Card, QRIS
            $table->text('notes')->nullable();
            $table->boolean('is_offline')->default(false); // ✅ ADDED: Flag untuk transaksi offline (kasir)
            $table->unique(['umkm_preset_id', 'transaction_code']); // Make transaction_code unique per UMKM
            $table->timestamps();
        });

        // 6. Transaction Items Table
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });

        // 7. Expenses Table
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_preset_id')->constrained('umkm_presets')->onDelete('cascade');
            $table->string('expense_category'); // Pembelian Stok, Gaji Karyawan, Tagihan, dll
            $table->text('description');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('notes')->nullable();
            // Material purchase details
            $table->string('material_name')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('price_per_unit', 15, 2)->nullable();
            $table->decimal('shipping_cost', 15, 2)->nullable();
            $table->decimal('discount', 15, 2)->nullable();
            $table->decimal('ppn_percent', 5, 2)->nullable();
            $table->timestamps();
        });

        // 8. Income Records Table
        Schema::create('income_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_preset_id')->constrained('umkm_presets')->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_records');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('umkm_presets');
        // Don't drop users table as it's managed by Laravel
    }
};
