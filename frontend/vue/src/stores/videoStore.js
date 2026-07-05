import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { videoService } from '../services/videoService';
import { UI_CONSTANTS } from '../utils/constants';

export const useVideoStore = defineStore('video', () => {
  // State
  const videos = ref([]);
  const currentVideo = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const hasMore = ref(true);
  const searchQuery = ref('');
  const selectedCategory = ref(null);

  // Getters
  const filteredVideos = computed(() => {
    let result = videos.value;
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
      );
    }
    if (selectedCategory.value) {
      result = result.filter(v => v.categoryId === selectedCategory.value);
    }
    return result;
  });

  // Actions
  const fetchVideos = async (page = 1, limit = UI_CONSTANTS.VIDEOS_PER_PAGE) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await videoService.getAll(page, limit);
      const newVideos = response.videos || response || [];
      
      if (page === 1) {
        videos.value = newVideos;
      } else {
        videos.value = [...videos.value, ...newVideos];
      }

      currentPage.value = page;
      hasMore.value = newVideos.length === limit;
    } catch (err) {
      error.value = err.message;
      console.error('Failed to fetch videos:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchVideo = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await videoService.getById(id);
      currentVideo.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Failed to fetch video:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return;
    await fetchVideos(currentPage.value + 1);
  };

  const searchVideos = async (query) => {
    searchQuery.value = query;
    if (query) {
      loading.value = true;
      try {
        const response = await videoService.search(query);
        videos.value = response.videos || response || [];
        hasMore.value = false;
      } catch (err) {
        error.value = err.message;
        console.error('Failed to search videos:', err);
      } finally {
        loading.value = false;
      }
    } else {
      await fetchVideos(1);
    }
  };

  const filterByCategory = async (categoryId) => {
    selectedCategory.value = categoryId;
    loading.value = true;
    try {
      const response = await videoService.getByCategory(categoryId);
      videos.value = response.videos || response || [];
      hasMore.value = false;
    } catch (err) {
      error.value = err.message;
      console.error('Failed to filter videos:', err);
    } finally {
      loading.value = false;
    }
  };

  const clearCache = () => {
    videos.value = [];
    currentVideo.value = null;
    currentPage.value = 1;
    hasMore.value = true;
    searchQuery.value = '';
    selectedCategory.value = null;
  };

  return {
    // State
    videos,
    currentVideo,
    loading,
    error,
    currentPage,
    hasMore,
    searchQuery,
    selectedCategory,
    
    // Getters
    filteredVideos,
    
    // Actions
    fetchVideos,
    fetchVideo,
    loadMore,
    searchVideos,
    filterByCategory,
    clearCache,
  };
});