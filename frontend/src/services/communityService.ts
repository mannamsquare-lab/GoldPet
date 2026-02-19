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
  isAnswered?: boolean;
  isLiked: boolean;
  isCommentedByMe: boolean;
  isMine: boolean;
  thumbnailUrl?: string;
  imageUrls: string[]; // Added this
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
  replyTo?: number;
  replies?: CommunityComment[];
  likeCount: number;
  isLikedByMe: boolean;
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
  images?: File[];
}

export const communityService = {
  getCategories: async (): Promise<CommunityCategory[]> => {
    try {
      const response = await apiClient.get('/community/categories');
      return response.data;
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      return [];
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
      
      const posts = Array.isArray(rawPosts) ? rawPosts.map((p: any) => ({
        ...p,
        authorId: p.userId,
        isLiked: p.isLikedByMe ?? p.isLiked ?? false,
        isCommentedByMe: p.isCommentedByMe ?? false,
        isMine: p.isMine ?? false,
      })) : [];

      return {
        posts,
        hasMore: !response.data.last,
        totalCount: response.data.totalElements,
      };
    } catch {
      return { posts: [], hasMore: false };
    }
  },

  getPostDetail: async (postId: number): Promise<CommunityPost & { comments: CommunityComment[] }> => {
    try {
      const response = await apiClient.get(`/community/posts/${postId}`);
      const data = response.data;
      
      const comments = data.comments?.map((c: any) => ({
          ...c,
          isLikedByMe: c.isLikedByMe ?? false,
          isRepliedByMe: c.isRepliedByMe ?? false,
          isMine: c.isMine ?? false,
          replyCount: c.replyCount || 0
      })) || [];

      return {
        ...data,
        authorId: data.userId,
        isLiked: data.isLikedByMe ?? data.isLiked ?? false,
        isCommentedByMe: data.isCommentedByMe ?? false,
        isMine: data.isMine ?? false,
        comments
      };
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
    } catch (e) {
      console.error('Create post error:', e);
      throw new Error('게시글 등록에 실패했습니다.');
    }
  },

  uploadFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'community');

      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (e) {
      console.error('File upload error:', e);
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

      const posts = Array.isArray(rawPosts) ? rawPosts.map((p: any) => ({
        ...p,
        isLiked: p.isLikedByMe ?? p.isLiked ?? false,
        isCommentedByMe: p.isCommentedByMe ?? false,
        isMine: true,
      })) : [];

      return {
        posts,
        hasMore: !response.data.last,
        totalCount: response.data.totalElements || 0,
      };
    } catch {
      return { posts: [], hasMore: false, totalCount: 0 };
    }
  },

  getMyComments: async (page = 0, size = 20): Promise<{ comments: CommunityComment[]; hasMore: boolean; totalCount: number }> => {
    try {
      const response = await apiClient.get(`/community/comments/me?page=${page}&size=${size}`);
      const rawComments = response.data.content || [];

      const comments = Array.isArray(rawComments) ? rawComments.map((c: any) => ({
        ...c,
        authorNickname: c.userNickname ?? c.authorNickname ?? '',
        authorProfileUrl: c.userProfileImage ?? c.authorProfileUrl,
        isMine: true,
        postTitle: c.postTitle ?? '',
      })) : [];

      return {
        comments,
        hasMore: !response.data.last,
        totalCount: response.data.totalElements || 0,
      };
    } catch {
      return { comments: [], hasMore: false, totalCount: 0 };
    }
  },
};
