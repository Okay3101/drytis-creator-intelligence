import { api } from './client';

export interface Script {
  id: number;
  topic: string;
  hook: string;
  body: string;
  cta: string;
  voiceover_mode: boolean;
  created_at: string;
}

export const scriptsApi = {
  generate: (data: {
    topic: string;
    tone?: string;
    duration_seconds?: number;
    voiceover_mode?: boolean;
    include_hooks?: boolean;
  }) => api.post<{ data: Script }>('/scripts/generate', data),

  revise: (id: number, data: { instruction: string }) =>
    api.post<{ data: Script }>(`/scripts/${id}/revise`, data),

  history: () => api.get<{ data: Script[] }>('/scripts'),

  show: (id: number) => api.get<{ data: Script }>(`/scripts/${id}`),
};
