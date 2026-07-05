import { BaseService } from './baseService';
import httpClient from './api';

class UserService extends BaseService {
  constructor() {
    super('/users');
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return httpClient.get('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data) {
    return httpClient.patch('/auth/profile', data);
  }

  /**
   * Get watch history
   */
  async getHistory(page = 1, limit = 20) {
    return httpClient.get(`/history?page=${page}&limit=${limit}`);
  }

  /**
   * Add video to history
   */
  async addToHistory(videoId) {
    return httpClient.post(`/history/${videoId}`, {});
  }

  /**
   * Clear watch history
   */
  async clearHistory() {
    return httpClient.delete('/history');
  }

  /**
   * Get user playlists
   */
  async getPlaylists(page = 1, limit = 20) {
    return httpClient.get(`/playlist?page=${page}&limit=${limit}`);
  }

  /**
   * Create new playlist
   */
  async createPlaylist(name) {
    return httpClient.post('/playlist', { title: name });
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId) {
    return httpClient.delete(`/playlist/${playlistId}`);
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(playlistId, videoId) {
    // Updated: Structured to explicitly route through /add/ and dropped payload body
    return httpClient.post(`/playlist/${playlistId}/add/${videoId}`);
  }

  /**
   * Remove video from playlist
   */
  async removeFromPlaylist(playlistId, videoId) {
    // Updated: Structured to explicitly route through /remove/
    return httpClient.delete(`/playlist/${playlistId}/remove/${videoId}`);
  }
}

export const userService = new UserService();
