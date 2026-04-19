import apiClient from './api/client';
import type {
  GoldBalanceResponse,
  GoldProductResponse,
  TransactionResponse,
  ChargeRequest,
  SpendRequest,
} from '../types/api';

// Generated aliases (Phase 3.10). Backend names are `ChargeRequest`/`SpendRequest`
// (no "Gold" prefix); legacy frontend names kept for caller-side compatibility.
export type GoldBalance = GoldBalanceResponse;
export type GoldProduct = GoldProductResponse;
export type GoldTransaction = TransactionResponse;
export type ChargeGoldRequest = ChargeRequest;
export type SpendGoldRequest = SpendRequest;

// Service - real API calls only, no mock fallbacks
export const goldService = {
  getBalance: async (): Promise<GoldBalance> => {
    const response = await apiClient.get('/gold/balance');
    return response.data;
  },

  getProducts: async (): Promise<GoldProduct[]> => {
    const response = await apiClient.get('/gold/products');
    return response.data;
  },

  getTransactions: async (
    page = 0,
    size = 20,
    type?: string
  ): Promise<{ content: GoldTransaction[]; totalPages: number; totalElements: number }> => {
    const params: Record<string, string | number> = { page, size };
    if (type && type !== 'ALL') params.type = type;
    const response = await apiClient.get('/gold/transactions', { params });
    return response.data;
  },

  chargeGold: async (
    request: ChargeGoldRequest
  ): Promise<GoldTransaction> => {
    const response = await apiClient.post('/gold/charge', request);
    return response.data;
  },

  spendGold: async (
    request: SpendGoldRequest
  ): Promise<GoldTransaction> => {
    const response = await apiClient.post('/gold/spend', request);
    return response.data;
  },
};
