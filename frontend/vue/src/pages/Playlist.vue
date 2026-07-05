<template>
  <main class="playlist-page">
    <h1>My Playlists</h1>

    <!-- Create Playlist Form -->
    <div class="create-playlist-form">
      <form @submit.prevent="createPlaylist">
        <input
          v-model="newPlaylistName"
          type="text"
          placeholder="New Playlist Name"
          required
        />
        <button type="submit" :disabled="creating">
          {{ creating ? 'Creating...' : '+ Create Playlist' }}
        </button>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Loading playlists...</p>
    </div>

    <!-- Playlists Grid -->
    <div v-else-if="playlists.length" class="playlist-grid">
      <div 
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-item"
      >
        <div class="playlist-info" @click="openPlaylist(playlist)">
          <h3>{{ playlist.name }}</h3>
          <p>{{ playlist.items?.length || 0 }} videos</p>
        </div>
        <div class="playlist-actions">
          <button 
            class="add-video-btn"
            @click.stop="showAddVideoModal(playlist)"
            title="Add video to playlist"
          >
            ➕
          </button>
          <button 
            class="delete-playlist-btn"
            @click.stop="deletePlaylist(playlist.id)"
            title="Delete playlist"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>You don't have any playlists yet.</p>
      <p class="hint">Create one above to get started!</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      {{ error }}
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>

    <!-- Add Video Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h2>Add Video to "{{ selectedPlaylist?.name }}"</h2>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search videos..."
            @input="searchVideos"
          />
        </div>
        <div class="video-list">
          <div 
            v-for="video in searchResults" 
            :key="video.id"
            class="video-item"
            @click="addVideoToPlaylist(video.id)"
          >
            <img :src="video.thumbnailUrl" :alt="video.title" />
            <span>{{ video.title }}</span>
          </div>
          <p v-if="searchResults.length === 0 && searchQuery">No videos found</p>
        </div>
        <button @click="showAddModal = false" class="close-modal-btn">Close</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onActivated, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserData } from '../composables/useUser';
import { userService } from '../services/userService';
import { videoService } from '../services/videoService';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const { playlists, loading, error, fetchPlaylists } = useUserData();

const newPlaylistName = ref('');
const creating = ref(false);
const showAddModal = ref(false);
const selectedPlaylist = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);

const loadPlaylists = async () => {
  await fetchPlaylists();
};

const retryLoad = () => {
  loadPlaylists();
};

onMounted(loadPlaylists);
onActivated(loadPlaylists);

watch(() => route.fullPath, () => {
  if (route.name === 'Playlist') {
    loadPlaylists();
  }
});

// Create Playlist
const createPlaylist = async () => {
  if (!newPlaylistName.value.trim()) return;

  creating.value = true;
  try {
    const response = await userService.createPlaylist(newPlaylistName.value.trim());
    
    Swal.fire({
      title: 'Success!',
      text: `Playlist "${response.title || newPlaylistName.value}" created!`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
    });

    newPlaylistName.value = '';
    await loadPlaylists();
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.message || 'Failed to create playlist',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  } finally {
    creating.value = false;
  }
};

// Delete Playlist
const deletePlaylist = async (playlistId) => {
  const result = await Swal.fire({
    title: 'Delete Playlist?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff6b6b',
    cancelButtonColor: '#666',
    confirmButtonText: 'Delete',
    background: '#1a1a1a',
    color: '#fff',
  });

  if (!result.isConfirmed) return;

  try {
    await userService.deletePlaylist(playlistId);
    await loadPlaylists();
    
    Swal.fire({
      title: 'Deleted!',
      text: 'Playlist has been deleted.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
    });
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to delete playlist',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  }
};

// Show Add Video Modal
const showAddVideoModal = async (playlist) => {
  selectedPlaylist.value = playlist;
  showAddModal.value = true;
  searchQuery.value = '';
  searchResults.value = [];
};

// Search Videos
const searchVideos = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  try {
    const response = await videoService.search(searchQuery.value);
    searchResults.value = response.videos || response || [];
  } catch (err) {
    console.error('Search failed:', err);
  }
};

// Add Video to Playlist
const addVideoToPlaylist = async (videoId) => {
  if (!selectedPlaylist.value) return;

  try {
    await userService.addToPlaylist(selectedPlaylist.value.id, videoId);
    
    Swal.fire({
      title: 'Added!',
      text: 'Video added to playlist',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
    });
    
    // Refresh playlists
    await loadPlaylists();
    showAddModal.value = false;
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to add video to playlist',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  }
};

const openPlaylist = (playlist) => {
  // Navigate to playlist detail or expand view
  // For now, just show the videos in a modal
  const videoTitles = playlist.items?.map(i => i.video.title).join('\n') || 'No videos';
  Swal.fire({
    title: playlist.name,
    text: videoTitles,
    icon: 'info',
    background: '#1a1a1a',
    color: '#fff',
    confirmButtonColor: '#ff9900',
  });
};
</script>

<style scoped>
.playlist-page {
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

.create-playlist-form {
  margin-bottom: 2rem;
}

.create-playlist-form form {
  display: flex;
  gap: 1rem;
  max-width: 500px;
}

.create-playlist-form input {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 153, 0, 0.2);
  border-radius: 0.25rem;
  color: #fff;
  font-size: 1rem;
}

.create-playlist-form input:focus {
  outline: none;
  border-color: #ff9900;
}

.create-playlist-form button {
  padding: 0.75rem 1.5rem;
  background: #ff9900;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.create-playlist-form button:hover:not(:disabled) {
  background: #ffb366;
}

.create-playlist-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.playlist-item {
  background: rgba(17, 17, 17, 0.96);
  border: 1px solid rgba(255, 153, 0, 0.16);
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.playlist-item:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 153, 0, 0.3);
  box-shadow: 0 8px 16px rgba(255, 153, 0, 0.1);
}

.playlist-info {
  flex: 1;
  cursor: pointer;
}

.playlist-info h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.playlist-info p {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
}

.playlist-actions button {
  background: transparent;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.add-video-btn:hover {
  color: #ff9900;
}

.delete-playlist-btn:hover {
  color: #ff6b6b;
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
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 153, 0, 0.2);
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #ff9900;
  margin-bottom: 1.5rem;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 153, 0, 0.2);
  border-radius: 0.25rem;
  color: #fff;
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: #ff9900;
}

.video-list {
  max-height: 300px;
  overflow-y: auto;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 0.25rem;
}

.video-item:hover {
  background: rgba(255, 153, 0, 0.1);
}

.video-item img {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.video-item span {
  color: #fff;
}

.close-modal-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #666;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.close-modal-btn:hover {
  background: #888;
}
</style>