import { apiClient } from './apiClient';

export interface DataItem {
    id: number;
    name: string;
    orderIndex?: number;
    code?: string;
}

export const dataService = {
    // Interests
    getInterests: async (): Promise<DataItem[]> => {
        const response = await apiClient.get<DataItem[]>('/data/interests');
        return response.data;
    },

    createInterest: async (name: string, orderIndex?: number): Promise<DataItem> => {
        const response = await apiClient.post<DataItem>('/data/interests', { name, orderIndex });
        return response.data;
    },

    deleteInterest: async (id: number): Promise<void> => {
        await apiClient.delete(`/data/interests/${id}`);
    },

    // Hobbies
    getHobbies: async (): Promise<DataItem[]> => {
        const response = await apiClient.get<DataItem[]>('/data/hobbies');
        return response.data;
    },

    createHobby: async (name: string, orderIndex?: number): Promise<DataItem> => {
        const response = await apiClient.post<DataItem>('/data/hobbies', { name, orderIndex });
        return response.data;
    },

    deleteHobby: async (id: number): Promise<void> => {
        await apiClient.delete(`/data/hobbies/${id}`);
    },

    // Community Categories
    getCategories: async (): Promise<DataItem[]> => {
        const response = await apiClient.get<DataItem[]>('/data/categories');
        return response.data;
    },

    createCategory: async (name: string, code?: string): Promise<DataItem> => {
        const response = await apiClient.post<DataItem>('/data/categories', { name, code });
        return response.data;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await apiClient.delete(`/data/categories/${id}`);
    },
};
