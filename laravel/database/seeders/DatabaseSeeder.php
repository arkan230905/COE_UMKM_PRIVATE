<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
use App\Models\IncomeRecord;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * NOTE: Seeder disabled to prevent auto-filled data.
     * Database will start empty - all data must be entered manually by the UMKM owner.
     */
    public function run(): void
    {
        // Seeder disabled - no auto-filled data
        // Uncomment below if you need to seed initial data for testing purposes
        /*
        // 1. Seed Users (Super Admin and Customer)
        $admin = User::create([
            'name' => 'Farmaku Super Admin',
            'email' => 'admin@umkm.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'phone' => '08123456789',
            'address' => 'Jl. Kesehatan Raya No. 12, Jakarta'
        ]);

        $customerUser = User::create([
            'name' => 'Rian Hidayat',
            'email' => 'rian@gmail.com',
            'password' => Hash::make('pelanggan123'),
            'role' => 'customer',
            'phone' => '087788992211',
            'address' => 'Perumahan Graha Indah Blok C3, Bandung'
        ]);

        // 2. Seed Customer record linked to customer User
        $customer = Customer::create([
            'user_id' => $customerUser->id,
            'name' => 'Rian Hidayat',
            'email' => 'rian@gmail.com',
            'phone' => '087788992211',
            'address' => 'Perumahan Graha Indah Blok C3, Bandung'
        ]);

        // 3. Seed Product Categories
        $cat1 = Category::create([
            'name' => 'Obat Ringan & Bebas',
            'slug' => 'obat-ringan-dan-bebas',
            'description' => 'Obat umum tanpa resep dokter untuk flu, batuk, pusing'
        ]);

        $cat2 = Category::create([
            'name' => 'Suplemen & Multivitamin',
            'slug' => 'suplemen-dan-multivitamin',
            'description' => 'Vitamin C, suplemen daya tahan tubuh bugar'
        ]);

        $cat3 = Category::create([
            'name' => 'Perawatan Luka & P3K',
            'slug' => 'perawatan-luka-dan-p3k',
            'description' => 'Plester luka, kasa steril, obat merah antiseptic'
        ]);

        // 4. Seed Products
        $p1 = Product::create([
            'category_id' => $cat1->id,
            'name' => 'Paracetamol Cough & Flu',
            'slug' => 'paracetamol-cough-and-flu',
            'description' => 'Meredakan gejala demam, flu, bersin-bersin dan batuk berdahak',
            'price' => 12500.00,
            'stock' => 85,
            'image' => '💊',
            'is_active' => true
        ]);

        $p2 = Product::create([
            'category_id' => $cat2->id,
            'name' => 'Vitamin C 1000mg Non-Acidic',
            'slug' => 'vitamin-c-1000mg-non-acidic',
            'description' => 'Meningkatkan imun tubuh harian tanpa mengiritasi lambung sensitif',
            'price' => 45000.00,
            'stock' => 42,
            'image' => '🍊',
            'is_active' => true
        ]);

        $p3 = Product::create([
            'category_id' => $cat3->id,
            'name' => 'Plester Antiseptik Elastis',
            'slug' => 'plester-antiseptik-elastis',
            'description' => 'Melindungi luka gores dari bakteri dengan perekat kuat ramah kulit',
            'price' => 8500.00,
            'stock' => 10,
            'image' => '🩹',
            'is_active' => true
        ]);

        // 5. Seed Transactions (Sales logs)
        $t1 = Transaction::create([
            'customer_id' => $customer->id,
            'transaction_code' => 'TRX501',
            'total_amount' => 57500.00,
            'status' => 'completed',
            'payment_method' => 'QRIS',
            'notes' => 'Tolong dibungkus kertas cokelat tebal privasi rapi.'
        ]);

        // Link item records
        TransactionItem::create([
            'transaction_id' => $t1->id,
            'product_id' => $p1->id,
            'quantity' => 1,
            'price' => 12500.00,
            'subtotal' => 12500.00
        ]);

        TransactionItem::create([
            'transaction_id' => $t1->id,
            'product_id' => $p2->id,
            'quantity' => 1,
            'price' => 45000.00,
            'subtotal' => 45000.00
        ]);

        // 6. Seed Accounting Income Records
        IncomeRecord::create([
            'transaction_id' => $t1->id,
            'amount' => 57500.00,
            'date' => now()->format('Y-m-d'),
            'description' => 'Penjualan Online Kode #TRX501'
        ]);

        // 7. Seed Business Expenses
        Expense::create([
            'expense_category' => 'Pembelian Stok',
            'description' => 'Kulakan Paracetamol & Vitamin C obat bebas dari distributor utama Kimia Farma',
            'amount' => 1200000.00,
            'date' => now()->subDays(5)->format('Y-m-d'),
            'notes' => 'Invoice nomor KF-80922'
        ]);

        Expense::create([
            'expense_category' => 'Tagihan Listrik & Air',
            'description' => 'Pembayaran tagihan listrik PLN dan air PDAM ruko apotek operasional',
            'amount' => 450000.00,
            'date' => now()->subDays(10)->format('Y-m-d'),
            'notes' => 'Token No: 8092-2211-5421'
        ]);
        */
    }
}
