import { apiFetch } from './api';

export const homeService = {
  getHomeData: async () => {
    return apiFetch('/api/home');
  },
  updateHomeData: async (data) => {
    return apiFetch('/api/home', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
