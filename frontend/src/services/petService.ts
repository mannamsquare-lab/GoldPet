// Pet Service - API integration for Pet features

import apiClient from './api/client';

export interface PetSpecies {
  id: number;
  code: string;
  name: string;
}

export interface PetBreed {
  id: number;
  speciesId: number;
  name: string;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  speciesId?: number;
  breed?: string;
  breedId?: number;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  weightKg?: number;
  isNeutered?: boolean;
  profileImageUrl?: string;
  temperamentTags?: string[];
}

export interface CreatePetRequest {
  name: string;
  speciesId: number;
  breedId?: number;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  weightKg?: number;
  isNeutered?: boolean;
  profileImageUrl?: string;
  temperamentTags?: string;
}

export interface UpdatePetRequest {
  name?: string;
  speciesId?: number;
  breedId?: number;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  weightKg?: number;
  isNeutered?: boolean;
  profileImageUrl?: string;
  temperamentTags?: string;
}

// Mock data
const mockSpecies: PetSpecies[] = [
  { id: 1, code: 'DOG', name: '강아지' },
  { id: 2, code: 'CAT', name: '고양이' },
  { id: 3, code: 'OTHER', name: '기타' },
];

const mockBreeds: PetBreed[] = [
  { id: 1, speciesId: 1, name: '골든 리트리버' },
  { id: 2, speciesId: 1, name: '말티즈' },
  { id: 3, speciesId: 1, name: '푸들' },
  { id: 4, speciesId: 1, name: '시바견' },
  { id: 5, speciesId: 1, name: '웰시코기' },
  { id: 6, speciesId: 1, name: '포메라니안' },
  { id: 7, speciesId: 1, name: '믹스견' },
  { id: 10, speciesId: 2, name: '코리안숏헤어' },
  { id: 11, speciesId: 2, name: '페르시안' },
  { id: 12, speciesId: 2, name: '러시안블루' },
  { id: 13, speciesId: 2, name: '스코티시폴드' },
  { id: 14, speciesId: 2, name: '믹스묘' },
];

const mockPets: Pet[] = [
  {
    id: 1,
    name: 'Goldie',
    species: '강아지',
    speciesId: 1,
    breed: '골든 리트리버',
    breedId: 1,
    gender: 'MALE',
    birthDate: '2022-03-15',
    weightKg: 32,
    isNeutered: true,
    profileImageUrl: '/assets/images/main/main_slide_img01.png',
    temperamentTags: ['활발함', '친화적', '산책 좋아함'],
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

export const petService = {
  getSpecies: async (): Promise<PetSpecies[]> => {
    if (USE_MOCK) return mockSpecies;

    try {
      const response = await apiClient.get('/pets/species');
      return response.data;
    } catch {
      return mockSpecies;
    }
  },

  getBreeds: async (speciesId?: number): Promise<PetBreed[]> => {
    if (USE_MOCK) {
      if (speciesId) {
        return mockBreeds.filter((b) => b.speciesId === speciesId);
      }
      return mockBreeds;
    }

    try {
      const url = speciesId ? `/pets/breeds?speciesId=${speciesId}` : '/pets/breeds';
      const response = await apiClient.get(url);
      return response.data;
    } catch {
      return mockBreeds;
    }
  },

  getMyPets: async (): Promise<Pet[]> => {
    if (USE_MOCK) return mockPets;

    try {
      const response = await apiClient.get('/pets/my');
      return response.data;
    } catch {
      return mockPets;
    }
  },

  getPet: async (petId: number): Promise<Pet> => {
    if (USE_MOCK) {
      const pet = mockPets.find((p) => p.id === petId);
      if (!pet) throw new Error('Pet not found');
      return pet;
    }

    try {
      const response = await apiClient.get(`/pets/${petId}`);
      return response.data;
    } catch {
      throw new Error('반려동물 정보를 불러올 수 없습니다.');
    }
  },

  createPet: async (data: CreatePetRequest): Promise<Pet> => {
    if (USE_MOCK) {
      console.log('Creating pet (mock):', data);
      return {
        id: Date.now(),
        name: data.name,
        species: mockSpecies.find((s) => s.id === data.speciesId)?.name || '',
        speciesId: data.speciesId,
        breed: mockBreeds.find((b) => b.id === data.breedId)?.name,
        breedId: data.breedId,
        gender: data.gender,
        birthDate: data.birthDate,
        weightKg: data.weightKg,
        isNeutered: data.isNeutered,
        profileImageUrl: data.profileImageUrl,
        temperamentTags: data.temperamentTags?.split(','),
      };
    }

    try {
      const response = await apiClient.post('/pets', data);
      return response.data;
    } catch {
      throw new Error('반려동물 등록에 실패했습니다.');
    }
  },

  updatePet: async (petId: number, data: UpdatePetRequest): Promise<Pet> => {
    if (USE_MOCK) {
      console.log('Updating pet (mock):', petId, data);
      const existing = mockPets.find((p) => p.id === petId);
      return { ...existing, ...data } as Pet;
    }

    try {
      const response = await apiClient.put(`/pets/${petId}`, data);
      return response.data;
    } catch {
      throw new Error('반려동물 정보 수정에 실패했습니다.');
    }
  },

  deletePet: async (petId: number): Promise<void> => {
    if (USE_MOCK) {
      console.log('Deleting pet (mock):', petId);
      return;
    }

    try {
      await apiClient.delete(`/pets/${petId}`);
    } catch {
      throw new Error('반려동물 삭제에 실패했습니다.');
    }
  },

  uploadPetImage: async (file: File): Promise<string> => {
    if (USE_MOCK) {
      // Return a mock URL
      return URL.createObjectURL(file);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url;
    } catch {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  },
};
