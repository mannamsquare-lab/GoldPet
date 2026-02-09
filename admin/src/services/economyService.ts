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
  type: 'CHARGE' | 'SPEND' | 'REWARD' | 'REFUND';
  amount: number;
  description: string;
  createdAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
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
};
