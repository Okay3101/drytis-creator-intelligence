import { api } from './client';

export type AccountType = 'creator' | 'brand';

export interface User {
  id: number;
  name: string;
  email: string;
  account_type: AccountType;
  status: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; account_type: AccountType }) =>
    api.post<{ message: string }>('/auth/register', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<{ token: string; user: User }>('/auth/verify-otp', data),

  resendOtp: (data: { email: string }) => api.post('/auth/resend-otp', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),

  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),

  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),

  me: () => api.get<{ user: User }>('/auth/me'),

  logout: () => api.post('/auth/logout'),

  deleteAccount: () => api.delete('/account'),
};
