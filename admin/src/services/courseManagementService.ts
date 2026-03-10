import { apiClient } from './apiClient';
import type { PageResponse } from '../types/api';

export interface CourseListItem {
  id: number;
  title: string;
  authorNickname: string;
  authorId: number;
  difficulty: string;
  region: string;
  distanceKm: number;
  estimatedMinutes: number;
  likeCount: number;
  commentCount: number;
  walkCount: number;
  rating: number;
  ratingCount: number;
  isHidden: boolean;
  createdAt: string;
}

export interface CourseSpotItem {
  id: number;
  type: string;
  name: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  orderIndex: number;
}

export interface CourseCommentItem {
  id: number;
  content: string;
  rating: number | null;
  authorId: number;
  authorNickname: string;
  likeCount: number;
  isHidden: boolean;
  createdAt: string;
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string | null;
  authorId: number;
  authorNickname: string;
  difficulty: string;
  region: string;
  distanceKm: number;
  estimatedMinutes: number;
  likeCount: number;
  commentCount: number;
  walkCount: number;
  rating: number;
  ratingCount: number;
  isHidden: boolean;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  spots: CourseSpotItem[];
  comments: CourseCommentItem[];
}

export const courseManagementService = {
  async getCourses(params: {
    page: number;
    size: number;
    search?: string;
    difficulty?: string;
    isPublished?: boolean;
  }): Promise<PageResponse<CourseListItem>> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', params.page.toString());
    searchParams.set('size', params.size.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params.isPublished !== undefined) searchParams.set('isPublished', params.isPublished.toString());
    const { data } = await apiClient.get(`/courses?${searchParams}`);
    return data;
  },

  async getCourseDetail(courseId: number): Promise<CourseDetail> {
    const { data } = await apiClient.get(`/courses/${courseId}`);
    return data;
  },

  async hideCourse(courseId: number): Promise<void> {
    await apiClient.post(`/courses/${courseId}/hide`);
  },

  async unhideCourse(courseId: number): Promise<void> {
    await apiClient.post(`/courses/${courseId}/unhide`);
  },

  async deleteCourse(courseId: number): Promise<void> {
    await apiClient.delete(`/courses/${courseId}`);
  },

  async hideComment(commentId: number): Promise<void> {
    await apiClient.post(`/courses/comments/${commentId}/hide`);
  },

  async unhideComment(commentId: number): Promise<void> {
    await apiClient.post(`/courses/comments/${commentId}/unhide`);
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/courses/comments/${commentId}`);
  },
};
