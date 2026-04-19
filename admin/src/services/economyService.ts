import { apiClient } from './apiClient';
import type {
  PageResponse,
  EconomyStatsResponse,
  TransactionResponse,
  GoldProductAdminResponse,
  GoldProductCreateRequest,
  GoldProductUpdateRequest,
} from '../types/api';

// Generated aliases (Phase 3.11.4). TransactionItem (admin tx list rows) maps to
// the shared TransactionResponse; admin schema does NOT expose userNickname there.
export type EconomyStats = EconomyStatsResponse;
export type TransactionItem = TransactionResponse;
export type GoldProductAdmin = GoldProductAdminResponse;
export type { GoldProductCreateRequest, GoldProductUpdateRequest };

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
