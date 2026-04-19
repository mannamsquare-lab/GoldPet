import type { components } from '../api/schema.d';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/**
 * Open-union wrapper: accepts known values at compile time and tolerates unknown
 * backend values during rolling deploys. Pair with explicit switch+default at the
 * consumption site (or Zod) to detect unknown values at runtime.
 */
export type OpenEnum<T> = T | (string & {});

export type Schemas = components['schemas'];

// OpenAPI-derived enum types. Source of truth is backend Kotlin enums.
export type UserStatus = Schemas['UserListItemResponse']['status'];

// --- Report domain (Phase 3.6) ---
export type ReportType = Schemas['CreateReportRequest']['type']; // POST|COMMENT|USER|CHAT|COURSE|WALK_SPOT
export type ReportStatus = Schemas['ReportAdminResponse']['status']; // PENDING|RESOLVED|DISMISSED
export type ReportActionType = Schemas['ResolveReportRequest']['actionType']; // DELETE_POST|HIDE_POST|...
export type ReportAdminResponse = Schemas['ReportAdminResponse'];

// --- Walk admin domain (Phase 3.9) ---
export type WalkAdminResponse = Schemas['WalkAdminResponse'];
export type WalkDetailResponse = Schemas['WalkDetailResponse'];
export type WalkSpotAdminDto = Schemas['WalkSpotAdminDto'];
export type WalkStatsDetailResponse = Schemas['WalkStatsDetailResponse'];
export type WalkRankingAdminResponse = Schemas['WalkRankingAdminResponse'];
export type BestWalkCoupleResponse = Schemas['BestWalkCoupleResponse'];
export type BestWalkCoupleRequest = Schemas['BestWalkCoupleRequest'];
