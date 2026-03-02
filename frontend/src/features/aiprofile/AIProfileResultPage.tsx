import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiProfileService } from '../../services/aiProfileService';
import { petService } from '../../services/petService';
import type { Pet } from '../../services/petService';
import { useToast } from '../../contexts/ToastContext';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import CustomSelect from '../../components/common/CustomSelect';
import './AIProfilePage.css';

export default function AIProfileResultPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [applyAs, setApplyAs] = useState<'MAIN' | 'ADDITIONAL'>('MAIN');

  const { data: request } = useQuery({
    queryKey: ['ai-profile', 'request', requestId],
    queryFn: () => aiProfileService.getRequest(Number(requestId)),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 3000 : false;
    },
  });

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['pets', 'my'],
    queryFn: () => petService.getMyPets(),
    enabled: showApplyModal,
  });

  const cancelMutation = useMutation({
    mutationFn: () => aiProfileService.cancelRequest(Number(requestId)),
    onSuccess: () => {
      showToast('요청이 취소되었습니다.');
      navigate('/ai-profile');
    },
    onError: () => {
      showToast('취소에 실패했습니다.', 'error');
    },
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      aiProfileService.applyToProfile(Number(requestId), {
        applyAs,
        petId: selectedPetId!,
      }),
    onSuccess: () => {
      showToast('프로필에 적용되었습니다!', 'success');
      setShowApplyModal(false);
      navigate('/mypage');
    },
    onError: () => {
      showToast('적용에 실패했습니다.', 'error');
    },
  });

  const handleOpenApplyModal = () => {
    if (pets.length === 0) {
      setSelectedPetId(null);
    } else {
      setSelectedPetId(pets[0].id);
    }
    setShowApplyModal(true);
  };

  const handleConfirmApply = () => {
    if (!selectedPetId) {
      showToast('반려동물을 선택해주세요.', 'error');
      return;
    }
    applyMutation.mutate();
  };

  if (!request) {
    return (
      <SubPageLayout title="AI 프로필 생성 중">
        <div id="aiMake">
          <div className="ai-result-loading">
            <div className="ai-result-spinner" />
            <p className="ai-result-loading-text">불러오는 중...</p>
          </div>
        </div>
      </SubPageLayout>
    );
  }

  const isProcessing = request.status === 'PENDING' || request.status === 'PROCESSING';
  const isCompleted = request.status === 'COMPLETED';
  const isFailed = request.status === 'FAILED';
  const isRefunded = request.status === 'REFUNDED';

  return (
    <SubPageLayout title={isProcessing ? 'AI 프로필 생성 중' : 'AI 프로필 완료'}>
      <div id="aiMake">
        <div className="make_complete">

          {/* PENDING / PROCESSING state */}
          {isProcessing && (
            <div className="ai-result-loading">
              <div className="ai-result-spinner" />
              <div className="ai_txt_wrap" style={{ marginTop: 24 }}>
                <strong>AI가 프로필을 생성하고 있어요...</strong>
                <p>잠시만 기다려 주세요.<br />완료되면 자동으로 결과가 표시됩니다.</p>
              </div>
              <button
                type="button"
                className="ai-result-cancel-btn"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? '취소 중...' : '생성 취소'}
              </button>
            </div>
          )}

          {/* COMPLETED state */}
          {isCompleted && request.resultUrl && (
            <>
              <div className="ai_txt_wrap">
                <strong>이미지 생성이 완료되었어요!</strong>
              </div>
              <div className="ai-result-image-wrap">
                <img
                  src={request.resultUrl}
                  alt="AI 생성 이미지"
                  className="ai-result-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/common/pet_none_img.svg';
                  }}
                />
              </div>
              {request.stylePrompt && (
                <p className="ai-result-prompt">{request.stylePrompt}</p>
              )}
              <div className="btn_wrap ai-result-btn-wrap">
                <button
                  type="button"
                  className="remake_btn ai-result-remake-btn"
                  onClick={() => navigate('/ai-profile')}
                >
                  다시 만들기
                </button>
                <button
                  type="button"
                  className="apply_btn ai-result-apply-btn"
                  onClick={handleOpenApplyModal}
                >
                  프로필 적용하기
                </button>
              </div>
            </>
          )}

          {/* FAILED state */}
          {isFailed && (
            <div className="ai-result-status-wrap">
              <div className="ai_txt_wrap">
                <strong style={{ color: 'var(--color-text-secondary)' }}>프로필 생성에 실패했어요</strong>
                <p>
                  프로필 생성 중 오류가 발생했습니다.<br />
                  골드가 환불되었습니다.
                </p>
              </div>
              <button
                type="button"
                className="submit_btn"
                onClick={() => navigate('/ai-profile')}
              >
                다시 시도하기
              </button>
            </div>
          )}

          {/* REFUNDED state */}
          {isRefunded && (
            <div className="ai-result-status-wrap">
              <div className="ai_txt_wrap">
                <strong style={{ color: 'var(--color-text-secondary)' }}>환불 처리됨</strong>
                <p>요청이 취소되어 골드가 환불되었습니다.</p>
              </div>
              <button
                type="button"
                className="submit_btn"
                onClick={() => navigate('/ai-profile')}
              >
                다시 만들기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="ai-apply-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="ai-apply-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-apply-modal-header">
              <h3>프로필 적용하기</h3>
              <button
                type="button"
                className="ai-apply-modal-close"
                onClick={() => setShowApplyModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="ai-apply-modal-body">
              {/* Pet selection */}
              <div className="ai-apply-field">
                <label className="ai-apply-label">반려동물 선택</label>
                {pets.length === 0 ? (
                  <p className="ai-apply-no-pets">등록된 반려동물이 없습니다.</p>
                ) : (
                  <CustomSelect
                    className="ai-apply-select"
                    value={selectedPetId != null ? String(selectedPetId) : ''}
                    options={pets.map((pet) => ({ label: pet.name, value: String(pet.id) }))}
                    placeholder="반려동물을 선택해 주세요"
                    onChange={(val) => setSelectedPetId(Number(val))}
                  />
                )}
              </div>

              {/* Apply mode */}
              <div className="ai-apply-field">
                <label className="ai-apply-label">적용 방식</label>
                <div className="ai-apply-radio-group">
                  <label className="ai-apply-radio-label">
                    <input
                      type="radio"
                      name="applyAs"
                      value="MAIN"
                      checked={applyAs === 'MAIN'}
                      onChange={() => setApplyAs('MAIN')}
                    />
                    <span>대표 이미지로 설정</span>
                  </label>
                  <label className="ai-apply-radio-label">
                    <input
                      type="radio"
                      name="applyAs"
                      value="ADDITIONAL"
                      checked={applyAs === 'ADDITIONAL'}
                      onChange={() => setApplyAs('ADDITIONAL')}
                    />
                    <span>추가 이미지로 등록</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="ai-apply-modal-footer">
              <button
                type="button"
                className="submit_btn"
                onClick={handleConfirmApply}
                disabled={applyMutation.isPending || !selectedPetId}
              >
                {applyMutation.isPending ? '적용 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SubPageLayout>
  );
}
