import { apiFetch } from './api';

export const cmsService = {
  getSiteConfig: async () => {
    return apiFetch('/api/cms');
  },
  updateSiteConfig: async (config) => {
    return apiFetch('/api/cms', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }
};
