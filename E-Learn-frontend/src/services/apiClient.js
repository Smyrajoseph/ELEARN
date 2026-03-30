import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://untumultuous-unvivaciously-branda.ngrok-free.dev/api';

console.log(`🔗 API Client initialized with base URL: ${API_BASE_URL}`);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error(`❌ Request error:`, error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`❌ API Error: ${status} - ${data?.error || data?.message || 'Unknown error'}`);

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        console.warn('🔐 Token expired or invalid - logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('🚫 Access forbidden - insufficient permissions');
      } else if (status === 404) {
        console.error('❓ Resource not found');
      } else if (status >= 500) {
        console.error('💥 Server error:', data?.message || 'Internal server error');
      }

      return Promise.reject(data || error.response);
    } else if (error.request) {
      // Request made but no response
      console.error('🌐 Network error - no response from server. Backend may be down.');
      return Promise.reject({ message: 'Network error. Backend may be offline. Please check the server is running.' });
    } else {
      // Error setting up request
      console.error('❌ Request error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default apiClient;
