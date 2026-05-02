import { apiFetch } from './api';

export const authService = {
  checkAuth: async () => {
    try {
      const data = await apiFetch('/api/auth/check');
      return data.isAuthenticated || false;
    } catch {
      return false;
    }
  },
  login: async (username, password) => {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  logout: async () => {
    return apiFetch('/api/auth/logout', { method: 'POST' });
  }
};
