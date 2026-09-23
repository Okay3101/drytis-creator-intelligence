import { api } from './client';

export interface ReelReadiness {
  id: number;
  status: string;
  score: number | null;
  issues: string[];
  suggestions: string[];
  created_at: string;
}

export const readinessApi = {
  uploadMedia: (formData: FormData) =>
    api.post<{ upload_id: number }>('/readiness/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  submit: (data: { upload_id?: number; caption?: string; instagram_account_id: number }) =>
    api.post<{ data: ReelReadiness }>('/readiness', data),

  history: () => api.get<{ data: ReelReadiness[] }>('/readiness'),

  show: (id: number) => api.get<{ data: ReelReadiness }>(`/readiness/${id}`),
};
