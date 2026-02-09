// TODO: Backend integration pending.
// Requires: Session timeout logic in client.ts interceptor,
// 401 error codes (AUTO_LOGOUT), and redirect logic.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AutoLogoutPage.css';

const AutoLogoutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="account-notice-container">
      <img src="/assets/images/icon_auto_logout.svg" alt="자동 로그아웃" className="account-notice-icon" />
      <h1 className="account-notice-title">자동 로그아웃 되었습니다</h1>
      <p className="account-notice-desc">
        장시간 활동이 없어<br />
        자동으로 로그아웃 되었습니다.<br />
        다시 로그인해 주세요.
      </p>
      <button className="account-notice-btn" onClick={() => navigate('/login')}>
        다시 로그인
      </button>
    </div>
  );
};

export default AutoLogoutPage;
