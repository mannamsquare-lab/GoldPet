// Community Service - API integration for Community features

import apiClient from './api/client';

export interface CommunityPost {
  id: number;
  authorId: number;
  categoryId: number;
  categoryName: string;
  title: string;
  content: string;
  authorNickname: string;
  authorProfileUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  postType: 'GENERAL' | 'QUESTION' | 'INFO';
  visibility: 'PUBLIC' | 'FRIENDS';
  isAnswered?: boolean;
  isLiked: boolean;
  isCommentedByMe: boolean;
  isMine: boolean;
  thumbnailUrl?: string;
  imageUrls: string[];
  youtubeUrl?: string | null;
  comments?: CommunityComment[];
  createdAt: string;
}

export interface CommunityCategory {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

export interface CommunityComment {
  id: number;
  postId: number;
  content: string;
  authorNickname: string;
  authorProfileUrl?: string;
  isAdopted: boolean;
  createdAt: string;
  parentCommentId: number | null;
  replyTo?: number;
  replies?: CommunityComment[];
  likeCount: number;
  isLiked: boolean;
  isRepliedByMe: boolean;
  depth: number;
  replyCount: number;
  isMine: boolean;
  postTitle?: string;
}

export interface CreatePostRequest {
  categoryId: number;
  title: string;
  content: string;
  postType: 'GENERAL' | 'QUESTION' | 'INFO';
  visibility?: 'PUBLIC' | 'FRIENDS';
  images?: File[];
}

export const communityService = {
  getCategories: async (): Promise<CommunityCategory[]> => {
    try {
      const response = await apiClient.get('/community/categories');
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  getPosts: async (categoryId?: number, page = 0, size = 20): Promise<{ posts: CommunityPost[]; hasMore: boolean; totalCount?: number }> => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await apiClient.get(`/community/posts?${params}`);
      const rawPosts = response.data.content || response.data;

      // Backend DTO (Phase 3 community rename) already emits authorId/authorNickname/
      // authorProfileUrl/isLiked directly — no remap needed.
      const posts = Array.isArray(rawPosts) ? (rawPosts as CommunityPost[]) : [];

      return {
        posts,
        hasMore: !response.data.last,
        totalCount: response.data.totalElements,
      };
    } catch (error: unknown) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  },

  getPostDetail: async (postId: number): Promise<CommunityPost & { comments: CommunityComment[] }> => {
    try {
      const response = await apiClient.get(`/community/posts/${postId}`);
      // Backend DTO (Phase 3 community rename) already emits author*/isLiked directly.
      return response.data as CommunityPost & { comments: CommunityComment[] };
    } catch {
      throw new Error('게시글을 불러올 수 없습니다.');
    }
  },

  createPost: async (data: CreatePostRequest): Promise<{ success: boolean; postId: number }> => {
    try {
      // 1. Upload images first if any
      const imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        // Upload concurrently
        const uploadPromises = data.images.map(file => communityService.uploadFile(file));
        const results = await Promise.all(uploadPromises);
        imageUrls.push(...results);
      }

      // 2. Create post with image URLs
      const response = await apiClient.post('/community/posts', {
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        postType: data.postType,
        imageUrls: imageUrls,
      });
      return { success: true, postId: response.data.id };
    } catch (error: unknown) {
      console.error('Create post error:', error);
      throw new Error('게시글 등록에 실패했습니다.');
    }
  },

  uploadFile: async (file: File): Promise<string> => {
    try {
      if (file.type.startsWith('image/')) {
        const { compressImage } = await import('../utils/imageCompression');
        file = await compressImage(file);
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'community');

      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error: unknown) {
      console.error('File upload error:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  },

  toggleLike: async (postId: number): Promise<{ isLiked: boolean; likeCount: number }> => {
    try {
      const response = await apiClient.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch {
      throw new Error('좋아요 처리에 실패했습니다.');
    }
  },

  createComment: async (postId: number, content: string, parentId?: number): Promise<CommunityComment> => {
    try {
      const response = await apiClient.post(`/community/posts/${postId}/comments`, {
        content,
        parentCommentId: parentId,
      });
      return response.data;
    } catch {
      throw new Error('댓글 등록에 실패했습니다.');
    }
  },

  toggleCommentLike: async (commentId: number): Promise<void> => {
    try {
      await apiClient.post(`/community/comments/${commentId}/like`);
    } catch {
      throw new Error('댓글 좋아요 처리에 실패했습니다.');
    }
  },

  deletePost: async (postId: number): Promise<void> => {
    try {
        await apiClient.delete(`/community/posts/${postId}`);
    } catch {
        throw new Error('게시글 삭제에 실패했습니다.');
    }
  },

  deleteComment: async (commentId: number): Promise<void> => {
      try {
          await apiClient.delete(`/community/comments/${commentId}`);
      } catch {
          throw new Error('댓글 삭제에 실패했습니다.');
      }
  },

  updatePost: async (postId: number, data: { title: string; content: string; imageUrls?: string[] }): Promise<void> => {
      try {
          await apiClient.put(`/community/posts/${postId}`, data);
      } catch {
          throw new Error('게시글 수정에 실패했습니다.');
      }
  },

  updateComment: async (commentId: number, content: string): Promise<void> => {
      try {
          await apiClient.put(`/community/comments/${commentId}`, { content });
      } catch {
          throw new Error('댓글 수정에 실패했습니다.');
      }
  },

  getMyPosts: async (page = 0, size = 20): Promise<{ posts: CommunityPost[]; hasMore: boolean; totalCount: number }> => {
    try {
      const response = await apiClient.get(`/community/posts/me?page=${page}&size=${size}`);
      const rawPosts = response.data.content || [];

      // Backend DTO emits author*/isLiked directly (Phase 3 community rename).
      const posts = Array.isArray(rawPosts)
        ? rawPosts.map((p: Record<string, unknown>) => ({ ...p, isMine: true }) as unknown as CommunityPost)
        : [];

      return {
        posts,
        hasMore: !response.data.last,
        totalCount: response.data.totalElements || 0,
      };
    } catch (error: unknown) {
      console.error('Failed to fetch my posts:', error);
      throw error;
    }
  },

  getMyComments: async (page = 0, size = 20): Promise<{ comments: CommunityComment[]; hasMore: boolean; totalCount: number }> => {
    try {
      const response = await apiClient.get(`/community/comments/me?page=${page}&size=${size}`);
      const rawComments = response.data.content || [];

      // Backend DTO emits author*/isLiked directly; only set UI-local isMine fallback.
      const comments = Array.isArray(rawComments)
        ? rawComments.map((c: Record<string, unknown>) => ({
            ...c,
            isMine: true,
            postTitle: c.postTitle ?? '',
          }) as unknown as CommunityComment)
        : [];

      return {
        comments,
        hasMore: !response.data.last,
        totalCount: response.data.totalElements || 0,
      };
    } catch (error: unknown) {
      console.error('Failed to fetch my comments:', error);
      throw error;
    }
  },
};
