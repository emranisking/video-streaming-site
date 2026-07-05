import { ref } from 'vue';
import { userService } from '../services/userService';
import { videoService } from '../services/videoService';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Composable for user data (history, playlists, etc.)
 */
export function useUserData() {
  const history = ref([]);
  const playlists = ref([]);
  const likedVideos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchHistory = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getHistory(page);
      history.value = response.videos || response || [];
    } catch (err) {
      error.value = ERROR_MESSAGES.NETWORK_ERROR;
      console.error('Failed to fetch history:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchPlaylists = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getPlaylists(page);
      playlists.value = response.playlists || response || [];
    } catch (err) {
      error.value = ERROR_MESSAGES.NETWORK_ERROR;
      console.error('Failed to fetch playlists:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchLikedVideos = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await videoService.getLikedVideos(page);
      likedVideos.value = response.videos || response || [];
    } catch (err) {
      error.value = ERROR_MESSAGES.NETWORK_ERROR;
      console.error('Failed to fetch liked videos:', err);
    } finally {
      loading.value = false;
    }
  };

  const addToHistory = async (videoId) => {
    try {
      await userService.addToHistory(videoId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    history,
    playlists,
    likedVideos,
    loading,
    error,
    fetchHistory,
    fetchPlaylists,
    fetchLikedVideos,
    addToHistory,
  };
}

/**
 * Composable for session management
 */
export function useSession() {
  const sessionId = ref(localStorage.getItem(STORAGE_KEYS.SESSION_ID));

  if (!sessionId.value) {
    // Generate new session ID
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    sessionId.value = generateUUID();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId.value);
  }

  return {
    sessionId,
  };
}