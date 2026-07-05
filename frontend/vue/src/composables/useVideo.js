import { ref, computed } from 'vue';
import { videoService } from '../services/videoService';
import { UI_CONSTANTS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Composable for video fetching and management
 */
export function useVideo() {
  const videos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const hasMore = ref(true);

  const fetchVideos = async (page = 1, limit = UI_CONSTANTS.VIDEOS_PER_PAGE) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('📹 Fetching videos from backend...');
      const response = await videoService.getVideos(page, limit);
      console.log('📹 Raw API response:', response);
      
      // Handle both array and object responses
      let videoData = response;
      if (response && typeof response === 'object') {
        // If response has a data property (paginated response)
        if (response.data && Array.isArray(response.data)) {
          videoData = response.data;
        }
        // If response is an object with videos property
        else if (response.videos && Array.isArray(response.videos)) {
          videoData = response.videos;
        }
        // If response is an array directly
        else if (Array.isArray(response)) {
          videoData = response;
        }
        // If response is an object with numeric keys (array-like)
        else {
          videoData = Object.values(response).filter(item => typeof item === 'object' && item.id);
        }
      }
      
      // Ensure we have an array
      if (!Array.isArray(videoData)) {
        console.warn('⚠️ Response is not an array:', videoData);
        videoData = [];
      }
      
      console.log('📹 Processed videos:', videoData);
      console.log('📹 Video count:', videoData.length);
      
      if (page === 1) {
        videos.value = videoData;
      } else {
        videos.value = [...videos.value, ...videoData];
      }

      currentPage.value = page;
      hasMore.value = videoData.length === limit;
      
      if (videos.value.length === 0) {
        console.warn('⚠️ No videos found in response');
      }
    } catch (err) {
      error.value = err.message || ERROR_MESSAGES.NETWORK_ERROR;
      console.error('❌ Failed to fetch videos:', err);
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return;
    await fetchVideos(currentPage.value + 1);
  };

  return {
    videos,
    loading,
    error,
    currentPage,
    hasMore,
    fetchVideos,
    loadMore,
  };
}