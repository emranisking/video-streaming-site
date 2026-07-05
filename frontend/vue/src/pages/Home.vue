<template>
  <main class="home-page">
    <section class="videos-section">
      <h2 v-once>Videos</h2>
      
      <!-- Loading Skeletons -->
      <div v-if="loading && videos.length === 0" class="video-grid">
        <SkeletonCard v-for="i in 12" :key="i" />
      </div>

      <!-- Video Grid -->
      <div v-else-if="videos.length > 0" class="video-grid">
        <div 
          v-for="video in videos"
          :key="video.id"
          class="grid-item"
        >
          <VideoCard 
            :video="video" 
            @click="navigateToWatch"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && !error" class="empty-state">
        <p>No videos available</p>
        <p class="hint">Check if your backend is running and has videos</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">Retry</button>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading && videos.length" class="load-more-section">
        <button @click="loadMore" class="load-more-btn">
          Load More Videos
        </button>
      </div>
      
      <!-- Loading More -->
      <div v-if="loading && videos.length" class="loading-more">
        <div class="loader"></div>
        <span>Loading more...</span>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVideo } from '../composables/useVideo';
import VideoCard from '../components/VideoCard.vue';
import SkeletonCard from '../components/SkeletonCard.vue';

const router = useRouter();
const { videos, loading, error, hasMore, fetchVideos, loadMore } = useVideo();

onMounted(() => {
  console.log('🏠 Home page mounted, fetching videos...');
  fetchVideos(1);
});

const navigateToWatch = (video) => {
  console.log('🎬 Navigating to watch video:', video.id, video.title);
  router.push({ 
    name: 'Watch', 
    params: { id: video.id } 
  });
};

const retry = () => {
  console.log('🔄 Retrying fetch...');
  fetchVideos(1);
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, rgba(255, 153, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 2rem;
}

.videos-section {
  max-width: 1400px;
  margin: 0 auto;
}

.videos-section h2 {
  color: #ff9900;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.grid-item {
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state .hint {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 0.5rem;
  margin: 2rem 0;
}

.error-state p {
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 2rem;
  background: #ff9900;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #ffb366;
}

.load-more-section {
  text-align: center;
  padding: 2rem 0;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
  border: 1px solid rgba(255, 153, 0, 0.3);
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: rgba(255, 153, 0, 0.2);
  border-color: #ff9900;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #999;
}

.loader {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 153, 0, 0.1);
  border-top: 2px solid #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>