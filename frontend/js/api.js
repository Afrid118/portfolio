// Base URL - same origin
const API_BASE = '/api';

// Get stored token
function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }
function setAuth(token, user) { 
  localStorage.setItem('token', token); 
  localStorage.setItem('user', JSON.stringify(user)); 
}
function clearAuth() { 
  localStorage.removeItem('token'); 
  localStorage.removeItem('user'); 
}

// Main API call function
async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle 204 No Content
    if (response.status === 204) {
      return { ok: true, status: response.status, data: null };
    }

    const responseData = await response.json().catch(() => ({}));
    let data = responseData;
    if (Array.isArray(responseData.data)) {
      data = responseData.data;
    } else if (responseData.data && typeof responseData.data === 'object') {
      data = { ...responseData.data, ...responseData };
    }
    
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      clearAuth();
      window.location.href = './login.html';
      return { ok: false, status: 401, data: { message: 'Unauthorized' } };
    }
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { ok: false, status: 500, data: { message: 'Network error. Please try again.' } };
  }
}

// Auth functions
const Auth = {
  register: (userData) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiCall('/auth/me'),
  updateProfile: (data) => apiCall('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => apiCall('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
};

// Items functions
const Items = {
  getAll: (params) => apiCall('/items?' + new URLSearchParams(params)),
  getById: (id) => apiCall(`/items/${id}`),
  getMatches: (id) => apiCall(`/items/${id}/matches`),
  getMy: () => apiCall('/items/my'),
  create: (formData) => apiCall('/items', { method: 'POST', body: formData }), // formData, not JSON
  update: (id, data) => apiCall(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/items/${id}`, { method: 'DELETE' }),
  adminGetAll: (params) => apiCall('/items/admin/all?' + new URLSearchParams(params)),
  adminUpdateStatus: (id, data) => apiCall(`/items/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  adminReturn: (id, data) => apiCall(`/items/admin/${id}/return`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Claims functions
const Claims = {
  create: (data) => apiCall('/claims', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => apiCall('/claims/my'),
  getForItem: (itemId) => apiCall(`/claims/item/${itemId}`),
  adminGetAll: (params) => apiCall('/claims/admin/all?' + new URLSearchParams(params)),
  adminUpdateStatus: (id, data) => apiCall(`/claims/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Notifications
const Notifications = {
  getAll: () => apiCall('/notifications'),
  getUnreadCount: () => apiCall('/notifications/unread-count'),
  markRead: (id) => apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiCall('/notifications/read-all', { method: 'PUT' }),
};

// Admin
const Admin = {
  getStats: () => apiCall('/admin/stats'),
  getUsers: (params) => apiCall('/admin/users?' + new URLSearchParams(params)),
  getUserById: (id) => apiCall(`/admin/users/${id}`),
  deleteUser: (id) => apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
};
