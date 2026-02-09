// TODO: Backend integration pending.
// Requires: UserStatus enum in User.kt, AuthService.login() status checks,
// 403 error codes (DORMANT_ACCOUNT), and client.ts interceptor + LoginPage.tsx redirect logic.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DormantAccountPage.css';

const DormantAccountPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="account-notice-container">
      <img src="/assets/images/icon_dormant.svg" alt="휴면 계정" className="account-notice-icon" />
      <h1 className="account-notice-title">휴면 계정 안내</h1>
      <p className="account-notice-desc">
        장기간 미접속으로 계정이 휴면 상태입니다.<br />
        계정을 다시 활성화하시려면<br />
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

export default DormantAccountPage;
