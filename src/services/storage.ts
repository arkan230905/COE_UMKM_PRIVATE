/**
 * Storage Adapter for SIUPIN
 * Provides abstraction layer between localStorage and Laravel API
 * Can be toggled via USE_API_STORAGE flag
 */

import apiService from './api';
import { 
  Category, 
  Product, 
  Customer, 
  Transaction, 
  Expense, 
  IncomeRecord,
  UMKMPreset
} from '../types';

// Toggle between localStorage and API
// Set to true to use Laravel backend, false for localStorage
const USE_API_STORAGE = true;

export class StorageService {
  private useApi: boolean;
  private currentUmkmId: string | null = null;

  constructor(useApi: boolean = USE_API_STORAGE) {
    this.useApi = useApi;
  }

  /**
   * Enable/Disable API usage
   */
  setUseApi(useApi: boolean) {
    this.useApi = useApi;
    console.log(`Storage mode: ${useApi ? 'API (Laravel)' : 'localStorage'}`);
  }

  /**
   * Set current UMKM ID for data isolation
   */
  setCurrentUmkmId(umkmId: string | null) {
    this.currentUmkmId = umkmId;
    console.log('🔐 Current UMKM ID set:', umkmId);
  }

  /**
   * Get current UMKM ID
   */
  getCurrentUmkmId(): string | null {
    return this.currentUmkmId;
  }

  /**
   * Get current storage mode
   */
  isUsingApi(): boolean {
    return this.useApi;
  }

  // ===========================
  // UMKM PRESETS
  // ===========================

  async getUmkmPresets(): Promise<UMKMPreset[]> {
    if (this.useApi) {
      try {
        const response = await apiService.getUmkmPresets();
        const data = response.data as any[] || [];
        
        // Map backend format to frontend format
        return data.map((item: any) => ({
          id: item.id?.toString() || item.id,
          umkmCode: item.umkm_code || item.umkmCode,
          businessName: item.business_name || item.businessName,
          industry: item.industry,
          logoText: item.logo_text || item.logoText,
          primaryColor: item.primary_color || item.primaryColor,
          accentColor: item.accent_color || item.accentColor,
          currency: item.currency,
          phone: item.phone,
          address: item.address,
          adminName: item.admin_name || item.adminName,
          adminEmail: item.admin_email || item.adminEmail,
        }));
      } catch (error) {
        console.error('API Error, falling back to localStorage:', error);
        return this.getFromLocalStorage<UMKMPreset>('umkm_presets');
      }
    }
    return this.getFromLocalStorage<UMKMPreset>('umkm_presets');
  }

  async getUmkmPresetByCode(code: string): Promise<UMKMPreset | null> {
    if (this.useApi) {
      try {
        const response = await apiService.getUmkmPresetByCode(code);
        const data = response.data as any;
        
        if (!data) return null;
        
        // Map backend format to frontend format
        return {
          id: data.id?.toString() || data.id,
          umkmCode: data.umkm_code || data.umkmCode,
          businessName: data.business_name || data.businessName,
          industry: data.industry,
          logoText: data.logo_text || data.logoText,
          primaryColor: data.primary_color || data.primaryColor,
          accentColor: data.accent_color || data.accentColor,
          currency: data.currency,
          phone: data.phone,
          address: data.address,
          adminName: data.admin_name || data.adminName,
          adminEmail: data.admin_email || data.adminEmail,
        };
      } catch (error) {
        console.error('API Error:', error);
        // Fallback to localStorage
        const presets = this.getFromLocalStorage<UMKMPreset>('umkm_presets');
        return presets.find(p => p.umkmCode === code) || null;
      }
    }
    const presets = this.getFromLocalStorage<UMKMPreset>('umkm_presets');
    return presets.find(p => p.umkmCode === code) || null;
  }

