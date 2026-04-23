import apiClient from './api/client';

export type PublicUserStatus = 'NORMAL' | 'BLOCKED_BY_ME' | 'WITHDRAWN';

export interface PetProfileResponse {
  id: number;
  ownerId: number;
  name: string;
  species: string;
  breed: string | null;
  profileImageUrl: string | null;
  profileImageUrls: string[];
  profileImageUrlViewer: string | null;
  profileImageUrlThumbnail: string | null;
  profileImageUrlsViewer: string[] | null;
  profileImageUrlsThumbnail: string[] | null;
}

export interface PublicUserProfileResponse {
  userId: number;
  nickname: string | null;
  intro: string | null;
  profileUrl: string | null;
  profileUrlThumbnail: string | null;
  profileUrlViewer: string | null;
  profileUrls: string[];
  profileUrlsThumbnail: string[];
  profileUrlsViewer: string[];
  publicPostCount: number;
  status: PublicUserStatus;
  isMe: boolean;
  blockedByMe: boolean;
  pets: PetProfileResponse[];
}

export interface CommunityPhotoPost {
  id: number;
  createdAt: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  viewerUrl: string | null;
  imageCount: number;
}

export interface UserCommunityPhotosResponse {
  posts: CommunityPhotoPost[];
  nextCursor: string | null;
}

export const userPublicProfileService = {
  getPublicProfile: async (userId: number): Promise<PublicUserProfileResponse> => {
    const response = await apiClient.get<PublicUserProfileResponse>(
      `/users/${userId}/public-profile`,
    );
    return response.data;
  },

  getCommunityPhotos: async (
    userId: number,
    cursor?: string,
    size = 30,
  ): Promise<UserCommunityPhotosResponse> => {
    const response = await apiClient.get<UserCommunityPhotosResponse>(
      `/users/${userId}/community/posts`,
      { params: { cursor, size } },
    );
    return response.data;
  },
};
