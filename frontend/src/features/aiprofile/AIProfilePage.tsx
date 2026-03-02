import { useNavigate } from 'react-router-dom';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import './AIProfilePage.css';

export default function AIProfilePage() {
  const navigate = useNavigate();

  return (
    <SubPageLayout title="AI 프로필 만들기">
      <div className="ai-intro-container">
        <div className="ai-intro-txt-wrap">
          <strong className="ai-intro-title">나의 AI 반려동물을<br />만나보세요</strong>
          <p className="ai-intro-desc">
            평소에 상상했던 반려동물의 다양한 모습을<br />
            프로필로 만들어 보세요.<br /><br />
            반려동물이 없어도 걱정마세요.<br />
            당신이 원하는 AI 펫을 만들 수 있습니다.
          </p>
        </div>

        <div className="ai-intro-img-wrap">
          <img
            src="/assets/images/ai_make/intro_img.jpg"
            alt="AI 프로필 예시"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/main/main_slide_butler01.jpg';
            }}
          />
        </div>

        <div className="ai-intro-btn-wrap">
          <button
            type="button"
            className="ai-intro-btn ai-intro-btn--simple"
            onClick={() => navigate('/ai-profile/simple')}
          >
            간단하게 <strong>만들기</strong>
          </button>
          <button
            type="button"
            className="ai-intro-btn ai-intro-btn--custom"
            onClick={() => navigate('/ai-profile/custom')}
          >
            원하는 대로 <strong>만들기</strong>
          </button>
        </div>
      </div>
    </SubPageLayout>
  );
}
