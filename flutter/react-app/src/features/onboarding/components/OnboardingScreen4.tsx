import './OnboardingScreen.css';
import { useNavigate } from 'react-router-dom';

interface OnboardingScreen4Props {
  onNext: () => void;
}

export const OnboardingScreen4 = ({ onNext }: OnboardingScreen4Props) => {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onNext();
    // 권한 안내 화면으로 이동
    navigate('/permissions');
  };

  return (
    <div className="onboarding-screen" data-name="인트로_4" data-node-id="4017:20737">
      {/* Header */}
      <div className="onboarding-header" data-name="Header" data-node-id="4017:20933">
        <div className="onboarding-logo-area">
          <div className="onboarding-logo">
            <img 
              src="/assets/images/common/logo.svg" 
              alt="GoldPet" 
              className="onboarding-logo-img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="onboarding-title-section" data-name="Title" data-node-id="4017:20930">
        <h1 className="onboarding-title">산책 기록</h1>
        <p className="onboarding-subtitle">반려동물과의 산책을 기록해보세요.</p>
      </div>

      {/* Background - 화면 전체 너비 */}
      <div className="onboarding-card-bg" data-name="BG" data-node-id="4017:20914">
        <img 
          src="/assets/images/onboarding/body/onboarding_body_bg.png" 
          alt="Background" 
          className="onboarding-bg-image"
          onError={() => {
            console.error('Background image failed to load');
          }}
        />
      </div>

      {/* Main Content */}
      <div className="onboarding-content" data-name="Body" data-node-id="4017:20912">
        {/* Card: Img 오버레이 */}
        <div className="onboarding-card" data-name="Card" data-node-id="4017:20913">
          {/* Main Image (오버레이) */}
          <div className="onboarding-card-img" data-name="Img" data-node-id="4017:20916">
            <img 
              src="/assets/images/onboarding/body/onboarding_4_body.png" 
              alt="Onboarding Content" 
              className="onboarding-main-image"
              onError={() => {
                console.error('Main image failed to load');
              }}
            />
          </div>
        </div>

        {/* Indicator - 오버레이 */}
        <div className="onboarding-indicator" data-name="Indigator" data-node-id="4017:20929">
          <div className="indicator-dot" />
          <div className="indicator-dot" />
          <div className="indicator-dot" />
          <div className="indicator-dot active" />
        </div>
      </div>

      {/* Button */}
      <div className="onboarding-button-section" data-name="Btn" data-node-id="4017:20910">
        <button 
          className="onboarding-button"
          onClick={handleStart}
          data-name="Property 1=Full, Property 2=Primary"
          data-node-id="168:6785"
        >
          지금 골드펫 시작하기
        </button>
      </div>
    </div>
  );
};