  async saveUmkmPreset(preset: Omit<UMKMPreset, 'id'>): Promise<UMKMPreset> {
    if (this.useApi) {
      try {
        console.log('📤 Sending UMKM registration to API:', preset);
        
        // Map frontend format to backend format
        const backendData = {
          umkm_code: preset.umkmCode,
          business_name: preset.businessName,
          industry: preset.industry,
          logo_text: preset.logoText,
          primary_color: preset.primaryColor,
          accent_color: preset.accentColor,
          currency: preset.currency,
          phone: preset.phone,
          address: preset.address,
          admin_name: preset.adminName,
          admin_email: preset.adminEmail,
          is_active: true,
        };
        
        console.log('📤 Backend format:', backendData);
        
        const response = await apiService.createUmkmPreset(backendData);
        
        console.log('✅ API Response:', response);
        
        const data = response.data as any;
        
        // Map backend format to frontend format
        const savedPreset = {
          id: String(data.id),
          umkmCode: data.umkm_code,
          businessName: data.business_name,
          industry: data.industry,
          logoText: data.logo_text,
          primaryColor: data.primary_color,
          accentColor: data.accent_color,
          currency: data.currency,
          phone: data.phone,
          address: data.address,
          adminName: data.admin_name,
          adminEmail: data.admin_email,
        };
        
        console.log('✅ Saved UMKM preset:', savedPreset);
        
        return savedPreset;
      } catch (error: any) {
        console.error('❌ API Error details:', error);
        console.error('❌ Error response:', error?.response);
        throw new Error(error?.response?.data?.message || error?.message || 'Failed to save UMKM');
      }
    }
    // For localStorage, create temp numeric ID then convert to string
    const items = this.getFromLocalStorage<UMKMPreset>('umkm_presets');
    const numericId = items.length > 0 ? Math.max(...items.map(i => parseInt(i.id) || 0)) + 1 : 1;
    const newItem = { ...preset, id: String(numericId) } as UMKMPreset;
    items.push(newItem);
    localStorage.setItem('umkm_presets', JSON.stringify(items));
    return newItem;
  }

  async updateUmkmPreset(id: string, preset: Partial<UMKMPreset>): Promise<UMKMPreset> {
    if (this.useApi) {
      try {
        // Map frontend format to backend format
        const backendData: any = {};
        if (preset.umkmCode) backendData.umkm_code = preset.umkmCode;
        if (preset.businessName) backendData.business_name = preset.businessName;
        if (preset.industry) backendData.industry = preset.industry;
        if (preset.logoText) backendData.logo_text = preset.logoText;
        if (preset.primaryColor) backendData.primary_color = preset.primaryColor;
        if (preset.accentColor) backendData.accent_color = preset.accentColor;
        if (preset.currency) backendData.currency = preset.currency;
        if (preset.phone) backendData.phone = preset.phone;
        if (preset.address) backendData.address = preset.address;
        if (preset.adminName) backendData.admin_name = preset.adminName;
        if (preset.adminEmail) backendData.admin_email = preset.adminEmail;
        
        const response = await apiService.updateUmkmPreset(parseInt(id), backendData);
        const data = response.data as any;
        
        return {
          id: String(data.id),
          umkmCode: data.umkm_code,
          businessName: data.business_name,
          industry: data.industry,
          logoText: data.logo_text,
          primaryColor: data.primary_color,
          accentColor: data.accent_color,
          currency: data.currency,
          phone: data.phone,
          address: data.address,
          adminName: data.admin_name,
          adminEmail: data.admin_email,
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    const items = this.getFromLocalStorage<UMKMPreset>('umkm_presets');
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`UMKM with id ${id} not found`);
    
    items[index] = { ...items[index], ...preset };
    localStorage.setItem('umkm_presets', JSON.stringify(items));
    return items[index];
  }

  async deleteUmkmPreset(id: string): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteUmkmPreset(parseInt(id));
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      const items = this.getFromLocalStorage<UMKMPreset>('umkm_presets');
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem('umkm_presets', JSON.stringify(filtered));
    }
  }

