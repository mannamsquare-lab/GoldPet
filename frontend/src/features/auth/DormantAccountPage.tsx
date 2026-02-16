import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DormantAccountPage.css';

const DormantAccountPage: React.FC = () => {
  const navigate = useNavigate();

  const handleActivate = () => {
    // TODO: Call API to activate dormant account
    navigate('/login');
  };

  return (
    <div className="dormant-account-page">
      <div className="dormant-account-body">
        <div className="typea-title-group-bc">
          <h1 className="typea-title">휴면 계정 안내</h1>
        </div>
        <div className="dormant-account-description">
          <p>고객님은 OOO을 1년 동안 이용하지 않아<br />휴면상태가 되었습니다.</p>
          <p>OOO 서비스를 다시 이용하시려면 버튼을<br />클릭해주세요.</p>
        </div>

        <div className="dormant-account-info-box">
          <p>최근 접속일 : 2021. 01. 29</p>
          <p>휴면 전환일 : 2022. 01. 29</p>
        </div>
      </div>

      <div className="dormant-account-button-container">
        <button className="dormant-account-button" onClick={handleActivate}>
          휴면 해제
        </button>
      </div>
    </div>
  );
};

export default DormantAccountPage;
