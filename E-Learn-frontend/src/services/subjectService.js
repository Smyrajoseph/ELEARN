import apiClient from './apiClient';

const subjectService = {
  // Get all subjects for a course
  getSubjectsByCourse: async (courseId) => {
    try {
      console.log(`📚 Fetching subjects for course ${courseId}...`);
      const response = await apiClient.get(`/subjects/${courseId}`);
      console.log('✅ Subjects fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      return [];
    }
  },

  // Create a new subject (Teacher only)
  createSubject: async (subjectData) => {
    try {
      console.log('📝 Creating subject:', subjectData);
      const response = await apiClient.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating subject:', error);
      throw error;
    }
  },

  // Update an existing subject (Teacher only)
  updateSubject: async (subjectId, subjectData) => {
    try {
      console.log(`✏️ Updating subject ${subjectId}:`, subjectData);
      const response = await apiClient.put(`/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating subject:', error);
      throw error;
    }
  },

  // Delete a subject (Teacher only)
  deleteSubject: async (subjectId) => {
    try {
      console.log(`🗑️ Deleting subject ${subjectId}...`);
      const response = await apiClient.delete(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting subject:', error);
      throw error;
    }
  },
};

export default subjectService;
