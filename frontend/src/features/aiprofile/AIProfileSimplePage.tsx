import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { petService, type Pet } from '../../services/petService';
import { aiProfileService } from '../../services/aiProfileService';
import { useAlert } from '../../contexts/AlertContext';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import './AIProfilePage.css';

export default function AIProfileSimplePage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ['pets', 'my'],
    queryFn: () => petService.getMyPets(),
  });

  const selectedPet: Pet | undefined =
    pets.find((p) => p.id === selectedPetId) ?? pets[0];

  const createMutation = useMutation({
    mutationFn: aiProfileService.createRequest,
    onSuccess: (data) => {
      navigate(`/ai-profile/result/${data.id}`);
    },
    onError: () => {
      showAlert('프로필 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const genderLabel = (gender?: string) => {
    if (gender === 'MALE') return '수컷';
    if (gender === 'FEMALE') return '암컷';
    return '미등록';
  };

  const handleSubmit = () => {
    if (!selectedPet) {
      showAlert('반려동물을 먼저 등록해주세요.');
      return;
    }

    const sourceImageUrl =
      selectedPet.profileImageUrl ||
      selectedPet.profileImageUrls?.[0] ||
      '/assets/images/common/pet_none_img.svg';

    createMutation.mutate({
      petId: selectedPet.id,
      type: 'IMAGE',
      sourceImageUrl,
      stylePrompt: null,
      mode: 'SIMPLE',
    });
  };

  const additionalImages = selectedPet?.profileImageUrls?.slice(1, 4) ?? [];

  return (
    <SubPageLayout title="간단하게 만들기">
      <div className="ai-simple-container">

        {/* Pet selector (only shown when >1 pet) */}
        {pets.length > 1 && (
          <div className="ai-simple-pet-selector">
            {pets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                className={`ai-simple-pet-selector-btn${selectedPet?.id === pet.id ? ' active' : ''}`}
                onClick={() => setSelectedPetId(pet.id)}
              >
                {pet.name}
              </button>
            ))}
          </div>
        )}

        {petsLoading ? (
          <div className="ai-simple-loading">반려동물 정보를 불러오는 중...</div>
        ) : selectedPet ? (
          <>
            {/* Large blob-masked hero image */}
            <div className="ai-simple-hero-img-wrap">
              <img
                src={
                  selectedPet.profileImageUrl ||
                  selectedPet.profileImageUrls?.[0] ||
                  '/assets/images/common/pet_none_img.svg'
                }
                alt={selectedPet.name}
                className="ai-simple-hero-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/common/pet_none_img.svg';
                }}
              />
            </div>

            {/* Additional images strip */}
            {additionalImages.length > 0 && (
              <div className="ai-simple-extra-imgs">
                {additionalImages.map((url, i) => (
                  <div key={i} className="ai-simple-extra-img-wrap">
                    <img
                      src={url}
                      alt={`추가 사진 ${i + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/common/pet_none_img.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pet info card */}
            <div className="ai-simple-info-card">
              <h3 className="ai-simple-pet-name">{selectedPet.name}</h3>
              <div className="ai-simple-info-rows">
                <div className="ai-simple-info-row">
                  <span className="ai-simple-info-label">종류</span>
                  <span className="ai-simple-info-value">{selectedPet.species || '미등록'}</span>
                </div>
                <div className="ai-simple-info-row">
                  <span className="ai-simple-info-label">품종</span>
                  <span className="ai-simple-info-value">{selectedPet.breed || '미등록'}</span>
                </div>
                <div className="ai-simple-info-row">
                  <span className="ai-simple-info-label">성별</span>
                  <span className="ai-simple-info-value">{genderLabel(selectedPet.gender)}</span>
                </div>
                {selectedPet.temperamentTags && selectedPet.temperamentTags.length > 0 && (
                  <div className="ai-simple-info-row ai-simple-info-row--tags">
                    <span className="ai-simple-info-label">특징</span>
                    <div className="ai-simple-pet-tags">
                      {selectedPet.temperamentTags.map((tag) => (
                        <span key={tag} className="ai-simple-pet-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="ai-simple-no-pet">
            <p>등록된 반려동물이 없습니다.</p>
            <button
              type="button"
              className="ai-simple-no-pet-btn"
              onClick={() => navigate('/pet/register')}
            >
              반려동물 등록하기
            </button>
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          className="ai-simple-submit-btn"
          onClick={handleSubmit}
          disabled={!selectedPet || createMutation.isPending}
        >
          {createMutation.isPending ? 'AI 프로필 생성 중...' : '프로필 생성하기'}
        </button>
      </div>
    </SubPageLayout>
  );
}
