import { api } from './client';

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
};
