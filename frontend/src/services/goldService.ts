import apiClient from './api/client';

// Interfaces - aligned with backend DTOs
export interface GoldBalance {
  balance: number;
  totalCharged: number;
  totalSpent: number;
}

export interface GoldProduct {
  id: string;           // productCode (string, not number)
  name: string;
  goldAmount: number;
  price: number;
  bonus: number;
}

export interface GoldTransaction {
  id: number;
  type: 'CHARGE' | 'SPEND' | 'REWARD' | 'REFUND' | 'ADMIN_ADJUST';
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
}

export interface ChargeGoldRequest {
  amount: number;
  bonus?: number;
  paymentMethod: string;
  externalTransactionId?: string;
}

export interface SpendGoldRequest {
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: number;
}

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
    const params: Record<string, any> = { page, size };
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
