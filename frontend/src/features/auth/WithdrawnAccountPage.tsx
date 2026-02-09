// TODO: Backend integration pending.
// Requires: UserStatus enum in User.kt, AuthService.login() status checks,
// 403 error codes (WITHDRAWN_ACCOUNT), and client.ts interceptor + LoginPage.tsx redirect logic.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WithdrawnAccountPage.css';

const WithdrawnAccountPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="account-notice-container">
      <img src="/assets/images/icon_withdrawn.svg" alt="탈퇴된 계정" className="account-notice-icon" />
      <h1 className="account-notice-title">탈퇴된 계정입니다</h1>
      <p className="account-notice-desc">
        이미 탈퇴 처리된 계정입니다.<br />
        재가입을 원하시면<br />
        고객센터로 문의해 주세요.
      </p>
      <button className="account-notice-btn" onClick={() => window.open('mailto:support@goldpet.com')}>
        고객센터 문의
      </button>
      <button className="account-notice-link" onClick={() => navigate('/login')}>
        로그인으로 돌아가기
      </button>
    </div>
  );
};

export default WithdrawnAccountPage;
