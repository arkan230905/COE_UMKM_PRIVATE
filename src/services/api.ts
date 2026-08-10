/**
 * API Service Layer for SIUPIN - Sistem UMKM Pintar
 * Handles all communication with Laravel backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic HTTP request handler
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ===========================
  // UMKM PRESETS API
  // ===========================
  
  async getUmkmPresets() {
    return this.get('/umkm-presets');
  }

  async getUmkmPresetByCode(code: string) {
    return this.get(`/umkm-presets/code/${code}`);
  }

  async createUmkmPreset(data: any) {
    return this.post('/umkm-presets', data);
  }

  async updateUmkmPreset(id: number, data: any) {
    return this.put(`/umkm-presets/${id}`, data);
  }

  async deleteUmkmPreset(id: number) {
    return this.delete(`/umkm-presets/${id}`);
  }

  // ===========================
  // CATEGORIES API
  // ===========================
  
  async getCategories() {
    return this.get('/categories');
  }

  async createCategory(data: { name: string; description?: string }) {
    return this.post('/categories', data);
  }

  async updateCategory(id: number, data: { name: string; description?: string }) {
    return this.put(`/categories/${id}`, data);
  }

  async deleteCategory(id: number) {
    return this.delete(`/categories/${id}`);
  }

  // ===========================
  // PRODUCTS API
  // ===========================
  
  async getProducts() {
    return this.get('/products');
  }

  async createProduct(data: any) {
    return this.post('/products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.put(`/products/${id}`, data);
  }

  async deleteProduct(id: number) {
    return this.delete(`/products/${id}`);
  }

  // ===========================
  // CUSTOMERS API
  // ===========================
  
  async getCustomers() {
    return this.get('/customers');
  }

  async createCustomer(data: any) {
    return this.post('/customers', data);
  }

  async updateCustomer(id: number, data: any) {
    return this.put(`/customers/${id}`, data);
  }

  async deleteCustomer(id: number) {
    return this.delete(`/customers/${id}`);
  }

  // ===========================
  // TRANSACTIONS API
  // ===========================
  
  async getTransactions() {
    return this.get('/transactions');
  }

  async createTransaction(data: any) {
    return this.post('/transactions', data);
  }

  async updateTransactionStatus(id: number, status: string) {
    return this.put(`/transactions/${id}/status`, { status });
  }

  async deleteTransaction(id: number) {
    return this.delete(`/transactions/${id}`);
  }

  // ===========================
  // EXPENSES API
  // ===========================
  
  async getExpenses() {
    return this.get('/expenses');
  }

  async createExpense(data: any) {
    return this.post('/expenses', data);
  }

  async updateExpense(id: number, data: any) {
    return this.put(`/expenses/${id}`, data);
  }

  async deleteExpense(id: number) {
    return this.delete(`/expenses/${id}`);
  }

  // ===========================
  // FINANCIAL REPORTS API
  // ===========================
  
  async getFinancialReport(params?: { start_date?: string; end_date?: string }) {
    const queryString = params 
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return this.get(`/financial-reports${queryString}`);
  }

  async getDashboardStats() {
    return this.get('/dashboard-stats');
  }

  // ===========================
  // HEALTH CHECK
  // ===========================
  
  async healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
