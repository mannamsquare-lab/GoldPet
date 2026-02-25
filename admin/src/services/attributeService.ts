import { apiClient } from './apiClient';

export interface AttributeOption {
    label: string;
    value: string;
}

export interface PetAttribute {
    id: number;
    category: 'TRAIT' | 'INTEREST' | 'ALLERGY';
    code: string;
    name: string;
    inputType: 'SELECT' | 'RADIO' | 'TEXT';
    displayOrder: number;
    options: AttributeOption[];
}

export type CreateAttributeRequest = Omit<PetAttribute, 'id'>;
export type UpdateAttributeRequest = Partial<CreateAttributeRequest>;

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
