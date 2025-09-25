const API_BASE = 'http://localhost:4444/v1';

const getToken = () => localStorage.getItem('auth_token');

const apiRequest = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const authAPI = {
  signup: (data) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => localStorage.clear(),
};

export const imageAPI = {
  getFolders: () => apiRequest('/image/folders'),
  createFolder: (data) => apiRequest('/image/create-folder', { method: 'POST', body: JSON.stringify(data) }),
  uploadSingleImage: async (formData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/image/single`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  },
  uploadMultipleImages: async (formData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/image/multiple`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  },
  searchImages: (query, folderId) => apiRequest(`/image/search?q=${encodeURIComponent(query)}${folderId ? `&folderId=${folderId}` : ''}`),
  getImagesByFolder: (folderId) => apiRequest(`/image/folder/${folderId}/images`),
  moveImage: (data) => apiRequest('/image/move', { method: 'PUT', body: JSON.stringify(data) }),
  getRootImages: () => apiRequest('/image/root'),
  getRootContents: () => apiRequest('/image/root-contents'),
  deleteFolder: (id) => apiRequest(`/image/folder/${id}`, { method: 'DELETE' }),
  deleteImage: (id) => apiRequest(`/image/image/${id}`, { method: 'DELETE' }),
  getImage: (id) => apiRequest(`/image/image/${id}`),
};
