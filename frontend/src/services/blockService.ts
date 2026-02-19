import apiClient from './api/client';

export interface BlockedUser {
  blockId: number;
  blockedUserId: number;
  blockedNickname: string | null;
  blockedProfileImageUrl: string | null;
  blockedPetName: string | null;
  blockedAt: string | null;
}

export const blockService = {
  getBlockList: async (): Promise<BlockedUser[]> => {
    const response = await apiClient.get('/matches/blocks');
    return response.data;
  },
  blockUser: async (blockedUserId: number) => {
    return apiClient.post('/matches/block', { blockedUserId });
  },
  unblockUser: async (blockedUserId: number) => {
    return apiClient.delete(`/matches/block/${blockedUserId}`);
  },
};
