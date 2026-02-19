import apiClient from './api/client';

export interface NotificationSettings {
  pushAlert: boolean;
  chatAlert: boolean;
  communityAlert: boolean;
  marketingAlert: boolean;
}

export interface PrivacySettings {
  locationSharing: boolean;
  profilePublic: boolean;
}

export const settingsService = {
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await apiClient.get('/users/me/notification-settings');
    return response.data;
  },

  updateNotificationSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    const response = await apiClient.put('/users/me/notification-settings', settings);
    return response.data;
  },

  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const response = await apiClient.get('/users/me/privacy-settings');
    return {
      locationSharing: response.data.isLocationSharingEnabled,
      profilePublic: response.data.isProfilePublic,
    };
  },

  updatePrivacySettings: async (settings: PrivacySettings): Promise<PrivacySettings> => {
    await apiClient.put('/users/me/privacy-settings', {
      isLocationSharingEnabled: settings.locationSharing,
      isProfilePublic: settings.profilePublic,
    });
    return settings;
  },

  exportMyData: async (): Promise<void> => {
    try {
      const response = await apiClient.get('/users/me/data-export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'goldpet-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      throw new Error('데이터 다운로드에 실패했습니다.');
    }
  },
};
