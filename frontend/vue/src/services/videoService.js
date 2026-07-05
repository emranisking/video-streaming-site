import { BaseService } from './baseService';
import httpClient from './api';

class VideoService extends BaseService {
  constructor() {
    super('/videos');
  }

  /**
   * Get all videos with pagination
   */
  async getVideos(page = 1, limit = 20) {
    console.log(`📹 Fetching videos: page ${page}, limit ${limit}`);
    const response = await httpClient.get(`${this.endpoint}?page=${page}&limit=${limit}`);
    console.log('📹 Video service response:', response);
    return response;
  }

  /**
   * Get video by ID
   */
  async getVideoById(id) {
    if (!id) throw new Error('Video ID is required');
    console.log(`📹 Fetching video: ${id}`);
    const response = await httpClient.get(`${this.endpoint}/${id}`);
    console.log('📹 Video detail response:', response);
    return response;
  }

  /**
   * Increment video views
   */
  async incrementViews(videoId) {
    return httpClient.patch(`${this.endpoint}/${videoId}/views`, {});
  }

  /**
   * Check view limit for a video
   */
  async checkViewLimit(videoId, sessionId) {
    return httpClient.get(`${this.endpoint}/${videoId}/check-limit?sessionId=${sessionId}`);
  }

  /**
   * Increment video count for session (for limit tracking)
   */
  async incrementViewCount(videoId, sessionId) {
    return httpClient.post(`${this.endpoint}/${videoId}/increment?sessionId=${sessionId}`, {});
  }

  /**
   * Check view limit AND increment view count in one call
   * This reduces network requests and prevents race conditions
   * 
   * @param {number|string} videoId - The video ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<{locked: boolean, views?: number, totalViews?: number}>}
   */
  async checkAndIncrementView(videoId, sessionId) {
    return httpClient.post(`${this.endpoint}/${videoId}/check-and-increment`, {
      sessionId,
    });
  }

  /**
   * Like a video
   */
  async likeVideo(videoId) {
    return httpClient.patch(`${this.endpoint}/${videoId}/like`, {});
  }

  /**
   * Unlike a video
   */
  async unlikeVideo(videoId) {
    return httpClient.delete(`/likes/${videoId}`);
  }

  /**
   * Get liked videos
   */
  async getLikedVideos(page = 1, limit = 20) {
    return httpClient.get(`/likes?page=${page}&limit=${limit}`);
  }

  /**
   * Get videos by category
   */
  async getByCategory(categoryId, page = 1, limit = 20) {
    return httpClient.get(`${this.endpoint}/category/${categoryId}?page=${page}&limit=${limit}`);
  }

  /**
   * Search videos
   */
  async search(query, page = 1, limit = 20) {
    return httpClient.get(`${this.endpoint}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }
}

export const videoService = new VideoService();