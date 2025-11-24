import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/api/client';
import './SnsSignupPage.css';
import { Header } from '../../components/common/Header';

export const SnsSignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 파라미터나 location state에서 SNS 제공자 정보 가져오기
  const snsProvider = location.state?.provider || 'SNS';

  const [formData, setFormData] = useState({
    nickname: '',
    petName: '',
    petType: '',
    petBirthday: '',
    petGender: '',
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
      const response = await apiClient.post('/auth/check-nickname', {
        nickname: formData.nickname,
      });
      setIsNicknameAvailable(response.data.available);
      if (!response.data.available) {
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
    // 반려동물 이름
    if (!formData.petName) {
      return false;
    }
    // 반려동물 종류
    if (!formData.petType) {
      return false;
    }
    // 반려동물 생년월일
    if (!formData.petBirthday) {
      return false;
    }
    // 반려동물 성별
    if (!formData.petGender) {
      return false;
    }
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
      if (!formData.petName) {
        newErrors.petName = '반려동물 이름을 입력해주세요.';
      }
      if (!formData.petType) {
        newErrors.petType = '반려동물 종류를 선택해주세요.';
      }
      if (!formData.petBirthday) {
        newErrors.petBirthday = '반려동물 생년월일을 입력해주세요.';
      }
      if (!formData.petGender) {
        newErrors.petGender = '반려동물 성별을 선택해주세요.';
      }
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/sns-signup', {
        provider: snsProvider,
        nickname: formData.nickname,
        petName: formData.petName,
        petType: formData.petType,
        petBirthday: formData.petBirthday,
        petGender: formData.petGender,
      });

      navigate('/signup/complete');
    } catch (error: any) {
      console.error('SNS signup error:', error);
      alert(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header />

      {/* Title Section */}
      <div className="page-title-section">
        <h1 className="page-title">추가 정보 입력</h1>
        <p className="page-subtitle">SNS 계정으로 가입하신 경우, 추가 정보를 입력해주세요.</p>
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

          {/* 반려동물 이름 입력 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">반려동물 이름</label>
            <input
              type="text"
              name="petName"
              className={`sns-signup-input sns-signup-input-rounded ${errors.petName ? 'error' : ''}`}
              placeholder="반려동물 이름을 입력해주세요"
              value={formData.petName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.petName && (
              <span className="sns-signup-error-message">{errors.petName}</span>
            )}
          </div>

          {/* 반려동물 종류 선택 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">반려동물 종류</label>
            <select
              name="petType"
              className={`sns-signup-input sns-signup-input-rounded sns-signup-select ${errors.petType ? 'error' : ''}`}
              value={formData.petType}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">반려동물 종류를 선택해주세요</option>
              <option value="dog">강아지</option>
              <option value="cat">고양이</option>
              <option value="other">기타</option>
            </select>
            {errors.petType && (
              <span className="sns-signup-error-message">{errors.petType}</span>
            )}
          </div>

          {/* 반려동물 생년월일 입력 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">반려동물 생년월일</label>
            <input
              type="date"
              name="petBirthday"
              className={`sns-signup-input sns-signup-input-rounded ${errors.petBirthday ? 'error' : ''}`}
              value={formData.petBirthday}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.petBirthday && (
              <span className="sns-signup-error-message">{errors.petBirthday}</span>
            )}
          </div>

          {/* 반려동물 성별 선택 */}
          <div className="sns-signup-input-group">
            <label className="sns-signup-input-label">반려동물 성별</label>
            <select
              name="petGender"
              className={`sns-signup-input sns-signup-input-rounded sns-signup-select ${errors.petGender ? 'error' : ''}`}
              value={formData.petGender}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">반려동물 성별을 선택해주세요</option>
              <option value="male">수컷</option>
              <option value="female">암컷</option>
              <option value="neutralized">중성화</option>
            </select>
            {errors.petGender && (
              <span className="sns-signup-error-message">{errors.petGender}</span>
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

