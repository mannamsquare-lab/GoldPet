import { apiClient } from './apiClient';
import type {
  PageResponse,
  PostListItemResponse,
  PostDetailAdminResponse,
  CommentAdminResponse,
} from '../types/api';

// Generated aliases (Phase 3.11.3).
export type PostListItem = PostListItemResponse;
export type PostDetail = PostDetailAdminResponse;
export type CommentItem = CommentAdminResponse;

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

  async updatePost(postId: number, payload: { title?: string; content?: string }): Promise<PostDetail> {
    const response = await apiClient.patch(`/community/posts/${postId}`, payload);
    return response.data;
  },

  async updateComment(commentId: number, content: string): Promise<CommentItem> {
    const response = await apiClient.patch(`/community/comments/${commentId}`, { content });
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
