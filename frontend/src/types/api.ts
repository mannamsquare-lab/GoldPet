/**
 * Centralized re-export of OpenAPI-generated types with frontend-specific refinements.
 * Source of truth is the backend Kotlin DTOs — see `openapi-typegen-migration.md`.
 *
 * Add more re-exports here as Phase 3 domains migrate. Keep refinements narrow and
 * documented: each override should name the backend constraint it's narrowing.
 */
import type { components } from '../api/schema.d';

export type Schemas = components['schemas'];

/**
 * Open-union wrapper: accepts known values at compile time and tolerates unknown
 * backend values during rolling deploys. Pair with explicit switch+default at the
 * consumption site (or Zod) to detect unknown values at runtime.
 */
export type OpenEnum<T> = T | (string & {});

// --- Auth domain (Phase 3.1) ---

/**
 * Backend declares `gender: String?`, but frontend UI only produces "MALE" | "FEMALE".
 * Narrowing here protects call sites; if backend starts returning other values the
 * consumer will catch it at the boundary. Gender enum upgrade tombstoned for a later
 * phase (requires DB migration of existing user.gender values).
 */
type Gender = 'MALE' | 'FEMALE';

export type AuthResponse = Schemas['AuthResponse'];
export type LoginRequest = Schemas['LoginRequest'];
export type LinkSuggestionInfo = Schemas['LinkSuggestionInfo'];
export type UserInfo = Schemas['UserInfo'];
export type EmailAvailabilityResponse = Schemas['EmailAvailabilityResponse'];
export type RefreshTokenRequest = Schemas['RefreshTokenRequest'];
export type ConfirmLinkRequest = Schemas['ConfirmLinkRequest'];

export type SignupRequest = Omit<Schemas['SignupRequest'], 'gender'> & {
  gender: Gender;
};

export type SnsSignupRequest = Omit<Schemas['SnsSignupRequest'], 'gender'> & {
  gender: Gender;
};
