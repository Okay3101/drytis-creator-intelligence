import { api } from './client';

export const accountApi = {
  updateProfile: (data: { name?: string; bio?: string }) => api.put('/profile', data),

  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    api.put('/password', data),

  updateNotificationPrefs: (data: Record<string, boolean>) => api.put('/notification-prefs', data),

  registerPushToken: (token: string, platform: string) =>
    api.post('/push-tokens', { token, platform }),

  notifications: () => api.get('/notifications'),

  markNotificationsRead: (ids: number[]) => api.post('/notifications/read', { ids }),

  support: () => api.get('/support'),

  sendSupportMessage: (message: string) => api.post('/support/messages', { message }),

  settings: () => api.get('/settings'),
};
