import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nativeBridge } from '../../bridge/nativeBridge';
import './PermissionsPage.css';

export const PermissionsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermissions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const results: { [key: string]: any } = {};

      // 위치 권한 요청
      try {
        console.log('위치 권한 요청 중...');
        results.location = await nativeBridge.callMethod('requestLocationPermission');
        console.log('위치 권한 결과:', results.location);
      } catch (error) {
        console.error('위치 권한 요청 실패:', error);
        results.location = { granted: false, error: error };
      }

      // 카메라 권한 요청
      try {
        console.log('카메라 권한 요청 중...');
        results.camera = await nativeBridge.callMethod('requestCameraPermission');
        console.log('카메라 권한 결과:', results.camera);
      } catch (error) {
        console.error('카메라 권한 요청 실패:', error);
        results.camera = { granted: false, error: error };
      }

      // 사진 권한 요청
      try {
        console.log('사진 권한 요청 중...');
        results.photo = await nativeBridge.callMethod('requestPhotoPermission');
        console.log('사진 권한 결과:', results.photo);
      } catch (error) {
        console.error('사진 권한 요청 실패:', error);
        results.photo = { granted: false, error: error };
      }

      // 권한 요청 완료 후 혜택 안내 화면으로 이동
      console.log('모든 권한 요청 완료:', results);
      navigate('/benefits');
    } catch (error) {
      console.error('권한 요청 중 오류 발생:', error);
      // 권한 거부 시에도 다음 화면으로 이동 (선택적)
      navigate('/benefits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/benefits');
  };

  return (
    <div className="permissions-page" style={{ padding: '22.22vw 4.44vw 0' }}>
      {/* Title Section */}
      <div className="permissions-title-section">
        <h2 className="permissions-title">앱 접근 권한 안내</h2>
      </div>

      <div className="permissions-content">
        <div className="permissions-list">
          <div className="permission-item">
            <div className="permission-icon-item">📍</div>
            <div className="permission-text">
              <h3>위치 정보</h3>
              <p>주변 친구 찾기 및 산책 경로 기록에 필요합니다.</p>
            </div>
          </div>

          <div className="permission-item">
            <div className="permission-icon-item">📷</div>
            <div className="permission-text">
              <h3>카메라</h3>
              <p>펫 사진 촬영 및 산책 중 사진 기록에 필요합니다.</p>
            </div>
          </div>

          <div className="permission-item">
            <div className="permission-icon-item">🖼️</div>
            <div className="permission-text">
              <h3>사진 라이브러리</h3>
              <p>앨범에서 사진을 선택하여 업로드할 때 필요합니다.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="permissions-footer">
        <button
          className="permissions-button primary"
          onClick={handleRequestPermissions}
          disabled={isLoading}
        >
          {isLoading ? '요청 중...' : '권한 허용하기'}
        </button>
        <button
          className="permissions-button secondary"
          onClick={handleSkip}
        >
          나중에 설정할게요
        </button>
      </div>
    </div>
  );
};

