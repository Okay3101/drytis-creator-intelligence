import { api } from './client';

export interface InstagramAccount {
  id: number;
  username: string;
  profile_picture_url: string | null;
  followers_count: number | null;
  connected_at: string;
}

export interface Diagnosis {
  id: number;
  instagram_account_id: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  score: number;
  created_at: string;
}

export const instagramApi = {
  getAccounts: () => api.get<{ data: InstagramAccount[] }>('/instagram/accounts'),

  startConnect: () => api.get<{ url: string }>('/instagram/connect'),

  connectDemo: () => api.post<{ message: string }>('/instagram/connect-demo'),

  disconnect: (id: number) => api.delete(`/instagram/accounts/${id}`),

  sync: (id: number) => api.post(`/instagram/accounts/${id}/sync`),

  analysisStatus: (id: number) =>
    api.get<{ status: string; progress: number }>(`/instagram/accounts/${id}/analysis-status`),

  getDiagnosis: (id: number) => api.get<{ data: Diagnosis }>(`/instagram/accounts/${id}/diagnosis`),

  submitFeedback: (id: number, data: { helpful: boolean; comment?: string }) =>
    api.post(`/instagram/accounts/${id}/feedback`, data),

  homePriority: () => api.get('/home/priority'),
};
