import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../services/api/client';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;
      login(accessToken, refreshToken, user);
      
      // 자동 로그인 설정
      if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
      }

      navigate('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnsLogin = (provider: 'naver' | 'kakao' | 'apple' | 'google') => {
    // SNS 로그인 처리 (추후 구현)
    console.log(`${provider} 로그인`);
  };

  return (
    <div className="login-page" data-name="로그인_텍스트홀더" data-node-id="4017:22523">
      {/* Title Section */}
      <div className="login-title-section" data-name="Title" data-node-id="4017:22554">
        <div className="login-logo-container">
          <img 
            src="/assets/images/common/logo.svg" 
            alt="GoldPet" 
            className="login-logo"
          />
        </div>
        <p className="login-subtitle">로그인 정보를 입력해 주세요</p>
      </div>

      {/* Login Form */}
      <div className="login-body" data-name="Body" data-node-id="4017:22525">
        <form className="login-form" onSubmit={handleLogin} data-name="login" data-node-id="4017:22526">
          <div className="login-input-group">
            <input
              type="text"
              className="login-input login-input-top"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <div className="login-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input login-input-bottom"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                data-name="ic_invisible"
                data-node-id="4017:22532"
              >
                <img 
                  src={showPassword ? "/assets/images/auth/ic_eye_off.svg" : "/assets/images/auth/ic_eye.svg"}
                  alt={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="login-password-icon"
                  onError={(e) => {
                    console.error('Password icon failed to load');
                    // 아이콘 로드 실패 시 텍스트로 대체
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const text = document.createTextNode(showPassword ? '👁️‍🗨️' : '👁️');
                    target.parentElement?.appendChild(text);
                  }}
                />
              </button>
            </div>
          </div>

          <div className="login-button-group" data-name="btn" data-node-id="4017:22536">
            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
              data-name="Btn/Basic/Full"
              data-node-id="4017:22539"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="login-options" data-node-id="4017:22540">
            <label className="login-auto-login" data-name="auto" data-node-id="4017:22541">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="login-checkbox"
              />
              <span className="login-checkbox-label">자동 로그인</span>
            </label>
            <div className="login-links">
              <button
                type="button"
                className="login-link"
                onClick={() => navigate('/find-username')}
              >
                아이디 찾기
              </button>
              <button
                type="button"
                className="login-link"
                onClick={() => navigate('/reset-password')}
              >
                비밀번호 변경
              </button>
              <button
                type="button"
                className="login-link"
                onClick={() => navigate('/signup')}
              >
                회원가입
              </button>
            </div>
          </div>
        </form>

        {/* SNS Login */}
        <div className="login-sns" data-name="sns" data-node-id="4017:22547">
          <p className="login-sns-title">SNS 계정으로 로그인/회원가입</p>
          <div className="login-sns-buttons" data-name="Logo" data-node-id="4017:22549">
            <button
              type="button"
              className="login-sns-button"
              onClick={() => handleSnsLogin('naver')}
              aria-label="네이버 로그인"
            >
              <img 
                src="/assets/images/auth/naver_logo.svg" 
                alt="네이버"
                className="login-sns-logo"
                onError={(e) => {
                  console.error('Naver logo failed to load');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.textContent = 'N';
                    target.parentElement.style.backgroundColor = '#03C75A';
                    target.parentElement.style.color = '#FFFFFF';
                    target.parentElement.style.fontWeight = 'bold';
                  }
                }}
              />
            </button>
            <button
              type="button"
              className="login-sns-button"
              onClick={() => handleSnsLogin('kakao')}
              aria-label="카카오 로그인"
            >
              <img 
                src="/assets/images/auth/kakao_logo.svg" 
                alt="카카오"
                className="login-sns-logo"
                onError={(e) => {
                  console.error('Kakao logo failed to load');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.textContent = 'K';
                    target.parentElement.style.backgroundColor = '#FEE500';
                    target.parentElement.style.color = '#000000';
                    target.parentElement.style.fontWeight = 'bold';
                  }
                }}
              />
            </button>
            <button
              type="button"
              className="login-sns-button login-sns-button-apple"
              onClick={() => handleSnsLogin('apple')}
              aria-label="애플 로그인"
            >
              <img 
                src="/assets/images/auth/apple_logo.svg" 
                alt="애플"
                className="login-sns-logo"
                onError={(e) => {
                  console.error('Apple logo failed to load');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.textContent = '🍎';
                    target.parentElement.style.fontSize = '24px';
                  }
                }}
              />
            </button>
            <button
              type="button"
              className="login-sns-button login-sns-button-google"
              onClick={() => handleSnsLogin('google')}
              aria-label="구글 로그인"
            >
              <img 
                src="/assets/images/auth/google_logo.svg" 
                alt="구글"
                className="login-sns-logo"
                onError={(e) => {
                  console.error('Google logo failed to load');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.textContent = 'G';
                    target.parentElement.style.backgroundColor = '#FFFFFF';
                    target.parentElement.style.color = '#4285F4';
                    target.parentElement.style.fontWeight = 'bold';
                  }
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

