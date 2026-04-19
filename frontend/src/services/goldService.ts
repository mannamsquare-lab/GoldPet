import { typedClient } from './api/typedClient';
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
    const response = await typedClient.get('/api/v1/gold/balance');
    return response.data;
  },

  getProducts: async (): Promise<GoldProduct[]> => {
    const response = await typedClient.get('/api/v1/gold/products');
    return response.data;
  },

  getTransactions: async (
    page = 0,
    size = 20,
    type?: string
  ): Promise<{ content: GoldTransaction[]; totalPages: number; totalElements: number }> => {
    const params: Record<string, string | number> = { page, size };
    if (type && type !== 'ALL') params.type = type;
    const response = await typedClient.get('/api/v1/gold/transactions', { params });
    return response.data as { content: GoldTransaction[]; totalPages: number; totalElements: number };
  },

  chargeGold: async (
    request: ChargeGoldRequest
  ): Promise<GoldTransaction> => {
    const response = await typedClient.post('/api/v1/gold/charge', request);
    return response.data;
  },

  spendGold: async (
    request: SpendGoldRequest
  ): Promise<GoldTransaction> => {
    const response = await typedClient.post('/api/v1/gold/spend', request);
    return response.data;
  },
};
