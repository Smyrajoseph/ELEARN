import apiClient from './apiClient';

const quizService = {
  // Get quiz by ID
  getQuizById: async (quizId) => {
    try {
      const response = await apiClient.get(`/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quizzes for a subject
  getQuizzesBySubject: async (subjectId) => {
    try {
      const response = await apiClient.get(`/quiz/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit quiz response
  submitQuizResponse: async (quizId, responseData) => {
    try {
      const response = await apiClient.post(`/quiz/${quizId}/submit`, responseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quiz results
  getQuizResults: async (quizId) => {
    try {
      const response = await apiClient.get(`/quiz/${quizId}/results`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create quiz (teacher only)
  createQuiz: async (data) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await apiClient.post('/quiz', data, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default quizService;
