const API_URL = import.meta.env.VITE_API_URL || "";

export const apiFetch = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const defaultOptions = {
    credentials: 'include',
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

  // You can handle global response errors here if needed
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text().catch(() => null);
    }
    throw { status: response.status, data: errorData };
  }

  // Helper to handle empty responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};
