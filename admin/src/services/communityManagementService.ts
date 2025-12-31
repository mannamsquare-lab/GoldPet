import { apiClient } from './apiClient';

export interface PostListItem {
  id: number;
  title: string;
  content: string;
  categoryName: string;
  authorNickname: string;
  authorId: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isHidden: boolean;
  createdAt: string | null;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  categoryName: string;
  authorId: number;
  authorNickname: string;
  authorProfileImage: string | null;
  imageUrls: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isHidden: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  comments: CommentItem[];
}

export interface CommentItem {
  id: number;
  content: string;
  authorId: number;
  authorNickname: string;
  isHidden: boolean;
  createdAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const communityManagementService = {
  async getPosts(params: {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: number;
  }): Promise<PageResponse<PostListItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.size !== undefined) queryParams.set('size', params.size.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.categoryId) queryParams.set('categoryId', params.categoryId.toString());

    const response = await apiClient.get(`/community/posts?${queryParams.toString()}`);
    return response.data;
  },

  async getPostDetail(postId: number): Promise<PostDetail> {
    const response = await apiClient.get(`/community/posts/${postId}`);
    return response.data;
  },

  async hidePost(postId: number, reason?: string): Promise<void> {
    await apiClient.post(`/community/posts/${postId}/hide`, { reason });
  },

  async unhidePost(postId: number): Promise<void> {
    await apiClient.post(`/community/posts/${postId}/unhide`);
  },

  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(`/community/posts/${postId}`);
  },

  async hideComment(commentId: number, reason?: string): Promise<void> {
    await apiClient.post(`/community/comments/${commentId}/hide`, { reason });
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/community/comments/${commentId}`);
  },
};
