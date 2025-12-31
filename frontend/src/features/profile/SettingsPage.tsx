import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profileService';
import type { SettingsData } from '../../services/profileService';
import './ProfilePage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: profileService.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: profileService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleToggle = (category: keyof SettingsData, key: string, value: boolean) => {
    if (!settings) return;
    updateMutation.mutate({
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  const handleLogout = async () => {
    await profileService.logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    await profileService.deleteAccount();
    navigate('/login');
  };

  if (isLoading || !settings) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div id="settingsPage">
      {/* Header */}
      <div className="settings_header">
        <button type="button" className="back_btn btn-effect" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1>설정</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* Notification Settings */}
      <div className="settings_section">
        <h2 className="section_title">알림 설정</h2>
        <div className="settings_list">
          <div className="settings_item">
            <span>푸시 알림</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => handleToggle('notifications', 'push', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="settings_item">
            <span>채팅 알림</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.notifications.chat}
                onChange={(e) => handleToggle('notifications', 'chat', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="settings_item">
            <span>커뮤니티 알림</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.notifications.community}
                onChange={(e) => handleToggle('notifications', 'community', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="settings_item">
            <span>마케팅 알림</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={(e) => handleToggle('notifications', 'marketing', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="settings_section">
        <h2 className="section_title">공개 설정</h2>
        <div className="settings_list">
          <div className="settings_item">
            <span>프로필 공개</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.privacy.profilePublic}
                onChange={(e) => handleToggle('privacy', 'profilePublic', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="settings_item">
            <span>위치 표시</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.privacy.locationVisible}
                onChange={(e) => handleToggle('privacy', 'locationVisible', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="settings_item">
            <span>활동 공개</span>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={settings.privacy.activityVisible}
                onChange={(e) => handleToggle('privacy', 'activityVisible', e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="settings_section">
        <h2 className="section_title">계정</h2>
        <div className="settings_list">
          <button type="button" className="settings_link btn-effect">
            <span>이메일</span>
            <span className="link_value">{settings.account.email}</span>
          </button>
          <button type="button" className="settings_link btn-effect">
            <span>연동 계정</span>
            <span className="link_value">{settings.account.linkedAccounts.join(', ')}</span>
          </button>
        </div>
      </div>

      {/* Support */}
      <div className="settings_section">
        <h2 className="section_title">고객지원</h2>
        <div className="settings_list">
          <button type="button" className="settings_link btn-effect" onClick={() => navigate('/terms/service')}>
            <span>서비스 이용약관</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="#999" strokeWidth="1.5"/></svg>
          </button>
          <button type="button" className="settings_link btn-effect" onClick={() => navigate('/terms/privacy')}>
            <span>개인정보 처리방침</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="#999" strokeWidth="1.5"/></svg>
          </button>
          <button type="button" className="settings_link btn-effect">
            <span>버전 정보</span>
            <span className="link_value">1.0.0</span>
          </button>
        </div>
      </div>

      {/* Logout & Delete */}
      <div className="settings_section">
        <div className="settings_list">
          <button type="button" className="settings_link logout_btn btn-effect" onClick={() => setShowLogoutModal(true)}>
            <span>로그아웃</span>
          </button>
          <button type="button" className="settings_link delete_btn btn-effect" onClick={() => setShowDeleteModal(true)}>
            <span>회원 탈퇴</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal_overlay">
          <div className="modal_content">
            <h3>로그아웃</h3>
            <p>정말 로그아웃 하시겠습니까?</p>
            <div className="modal_buttons">
              <button type="button" className="cancel_btn" onClick={() => setShowLogoutModal(false)}>취소</button>
              <button type="button" className="confirm_btn" onClick={handleLogout}>로그아웃</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal_overlay">
          <div className="modal_content">
            <h3>회원 탈퇴</h3>
            <p>탈퇴 시 모든 데이터가 삭제됩니다.<br/>정말 탈퇴하시겠습니까?</p>
            <div className="modal_buttons">
              <button type="button" className="cancel_btn" onClick={() => setShowDeleteModal(false)}>취소</button>
              <button type="button" className="confirm_btn danger" onClick={handleDeleteAccount}>탈퇴하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
