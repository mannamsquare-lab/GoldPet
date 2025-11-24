import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupCompletePage.css';

export const SignupCompletePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 3초 후 자동으로 로그인 화면으로 이동
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="signup-complete-page">
      <div className="signup-complete-content">
        <div className="signup-complete-icon">✓</div>
        <h1 className="signup-complete-title">회원가입이 완료되었습니다</h1>
        <p className="signup-complete-subtitle">
          골드펫과 함께<br />
          반려동물과의 특별한 시간을 만들어보세요!
        </p>
        <div className="signup-complete-button-group">
          <button
            type="button"
            className="signup-complete-button"
            onClick={handleGoToLogin}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

