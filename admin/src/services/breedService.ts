// Breed Service - API integration for Admin breed management

import { apiClient } from './apiClient';

export interface BreedResponse {
  id: number;
  speciesId: number;
  name: string;
  category?: string;
  description?: string;
}

export interface SpeciesResponse {
  id: number;
  code: string;
  name: string;
}

export interface CreateBreedRequest {
  speciesId: number;
  name: string;
  category?: string;
  description?: string;
}

export interface UpdateBreedRequest {
  name: string;
  category?: string;
  description?: string;
}

export const breedService = {
  // Get all species
  getSpecies: async (): Promise<SpeciesResponse[]> => {
    const response = await apiClient.get('/data/species');
    return response.data;
  },

  // Get all breeds (optionally filtered by species)
  getBreeds: async (speciesId?: number): Promise<BreedResponse[]> => {
    const params = speciesId ? { speciesId } : {};
    const response = await apiClient.get('/breeds', { params });
    return response.data;
  },

  // Get single breed
  getBreed: async (breedId: number): Promise<BreedResponse> => {
    const response = await apiClient.get(`/breeds/${breedId}`);
    return response.data;
  },

  // Create breed
  createBreed: async (data: CreateBreedRequest): Promise<BreedResponse> => {
    const response = await apiClient.post('/breeds', data);
    return response.data;
  },

  // Update breed
  updateBreed: async (breedId: number, data: UpdateBreedRequest): Promise<BreedResponse> => {
    const response = await apiClient.put(`/breeds/${breedId}`, data);
    return response.data;
  },

  // Delete breed
  deleteBreed: async (breedId: number): Promise<void> => {
    await apiClient.delete(`/breeds/${breedId}`);
  },

  // Create species
  createSpecies: async (data: { name: string; code: string }): Promise<SpeciesResponse> => {
    const response = await apiClient.post('/data/species', data);
    return response.data;
  },

  // Delete species
  deleteSpecies: async (speciesId: number): Promise<void> => {
    await apiClient.delete(`/data/species/${speciesId}`);
  },
};
