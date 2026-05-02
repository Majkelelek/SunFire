import { apiFetch } from './api';

export const projectService = {
  getAllProjects: async () => {
    return apiFetch('/api/projects');
  },
  createProject: async (project) => {
    return apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  },
  updateProject: async (id, project) => {
    return apiFetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    });
  },
  deleteProject: async (id) => {
    return apiFetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  }
};
