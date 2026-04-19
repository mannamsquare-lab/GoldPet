import { apiClient } from './apiClient';
import type { PageResponse, UserStatus } from '../types/api';

export interface UserListItem {
  id: number;
  email: string | null;
  nickname: string;
  profileImageUrl: string | null;
  status: UserStatus;
  petCount: number;
  walkCount: number;
  postCount: number;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export interface UserDetail {
  id: number;
  email: string | null;
  nickname: string;
  intro: string | null;
  profileImageUrl: string | null;
  status: UserStatus;
  oauthProvider: string | null;
  goldBalance: number;
  createdAt: string | null;
  lastLoginAt: string | null;
  pets: Array<{
    id: number;
    name: string;
    species: string;
    breed: string | null;
  }>;
  stats: {
    totalWalks: number;
    totalDistance: number;
    totalPosts: number;
    totalComments: number;
    badgeCount: number;
  };
}

export const userManagementService = {
  async getUsers(params: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<UserListItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.size !== undefined) queryParams.set('size', params.size.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortDir) queryParams.set('sortDir', params.sortDir);

    const response = await apiClient.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  async getUserDetail(userId: number): Promise<UserDetail> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  async updateUserStatus(userId: number, status: UserStatus, reason?: string): Promise<void> {
    await apiClient.patch(`/users/${userId}/status`, { status, reason });
  },

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  async searchUsers(query: string, limit = 10): Promise<UserListItem[]> {
    const response = await apiClient.get(`/users/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },
};