  // ===========================
  // CATEGORIES
  // ===========================

  async getCategories(): Promise<Category[]> {
    if (this.useApi) {
      try {
        // Send umkm_preset_id as query parameter if available
        const endpoint = this.currentUmkmId 
          ? `/categories?umkm_preset_id=${this.currentUmkmId}` 
          : '/categories';
        
        const response = await apiService.get(endpoint);
        const allCategories = (response.data as any[]) || [];
        
        // Map backend format (snake_case) to frontend format (camelCase)
        const mapped = allCategories.map(cat => ({
          ...cat,
          umkmPresetId: cat.umkm_preset_id || cat.umkmPresetId
        }));
        
        console.log(`✅ Loaded ${mapped.length} categories from backend for UMKM ${this.currentUmkmId || 'all'}`);
        return mapped;
      } catch (error) {
        console.error('API Error, falling back to localStorage:', error);
        return this.getFromLocalStorage<Category>('categories');
      }
    }
    return this.getFromLocalStorage<Category>('categories');
  }

  async saveCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (this.useApi) {
      try {
        // Validate umkmPresetId is not placeholder
        if (!category.umkmPresetId || category.umkmPresetId === 'placeholder') {
          throw new Error('UMKM belum dipilih. umkmPresetId tidak valid.');
        }
        
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {
          name: category.name,
          slug: category.slug,
          description: category.description,
          umkm_preset_id: parseInt(String(category.umkmPresetId)) // Ensure integer
        };
        
        console.log('📤 saveCategory - Sending to backend:', backendData);
        
        const response = await apiService.createCategory(backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          createdAt: data.created_at || data.createdAt
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.saveToLocalStorage<Category>('categories', category);
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {};
        if (category.umkmPresetId !== undefined) backendData.umkm_preset_id = category.umkmPresetId;
        if (category.name !== undefined) backendData.name = category.name;
        if (category.slug !== undefined) backendData.slug = category.slug;
        if (category.description !== undefined) backendData.description = category.description;
        
        const response = await apiService.updateCategory(id, backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          createdAt: data.created_at || data.createdAt
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.updateInLocalStorage<Category>('categories', id, category);
  }

  async deleteCategory(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteCategory(id);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      this.deleteFromLocalStorage('categories', id);
    }
  }

  // ===========================
  // PRODUCTS
  // ===========================

  async getProducts(): Promise<Product[]> {
    if (this.useApi) {
      try {
        // Send umkm_preset_id as query parameter if available
        const endpoint = this.currentUmkmId 
          ? `/products?umkm_preset_id=${this.currentUmkmId}` 
          : '/products';
        
        const response = await apiService.get(endpoint);
        const allProducts = (response.data as any[]) || [];
        
        // Map backend format (snake_case) to frontend format (camelCase)
        const mapped = allProducts.map(prod => ({
          ...prod,
          umkmPresetId: prod.umkm_preset_id || prod.umkmPresetId,
          categoryId: prod.category_id || prod.categoryId,
          isActive: prod.is_active !== undefined ? prod.is_active : prod.isActive,
          createdAt: prod.created_at || prod.createdAt,
          barcode: prod.barcode || null,
          price: typeof prod.price === 'string' ? parseFloat(prod.price) : prod.price, // Parse string to number
          stock: typeof prod.stock === 'string' ? parseInt(prod.stock) : prod.stock
        }));
        
        console.log(`✅ Loaded ${mapped.length} products from backend for UMKM ${this.currentUmkmId || 'all'}`);
        return mapped;
      } catch (error) {
        console.error('API Error, falling back to localStorage:', error);
        return this.getFromLocalStorage<Product>('products');
      }
    }
    return this.getFromLocalStorage<Product>('products');
  }

  async saveProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (this.useApi) {
      try {
        console.log('📤 saveProduct - Received product data:', product);
        
        // Validate umkmPresetId is not placeholder
        if (!product.umkmPresetId || product.umkmPresetId === 'placeholder') {
          throw new Error('UMKM belum dipilih. Silakan pilih UMKM terlebih dahulu.');
        }
        
        // Parse umkmPresetId to integer
        const umkmPresetIdNum = parseInt(String(product.umkmPresetId));
        if (isNaN(umkmPresetIdNum)) {
          throw new Error(`UMKM ID tidak valid: ${product.umkmPresetId}`);
        }
        
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {
          umkm_preset_id: umkmPresetIdNum, // Ensure integer
          category_id: product.categoryId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          is_active: product.isActive !== undefined ? product.isActive : true,
          barcode: product.barcode
        };
        
        console.log('📤 saveProduct - Sending to backend:', backendData);
        console.log('📤 umkm_preset_id value:', backendData.umkm_preset_id, 'type:', typeof backendData.umkm_preset_id);
        
        const response = await apiService.createProduct(backendData);
        const data = response.data as any;
        
        console.log('✅ saveProduct - Response from backend:', data);
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          categoryId: data.category_id || data.categoryId,
          isActive: data.is_active !== undefined ? data.is_active : data.isActive,
          createdAt: data.created_at || data.createdAt,
          barcode: data.barcode || null,
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price, // Parse string to number
          stock: typeof data.stock === 'string' ? parseInt(data.stock) : data.stock
        };
      } catch (error: any) {
        console.error('❌ API Error saveProduct:', error);
        
        // Parse Laravel validation errors
        if (error?.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(`Validasi gagal: ${errorMessages.join(', ')}`);
        }
        
        throw new Error(error?.response?.data?.message || error?.message || 'Gagal menyimpan produk ke database');
      }
    }
    return this.saveToLocalStorage<Product>('products', product);
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {};
        if (product.umkmPresetId !== undefined) backendData.umkm_preset_id = product.umkmPresetId;
        if (product.categoryId !== undefined) backendData.category_id = product.categoryId;
        if (product.name !== undefined) backendData.name = product.name;
        if (product.slug !== undefined) backendData.slug = product.slug;
        if (product.description !== undefined) backendData.description = product.description;
        if (product.price !== undefined) backendData.price = product.price;
        if (product.stock !== undefined) backendData.stock = product.stock;
        if (product.image !== undefined) backendData.image = product.image;
        if (product.isActive !== undefined) backendData.is_active = product.isActive;
        if (product.barcode !== undefined) backendData.barcode = product.barcode;
        
        const response = await apiService.updateProduct(id, backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          categoryId: data.category_id || data.categoryId,
          isActive: data.is_active !== undefined ? data.is_active : data.isActive,
          createdAt: data.created_at || data.createdAt,
          barcode: data.barcode || null,
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price, // Parse string to number
          stock: typeof data.stock === 'string' ? parseInt(data.stock) : data.stock
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.updateInLocalStorage<Product>('products', id, product);
  }

  async deleteProduct(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteProduct(id);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      this.deleteFromLocalStorage('products', id);
    }
  }

