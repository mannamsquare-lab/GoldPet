import apiClient from './api/client';

// Interfaces
export interface GoldBalance {
  balance: number;
  lastUpdated: string;
}

export interface GoldProduct {
  id: number;
  name: string;
  description: string;
  goldAmount: number;
  price: number;
  bonusAmount?: number;
}

export interface GoldTransaction {
  id: number;
  type: 'CHARGE' | 'SPEND' | 'EARN' | 'REFUND';
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
}

export interface ChargeGoldRequest {
  productId: number;
  paymentMethod: string;
}

export interface SpendGoldRequest {
  amount: number;
  purpose: string;
  referenceId?: string;
}

// Mock Data
const mockBalance: GoldBalance = {
  balance: 1250,
  lastUpdated: '2025-12-21T10:00:00',
};

const mockProducts: GoldProduct[] = [
  {
    id: 1,
    name: '골드 100',
    description: '100 골드',
    goldAmount: 100,
    price: 1100,
  },
  {
    id: 2,
    name: '골드 500',
    description: '500 골드 + 50 보너스',
    goldAmount: 500,
    price: 5500,
    bonusAmount: 50,
  },
  {
    id: 3,
    name: '골드 1000',
    description: '1000 골드 + 150 보너스',
    goldAmount: 1000,
    price: 11000,
    bonusAmount: 150,
  },
  {
    id: 4,
    name: '골드 3000',
    description: '3000 골드 + 500 보너스',
    goldAmount: 3000,
    price: 33000,
    bonusAmount: 500,
  },
];

const mockTransactions: GoldTransaction[] = [
  {
    id: 1,
    type: 'EARN',
    amount: 10,
    description: '산책 완료 보상',
    createdAt: '2025-12-21',
    balanceAfter: 1250,
  },
  {
    id: 2,
    type: 'SPEND',
    amount: -50,
    description: 'AI 프로필 생성',
    createdAt: '2025-12-20',
    balanceAfter: 1240,
  },
  {
    id: 3,
    type: 'CHARGE',
    amount: 500,
    description: '골드 500 충전',
    createdAt: '2025-12-19',
    balanceAfter: 1290,
  },
  {
    id: 4,
    type: 'EARN',
    amount: 25,
    description: '산책 완료 보상',
    createdAt: '2025-12-18',
    balanceAfter: 790,
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Service
export const goldService = {
  getBalance: async (): Promise<GoldBalance> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockBalance;
    }

    try {
      const response = await apiClient.get('/gold/balance');
      return response.data;
    } catch {
      return mockBalance;
    }
  },

  getProducts: async (): Promise<GoldProduct[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockProducts;
    }

    try {
      const response = await apiClient.get('/gold/products');
      return response.data;
    } catch {
      return mockProducts;
    }
  },

  getTransactions: async (
    page = 0,
    size = 20
  ): Promise<GoldTransaction[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockTransactions;
    }

    try {
      const response = await apiClient.get('/gold/transactions', {
        params: { page, size },
      });
      return response.data;
    } catch {
      return mockTransactions;
    }
  },

  chargeGold: async (
    request: ChargeGoldRequest
  ): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { success: true };
    }

    try {
      const response = await apiClient.post('/gold/charge', request);
      return response.data;
    } catch {
      return { success: false };
    }
  },

  spendGold: async (
    request: SpendGoldRequest
  ): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { success: true };
    }

    try {
      const response = await apiClient.post('/gold/spend', request);
      return response.data;
    } catch {
      return { success: false };
    }
  },
};
