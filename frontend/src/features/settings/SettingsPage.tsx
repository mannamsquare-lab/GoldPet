import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAlert } from '../../contexts/AlertContext';
import { useToast } from '../../contexts/ToastContext';
import { settingsService } from '../../services/settingsService';
import type { NotificationSettings, PrivacySettings } from '../../services/settingsService';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { showConfirm } = useAlert();
  const { showToast } = useToast();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    walkAlert: true,
    chatAlert: true,
    friendAlert: true,
    communityAlert: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    locationSharing: true,
    profilePublic: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [notifications, privacy] = await Promise.all([
        settingsService.getNotificationSettings(),
        settingsService.getPrivacySettings(),
      ]);
      setNotificationSettings(notifications);
      setPrivacySettings(privacy);
    } catch (error) {
      showToast('설정을 불러오는데 실패했습니다.', 'error');
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);
    try {
      await settingsService.updateNotificationSettings(newSettings);
      showToast('알림 설정이 변경되었습니다.', 'success');
    } catch (error) {
      setNotificationSettings(notificationSettings);
      showToast('알림 설정 변경에 실패했습니다.', 'error');
    }
  };

  const handlePrivacyToggle = async (key: keyof PrivacySettings) => {
    const newSettings = { ...privacySettings, [key]: !privacySettings[key] };
    setPrivacySettings(newSettings);
    try {
      await settingsService.updatePrivacySettings(newSettings);
      showToast('개인정보 설정이 변경되었습니다.', 'success');
    } catch (error) {
      setPrivacySettings(privacySettings);
      showToast('개인정보 설정 변경에 실패했습니다.', 'error');
    }
  };

  const handlePasswordChange = () => {
    navigate('/profile/password-change');
  };

  const handleLogout = () => {
    showConfirm('로그아웃 하시겠습니까?', () => {
      logout();
      navigate('/login');
      showToast('로그아웃 되었습니다.', 'success');
    });
  };

  const handleDeleteAccount = () => {
    showConfirm('정말로 회원탈퇴 하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.', () => {
      showToast('회원탈퇴가 처리되었습니다.', 'success');
      logout();
      navigate('/login');
    });
  };

  const handleTermsClick = () => {
    navigate('/profile/terms');
  };

  const handlePrivacyPolicyClick = () => {
    navigate('/profile/privacy-policy');
  };

  return (
    <div className="settings-container">
      {/* Notification Settings */}
      <div className="settings-section">
        <span className="section-title">알림 설정</span>
        <div className="settings-toggle">
          <span className="toggle-label">산책 알림</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="walk-alert"
              checked={notificationSettings.walkAlert}
              onChange={() => handleNotificationToggle('walkAlert')}
            />
            <label htmlFor="walk-alert"></label>
          </div>
        </div>
        <div className="settings-toggle">
          <span className="toggle-label">채팅 알림</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="chat-alert"
              checked={notificationSettings.chatAlert}
              onChange={() => handleNotificationToggle('chatAlert')}
            />
            <label htmlFor="chat-alert"></label>
          </div>
        </div>
        <div className="settings-toggle">
          <span className="toggle-label">친구 알림</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="friend-alert"
              checked={notificationSettings.friendAlert}
              onChange={() => handleNotificationToggle('friendAlert')}
            />
            <label htmlFor="friend-alert"></label>
          </div>
        </div>
        <div className="settings-toggle">
          <span className="toggle-label">커뮤니티 알림</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="community-alert"
              checked={notificationSettings.communityAlert}
              onChange={() => handleNotificationToggle('communityAlert')}
            />
            <label htmlFor="community-alert"></label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="settings-section">
        <span className="section-title">개인정보 설정</span>
        <div className="settings-toggle">
          <span className="toggle-label">위치 공유</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="location-sharing"
              checked={privacySettings.locationSharing}
              onChange={() => handlePrivacyToggle('locationSharing')}
            />
            <label htmlFor="location-sharing"></label>
          </div>
        </div>
        <div className="settings-toggle">
          <span className="toggle-label">프로필 공개</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="profile-public"
              checked={privacySettings.profilePublic}
              onChange={() => handlePrivacyToggle('profilePublic')}
            />
            <label htmlFor="profile-public"></label>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="settings-section">
        <span className="section-title">계정 관리</span>
        <div className="settings-link" onClick={handlePasswordChange}>
          <span>비밀번호 변경</span>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
        <div className="settings-link" onClick={handleLogout}>
          <span>로그아웃</span>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-danger">
        <button type="button" className="danger-link" onClick={handleDeleteAccount}>
          회원탈퇴
        </button>
      </div>

      {/* App Info */}
      <div className="settings-section">
        <span className="section-title">앱 정보</span>
        <div className="settings-link" onClick={handleTermsClick}>
          <span>이용약관</span>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
        <div className="settings-link" onClick={handlePrivacyPolicyClick}>
          <span>개인정보처리방침</span>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
      </div>

      <div className="settings-app-info">
        <span className="version">앱 버전 v1.0.0</span>
      </div>
    </div>
  );
};

export default SettingsPage;
