import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { goldService } from '../../services/goldService';
import { aiProfileService } from '../../services/aiProfileService';
import { useAlert } from '../../contexts/AlertContext';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import apiClient from '../../services/api/client';
import './AIProfilePage.css';

const CUSTOM_GOLD_COST = 100;
const MAX_CHARS = 500;

type PetType = 'dog' | 'cat' | 'other';

export default function AIProfileCustomPage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [petType, setPetType] = useState<PetType>('dog');
  const [uploadedImages, setUploadedImages] = useState<(string | null)[]>([null, null, null, null]);
  const [uploading, setUploading] = useState<boolean[]>([false, false, false, false]);
  const [prompt, setPrompt] = useState('');
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const { data: goldBalance } = useQuery({
    queryKey: ['gold', 'balance'],
    queryFn: () => goldService.getBalance(),
  });

  const createMutation = useMutation({
    mutationFn: aiProfileService.createRequest,
    onSuccess: (data) => {
      navigate(`/ai-profile/result/${data.id}`);
    },
    onError: () => {
      showAlert('프로필 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const petTypeLabel = (type: PetType) => {
    if (type === 'dog') return '강아지';
    if (type === 'cat') return '고양이';
    return '기타';
  };

  const handleSlotClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleFileChange = async (index: number, file: File | undefined) => {
    if (!file) return;

    const newUploading = [...uploading];
    newUploading[index] = true;
    setUploading(newUploading);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'ai-profile');
      const response = await apiClient.post<{ url: string }>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newImages = [...uploadedImages];
      newImages[index] = response.data.url;
      setUploadedImages(newImages);
    } catch {
      // Fallback to local object URL for mock/dev
      const objectUrl = URL.createObjectURL(file);
      const newImages = [...uploadedImages];
      newImages[index] = objectUrl;
      setUploadedImages(newImages);
    } finally {
      const finishedUploading = [...uploading];
      finishedUploading[index] = false;
      setUploading(finishedUploading);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newImages = [...uploadedImages];
    newImages[index] = null;
    setUploadedImages(newImages);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const filledImages = uploadedImages.filter(Boolean) as string[];

  const handleSubmit = () => {
    if (!prompt.trim()) {
      showAlert('원하는 스타일을 설명해주세요.');
      return;
    }

    if (goldBalance && goldBalance.balance < CUSTOM_GOLD_COST) {
      showAlert('골드가 부족합니다. 골드를 충전해주세요.');
      return;
    }

    const sourceImageUrl = filledImages[0] || null;

    createMutation.mutate({
      petId: 0,
      type: 'IMAGE',
      sourceImageUrl: sourceImageUrl ?? '/assets/images/common/pet_none_img.svg',
      stylePrompt: prompt.trim(),
      petType,
      mode: 'CUSTOM',
    });
  };

  return (
    <SubPageLayout title="원하는 대로 만들기">
      <div className="ai-custom-container">
        <div className="ai-custom-header">
          <strong className="ai-custom-title">원하는 프로필을<br />직접 설명해주세요</strong>
          <p className="ai-custom-subtitle">
            사진을 업로드하고 원하는 스타일을<br />
            자유롭게 입력하면 AI가 만들어드립니다.
          </p>
        </div>

        {goldBalance && (
          <div className="ai-custom-gold-info">
            <span className="ai-custom-gold-label">보유 골드</span>
            <span className="ai-custom-gold-amount">{goldBalance.balance} G</span>
          </div>
        )}

        {/* Pet Type Tabs */}
        <div>
          <p className="ai-custom-section-label">반려동물 종류</p>
          <div className="ai-custom-pet-tabs">
            {(['dog', 'cat', 'other'] as PetType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`ai-custom-tab-btn${petType === type ? ' active' : ''}`}
                onClick={() => setPetType(type)}
              >
                {petTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="ai-custom-upload-section">
          <p className="ai-custom-section-label">사진 업로드 (선택, 최대 4장)</p>
          <div className="ai-custom-upload-grid">
            {uploadedImages.map((img, index) => (
              <div
                key={index}
                className="ai-custom-upload-slot"
                onClick={() => !uploading[index] && handleSlotClick(index)}
              >
                {img ? (
                  <>
                    <img src={img} alt={`업로드 이미지 ${index + 1}`} className="preview" />
                    <button
                      type="button"
                      className="ai-custom-upload-remove"
                      onClick={(e) => handleRemoveImage(e, index)}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div className="ai-custom-upload-icon">
                      {uploading[index] ? '⏳' : '+'}
                    </div>
                    <span className="ai-custom-upload-label">
                      {uploading[index] ? '업로드 중...' : `사진 ${index + 1}`}
                    </span>
                  </>
                )}
                <input
                  ref={(el) => { fileInputRefs.current[index] = el; }}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(index, e.target.files?.[0])}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Textarea */}
        <div className="ai-custom-prompt-section">
          <p className="ai-custom-section-label">원하는 스타일 설명</p>
          <div className="ai-custom-prompt-wrap">
            <textarea
              className="ai-custom-prompt-txt"
              placeholder={`원하는 스타일을 자세히 설명해주세요\n예: 귀여운 카툰 스타일로 그려주세요. 배경은 꽃밭이면 좋겠어요.`}
              value={prompt}
              maxLength={MAX_CHARS}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <span className="ai-custom-char-count">{prompt.length}/{MAX_CHARS}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            필요한 골드: <strong style={{ color: '#FF9800' }}>{CUSTOM_GOLD_COST} G</strong>
          </p>
        </div>

        <button
          type="button"
          className="ai-custom-submit-btn"
          onClick={handleSubmit}
          disabled={!prompt.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? 'AI 프로필 생성 중...' : 'AI 프로필 생성하기'}
        </button>
      </div>
    </SubPageLayout>
  );
}
