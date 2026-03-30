import apiClient from './apiClient';

const noteService = {
  // Get the study note for a specific subject
  getNote: async (subjectId) => {
    try {
      const response = await apiClient.get(`/notes/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save or update the study note for a subject
  saveNote: async (subjectId, content) => {
    try {
      const response = await apiClient.post('/notes', { subjectId, content });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default noteService;