  // ===========================
  // CUSTOMERS
  // ===========================

  async getCustomers(): Promise<Customer[]> {
    if (this.useApi) {
      try {
        // Send umkm_preset_id as query parameter if available
        const endpoint = this.currentUmkmId 
          ? `/customers?umkm_preset_id=${this.currentUmkmId}` 
          : '/customers';
        
        const response = await apiService.get(endpoint);
        const allCustomers = (response.data as any[]) || [];
        
        // Map backend format (snake_case) to frontend format (camelCase)
        const mapped = allCustomers.map(cust => ({
          ...cust,
          umkmPresetId: cust.umkm_preset_id || cust.umkmPresetId,
          userId: cust.user_id || cust.userId,
          createdAt: cust.created_at || cust.createdAt
        }));
        
        console.log(`✅ Loaded ${mapped.length} customers from backend for UMKM ${this.currentUmkmId || 'all'}`);
        return mapped;
      } catch (error) {
        console.error('API Error, falling back to localStorage:', error);
        return this.getFromLocalStorage<Customer>('customers');
      }
    }
    return this.getFromLocalStorage<Customer>('customers');
  }

  async saveCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {
          umkm_preset_id: customer.umkmPresetId,
          user_id: customer.userId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        };
        
        const response = await apiService.createCustomer(backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          userId: data.user_id || data.userId,
          createdAt: data.created_at || data.createdAt
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.saveToLocalStorage<Customer>('customers', customer);
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {};
        if (customer.umkmPresetId !== undefined) backendData.umkm_preset_id = customer.umkmPresetId;
        if (customer.userId !== undefined) backendData.user_id = customer.userId;
        if (customer.name !== undefined) backendData.name = customer.name;
        if (customer.email !== undefined) backendData.email = customer.email;
        if (customer.phone !== undefined) backendData.phone = customer.phone;
        if (customer.address !== undefined) backendData.address = customer.address;
        
        const response = await apiService.updateCustomer(id, backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          userId: data.user_id || data.userId,
          createdAt: data.created_at || data.createdAt
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.updateInLocalStorage<Customer>('customers', id, customer);
  }

  async deleteCustomer(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteCustomer(id);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      this.deleteFromLocalStorage('customers', id);
    }
  }

