import apiClient from './api/client';

export interface NotificationSettings {
  walkAlert: boolean;
  chatAlert: boolean;
  friendAlert: boolean;
  communityAlert: boolean;
}

export interface PrivacySettings {
  locationSharing: boolean;
  profilePublic: boolean;
}

const mockNotificationSettings: NotificationSettings = {
  walkAlert: true,
  chatAlert: true,
  friendAlert: true,
  communityAlert: true,
};

const mockPrivacySettings: PrivacySettings = {
  locationSharing: true,
  profilePublic: true,
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const settingsService = {
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockNotificationSettings;
    }
    try {
      const response = await apiClient.get('/settings/notifications');
      return response.data;
    } catch {
      return mockNotificationSettings;
    }
  },

  updateNotificationSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      Object.assign(mockNotificationSettings, settings);
      return mockNotificationSettings;
    }
    try {
      const response = await apiClient.put('/settings/notifications', settings);
      return response.data;
    } catch {
      return settings;
    }
  },

  getPrivacySettings: async (): Promise<PrivacySettings> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockPrivacySettings;
    }
    try {
      const response = await apiClient.get('/settings/privacy');
      return response.data;
    } catch {
      return mockPrivacySettings;
    }
  },

  updatePrivacySettings: async (settings: PrivacySettings): Promise<PrivacySettings> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      Object.assign(mockPrivacySettings, settings);
      return mockPrivacySettings;
    }
    try {
      const response = await apiClient.put('/settings/privacy', settings);
      return response.data;
    } catch {
      return settings;
    }
  },
};
