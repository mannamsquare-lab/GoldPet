import { apiClient } from './apiClient';

export interface EconomyStats {
  totalGoldCirculation: number;
  totalRevenue: number;
  todayRevenue: number;
  activeSubscriptions: number;
  pendingPayouts: number;
}

export interface TransactionItem {
  id: number;
  userId: number;
  userNickname: string;
  type: 'CHARGE' | 'SPEND' | 'REWARD' | 'REFUND' | 'ADMIN_ADJUST';
  amount: number;
  description: string;
  createdAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export interface GoldProductAdmin {
  id: number;
  productCode: string;
  name: string;
  goldAmount: number;
  price: number;
  bonus: number;
  isActive: boolean;
  displayOrder: number;
}

export interface GoldProductCreateRequest {
  productCode: string;
  name: string;
  goldAmount: number;
  price: number;
  bonus?: number;
  displayOrder?: number;
}

export interface GoldProductUpdateRequest {
  name?: string;
  goldAmount?: number;
  price?: number;
  bonus?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export const economyService = {
  async getStats(): Promise<EconomyStats> {
    const response = await apiClient.get('/economy/stats');
    return response.data;
  },

  async getTransactions(params: { page?: number; type?: string }): Promise<PageResponse<TransactionItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.type) queryParams.set('type', params.type);
    
    const response = await apiClient.get(`/economy/transactions?${queryParams.toString()}`);
    return response.data;
  },

  async adjustGold(userId: number, amount: number, reason: string): Promise<void> {
    await apiClient.post('/economy/adjust', { userId, amount, reason });
  },

  async getProducts(): Promise<GoldProductAdmin[]> {
    const response = await apiClient.get('/economy/products');
    return response.data;
  },

  async createProduct(request: GoldProductCreateRequest): Promise<GoldProductAdmin> {
    const response = await apiClient.post('/economy/products', request);
    return response.data;
  },

  async updateProduct(id: number, request: GoldProductUpdateRequest): Promise<GoldProductAdmin> {
    const response = await apiClient.put(`/economy/products/${id}`, request);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/economy/products/${id}`);
  },

  async refundTransaction(transactionId: number, reason: string): Promise<void> {
    await apiClient.post('/economy/refund', { transactionId, reason });
  },
};
