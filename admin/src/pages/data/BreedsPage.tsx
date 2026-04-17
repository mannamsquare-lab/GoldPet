import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { breedService } from '../../services/breedService';
import type { BreedResponse, SpeciesResponse } from '../../services/breedService';
import { Button } from '../../components/common/Button';
import { useConfirm } from '@/hooks/useConfirm'

interface BreedsPageProps {
  embedded?: boolean;
}

const BreedsPage: React.FC<BreedsPageProps> = ({ embedded = false }) => {
  const queryClient = useQueryClient();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirm()
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<BreedResponse | null>(null);
  const [formData, setFormData] = useState({ speciesId: 0, name: '', category: '', description: '' });

  const { data: species = [] } = useQuery<SpeciesResponse[]>({
    queryKey: ['species'],
    queryFn: breedService.getSpecies,
  });

  const { data: breeds = [], isLoading } = useQuery<BreedResponse[]>({
    queryKey: ['breeds', selectedSpeciesId],
    queryFn: () => breedService.getBreeds(selectedSpeciesId),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { speciesId: number; name: string; category: string; description: string }) => {
      if (editingBreed) {
        return breedService.updateBreed(editingBreed.id, {
          name: data.name,
          category: data.category || undefined,
          description: data.description || undefined,
        });
      } else {
        return breedService.createBreed({
          speciesId: data.speciesId,
          name: data.name,
          category: data.category || undefined,
          description: data.description || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (breedId: number) => breedService.deleteBreed(breedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
    },
  });

  const handleOpenModal = (breed?: BreedResponse) => {
    if (breed) {
      setEditingBreed(breed);
      setFormData({
        speciesId: breed.speciesId,
        name: breed.name,
        category: breed.category || '',
        description: breed.description || '',
      });
    } else {
      setEditingBreed(null);
      setFormData({ speciesId: selectedSpeciesId || 0, name: '', category: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBreed(null);
    setFormData({ speciesId: 0, name: '', category: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleDelete = async (breedId: number) => {
    if (!(await confirmDialog({ description: '정말 삭제하시겠습니까?', variant: 'destructive' }))) return;
    deleteMutation.mutate(breedId);
  };

  const getSpeciesName = (speciesId: number) => {
    return species.find((s) => s.id === speciesId)?.name || '-';
  };

  return (
    <div className={embedded ? '' : 'p-6'}>
      {!embedded && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">품종 관리</h1>
        </div>
      )}

      <div className={`flex justify-between items-center ${embedded ? 'mb-4' : 'mb-6'}`}>
        <div></div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + 품종 추가
        </Button>
      </div>

      {submitMutation.isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          저장에 실패했습니다.
        </div>
      )}
      {deleteMutation.isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          삭제에 실패했습니다.
        </div>
      )}

      {/* Species Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">종 선택</label>
        <select
          value={selectedSpeciesId || ''}
          onChange={(e) => setSelectedSpeciesId(e.target.value ? Number(e.target.value) : undefined)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-48"
        >
          <option value="">전체</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Breeds Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">분류</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">품종명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : breeds.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">등록된 품종이 없습니다.</td>
              </tr>
            ) : (
              breeds.map((breed) => (
                <tr key={breed.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{breed.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSpeciesName(breed.speciesId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{breed.category || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{breed.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{breed.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="link" size="sm" onClick={() => handleOpenModal(breed)}>
                      수정
                    </Button>
                    <Button variant="link" size="sm" className="text-red-600 hover:text-red-900" onClick={() => handleDelete(breed.id)}>
                      삭제
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingBreed ? '품종 수정' : '품종 추가'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">종</label>
                <select
                  value={formData.speciesId}
                  onChange={(e) => setFormData({ ...formData, speciesId: Number(e.target.value) })}
                  disabled={!!editingBreed}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                  required
                >
                  <option value="">선택해주세요</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">분류 (예: 소형견, 단모종)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="분류를 입력하세요"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">품종명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="품종명을 입력하세요"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  저장
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    {ConfirmDialog}
    </div>
  );
};

export default BreedsPage;
