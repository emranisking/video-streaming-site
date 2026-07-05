import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useSession } from './useUser';
import { videoService } from '../services/videoService';
import { userService } from '../services/userService';
import { getFullUrl } from '../utils/helpers';
import { ERROR_MESSAGES } from '../utils/constants';
import Swal from 'sweetalert2';

/**
 * Composable for watch page logic
 * Combines video fetching, limit checking, view increment, history, and likes
 */
export function useWatch(videoId) {
  const authStore = useAuthStore();
  const { sessionId } = useSession();
  
  // State
  const video = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isLiked = ref(false);
  const watchLimitMsg = ref('');
  const isPlaybackReady = ref(false);
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  // Fetch video data
  const fetchVideo = async () => {
    if (!videoId) {
      error.value = 'No video ID provided';
      return;
    }

    loading.value = true;
    error.value = null;
    watchLimitMsg.value = '';

    try {
      const data = await videoService.getVideoById(videoId);
      video.value = data;
      
      // Check if user has liked this video
      // You might need a separate endpoint for this
      // For now, we'll use a local check
      isLiked.value = false;
      
      return data;
    } catch (err) {
      error.value = err.message || ERROR_MESSAGES.VIDEO_NOT_FOUND;
      console.error('Failed to fetch video:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ============ NEW: Combined check and increment ============
  /**
   * Check view limit AND increment view count in one call
   * This reduces network requests and prevents race conditions
   */
  const checkAndIncrementView = async () => {
    try {
      // Combined endpoint: check limit AND increment if allowed
      const response = await videoService.checkAndIncrementView(videoId, sessionId.value);
      
      if (response.locked) {
        watchLimitMsg.value = ERROR_MESSAGES.VIEW_LIMIT_REACHED;
        return false;
      }
      
      // Update video view count if returned from server
      if (response.views && video.value) {
        video.value.views = response.views;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to check/increment view:', err);
      // Allow playback if API fails (fail open)
      return true;
    }
  };
  // ============ END NEW ============

  // Add to history (only if authenticated)
  const addToHistory = async () => {
    if (!isAuthenticated.value) return;
    
    try {
      await userService.addToHistory(videoId);
    } catch (err) {
      console.error('Failed to add to history:', err);
    }
  };

  // Toggle like/unlike
  const toggleLike = async () => {
    if (!isAuthenticated.value) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to like videos',
        icon: 'warning',
        confirmButtonColor: '#ff9900',
        background: '#1a1a1a',
        color: '#fff',
      });
      return { success: false, error: 'Authentication required' };
    }

    try {
      if (isLiked.value) {
        // Unlike
        const updated = await videoService.unlikeVideo(videoId);
        isLiked.value = false;
        if (video.value) {
          video.value.likes = Math.max((video.value.likes || 1) - 1, 0);
        }
        return { success: true, action: 'unliked' };
      } else {
        // Like
        const updated = await videoService.likeVideo(videoId);
        isLiked.value = true;
        if (video.value) {
          video.value.likes = (video.value.likes || 0) + 1;
        }
        return { success: true, action: 'liked' };
      }
    } catch (err) {
      console.error('Toggle like error:', err);
      return { success: false, error: err.message };
    }
  };

  // Get resume position from localStorage
  const getResumePosition = () => {
    const sessionKey = `pos_${videoId}_${sessionId.value}`;
    const saved = localStorage.getItem(sessionKey);
    return saved ? Number(saved) : 0;
  };

  // Save position to localStorage
  const savePosition = (currentTime) => {
    if (currentTime > 2) {
      const sessionKey = `pos_${videoId}_${sessionId.value}`;
      try {
        localStorage.setItem(sessionKey, String(currentTime));
      } catch (_) {}
    }
  };

  // Clear saved position
  const clearPosition = () => {
    const sessionKey = `pos_${videoId}_${sessionId.value}`;
    try {
      localStorage.removeItem(sessionKey);
    } catch (_) {}
  };

  // ============ UPDATED: Initialize watch session ============
  const initializeWatch = async () => {
    try {
      await fetchVideo();
      if (!video.value) return;

      // Use the combined check and increment (single API call)
      const canPlay = await checkAndIncrementView();
      if (!canPlay) return;

      // Only add to history if playback is allowed
      await addToHistory();

      isPlaybackReady.value = true;
    } catch (err) {
      error.value = err.message;
      console.error('Initialize watch failed:', err);
    }
  };
  // ============ END UPDATED ============

  // Get video URL for player
  const getVideoUrl = () => {
    if (!video.value) return '';
    return getFullUrl(video.value.videoUrl);
  };

  // Reset state
  const reset = () => {
    video.value = null;
    loading.value = false;
    error.value = null;
    isLiked.value = false;
    watchLimitMsg.value = '';
    isPlaybackReady.value = false;
  };

  return {
    // State
    video,
    loading,
    error,
    isLiked,
    watchLimitMsg,
    isPlaybackReady,
    isAuthenticated,
    
    // Methods
    fetchVideo,
    checkAndIncrementView,
    addToHistory,
    toggleLike,
    getResumePosition,
    savePosition,
    clearPosition,
    initializeWatch,
    getVideoUrl,
    reset,
  };
}