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
        const data = response.data || [];
        
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
        
        const response = await apiService.createUmkmPreset(backendData);
        const data = response.data as any;
        
        // Map backend format to frontend format
        return {
          id: data.id,
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
    return this.saveToLocalStorage<UMKMPreset>('umkm_presets', preset);
  }

  async updateUmkmPreset(id: number, preset: Partial<UMKMPreset>): Promise<UMKMPreset> {
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
        
        const response = await apiService.updateUmkmPreset(id, backendData);
        const data = response.data as any;
        
        return {
          id: data.id,
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
    return this.updateInLocalStorage<UMKMPreset>('umkm_presets', id, preset);
  }

  async deleteUmkmPreset(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await apiService.deleteUmkmPreset(id);
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      this.deleteFromLocalStorage('umkm_presets', id);
    }
  }

  // ===========================
  // CATEGORIES
  // ===========================

  async getCategories(): Promise<Category[]> {
    if (this.useApi) {
      try {
        const response = await apiService.getCategories();
        return response.data || [];
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
        const response = await apiService.createCategory(category);
        return response.data as Category;
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
        const response = await apiService.updateCategory(id, category as any);
        return response.data as Category;
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
        const response = await apiService.getProducts();
        return response.data || [];
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
        const response = await apiService.createProduct(product);
        return response.data as Product;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.saveToLocalStorage<Product>('products', product);
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    if (this.useApi) {
      try {
        const response = await apiService.updateProduct(id, product);
        return response.data as Product;
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
        const response = await apiService.getCustomers();
        return response.data || [];
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
        const response = await apiService.createCustomer(customer);
        return response.data as Customer;
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
        const response = await apiService.updateCustomer(id, customer);
        return response.data as Customer;
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
        const response = await apiService.getTransactions();
        return response.data || [];
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
        const response = await apiService.createTransaction(transaction);
        return response.data as Transaction;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
    return this.saveToLocalStorage<Transaction>('transactions', transaction);
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
        const response = await apiService.getExpenses();
        return response.data || [];
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
        const response = await apiService.createExpense(expense);
        return response.data as Expense;
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
        const response = await apiService.updateExpense(id, expense);
        return response.data as Expense;
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
