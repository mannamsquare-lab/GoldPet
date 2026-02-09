import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { aiProfileService } from '../../services/aiProfileService';
import GenerationProgress from './components/GenerationProgress';
import ResultDisplay from './components/ResultDisplay';
import './AIProfilePage.css';

export default function AIProfileResultPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const { data: request } = useQuery({
    queryKey: ['ai-profile', 'request', requestId],
    queryFn: () => aiProfileService.getRequest(Number(requestId)),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 3000 : false;
    },
  });

  if (!request) {
    return (
      <div id="aiMake">
        <div className="ai_txt_wrap">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const isProcessing = request.status === 'PENDING' || request.status === 'PROCESSING';
  const isCompleted = request.status === 'COMPLETED';
  const isFailed = request.status === 'FAILED';

  return (
    <div id="aiMake">
      <div className="make_complete">
        <div className="ai_txt_wrap">
          <strong>
            {isProcessing && 'AI 프로필 생성 중'}
            {isCompleted && 'AI 프로필이 완성되었어요!'}
            {isFailed && '프로필 생성에 실패했어요'}
          </strong>
        </div>

        {isProcessing && <GenerationProgress status={request.status} />}

        {isCompleted && request.resultImageUrl && (
          <>
            <ResultDisplay imageUrl={request.resultImageUrl} promptText={request.stylePrompt || undefined} />

            <div className="btn_wrap">
              <button type="button" className="remake_btn" onClick={() => navigate('/ai-profile')}>
                다시 만들기
              </button>
              <button
                type="button"
                className="apply_btn"
                onClick={() => {
                  alert('프로필이 적용되었습니다!');
                  navigate('/profile');
                }}
              >
                프로필 적용하기
              </button>
            </div>
          </>
        )}

        {isFailed && (
          <div style={{ textAlign: 'center', marginTop: '6.67vw' }}>
            <p style={{ fontSize: '3.89vw', color: '#505050', marginBottom: '4.44vw' }}>
              프로필 생성 중 오류가 발생했습니다.
              <br />
              다시 시도해주세요.
            </p>
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
  );
}
