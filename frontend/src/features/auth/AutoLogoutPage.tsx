// TODO: Backend integration pending.
// Requires: Session timeout logic in client.ts interceptor,
// 401 error codes (AUTO_LOGOUT), and redirect logic.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AutoLogoutPage.css';

const AutoLogoutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auto-logout-page">
      <div className="auto-logout-body">
        <div className="typea-title-group-bc">
          <h1 className="typea-title">자동 로그아웃</h1>
        </div>
        <div className="auto-logout-description">
          <p>일정시간 동안 서비스 미사용으로<br />OOO 서비스에서 자동으로 로그아웃 되었습니다.</p>
        </div>
      </div>

      <div className="auto-logout-button-container">
        <button className="auto-logout-button" onClick={() => navigate('/login')}>
          로그인
        </button>
      </div>
    </div>
  );
};

export default AutoLogoutPage;
