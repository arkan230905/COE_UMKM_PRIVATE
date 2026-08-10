<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UmkmPreset;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Expense;

class UmkmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create UMKM 1: Bistara Coffee
        $bistara = UmkmPreset::create([
            'umkm_code' => 'BISTARA-001',
            'business_name' => 'Bistara Coffee',
            'industry' => 'Food & Beverage',
            'logo_text' => 'BC',
            'primary_color' => '#1E3A5F',
            'accent_color' => '#3B82F6',
            'currency' => 'Rp',
            'phone' => '0812-3456-7890',
            'address' => 'Jl. Sudirman No. 123, Jakarta',
            'admin_name' => 'Admin Bistara',
            'admin_email' => 'admin@bistara.com',
            'is_active' => true,
        ]);

        // Categories for Bistara
        $categoryKopi = Category::create([
            'umkm_preset_id' => $bistara->id,
            'name' => 'Kopi',
            'slug' => 'kopi-' . time(),
            'description' => 'Berbagai varian kopi pilihan',
        ]);

        $categoryMakanan = Category::create([
            'umkm_preset_id' => $bistara->id,
            'name' => 'Makanan',
            'slug' => 'makanan-' . time(),
            'description' => 'Aneka makanan pendamping',
        ]);

        // Products for Bistara
        Product::create([
            'umkm_preset_id' => $bistara->id,
            'category_id' => $categoryKopi->id,
            'name' => 'Americano',
            'slug' => 'americano-' . time(),
            'description' => 'Espresso dengan air panas',
            'price' => 25000,
            'stock' => 100,
            'image' => 'https://via.placeholder.com/200x200?text=Americano',
            'is_active' => true,
        ]);

        Product::create([
            'umkm_preset_id' => $bistara->id,
            'category_id' => $categoryKopi->id,
            'name' => 'Cappuccino',
            'slug' => 'cappuccino-' . time(),
            'description' => 'Espresso dengan susu dan foam',
            'price' => 30000,
            'stock' => 100,
            'image' => 'https://via.placeholder.com/200x200?text=Cappuccino',
            'is_active' => true,
        ]);

        Product::create([
            'umkm_preset_id' => $bistara->id,
            'category_id' => $categoryMakanan->id,
            'name' => 'Croissant',
            'slug' => 'croissant-' . time(),
            'description' => 'Pastry mentega berlapis',
            'price' => 20000,
            'stock' => 50,
            'image' => 'https://via.placeholder.com/200x200?text=Croissant',
            'is_active' => true,
        ]);

        // Customer for Bistara
        Customer::create([
            'umkm_preset_id' => $bistara->id,
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'phone' => '0812-1111-1111',
            'address' => 'Jl. Gatot Subroto No. 45, Jakarta',
        ]);

        // Expense for Bistara
        Expense::create([
            'umkm_preset_id' => $bistara->id,
            'expense_category' => 'Pembelian Stok',
            'description' => 'Beli biji kopi arabica 10kg',
            'amount' => 500000,
            'date' => now()->toDateString(),
            'notes' => 'Supplier: Kopi Nusantara',
        ]);

        // Create UMKM 2: Toko Elektronik Jaya
        $elektronik = UmkmPreset::create([
            'umkm_code' => 'ELEKT-001',
            'business_name' => 'Toko Elektronik Jaya',
            'industry' => 'Electronics',
            'logo_text' => 'TEJ',
            'primary_color' => '#DC2626',
            'accent_color' => '#EF4444',
            'currency' => 'Rp',
            'phone' => '0813-5555-6666',
            'address' => 'Jl. Ahmad Yani No. 88, Bandung',
            'admin_name' => 'Admin Elektronik',
            'admin_email' => 'admin@elektronikjaya.com',
            'is_active' => true,
        ]);

        // Categories for Elektronik
        $categoryHP = Category::create([
            'umkm_preset_id' => $elektronik->id,
            'name' => 'Handphone',
            'slug' => 'handphone-' . time(),
            'description' => 'Berbagai merk handphone',
        ]);

        $categoryAksesoris = Category::create([
            'umkm_preset_id' => $elektronik->id,
            'name' => 'Aksesoris',
            'slug' => 'aksesoris-' . time(),
            'description' => 'Aksesoris elektronik',
        ]);

        // Products for Elektronik
        Product::create([
            'umkm_preset_id' => $elektronik->id,
            'category_id' => $categoryHP->id,
            'name' => 'Samsung Galaxy A54',
            'slug' => 'samsung-a54-' . time(),
            'description' => 'Smartphone Samsung terbaru',
            'price' => 4500000,
            'stock' => 15,
            'image' => 'https://via.placeholder.com/200x200?text=Samsung+A54',
            'is_active' => true,
        ]);

        Product::create([
            'umkm_preset_id' => $elektronik->id,
            'category_id' => $categoryAksesoris->id,
            'name' => 'Charger Type-C',
            'slug' => 'charger-typec-' . time(),
            'description' => 'Charger fast charging',
            'price' => 150000,
            'stock' => 50,
            'image' => 'https://via.placeholder.com/200x200?text=Charger',
            'is_active' => true,
        ]);

        // Customer for Elektronik
        Customer::create([
            'umkm_preset_id' => $elektronik->id,
            'name' => 'Siti Aminah',
            'email' => 'siti@example.com',
            'phone' => '0813-2222-2222',
            'address' => 'Jl. Braga No. 12, Bandung',
        ]);

        // Expense for Elektronik
        Expense::create([
            'umkm_preset_id' => $elektronik->id,
            'expense_category' => 'Sewa Toko',
            'description' => 'Sewa toko bulan Agustus 2026',
            'amount' => 3000000,
            'date' => now()->toDateString(),
            'notes' => 'Pembayaran sewa',
        ]);

        echo "✅ Seeder berhasil! 2 UMKM dengan data lengkap telah dibuat.\n";
    }
}
