import { apiClient } from './apiClient';
import type {
  PetAttributeResponse,
  AttributeOption,
  PetAttributeRequest,
} from '../types/api';

// Generated aliases (Phase 3.11.1). Backend uses single PetAttributeRequest for
// both create + update; matches Partial<...> semantics at the call site.
export type { AttributeOption };
export type PetAttribute = PetAttributeResponse;
export type CreateAttributeRequest = PetAttributeRequest;
export type UpdateAttributeRequest = PetAttributeRequest;

export const getAttributes = async (): Promise<PetAttribute[]> => {
    const response = await apiClient.get<PetAttribute[]>('/pet-attributes');
    return response.data;
};

export const createAttribute = async (data: CreateAttributeRequest): Promise<PetAttribute> => {
    const response = await apiClient.post<PetAttribute>('/pet-attributes', data);
    return response.data;
};

export const updateAttribute = async (id: number, data: UpdateAttributeRequest): Promise<PetAttribute> => {
    const response = await apiClient.put<PetAttribute>(`/pet-attributes/${id}`, data);
    return response.data;
};

export const deleteAttribute = async (id: number): Promise<void> => {
    await apiClient.delete(`/pet-attributes/${id}`);
};
