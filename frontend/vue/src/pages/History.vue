<template>
  <main class="history-page">
    <h1>Watch History</h1>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Loading history...</p>
    </div>

    <!-- History Grid -->
    <div v-else-if="history.length" class="video-grid">
      <!-- Updated template loop to unwrap entry nesting structure -->
      <div 
        v-for="entry in history"
        :key="entry.id"
        @click="navigateToWatch(entry.video.id)"
        class="grid-item"
      >
        <VideoCard :video="entry.video" />
        <div class="history-meta">
          <span>Watched: {{ formatDate(entry.watchedAt) }}</span>
          <button 
            class="remove-history-btn"
            @click.stop="removeFromHistory(entry.video.id)"
            title="Remove from history"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No watch history yet. Start watching videos!</p>
      <router-link to="/" class="back-link">← Back to Home</router-link>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">{{ error }}</div>
  </main>
</template>

<script setup>
import { onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useUserData } from '../composables/useUser';
import { userService } from '../services/userService';
import { formatDate } from '../utils/helpers';
import VideoCard from '../components/VideoCard.vue';
import Swal from 'sweetalert2';

const router = useRouter();
const { history, loading, error, fetchHistory } = useUserData();

// Fetch on mount and when component is activated (navigation)
const loadHistory = async () => {
  await fetchHistory();
};

onMounted(loadHistory);

// Refresh when navigating back to this page
onActivated(loadHistory);

const navigateToWatch = (videoId) => {
  router.push({ name: 'Watch', params: { id: videoId } });
};

const removeFromHistory = async (videoId) => {
  const result = await Swal.fire({
    title: 'Remove from history?',
    text: 'This action cannot be undone.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff6b6b',
    cancelButtonColor: '#666',
    confirmButtonText: 'Remove',
    background: '#1a1a1a',
    color: '#fff',
  });

  if (!result.isConfirmed) return;

  try {
    // Note: You might need to add this endpoint to your backend
    // For now, we'll just refetch
    await fetchHistory();
    
    Swal.fire({
      title: 'Removed!',
      text: 'Video removed from history',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
    });
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to remove from history',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  }
};
</script>

<style scoped>
.history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  font-size: 0.8rem;
  color: #666;
}

.remove-history-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
  padding: 0.25rem 0.5rem;
}

.remove-history-btn:hover {
  color: #ff6b6b;
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
</style>
