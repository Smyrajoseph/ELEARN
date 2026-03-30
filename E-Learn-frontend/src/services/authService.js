import apiClient from './apiClient';

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('👤 Registering user with email:', userData.email);
      const response = await apiClient.post('/auth/register', userData);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Parse validation errors from backend
      if (error?.errors && Array.isArray(error.errors)) {
        const messages = error.errors.map(err => err.msg).join(', ');
        const validationError = new Error(messages);
        validationError.details = error.errors;
        throw validationError;
      }
      
      // Handle other error types
      const errorMsg = error?.error || error?.message || 'Registration failed';
      throw new Error(errorMsg);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('🔐 Logging in user:', credentials.email);
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Login successful, token stored');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMsg = error?.error || error?.message || 'Login failed';
      throw new Error(errorMsg);
    }
  },

  // Logout user
  logout: async () => {
    try {
      console.log('👋 Logging out...');
      await apiClient.post('/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('👤 Fetching current user...');
      const response = await apiClient.get('/auth/me');
      console.log('✅ Current user fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
