import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API functions
export const authApi = {
  // Register user
  register: (userData) => api.post('/register', userData),
  
  // Login
  login: (credentials) => api.post('/login', credentials),
  
  // Get current user
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return api.get('/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get user role
  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  }
};

export default api;