  // ===========================
  // TRANSACTIONS
  // ===========================

  async getTransactions(): Promise<Transaction[]> {
    if (this.useApi) {
      try {
        // Send umkm_preset_id as query parameter if available
        const endpoint = this.currentUmkmId 
          ? `/transactions?umkm_preset_id=${this.currentUmkmId}` 
          : '/transactions';
        
        const response = await apiService.get(endpoint);
        const allTransactions = (response.data as any[]) || [];
        
        console.log('📦 Raw transactions from backend:', allTransactions.slice(0, 2));
        
        // Map backend format (snake_case) to frontend format (camelCase)
        const mapped = allTransactions.map(trans => ({
          ...trans,
          umkmPresetId: trans.umkm_preset_id || trans.umkmPresetId,
          customerId: trans.customer_id || trans.customerId,
          transactionCode: trans.transaction_code || trans.transactionCode,
          totalAmount: typeof trans.total_amount === 'string' ? parseFloat(trans.total_amount) : trans.total_amount,
          paymentMethod: trans.payment_method || trans.paymentMethod,
          createdAt: trans.created_at || trans.createdAt,
          isOffline: trans.is_offline !== undefined ? trans.is_offline : (trans.isOffline || false),
          // ✅ MAP ITEMS from backend (transaction_items table with product relation)
          items: trans.items?.map((item: any) => ({
            productId: item.product_id || item.productId,
            productName: item.product?.name || item.product_name || item.productName || 'Produk Tidak Diketahui',
            categoryName: item.product?.category?.name || item.category_name || item.categoryName || '-',
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
          })) || []
        }));
        
        console.log(`✅ Loaded ${mapped.length} transactions from backend for UMKM ${this.currentUmkmId || 'all'}`);
        console.log('📦 Sample mapped transaction:', mapped[0]);
        console.log('📦 Sample items:', mapped[0]?.items);
        return mapped;
      } catch (error) {
        console.error('API Error, falling back to localStorage:', error);
        return this.getFromLocalStorage<Transaction>('transactions');
      }
    }
    return this.getFromLocalStorage<Transaction>('transactions');
  }

  async saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {
          umkm_preset_id: transaction.umkmPresetId,
          transaction_code: transaction.transactionCode,
          total_amount: transaction.totalAmount,
          status: transaction.status,
          payment_method: transaction.paymentMethod,
          notes: transaction.notes,
          is_offline: transaction.isOffline || false, // ✅ ADDED
          items: transaction.items?.map(item => ({
            product_id: item.productId,
            product_name: item.productName, // ✅ Send snapshot
            product_description: item.productDescription, // ✅ Send snapshot (if available)
            category_name: item.categoryName, // ✅ Send snapshot
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          }))
        };
        
