import apiClient from './apiClient';

const videoService = {
  // Get videos for a course
  getCourseVideos: async (courseId) => {
    try {
      const response = await apiClient.get(`/video/courses/${courseId}/video`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload content (video or document) for a course
  uploadVideo: async (courseId, videoData) => {
    try {
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('type', videoData.type || 'video');
      if (videoData.subject_id) {
        formData.append('subject_id', videoData.subject_id);
      }
      if (videoData.year_id) {
        formData.append('year_id', videoData.year_id);
      }
      if (videoData.file) {
        formData.append('video', videoData.file); // Backend expects 'video' field
      }
      if (videoData.url) {
        formData.append('url', videoData.url);
      }

      const response = await apiClient.post(`/video/courses/${courseId}/video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get video by ID
  getVideoById: async (videoId) => {
    try {
      const response = await apiClient.get(`/video/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update video progress (Mark as completed)
  updateVideoProgress: async (videoId) => {
    try {
      const response = await apiClient.post(`/users/video-complete/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update video metadata and file
  updateVideo: async (videoId, videoData) => {
    try {
      const formData = new FormData();
      if (videoData.title) formData.append('title', videoData.title);
      if (videoData.description) formData.append('description', videoData.description);
      if (videoData.subject_id) formData.append('subject_id', videoData.subject_id);
      if (videoData.year_id) formData.append('year_id', videoData.year_id);
      if (videoData.file) formData.append('video', videoData.file);

      const response = await apiClient.put(`/video/video/${videoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all videos uploaded by the teacher
  getTeacherVideos: async () => {
    try {
      const response = await apiClient.get('/video/my-videos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a video
  deleteVideo: async (videoId) => {
    try {
      const response = await apiClient.delete(`/video/video/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default videoService;
