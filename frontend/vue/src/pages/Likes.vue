<template>
  <main class="likes-page">
    <h1>Liked Videos</h1>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Loading liked videos...</p>
    </div>

    <!-- Likes Grid -->
    <div v-else-if="likedVideos.length" class="video-grid">
      <!-- Updated loop variable and nested video key accessors -->
      <div 
        v-for="like in likedVideos"
        :key="like.id"
        class="grid-item"
      >
        <VideoCard :video="like.video" @click="navigateToWatch(like.video.id)" />
        <button 
          class="unlike-btn"
          @click.stop="handleUnlike(like.video)"
        >
          💔 Unlike
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>You haven't liked any videos yet.</p>
      <router-link to="/" class="back-link">← Back to Home</router-link>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      {{ error }}
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onActivated, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserData } from '../composables/useUser';
import { videoService } from '../services/videoService';
import VideoCard from '../components/VideoCard.vue';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const { likedVideos, loading, error, fetchLikedVideos } = useUserData();

// Function to load likes
const loadLikes = async () => {
  await fetchLikedVideos();
};

// Retry function
const retryLoad = () => {
  loadLikes();
};

// Load on component mount
onMounted(() => {
  loadLikes();
});

// Refresh when navigating back to this page (keeps data fresh)
onActivated(() => {
  loadLikes();
});

// Watch for route changes (if using dynamic routes)
watch(() => route.fullPath, () => {
  // Only reload if we're coming back to this page
  if (route.name === 'Likes') {
    loadLikes();
  }
});

const navigateToWatch = (videoId) => {
  router.push({ name: 'Watch', params: { id: videoId } });
};

const handleUnlike = async (video) => {
  const result = await Swal.fire({
    title: 'Remove from likes?',
    text: `Unlike "${video.title}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff6b6b',
    cancelButtonColor: '#666',
    confirmButtonText: 'Unlike',
    background: '#1a1a1a',
    color: '#fff',
  });

  if (!result.isConfirmed) return;

  try {
    await videoService.unlikeVideo(video.id);
    
    // Updated local state removal index mapping to find by like.video.id
    const index = likedVideos.value.findIndex(like => like.video.id === video.id);
    if (index !== -1) {
      likedVideos.value.splice(index, 1);
    }

    Swal.fire({
      title: 'Removed!',
      text: 'Video removed from your likes',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
    });
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to unlike video',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  }
};
</script>

<style scoped>
.likes-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, rgba(255, 153, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
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
  position: relative;
  cursor: pointer;
}

.unlike-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.unlike-btn:hover {
  background: #ff6b6b;
  border-color: #ff6b6b;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 153, 0, 0.1);
  border-top: 3px solid #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.back-link {
  color: #ff9900;
  text-decoration: none;
}

.back-link:hover {
  color: #ffb366;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 0.5rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
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
</style>
