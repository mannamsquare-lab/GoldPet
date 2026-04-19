import { apiClient } from './apiClient';
import type {
  PageResponse,
  CourseListItemResponse,
  CourseDetailAdminResponse,
  CourseSpotAdminResponse,
  CourseCommentAdminResponse,
} from '../types/api';

// Generated aliases (Phase 3.11.3).
export type CourseListItem = CourseListItemResponse;
export type CourseSpotItem = CourseSpotAdminResponse;
export type CourseCommentItem = CourseCommentAdminResponse;
export type CourseDetail = CourseDetailAdminResponse;

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
