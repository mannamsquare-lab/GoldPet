import { apiClient } from './apiClient';
import type {
  PageResponse,
  UserStatus,
  UserListItemResponse,
  UserDetailResponse,
} from '../types/api';

// Generated aliases (Phase 3.11.2).
export type UserListItem = UserListItemResponse;
export type UserDetail = UserDetailResponse;

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
