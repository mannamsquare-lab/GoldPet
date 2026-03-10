// Course Service - API integration for Walk Course Platform

import apiClient from './api/client';

// ── Types ──

export type CourseDifficulty = 'EASY' | 'MODERATE' | 'HARD';

export type CourseSpotType =
  | 'CONVENIENCE_STORE'
  | 'WATER_FOUNTAIN'
  | 'RESTROOM'
  | 'PET_CAFE'
  | 'PARK'
  | 'DANGER_ZONE'
  | 'REST_AREA'
  | 'TRASH_CAN'
  | 'PHOTO_SPOT'
  | 'OTHER';

export interface CourseSpotDto {
  latitude: number;
  longitude: number;
  type: CourseSpotType;
  name?: string;
  description?: string;
  imageUrl?: string;
  orderIndex: number;
}

export interface CourseSpotResponse {
  id: number;
  latitude: number;
  longitude: number;
  type: CourseSpotType;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  orderIndex: number;
}

export interface CourseResponse {
  id: number;
  title: string;
  description: string | null;
  path: number[][]; // [[lat, lng], ...]
  distanceKm: number;
  estimatedMinutes: number;
  difficulty: CourseDifficulty;
  region: string;
  startAddress: string | null;
  endAddress: string | null;
  thumbnailUrl: string | null;
  likeCount: number;
  commentCount: number;
  walkCount: number;
  rating: number;
  ratingCount: number;
  isPublished: boolean;
  originWalkId: number | null;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  spots: CourseSpotResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  path: number[][]; // [[lat, lng], ...]
  distanceKm: number;
  estimatedMinutes: number;
  difficulty?: CourseDifficulty;
  spots?: CourseSpotDto[];
  originWalkId?: number;
}

export interface UpdateCourseRequest {
  title: string;
  description?: string;
  path: number[][];
  distanceKm: number;
  estimatedMinutes: number;
  difficulty: CourseDifficulty;
  spots?: CourseSpotDto[];
}

export interface CourseCommentResponse {
  id: number;
  courseId: number;
  userId: number;
  userNickname: string;
  userProfileImageUrl: string | null;
  parentCommentId: number | null;
  content: string;
  rating: number | null;
  likeCount: number;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseCommentRequest {
  content: string;
  rating?: number; // 1-5, null for replies
  parentCommentId?: number;
}

export interface UpdateCourseCommentRequest {
  content: string;
  rating?: number;
}

export interface CourseLikeStatusResponse {
  courseId: number;
  liked: boolean;
  likeCount: number;
}

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
