import apiClient from './apiClient';

const enrollmentService = {
  // Request enrollment in a course
  requestEnrollment: async (enrollmentData) => {
    try {
      console.log('📝 Requesting enrollment with data:', enrollmentData);
      const response = await apiClient.post('/enrollments', enrollmentData);
      console.log('✅ Enrollment request created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Enrollment request failed:', error);
      throw error;
    }
  },

  // Get student's enrollments
  getMyEnrollments: async () => {
    try {
      console.log('📋 Fetching student enrollments...');
      const response = await apiClient.get('/enrollments/my');
      console.log('✅ Enrollments fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch enrollments:', error);
      throw error;
    }
  },

  // Cancel enrollment request
  cancelEnrollmentRequest: async (requestId) => {
    try {
      console.log('🚫 Cancelling enrollment request:', requestId);
      const response = await apiClient.delete(`/enrollments/${requestId}/cancel`);
      console.log('✅ Enrollment request cancelled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to cancel request:', error);
      throw error;
    }
  },

  // Get enrollment requests for a course (teacher)
  getCourseEnrollmentRequests: async (courseId, yearId) => {
    try {
      console.log(`👥 Fetching enrollment requests for course ${courseId}, year ${yearId}...`);
      const response = await apiClient.get(`/enrollments/${courseId}/${yearId}/requests`);
      console.log('✅ Enrollment requests fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch enrollment requests:', error);
      throw error;
    }
  },

  // Get all enrollment requests for the current teacher
  getTeacherPendingRequests: async () => {
    try {
      console.log('📋 Fetching ALL pending enrollment requests for teacher...');
      const response = await apiClient.get('/enrollments/teacher/requests');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch teacher requests:', error);
      throw error;
    }
  },

  // Update enrollment status (teacher)
  updateEnrollmentStatus: async (requestId, status) => {
    try {
      console.log(`✏️ Updating enrollment request ${requestId} to ${status}...`);
      const response = await apiClient.patch(`/enrollments/${requestId}/status`, { status });
      console.log('✅ Enrollment status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update enrollment status:', error);
      throw error;
    }
  },

  // Get enrolled students (teacher)
  getEnrolledStudents: async (courseId, yearId) => {
    try {
      console.log(`🎓 Fetching enrolled students for course ${courseId}, year ${yearId}...`);
      const response = await apiClient.get(`/enrollments/${courseId}/${yearId}/students`);
      console.log('✅ Enrolled students fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch enrolled students:', error);
      throw error;
    }
  },

  // Unenroll student (teacher)
  unenrollStudent: async (courseId, yearId, studentId) => {
    try {
      console.log(`🔓 Unenrolling student ${studentId} from course ${courseId}, year ${yearId}...`);
      const response = await apiClient.delete(`/enrollments/${courseId}/${yearId}/${studentId}/unenroll`);
      console.log('✅ Student unenrolled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to unenroll student:', error);
      throw error;
    }
  }
};

export default enrollmentService;
