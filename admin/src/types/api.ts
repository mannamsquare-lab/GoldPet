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
