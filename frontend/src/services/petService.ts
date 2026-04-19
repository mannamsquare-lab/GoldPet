// Pet Service - API integration for Pet features

import apiClient from './api/client';
import { typedClient } from './api/typedClient';
import type {
  PetResponse,
  SpeciesResponse,
  BreedResponse,
  CreatePetRequest as CreatePetRequestDto,
  UpdatePetRequest as UpdatePetRequestDto,
  AttributeOption as AttributeOptionDto,
  PetAttributeResponse,
} from '../types/api';

// Generated aliases (Phase 3.10).
export type PetSpecies = SpeciesResponse;
export type PetBreed = BreedResponse;
export type Pet = PetResponse;
export type CreatePetRequest = CreatePetRequestDto;
export type UpdatePetRequest = UpdatePetRequestDto;
export type AttributeOption = AttributeOptionDto;
export type PetAttribute = PetAttributeResponse;

// Mock data
const mockSpecies: PetSpecies[] = [
  { id: 1, code: 'DOG', name: '강아지', breedCount: 0 },
  { id: 2, code: 'CAT', name: '고양이', breedCount: 0 },
  { id: 3, code: 'OTHER', name: '기타', breedCount: 0 },
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
    ownerId: 1,
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
    profileImageUrls: ['/assets/images/main/main_slide_img01.png'],
    temperamentTags: ['활발함', '친화적', '산책 좋아함'],
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Fallback Schema to restore UI when backend data is missing or for display mapping
export const FALLBACK_ATTRIBUTES_SCHEMA = [
    // TRAIT (Personality)
    { code: 'Activity', name: '활동성', category: 'TRAIT', inputType: 'SELECT', options: [{label: '에너자이저', value: 'ENERGIZER'}, {label: '활발함', value: 'ACTIVE'}, {label: '보통', value: 'NORMAL'}, {label: '얌전함', value: 'CALM'}, {label: '매우 정적', value: 'STATIC'}] },
    { code: 'Friendliness', name: '사회성/친화력', category: 'TRAIT', inputType: 'SELECT', options: [{label: '모두의 친구', value: 'SOCIAL'}, {label: '사람 중심', value: 'PEOPLE_ONLY'}, {label: '선택적', value: 'SELECTIVE'}, {label: '낯가림', value: 'SHY'}, {label: '독립적', value: 'INDEPENDENT'}] },
    { code: 'Training', name: '훈련 상태', category: 'TRAIT', inputType: 'SELECT', options: [{label: '전문 교육 수료', value: 'PROFESSIONAL'}, {label: '기본 매너 숙지', value: 'BASIC'}, {label: '현재 교육 중', value: 'TRAINING'}, {label: '자유로운 영혼', value: 'FREE_SPIRIT'}] },
    { code: 'Barking', name: '소음(짖음) 수준', category: 'TRAIT', inputType: 'SELECT', options: [{label: '표현이 풍부함', value: 'VOCAL'}, {label: '필요할 때만', value: 'NECESSARY'}, {label: '거의 없음', value: 'QUIET'}] },
    { code: 'Note', name: '특이사항', category: 'TRAIT', inputType: 'TEXT', options: [] },

    // INTEREST
    { code: 'Toy', name: '장난감 놀이', category: 'INTEREST', inputType: 'SELECT', options: [{label: '장난감 마니아', value: 'MANIA'}, {label: '즐겨 노는 편', value: 'LIKE'}, {label: '보통', value: 'NORMAL'}, {label: '관심 낮음', value: 'DISLIKE'}] },
    { code: 'Walk', name: '야외 활동', category: 'INTEREST', inputType: 'SELECT', options: [{label: '산책 중독', value: 'ADDICTED'}, {label: '산책을 즐김', value: 'ENJOY'}, {label: '적당히 즐김', value: 'MODERATE'}, {label: '실내파', value: 'INDOOR'}] },
    { code: 'Petting', name: '스킨십', category: 'INTEREST', inputType: 'SELECT', options: [{label: '애교쟁이', value: 'LOVER'}, {label: '스킨십 선호', value: 'LIKE'}, {label: '적당히 수용', value: 'ACCEPT'}, {label: '개인 공간 중시', value: 'PRIVATE'}] },
    { code: 'Friendship', name: '친구 관계', category: 'INTEREST', inputType: 'SELECT', options: [{label: '적극적인 사교가', value: 'SOCIAL'}, {label: '매너 있는 관계', value: 'MANNER'}, {label: '조심스러운 만남', value: 'CAREFUL'}, {label: '외골수', value: 'LONER'}] },

    // ALLERGY (Update: Meat, DairyEgg, Grain, Other)
    { code: 'AllergyMeat', name: '육류', category: 'ALLERGY', inputType: 'SELECT', options: [{label: '있음', value: 'YES'}, {label: '없음', value: 'NO'}, {label: '모름', value: 'UNKNOWN'}] },
    { code: 'AllergyDairyEgg', name: '유제품/알', category: 'ALLERGY', inputType: 'SELECT', options: [{label: '있음', value: 'YES'}, {label: '없음', value: 'NO'}, {label: '모름', value: 'UNKNOWN'}] },
    { code: 'AllergyGrain', name: '곡물', category: 'ALLERGY', inputType: 'SELECT', options: [{label: '있음', value: 'YES'}, {label: '없음', value: 'NO'}, {label: '모름', value: 'UNKNOWN'}] },
    { code: 'AllergyOther', name: '기타', category: 'ALLERGY', inputType: 'SELECT', options: [{label: '있음', value: 'YES'}, {label: '없음', value: 'NO'}, {label: '모름', value: 'UNKNOWN'}] },
];

export const petService = {

  getSpecies: async (): Promise<PetSpecies[]> => {
    if (USE_MOCK) return mockSpecies;

    const response = await typedClient.get('/api/v1/pets/species');
    return response.data as PetSpecies[];
  },

  getBreeds: async (speciesId?: number): Promise<PetBreed[]> => {
    if (USE_MOCK) {
      if (speciesId) {
        return mockBreeds.filter((b) => b.speciesId === speciesId);
      }
      return mockBreeds;
    }

    const response = await typedClient.get('/api/v1/pets/breeds', {
      params: speciesId ? { speciesId } : undefined,
    });
    return response.data as PetBreed[];
  },

  getMyPets: async (): Promise<Pet[]> => {
    if (USE_MOCK) return mockPets;

    const response = await typedClient.get('/api/v1/pets/my');
    return response.data as Pet[];
  },

  getPetAttributes: async (): Promise<PetAttribute[]> => {
    if (USE_MOCK) return []; // Or mock attributes if needed

    const response = await typedClient.get('/api/v1/pets/attributes');
    return response.data as PetAttribute[];
  },

  getPet: async (petId: number): Promise<Pet> => {
    if (USE_MOCK) {
      const pet = mockPets.find((p) => p.id === petId);
      if (!pet) throw new Error('Pet not found');
      return pet;
    }

    try {
      const response = await typedClient.getPath('/api/v1/pets/{petId}', { petId });
      return response.data as Pet;
    } catch {
      throw new Error('반려동물 정보를 불러올 수 없습니다.');
    }
  },

  createPet: async (data: CreatePetRequest): Promise<Pet> => {
    if (USE_MOCK) {
      console.log('Creating pet (mock):', data);
      return {
        id: Date.now(),
        ownerId: 0,
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
        profileImageUrls: data.profileImageUrl ? [data.profileImageUrl] : [],
        temperamentTags: data.temperamentTags?.split(',') ?? [],
      };
    }

    try {
      const response = await typedClient.post('/api/v1/pets', data);
      return response.data as Pet;
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
      const response = await typedClient.putPath('/api/v1/pets/{petId}', { petId }, data);
      return response.data as Pet;
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
      await typedClient.deletePath('/api/v1/pets/{petId}', { petId });
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
      const { compressImage } = await import('../utils/imageCompression');
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('category', 'pet');
      // Multipart — stays on apiClient; typedClient is JSON-only.
      const response = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url;
    } catch {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  },
};
