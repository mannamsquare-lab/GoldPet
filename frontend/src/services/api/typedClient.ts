/**
 * typedClient: thin typed wrapper around apiClient (axios) that constrains paths,
 * methods, request bodies, and response types against the generated OpenAPI schema.
 *
 * Migration strategy: call sites can continue using `apiClient` (string-path, any body)
 * OR switch to `typedClient` for compile-time safety. Both use the same underlying axios
 * instance, so 401/refresh interceptors, headers, etc. are preserved.
 *
 * Scope: JSON bodies only. Multipart endpoints (e.g. /files/upload) stay on `apiClient`.
 *
 * NOTE: Callers pass the full spec path (e.g. "/api/v1/users/me"). typedClient strips the
 * shared `/api/v1` prefix at runtime to match `apiClient.baseURL`. Path parameter
 * substitution is caller responsibility until a param-typed overload lands
 * (tombstoned Phase 4.5 follow-up).
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from './client';
import type { paths } from '../../api/schema.d';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type PathsWithMethod<M extends HttpMethod> = {
  [P in keyof paths]: paths[P] extends { [K in M]: unknown } ? P : never;
}[keyof paths];

type Op<P extends keyof paths, M extends keyof paths[P]> = paths[P][M];

type JsonOf<T> = T extends { content: { 'application/json': infer J } } ? J : never;

// Try 200 then 201 for the response payload. Returns never if neither has JSON content.
export type ResponseOf<P extends keyof paths, M extends keyof paths[P]> =
  Op<P, M> extends { responses: { 200: infer R200 } } ? JsonOf<R200> :
  Op<P, M> extends { responses: { 201: infer R201 } } ? JsonOf<R201> :
  unknown;

// Body shape for endpoints that declare a JSON request body; never otherwise.
export type RequestBodyOf<P extends keyof paths, M extends keyof paths[P]> =
  Op<P, M> extends { requestBody: infer RB } ? JsonOf<RB> : never;

// Allow undefined if the endpoint has no body; otherwise require the typed body.
export type OptionalBody<P extends keyof paths, M extends keyof paths[P]> =
  RequestBodyOf<P, M> extends never ? undefined : RequestBodyOf<P, M>;

// Optional config passthrough for axios.
type Config = Omit<AxiosRequestConfig, 'data' | 'method' | 'url'>;

// apiClient.baseURL is `${VITE_API_BASE_URL}/api/v1`; spec paths are `/api/v1/...`.
// Strip the shared prefix at call time so axios builds the correct URL.
const BASE_STRIP = '/api/v1';
const toAxiosPath = (p: string): string =>
  p.startsWith(BASE_STRIP) ? p.slice(BASE_STRIP.length) || '/' : p;

export const typedClient = {
  get: <P extends PathsWithMethod<'get'>>(
    path: P,
    config?: Config,
  ): Promise<AxiosResponse<ResponseOf<P, 'get'>>> =>
    apiClient.get(toAxiosPath(path as string), config),

  post: <P extends PathsWithMethod<'post'>>(
    path: P,
    body: OptionalBody<P, 'post'>,
    config?: Config,
  ): Promise<AxiosResponse<ResponseOf<P, 'post'>>> =>
    apiClient.post(toAxiosPath(path as string), body, config),

  put: <P extends PathsWithMethod<'put'>>(
    path: P,
    body: OptionalBody<P, 'put'>,
    config?: Config,
  ): Promise<AxiosResponse<ResponseOf<P, 'put'>>> =>
    apiClient.put(toAxiosPath(path as string), body, config),

  patch: <P extends PathsWithMethod<'patch'>>(
    path: P,
    body: OptionalBody<P, 'patch'>,
    config?: Config,
  ): Promise<AxiosResponse<ResponseOf<P, 'patch'>>> =>
    apiClient.patch(toAxiosPath(path as string), body, config),

  delete: <P extends PathsWithMethod<'delete'>>(
    path: P,
    config?: Config,
  ): Promise<AxiosResponse<ResponseOf<P, 'delete'>>> =>
    apiClient.delete(toAxiosPath(path as string), config),
};

export default typedClient;
