<template>
  <main class="watch-page">
    <router-link to="/" class="watch-backlink">← Back to home</router-link>

    <div class="watch-layout">
      <!-- Main Player Section -->
      <section class="watch-player-card">
        <!-- Video Title -->
        <h1 class="watch-title">
          {{ video ? video.title : 'Loading video...' }}
        </h1>

        <!-- Video Metadata -->
        <div v-if="video" class="watch-meta">
          <span>{{ formatViewCount(video.views) }} views</span>
          <span>{{ video.likes || 0 }} likes</span>
          <span v-if="video.category?.name">{{ video.category.name }}</span>
        </div>

        <!-- Video Player -->
        <VideoPlayer 
          v-if="isPlaybackReady && video"
          :videoUrl="getVideoUrl()"
          :videoId="Number(props.videoId)"
          @timeupdate="savePosition"
          @ended="clearPosition"
        />

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-state">
          <div class="video-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading video...</p>
        </div>

        <!-- Watch Limit Message -->
        <div v-if="watchLimitMsg" class="watch-message">
          {{ watchLimitMsg }}
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </section>

      <!-- Sidebar -->
      <aside class="watch-sidebar">
        <h3>Video Actions</h3>
        <p>
          Play this video on its own page, just like YouTube. 
          Your history and likes are still tracked after playback starts.
        </p>
        <div class="watch-actions">
          <button 
            class="like-btn"
            :class="{ 'liked': isLiked }"
            @click="handleLike"
            :disabled="!isAuthenticated || !video || loading"
          >
            {{ isLiked ? '❤️ Liked' : '🤍 Like' }}
          </button>
          <span class="like-count">{{ video?.likes || 0 }} likes</span>
        </div>

        <!-- Additional video info -->
        <div v-if="video" class="video-info-section">
          <h4>Description</h4>
          <p>{{ video.description || 'No description available.' }}</p>
          <p class="video-date">
            Uploaded: {{ formatDate(video.createdAt) }}
          </p>
        </div>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useWatch } from '../composables/useWatch';
import { formatViewCount, formatDate } from '../utils/helpers';
import VideoPlayer from '../components/VideoPlayer.vue';
import Swal from 'sweetalert2';

const props = defineProps({
  videoId: {
    type: Number,
    required: true,
  },
});

const {
  video,
  loading,
  error,
  isLiked,
  watchLimitMsg,
  isPlaybackReady,
  isAuthenticated,
  initializeWatch,
  getVideoUrl,
  toggleLike,
  savePosition,
  clearPosition,
  reset,
} = useWatch(props.videoId);

// Handle like/unlike
const handleLike = async () => {
  const result = await toggleLike();
  if (result.success) {
    Swal.fire({
      title: result.action === 'liked' ? 'Liked!' : 'Unliked!',
      text: result.action === 'liked' ? 'Video liked ❤️' : 'Video unliked 💔',
      icon: result.action === 'liked' ? 'success' : 'info',
      timer: 1000,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
    });
  } else if (result.error !== 'Authentication required') {
    Swal.fire({
      title: 'Error',
      text: result.error || 'Failed to update like',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  }
};

// Watch for route changes
watch(() => props.videoId, async (newId, oldId) => {
  if (newId !== oldId) {
    reset();
    await initializeWatch();
  }
});

// Initialize on mount
onMounted(async () => {
  await initializeWatch();
});
</script>

<style scoped>
.watch-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, rgba(255, 153, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 2rem;
}

.watch-backlink {
  display: inline-block;
  margin-bottom: 2rem;
  color: #ff9900;
  text-decoration: none;
  transition: color 0.2s;
}

.watch-backlink:hover {
  color: #ffb366;
}

.watch-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.7fr 0.8fr;
  gap: 2rem;
}

.watch-player-card {
  background: rgba(17, 17, 17, 0.96);
  border: 1px solid rgba(255, 153, 0, 0.16);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.watch-title {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.watch-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: #999;
  font-size: 0.9rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.video-loader {
  display: flex;
  gap: 0.5rem;
}

.video-loader span {
  width: 8px;
  height: 8px;
  background: #ff9900;
  border-radius: 50%;
  animation: bounce 1.4s infinite;
}

.video-loader span:nth-child(1) { animation-delay: -0.32s; }
.video-loader span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.watch-sidebar {
  background: rgba(17, 17, 17, 0.96);
  border: 1px solid rgba(255, 153, 0, 0.16);
  border-radius: 0.5rem;
  padding: 1.5rem;
  height: fit-content;
}

.watch-sidebar h3 {
  color: #ff9900;
  margin-bottom: 1rem;
}

.watch-sidebar p {
  color: #999;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.watch-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.like-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 153, 0, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 153, 0, 0.3);
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.like-btn:hover:not(:disabled) {
  background: rgba(255, 153, 0, 0.2);
  border-color: #ff9900;
}

.like-btn.liked {
  background: #ff9900;
  color: #000;
  border-color: #ff9900;
}

.like-btn.liked:hover:not(:disabled) {
  background: #ffb366;
}

.like-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.like-count {
  color: #999;
  font-size: 0.9rem;
}

.video-info-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.video-info-section h4 {
  color: #ff9900;
  margin-bottom: 0.5rem;
}

.video-info-section p {
  color: #999;
  font-size: 0.9rem;
  line-height: 1.6;
}

.video-date {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.watch-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 0.25rem;
  color: #ff6b6b;
  text-align: center;
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 0.25rem;
  color: #ff6b6b;
  text-align: center;
}

@media (max-width: 960px) {
  .watch-layout {
    grid-template-columns: 1fr;
  }

  .watch-sidebar {
    height: auto;
  }
}
</style>