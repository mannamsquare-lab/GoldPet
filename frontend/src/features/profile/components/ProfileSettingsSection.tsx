import React from 'react';

interface ProfileSettingsSectionProps {
    onEdit: () => void;
    editLabel?: string;
    idPrefix?: string;
    isNotificationEnabled?: boolean;
    onNotificationChange?: (enabled: boolean) => Promise<void>;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
    onEdit,
    editLabel = '수정하기',
}) => {
    return (
        <button type="button" className="submit_btn" onClick={onEdit}>{editLabel}</button>
    );
};
