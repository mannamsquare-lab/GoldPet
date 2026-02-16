import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import './SnsSignupPage.css';
import { useAlert } from '../../contexts/AlertContext';

export const SnsSignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const { showAlert } = useAlert();

  // URL 파라미터나 location state에서 SNS 제공자 정보 가져오기
  const snsProvider = location.state?.provider || 'SNS';

  const [formData, setFormData] = useState({
    nickname: '',
    name: '',
    birthDate: '',
    gender: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // 닉네임 변경 시 중복체크 상태 초기화
    if (name === 'nickname') {
      setIsNicknameAvailable(null);
    }
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname || formData.nickname.length < 2 || formData.nickname.length > 10) {
      setErrors(prev => ({ ...prev, nickname: '닉네임은 2-10자 한글, 영문, 숫자로 입력해주세요.' }));
      return;
    }

    setIsCheckingNickname(true);
    try {
      const response = await authService.checkNickname(formData.nickname);
      setIsNicknameAvailable(response.available);
      if (!response.available) {
        setErrors(prev => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
      }
    } catch (error: any) {
      console.error('Nickname check error:', error);
      setIsNicknameAvailable(false);
      setErrors(prev => ({ ...prev, nickname: error.response?.data?.message || '닉네임 확인에 실패했습니다.' }));
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const isFormValid = () => {
    // 닉네임: 2-10자, 중복확인 완료
    if (!formData.nickname || formData.nickname.length < 2 || formData.nickname.length > 10 || isNicknameAvailable !== true) {
      return false;
    }
    // 이름
    if (!formData.name) return false;
    // 생년월일
    if (!formData.birthDate) return false;
    // 성별
    if (!formData.gender) return false;
    // 휴대폰 번호
    if (!formData.phoneNumber) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      const newErrors: { [key: string]: string } = {};
      if (!formData.nickname || formData.nickname.length < 2 || formData.nickname.length > 10) {
        newErrors.nickname = '닉네임은 2-10자 한글, 영문, 숫자로 입력해주세요.';
      } else if (isNicknameAvailable !== true) {
        newErrors.nickname = '닉네임 중복확인을 해주세요.';
      }
      if (!formData.name) newErrors.name = '이름을 입력해주세요.';
      if (!formData.birthDate) newErrors.birthDate = '생년월일을 입력해주세요.';
      if (!formData.gender) newErrors.gender = '성별을 선택해주세요.';
      if (!formData.phoneNumber) newErrors.phoneNumber = '휴대폰 번호를 입력해주세요.';

      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.snsSignup({
        provider: snsProvider,
        nickname: formData.nickname,
        name: formData.name,
        birthDate: formData.birthDate,
        gender: formData.gender as 'MALE' | 'FEMALE',
        phoneNumber: formData.phoneNumber,
      });

      // Auto login after signup
      const { user, accessToken, refreshToken } = response;
      const currentToken = localStorage.getItem('accessToken') || accessToken;

      if (currentToken) {
        login(currentToken, refreshToken || '', user);
      }

      navigate('/signup/complete');
    } catch (error: any) {
      console.error('SNS signup error:', error);
      showAlert(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>

      {/* Title Section */}
      <div className="typea-title-group-bc">
        <h1 className="typea-title">SNS 회원가입</h1>
        <p className="typea-subtitle">추가 정보 입력을 통해 회원가입을 완료해주세요.</p>
      </div>

      <div className="sns-signup-body">
        <form className="sns-signup-form" onSubmit={handleSubmit}>
          {/* 닉네임 입력 - 중복체크 버튼 포함 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">닉네임</label>
            <div className="sns-signup-input-row">
              <input
                type="text"
                name="nickname"
                className={`sns-signup-input sns-signup-input-username ${errors.nickname ? 'error' : ''} ${isNicknameAvailable === true ? 'success' : ''}`}
                placeholder="2-10자, 한글, 영문, 숫자"
                value={formData.nickname}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className={`sns-signup-check-button ${formData.nickname.length >= 2 && formData.nickname.length <= 10 ? 'active' : ''}`}
                onClick={handleCheckNickname}
                disabled={isLoading || isCheckingNickname || formData.nickname.length < 2 || formData.nickname.length > 10}
              >
                {isCheckingNickname ? '확인 중...' : '중복확인'}
              </button>
            </div>
            {errors.nickname && (
              <span className="sns-signup-error-message">{errors.nickname}</span>
            )}
            {isNicknameAvailable === true && !errors.nickname && (
              <span className="sns-signup-success-message">사용 가능한 닉네임입니다.</span>
            )}
          </div>

          {/* 이름 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">이름</label>
            <input
              type="text"
              name="name"
              className={`sns-signup-input sns-signup-input-rounded ${errors.name ? 'error' : ''}`}
              placeholder="이름을 입력해주세요"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.name && (
              <span className="sns-signup-error-message">{errors.name}</span>
            )}
          </div>

          {/* 생년월일 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">생년월일</label>
            <input
              type="date"
              name="birthDate"
              className={`sns-signup-input sns-signup-input-rounded ${errors.birthDate ? 'error' : ''}`}
              value={formData.birthDate}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.birthDate && (
              <span className="sns-signup-error-message">{errors.birthDate}</span>
            )}
          </div>

          {/* 성별 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">성별</label>
            <select
              name="gender"
              className={`sns-signup-input sns-signup-input-rounded sns-signup-select ${errors.gender ? 'error' : ''}`}
              value={formData.gender}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">성별을 선택해주세요</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
            {errors.gender && (
              <span className="sns-signup-error-message">{errors.gender}</span>
            )}
          </div>

          {/* 휴대폰 번호 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">휴대폰 번호</label>
            <input
              type="tel"
              name="phoneNumber"
              className={`sns-signup-input sns-signup-input-rounded ${errors.phoneNumber ? 'error' : ''}`}
              placeholder="휴대폰 번호를 입력해주세요 (- 제외)"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <span className="sns-signup-error-message">{errors.phoneNumber}</span>
            )}
          </div>

          <div className="sns-signup-button-group">
            <button
              type="submit"
              className="sns-signup-button"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

