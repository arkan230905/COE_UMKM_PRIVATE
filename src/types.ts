/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Roles supported by the app
export type UserRole = 'super_admin' | 'customer';

// Transaction payment status
export type TransactionStatus = 'pending' | 'paid' | 'completed' | 'cancelled';

// Available payment methods requested
export type PaymentMethod = 'E-Wallet' | 'Cash' | 'Debit Card' | 'QRIS';

// 1. User Entity (mirrors users MySQL table)
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  createdAt: string;
}

// 2. Category Entity (mirrors categories MySQL table)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

// 3. Product Entity (mirrors products MySQL table)
export interface Product {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string; // Base64 or URL/placeholder icon
  isActive: boolean;
  createdAt: string;
  barcode?: string; // Automatically generated code for cash register supermarket style scanning/search
}

// 4. Customer Entity (mirrors customers MySQL table)
export interface Customer {
  id: number;
  userId: number; // reference to users
  name: string;
  email: string;
  password?: string; // password for customer login
  phone: string;
  address: string;
  createdAt: string;
  umkmId?: string;
}

// 5. Transaction Entity (mirrors transactions MySQL table)
export interface Transaction {
  id: number;
  customerId: number;
  transactionCode: string;
  totalAmount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  // Shipping tracking parameters
  shippingStatus?: 'Dalam Antrean' | 'Sedang Dikemas' | 'Sedang Dikirim' | 'Sampai Tujuan';
  courierName?: string;
  trackingNumber?: string;
}

// 6. TransactionItem Entity (mirrors transaction_items MySQL table)
export interface TransactionItem {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
}

// 7. Expense Entity (mirrors expenses MySQL table)
export interface Expense {
  id: number;
  expenseCategory: string; // gaji, tagihan, pembelian stok, dll
  description: string;
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
}

// 8. IncomeRecord Entity (mirrors income_records MySQL table)
export interface IncomeRecord {
  id: number;
  transactionId: number | null; // null if manual entry
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

// Cart item structure for customers shopping
export interface CartItem {
  product: Product;
  quantity: number;
}

// Multi-UMKM Preset for showcasing the application on any business!
export interface UMKMPreset {
  id: string;
  umkmCode: string; // Automatic system-assigned alphanumeric code for login and identification
  businessName: string;
  industry: string;
  logoText: string;
  primaryColor: string; // hex or tailwind class
  accentColor: string;
  currency: string;
  phone: string;
  address: string;
  adminName?: string; // Name of the admin/owner who registered this UMKM
  adminEmail?: string; // Email of the admin/owner
}
