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

const CAMERA_ICON = '/assets/images/common/camera_icon.svg';
const PLUS_ICON = '/assets/images/common/plus_icon.svg';

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
    onError: (error: any) => {
      const message = error?.response?.data?.message || '프로필 생성에 실패했습니다. 다시 시도해주세요.';
      showAlert(message);
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
      petId: null,
      type: 'IMAGE',
      sourceImageUrl: sourceImageUrl ?? '/assets/images/common/pet_none_img.svg',
      stylePrompt: prompt.trim(),
      petType,
      mode: 'CUSTOM',
    });
  };

  return (
    <SubPageLayout title="">
      <div className="ai-custom-container">
        {/* Title area */}
        <div className="ai-custom-header">
          <strong className="ai-custom-title">원하는 대로 만들기</strong>
          <p className="ai-custom-subtitle">옵션 선택과 프롬프트를 입력하여 만들기</p>
        </div>

        {/* Image upload: 4 inline slots */}
        <div className="ai-custom-upload-row">
          {uploadedImages.map((img, index) => (
            <div
              key={index}
              className="ai-custom-upload-slot"
              onClick={() => !uploading[index] && handleSlotClick(index)}
            >
              {img ? (
                <>
                  <img src={img} alt={`업로드 ${index + 1}`} className="ai-custom-upload-preview" />
                  <button
                    type="button"
                    className="ai-custom-upload-remove"
                    onClick={(e) => handleRemoveImage(e, index)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="ai-custom-upload-icon">
                  {uploading[index] ? '⏳' : index < 3 ? <img src={CAMERA_ICON} alt="" width={32} height={32} /> : <img src={PLUS_ICON} alt="" width={24} height={24} />}
                </div>
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

        {/* Pet type tabs */}
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

        {/* Prompt textarea */}
        <textarea
          className="ai-custom-prompt-txt"
          placeholder={"원하는 스타일을 자유롭게 설명해 주세요\n\n예) 꽃밭에서 뛰어노는 귀여운 모습\n예) 우주복을 입고 달 위에 서 있는 멋진 모습\n예) 지브리 애니메이션 스타일의 따뜻한 그림"}
          value={prompt}
          maxLength={MAX_CHARS}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Fixed bottom button */}
      <div className="ai-custom-bottom-btn">
        <button
          type="button"
          className="ai-custom-submit-btn"
          onClick={handleSubmit}
          disabled={!prompt.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? '프로필 생성 중...' : '프로필 생성하기'}
        </button>
      </div>
    </SubPageLayout>
  );
}
