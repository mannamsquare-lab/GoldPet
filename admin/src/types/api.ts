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

// --- Content domain (Phase 3.11.1) — admin content management ---

// AI Profile admin
export type AIRequestAdminResponse = Schemas['AIRequestAdminResponse'];
export type AIStyleAdminResponse = Schemas['AIStyleAdminResponse'];
export type AIStyleAdminRequest = Schemas['AIStyleAdminRequest'];
export type AIProfileStatsResponse = Schemas['AIProfileStatsResponse'];

// Emoticon admin
export type EmoticonResponse = Schemas['EmoticonResponse'];
export type EmoticonPackResponse = Schemas['EmoticonPackResponse'];
export type CreateEmoticonRequest = Schemas['CreateEmoticonRequest'];
export type UpdateEmoticonRequest = Schemas['UpdateEmoticonRequest'];

// Gamification (admin uses same Badge as frontend)
export type BadgeResponse = Schemas['BadgeResponse'];

// AI loading tip
export type AILoadingTipResponse = Schemas['AILoadingTipResponse'];
export type CreateLoadingTipRequest = Schemas['CreateLoadingTipRequest'];
export type UpdateLoadingTipRequest = Schemas['UpdateLoadingTipRequest'];

// Pet breed
export type BreedResponse = Schemas['BreedResponse'];
export type SpeciesResponse = Schemas['SpeciesResponse'];
export type CreateBreedRequest = Schemas['CreateBreedRequest'];
export type UpdateBreedRequest = Schemas['UpdateBreedRequest'];

// Pet attribute (backend uses single PetAttributeRequest for both create + update)
export type PetAttributeResponse = Schemas['PetAttributeResponse'];
export type AttributeOption = Schemas['AttributeOption'];
export type PetAttributeRequest = Schemas['PetAttributeRequest'];
