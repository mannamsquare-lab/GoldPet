import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useAlert } from '../../../contexts/AlertContext';
import { useToast } from '../../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface ProfileSettingsSectionProps {
    onEdit: () => void;
    editLabel?: string;
    idPrefix: string;
    isNotificationEnabled?: boolean;
    onNotificationChange?: (enabled: boolean) => Promise<void>;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({ 
    onEdit, 
    editLabel = '수정하기', 
    idPrefix,
    isNotificationEnabled = true,
    onNotificationChange
}) => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const { showConfirm } = useAlert();
    const [localEnabled, setLocalEnabled] = useState(isNotificationEnabled);

    const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (keep existing handleToggle)
        const newValue = e.target.checked;
        setLocalEnabled(newValue); // Optimistic update
        
        if (onNotificationChange) {
            try {
                await onNotificationChange(newValue);
                showToast(newValue ? '알림이 설정되었습니다.' : '알림이 해제되었습니다.', 'success');
            } catch (error) {
                setLocalEnabled(!newValue); // Revert on error
                showToast('알림 설정을 변경하지 못했습니다.', 'error');
            }
        }
    };

    const handleTermsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/profile/terms');
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        showConfirm('로그아웃 하시겠습니까?', () => {
            logout();
            navigate('/login');
            showToast('로그아웃 되었습니다.', 'success');
        });
    };

    const handleSettingsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/settings');
    };

    return (
        <>
            <a href="/settings" className="white_link" onClick={handleSettingsClick}>설정</a>
            <div className="check_wrap">
                <div className="check_box">
                    <input
                        type="checkbox"
                        id={`${idPrefix}_alram`}
                        checked={localEnabled}
                        onChange={handleToggle}
                    />
                    <label htmlFor={`${idPrefix}_alram`}>알림설정</label>
                </div>
                <a href="/profile/terms" className="white_link" onClick={handleTermsClick}>약관</a>
                <a href="#" className="white_link" onClick={handleLogout}>로그아웃</a>
            </div>
            <button type="button" className="submit_btn" onClick={onEdit}>{editLabel}</button>
        </>
    );
};