        // ✅ Only add customer_id if it exists (for online transactions)
        if (transaction.customerId) {
          backendData.customer_id = transaction.customerId;
        }
        
        console.log('📤 Sending transaction to backend:', backendData);
        
        const response = await apiService.createTransaction(backendData);
        const data = response.data as any;
        
        console.log('✅ Transaction response from backend:', data);
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          customerId: data.customer_id || data.customerId,
          transactionCode: data.transaction_code || data.transactionCode,
          totalAmount: typeof data.total_amount === 'string' ? parseFloat(data.total_amount) : data.total_amount,
          paymentMethod: data.payment_method || data.paymentMethod,
          createdAt: data.created_at || data.createdAt,
          isOffline: data.is_offline !== undefined ? data.is_offline : data.isOffline,
          // ✅ MAP ITEMS from backend response
          items: data.items?.map((item: any) => ({
            productId: item.product_id || item.productId,
            productName: item.product?.name || item.product_name || item.productName || 'Produk Tidak Diketahui',
            categoryName: item.product?.category?.name || item.category_name || item.categoryName || '-',
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
          })) || []
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.saveToLocalStorage<Transaction>('transactions', transaction);
  }

  async updateTransactionStatus(id: number, status: string): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.updateTransactionStatus(id, status);
        console.log(`✅ Transaction ${id} status updated to: ${status}`);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      // localStorage fallback
      const items = this.getFromLocalStorage<Transaction>('transactions');
      const index = items.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`Transaction with id ${id} not found`);
      
      items[index] = { ...items[index], status: status as any };
      localStorage.setItem('transactions', JSON.stringify(items));
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteTransaction(id);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      this.deleteFromLocalStorage('transactions', id);
    }
  }

  // ===========================
  // EXPENSES
  // ===========================

  async getExpenses(): Promise<Expense[]> {
    if (this.useApi) {
      try {
        // Send umkm_preset_id as query parameter if available
        const endpoint = this.currentUmkmId 
          ? `/expenses?umkm_preset_id=${this.currentUmkmId}` 
          : '/expenses';
        
        const response = await apiService.get(endpoint);
        const allExpenses = (response.data as any[]) || [];
        
        // Map backend format (snake_case) to frontend format (camelCase)
        const mapped = allExpenses.map(exp => ({
          ...exp,
          umkmPresetId: exp.umkm_preset_id || exp.umkmPresetId,
          expenseCategory: exp.expense_category || exp.expenseCategory,
          materialName: exp.material_name || exp.materialName,
          pricePerUnit: exp.price_per_unit || exp.pricePerUnit,
          shippingCost: exp.shipping_cost || exp.shippingCost,
          ppnPercent: exp.ppn_percent || exp.ppnPercent,
          createdAt: exp.created_at || exp.createdAt
        }));
        
        console.log(`✅ Loaded ${mapped.length} expenses from backend for UMKM ${this.currentUmkmId || 'all'}`);
        return mapped;
      } catch (error) {
        console.error('API Error, falling back to localStorage:', error);
        return this.getFromLocalStorage<Expense>('expenses');
      }
    }
    return this.getFromLocalStorage<Expense>('expenses');
  }

  async saveExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {
          umkm_preset_id: expense.umkmPresetId,
          expense_category: expense.expenseCategory,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          notes: expense.notes,
          material_name: expense.materialName,
          quantity: expense.quantity,
          unit: expense.unit,
          price_per_unit: expense.pricePerUnit,
          shipping_cost: expense.shippingCost,
          discount: expense.discount,
          ppn_percent: expense.ppnPercent
        };
        
        const response = await apiService.createExpense(backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          expenseCategory: data.expense_category || data.expenseCategory,
          materialName: data.material_name || data.materialName,
          pricePerUnit: data.price_per_unit || data.pricePerUnit,
          shippingCost: data.shipping_cost || data.shippingCost,
          ppnPercent: data.ppn_percent || data.ppnPercent,
          createdAt: data.created_at || data.createdAt
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.saveToLocalStorage<Expense>('expenses', expense);
  }

  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
    if (this.useApi) {
      try {
        // Map frontend format (camelCase) to backend format (snake_case)
        const backendData: any = {};
        if (expense.umkmPresetId !== undefined) backendData.umkm_preset_id = expense.umkmPresetId;
        if (expense.expenseCategory !== undefined) backendData.expense_category = expense.expenseCategory;
        if (expense.description !== undefined) backendData.description = expense.description;
        if (expense.amount !== undefined) backendData.amount = expense.amount;
        if (expense.date !== undefined) backendData.date = expense.date;
        if (expense.notes !== undefined) backendData.notes = expense.notes;
        if (expense.materialName !== undefined) backendData.material_name = expense.materialName;
        if (expense.quantity !== undefined) backendData.quantity = expense.quantity;
        if (expense.unit !== undefined) backendData.unit = expense.unit;
        if (expense.pricePerUnit !== undefined) backendData.price_per_unit = expense.pricePerUnit;
        if (expense.shippingCost !== undefined) backendData.shipping_cost = expense.shippingCost;
        if (expense.discount !== undefined) backendData.discount = expense.discount;
        if (expense.ppnPercent !== undefined) backendData.ppn_percent = expense.ppnPercent;
        
        const response = await apiService.updateExpense(id, backendData);
        const data = response.data as any;
        
        // Map response back to frontend format
        return {
          ...data,
          umkmPresetId: data.umkm_preset_id || data.umkmPresetId,
          expenseCategory: data.expense_category || data.expenseCategory,
          materialName: data.material_name || data.materialName,
          pricePerUnit: data.price_per_unit || data.pricePerUnit,
          shippingCost: data.shipping_cost || data.shippingCost,
          ppnPercent: data.ppn_percent || data.ppnPercent,
          createdAt: data.created_at || data.createdAt
        };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.updateInLocalStorage<Expense>('expenses', id, expense);
  }

  async deleteExpense(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteExpense(id);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      this.deleteFromLocalStorage('expenses', id);
    }
  }

  // ===========================
  // FINANCIAL REPORTS
  // ===========================

  async getFinancialReport(params?: { start_date?: string; end_date?: string }) {
    if (this.useApi) {
      try {
        const response = await apiService.getFinancialReport(params);
        return response.data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    // For localStorage, calculate from existing data
    const incomes = this.getFromLocalStorage<IncomeRecord>('incomes');
    const expenses = this.getFromLocalStorage<Expense>('expenses');
    const transactions = this.getFromLocalStorage<Transaction>('transactions');

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: totalIncome - totalExpense,
        total_transactions: transactions.length,
        completed_transactions: transactions.filter(t => t.status === 'completed').length,
        pending_transactions: transactions.filter(t => t.status === 'pending').length,
      },
      incomes,
      expenses,
      transactions,
    };
  }

  // ===========================
  // LOCALSTORAGE HELPERS
  // ===========================

  private getFromLocalStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToLocalStorage<T extends { id?: number }>(key: string, item: Omit<T, 'id'>): T {
    const items = this.getFromLocalStorage<T>(key);
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
    const newItem = { ...item, id: newId } as T;
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    return newItem;
  }

  private updateInLocalStorage<T extends { id: number }>(
    key: string,
    id: number,
    updates: Partial<T>
  ): T {
    const items = this.getFromLocalStorage<T>(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`Item with id ${id} not found in ${key}`);
    
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(key, JSON.stringify(items));
    return items[index];
  }

  private deleteFromLocalStorage(key: string, id: number): void {
    const items = this.getFromLocalStorage(key);
    const filtered = items.filter((item: any) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
