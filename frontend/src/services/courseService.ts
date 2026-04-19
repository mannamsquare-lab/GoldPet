// Course Service - API integration for Walk Course Platform

import apiClient from './api/client';
import type {
  CourseDifficulty,
  CourseSpotType,
  CourseSpotDto,
  CourseSpotResponse,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseCommentResponse,
  CreateCourseCommentRequest,
  UpdateCourseCommentRequest,
  CourseLikeStatusResponse,
} from '../types/api';

// ── Types ── (Phase 4 sweep — generated re-exports)

export type {
  CourseDifficulty,
  CourseSpotType,
  CourseSpotDto,
  CourseSpotResponse,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseCommentResponse,
  CreateCourseCommentRequest,
  UpdateCourseCommentRequest,
  CourseLikeStatusResponse,
};

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

// ── Service ──

export const courseService = {
  // ── Course CRUD ──

  getCourseDetail: async (courseId: number): Promise<CourseResponse> => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (request: CreateCourseRequest): Promise<CourseResponse> => {
    const response = await apiClient.post('/courses', request);
    return response.data;
  },

  updateCourse: async (courseId: number, request: UpdateCourseRequest): Promise<CourseResponse> => {
    const response = await apiClient.put(`/courses/${courseId}`, request);
    return response.data;
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}`);
  },

  // ── Course Search & List ──

  searchNearbyCourses: async (params: {
    lat: number;
    lng: number;
    radiusMeters?: number;
    difficulty?: CourseDifficulty;
    page?: number;
    size?: number;
  }): Promise<PageResponse<CourseResponse>> => {
    const response = await apiClient.get('/courses/search', { params });
    return response.data;
  },

  getPopularCourses: async (params?: {
    region?: string;
    difficulty?: CourseDifficulty;
    sortBy?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<CourseResponse>> => {
    const response = await apiClient.get('/courses/popular', { params });
    return response.data;
  },

  getMyCourses: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<CourseResponse>> => {
    const response = await apiClient.get('/courses/my', { params });
    return response.data;
  },

  // ── Course from Walk ──

  createCourseFromWalk: async (walkId: number, request: CreateCourseRequest): Promise<CourseResponse> => {
    const response = await apiClient.post(`/courses/from-walk/${walkId}`, request);
    return response.data;
  },

  // ── Like ──

  toggleCourseLike: async (courseId: number): Promise<CourseLikeStatusResponse> => {
    const response = await apiClient.post(`/courses/${courseId}/likes`);
    return response.data;
  },

  getCourseLikeStatus: async (courseId: number): Promise<CourseLikeStatusResponse> => {
    const response = await apiClient.get(`/courses/${courseId}/likes/status`);
    return response.data;
  },

  // ── Comments ──

  getCourseComments: async (courseId: number, params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<CourseCommentResponse>> => {
    const response = await apiClient.get(`/courses/${courseId}/comments`, { params });
    return response.data;
  },

  createCourseComment: async (courseId: number, request: CreateCourseCommentRequest): Promise<CourseCommentResponse> => {
    const response = await apiClient.post(`/courses/${courseId}/comments`, request);
    return response.data;
  },

  updateCourseComment: async (courseId: number, commentId: number, request: UpdateCourseCommentRequest): Promise<CourseCommentResponse> => {
    const response = await apiClient.put(`/courses/${courseId}/comments/${commentId}`, request);
    return response.data;
  },

  deleteCourseComment: async (courseId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/comments/${commentId}`);
  },

  toggleCommentLike: async (courseId: number, commentId: number): Promise<boolean> => {
    const response = await apiClient.post(`/courses/${courseId}/comments/${commentId}/like`);
    return response.data;
  },
};
