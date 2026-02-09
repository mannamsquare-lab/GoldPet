import { useNavigate } from 'react-router-dom';
import './AIProfilePage.css';

export default function AIProfilePage() {
  const navigate = useNavigate();

  return (
    <div id="aiMake">
      <div className="make_intro">
        <div className="ai_txt_wrap">
          <strong>AI 프로필을 만들어 보세요!</strong>
          <p>
            우리 아이의 특별한 프로필을 AI가 만들어드려요.
            <br />
            간단하게 또는 원하는 대로 선택해보세요!
          </p>
        </div>

        <div className="img_wrap">
          <img
            src="/assets/images/main/main_slide_butler01.jpg"
            alt="AI Profile Example"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div className="btn_wrap">
          <button type="button" onClick={() => navigate('/ai-profile/styles?mode=simple')}>
            간단하게 만들기
          </button>
          <button type="button" onClick={() => navigate('/ai-profile/styles?mode=custom')}>
            원하는 대로 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
