// TODO: Backend integration pending.
// Requires: UserStatus enum in User.kt, AuthService.login() status checks,
// 403 error codes (PASSWORD_EXPIRED), and client.ts interceptor + LoginPage.tsx redirect logic.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PasswordExpiryPage.css';

const PasswordExpiryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="account-notice-container">
      <img src="/assets/images/icon_password.svg" alt="비밀번호 만료" className="account-notice-icon" />
      <h1 className="account-notice-title">비밀번호 변경이 필요합니다</h1>
      <p className="account-notice-desc">
        비밀번호 유효기간이 만료되었습니다.<br />
        안전한 서비스 이용을 위해<br />
        비밀번호를 변경해 주세요.
      </p>
      <button className="account-notice-btn" onClick={() => navigate('/reset-password')}>
        비밀번호 변경
      </button>
      <button className="account-notice-link" onClick={() => navigate('/login')}>
        나중에 변경하기
      </button>
    </div>
  );
};

export default PasswordExpiryPage;
