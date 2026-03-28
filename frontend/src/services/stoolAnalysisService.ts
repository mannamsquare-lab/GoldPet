import apiClient from './api/client';

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface StoolAnalysisResponse {
  id: number;
  petId: number;
  imageUrl: string;
  status: AnalysisStatus;
  colorScore: number | null;
  consistencyScore: number | null;
  coatingScore: number | null;
  contentsScore: number | null;
  overallScore: number | null;
  colorAssessment: string | null;
  consistencyAssessment: string | null;
  coatingAssessment: string | null;
  contentsAssessment: string | null;
  healthSummary: string | null;
  healthTips: string | null;
  warnings: string | null;
  errorMessage: string | null;
  analyzedAt: string | null;
  createdAt: string | null;
  disclaimer: string;
}

export interface MonthlyScore {
  yearMonth: string;
  averageScore: number;
  count: number;
}

export interface HealthTrendResponse {
  petId: number;
  petName: string;
  monthlyScores: MonthlyScore[];
  totalAnalyses: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

export const stoolAnalysisService = {
  getAnalysisHistory: async (petId: number, page: number): Promise<PageResponse<StoolAnalysisResponse>> => {
    const response = await apiClient.get(`/health/stool-analyses/pet/${petId}`, {
      params: { page, size: 20 },
    });
    return response.data;
  },

  getAnalysis: async (id: number): Promise<StoolAnalysisResponse> => {
    const response = await apiClient.get(`/health/stool-analyses/${id}`);
    return response.data;
  },

  getHealthTrend: async (petId: number, months = 6): Promise<HealthTrendResponse> => {
    const response = await apiClient.get(`/health/stool-analyses/pet/${petId}/trend`, {
      params: { months },
    });
    return response.data;
  },
};
