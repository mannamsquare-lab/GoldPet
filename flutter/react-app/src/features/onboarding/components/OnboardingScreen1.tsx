import './OnboardingScreen.css';

interface OnboardingScreen1Props {
  onNext: () => void;
}

export const OnboardingScreen1 = ({ onNext }: OnboardingScreen1Props) => {
  return (
    <div className="onboarding-screen" data-name="인트로_1" data-node-id="4017:20145">
      {/* Header */}
      <div className="onboarding-header" data-name="Header" data-node-id="4017:20341">
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
      <div className="onboarding-title-section" data-name="Title" data-node-id="4017:20338">
        <h1 className="onboarding-title">펫 메이팅</h1>
        <p className="onboarding-subtitle">반려동물을 위한 특별한 만남</p>
      </div>

      {/* Background - 화면 전체 너비 */}
      <div className="onboarding-card-bg" data-name="BG" data-node-id="4017:20322">
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
      <div className="onboarding-content" data-name="Body" data-node-id="4017:20320">
        {/* Card: Img 오버레이 */}
        <div className="onboarding-card" data-name="Card" data-node-id="4017:20321">
          {/* Main Image (오버레이) */}
          <div className="onboarding-card-img" data-name="Img" data-node-id="4017:20324">
            <img 
              src="/assets/images/onboarding/body/onboarding_1_body.png" 
              alt="Onboarding Content" 
              className="onboarding-main-image"
              onError={() => {
                console.error('Main image failed to load');
              }}
            />
          </div>
        </div>

        {/* Indicator - 오버레이 */}
        <div className="onboarding-indicator" data-name="Indigator" data-node-id="4017:20337">
          <div className="indicator-dot active" />
          <div className="indicator-dot" />
          <div className="indicator-dot" />
          <div className="indicator-dot" />
        </div>
      </div>

      {/* Button */}
      <div className="onboarding-button-section" data-name="Btn" data-node-id="4017:20318">
        <button 
          className="onboarding-button"
          onClick={onNext}
          data-name="Property 1=Full, Property 2=Primary"
          data-node-id="168:6785"
        >
          지금 골드펫 시작하기
        </button>
      </div>
    </div>
  );
};
