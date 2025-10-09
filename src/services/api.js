import axios from 'axios';

// Force Railway URL for production - URGENT DEPLOYMENT FIX
const API_BASE_URL = 'https://backend-ticketing-system.up.railway.app/api';

console.log('Using Railway API URL:', API_BASE_URL);
console.log('URGENT: Railway URL configured - deployment fix');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest && originalRequest.url && (
      originalRequest.url.startsWith('/auth/login') ||
      originalRequest.url.startsWith('/auth/register') ||
      originalRequest.url.startsWith('/auth/profile') ||
      originalRequest.url.startsWith('/auth/logout')
    );
    
    if (error.response?.status === 401 && isAuthEndpoint) {
      console.log('Auth endpoint 401 error - logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on /login
      if (window.location.pathname !== '/login') {
      window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getDepartments: () => api.get('/departments'),
  changePassword: (data) => api.post('/auth/change-password', data), // Added changePassword
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  getStructure: () => api.get('/departments/structure'),
  getMembers: (id) => api.get(`/departments/${id}/members`),
  addMember: (id, userId) => api.post(`/departments/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/departments/${id}/members/${userId}`),
};

// User Management APIs (Department Head features)
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getDepartmentUsers: (departmentId) => api.get(`/users/department/${departmentId}`),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  approveUser: (id) => api.post(`/users/${id}/approve`),
  rejectUser: (id) => api.post(`/users/${id}/reject`),
  getPendingUsers: () => api.get('/users/pending'),
  assignRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  assignDepartment: (id, departmentId) => api.patch(`/users/${id}/department`, { departmentId }),
};

// Task Management APIs (Department Head features)
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getDepartmentTasks: (departmentId, params) => 
    api.get(`/tasks/department/${departmentId}`, { params }),
  assignTask: (id, userId) => api.patch(`/tasks/${id}/assign`, { userId }),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  updatePriority: (id, priority) => api.patch(`/tasks/${id}/priority`, { priority }),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getAssignedTasks: () => api.get('/tasks/assigned'),
  getTaskAnalytics: (departmentId, params) => 
    api.get(`/tasks/analytics/${departmentId}`, { params }),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/files/task/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAttachments: (id) => api.get(`/files/task/${id}`),
  deleteAttachment: (id, attachmentId) => api.delete(`/files/${attachmentId}`),
};

// Ticket Management APIs (Department Head features)
export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  assignTicket: (id, userId) => api.patch(`/tickets/${id}/assign`, { userId }),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  updatePriority: (id, priority) => api.patch(`/tickets/${id}/priority`, { priority }),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getAssignedTickets: () => api.get('/tickets/assigned'),
  getTicketAnalytics: (departmentId, params) => 
    api.get(`/tickets/analytics/${departmentId}`, { params }),
  addComment: (id, comment) => api.post(`/tickets/${id}/comments`, { comment }),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/files/ticket/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAttachments: (id) => api.get(`/files/ticket/${id}`),
  deleteAttachment: (id, attachmentId) => api.delete(`/files/${attachmentId}`),
  // Forwarding methods
  forwardTicket: (id, data) => api.post(`/tickets/${id}/forward`, data),
  respondToForward: (id, data) => api.patch(`/tickets/${id}/forward/respond`, data),
  getForwardHistory: (id) => api.get(`/tickets/${id}/forward-history`),
  getTicketsForwardedToMe: () => api.get('/tickets/forwarded-to-me'),
};

// Analytics APIs (Department Head features)
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getDepartmentMetrics: (departmentId, params) => 
    api.get(`/analytics/department/${departmentId}/metrics`, { params }),
  getDepartmentAnalytics: (departmentId, params) => 
    api.get(`/analytics/department/${departmentId}/analytics`, { params }),
  getTaskAnalytics: (departmentId, params) => 
    api.get(`/analytics/department/${departmentId}/tasks`, { params }),
  getTicketAnalytics: (departmentId, params) => 
    api.get(`/analytics/department/${departmentId}/tickets`, { params }),
  getUserPerformance: (departmentId, params) => 
    api.get(`/analytics/department/${departmentId}/users/performance`, { params }),
  getDepartmentTrends: (departmentId, params) => 
    api.get(`/analytics/department/${departmentId}/trends`, { params }),
  exportMetrics: (departmentId, format, params) => 
    api.get(`/analytics/department/${departmentId}/metrics/export`, { 
      params: { ...params, format },
      responseType: 'blob',
    }),
  exportAnalytics: (departmentId, format, params) => 
    api.get(`/analytics/department/${departmentId}/analytics/export`, { 
      params: { ...params, format },
      responseType: 'blob',
    }),
};

// Reports APIs (Department Head features)
export const reportsAPI = {
  // List all reports for department head
  listReports: () => api.get('/analytics/reports'),
  
  // Get a specific report
  getReport: (reportId) => api.get(`/analytics/reports/${reportId}`),
  
  // Create a new report
  createReport: (reportData) => api.post('/analytics/reports', reportData),
  
  // Update a report
  updateReport: (reportId, reportData) => api.put(`/analytics/reports/${reportId}`, reportData),
  
  // Delete a report
  deleteReport: (reportId) => api.delete(`/analytics/reports/${reportId}`),
  
  // Export a report
  exportReport: (reportId, format) => 
    api.get(`/analytics/reports/${reportId}/export`, { 
      params: { format },
      responseType: 'blob',
    }),
};

// Notifications APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (settings) => api.put('/notifications/settings', settings),
};

// File Upload APIs
export const fileAPI = {
  upload: (file, type, entityId) => {
    if (type === 'task') {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/files/task/${entityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    // fallback for other types (if any)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('entityId', entityId);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
  delete: (fileId) => api.delete(`/files/${fileId}`),
  getByEntity: (type, entityId) => api.get(`/files/${type}/${entityId}`),
};

// WebSocket connection for real-time updates
export const connectWebSocket = (token) => {
  const WS_URL = 'wss://backend-ticketing-system.up.railway.app';
  const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Handle real-time updates
    if (data.type === 'notification') {
      // Handle new notification
    } else if (data.type === 'task_update') {
      // Handle task update
    } else if (data.type === 'ticket_update') {
      // Handle ticket update
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};


// Comments APIs
export const commentAPI = {
  fetchComments: (taskId) => api.get(`/comments/task/${taskId}`),
  addComment: (taskId, comment) => api.post('/comments', { ...comment, taskId }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  fetchTicketComments: (ticketId) => api.get(`/comments/ticket/${ticketId}`),
  addTicketComment: (ticketId, { content }) => api.post('/comments', { ticketId, content }),
};

export default api; 