import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator: 10.0.2.2 | iOS simulator: localhost | Physical device: your Mac's LAN IP
export const API_BASE = 'http://10.0.2.2:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Let callers handle 401 — auth store listens via event
    return Promise.reject(error);
  },
);
