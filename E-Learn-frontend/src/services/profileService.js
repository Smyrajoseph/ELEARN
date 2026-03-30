import apiClient from './apiClient';

const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profiles');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/profiles', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile photo
  uploadProfilePhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiClient.post('/profiles/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default profileService;
