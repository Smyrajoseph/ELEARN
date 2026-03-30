import apiClient from './apiClient';

const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new course (teacher/admin only)
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post('/courses/create', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course years for a specific course
  getCourseYears: async (courseId) => {
    try {
      console.log(`📅 Fetching years for course ${courseId}...`);
      const response = await apiClient.get(`/course-years/${courseId}/years`);
      console.log('✅ Course years fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching course years:', error);
      // Return empty array instead of throwing to handle gracefully
      return [];
    }
  }
};

export default courseService;
