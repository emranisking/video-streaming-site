<template>
  <div class="video-player-container">
    <!-- Loader -->
    <div v-if="loading" class="video-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- Video Player -->
    <div class="player-shell" ref="playerShell">
      <video
        ref="videoElement"
        playsinline
        crossorigin="anonymous"
        class="video-player"
        @timeupdate="onTimeUpdate"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @error="onVideoError"
      ></video>

      <!-- Controls -->
      <div class="player-controls">
        <button 
          class="control-btn play-btn"
          @click="togglePlayPauseLocal"
          :title="isPlaying ? 'Pause' : 'Play'"
        >
          {{ isPlaying ? '⏸️' : '▶️' }}
        </button>

        <input
          type="range"
          class="seek-bar"
          :value="currentTime"
          :max="duration || 0"
          step="0.1"
          @input="seekLocal($event.target.value)"
        >

        <span class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>

        <button 
          class="control-btn mute-btn"
          @click="toggleMuteLocal"
          :title="isMuted ? 'Unmute' : 'Mute'"
        >
          {{ isMuted ? '🔇' : '🔊' }}
        </button>

        <input
          type="range"
          class="volume-bar"
          :value="volume"
          min="0"
          max="1"
          step="0.05"
          @input="setVolumeLocal($event.target.value)"
        >

        <button 
          class="control-btn fullscreen-btn"
          @click="requestFullscreenLocal"
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="player-error">
      {{ error }}
      <button class="retry-btn" @click="retryPlayback">Retry</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { usePlayer } from '../composables/usePlayer';
import { formatTime } from '../utils/formatters';

const props = defineProps({
  videoUrl: {
    type: String,
    required: true,
  },
  videoId: {
    type: Number,
    required: true,
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['timeupdate', 'ended', 'error', 'loaded']);

const videoElement = ref(null);
const playerShell = ref(null);
const sessionId = ref(localStorage.getItem('sessionId') || 'guest');

// Player state
const currentTime = ref(0);
const duration = ref(0);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(1);

const { 
  loading, 
  error, 
  initializeHLS,
  togglePlayPause,
  setVolume: setPlayerVolume,
  toggleMute: togglePlayerMute,
  seek: seekPlayer,
  requestFullscreen,
  destroyHLS,
  play,
  pause,
  isNativePlayback,
} = usePlayer(videoElement);

// Get saved resume position
const getResumePosition = () => {
  const sessionKey = `pos_${props.videoId}_${sessionId.value}`;
  const saved = localStorage.getItem(sessionKey);
  return saved ? Number(saved) : 0;
};

// Save position periodically
let saveInterval = null;
const savePosition = () => {
  if (videoElement.value && currentTime.value > 2) {
    const sessionKey = `pos_${props.videoId}_${sessionId.value}`;
    try {
      localStorage.setItem(sessionKey, String(currentTime.value));
    } catch (_) {}
  }
};

// Clear saved position when video ends
const clearPosition = () => {
  const sessionKey = `pos_${props.videoId}_${sessionId.value}`;
  try {
    localStorage.removeItem(sessionKey);
  } catch (_) {}
};

// Time update handler
const onTimeUpdate = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime;
    duration.value = videoElement.value.duration || 0;
    emit('timeupdate', currentTime.value);
  }
};

// Metadata loaded
const onLoadedMetadata = () => {
  const resumeTime = getResumePosition();
  if (resumeTime > 2 && videoElement.value) {
    try {
      videoElement.value.currentTime = resumeTime;
    } catch (_) {}
  }
  emit('loaded');
};

// Ended handler
const onEnded = () => {
  clearPosition();
  emit('ended');
};

// Video error handler
const onVideoError = (event) => {
  console.error('Video error:', event);
  emit('error', event);
};

// Retry playback
const retryPlayback = async () => {
  await setupVideo();
};

// Setup video playback with debounce
let setupTimeout = null;
const setupVideo = async () => {
  // Clear any pending setup
  if (setupTimeout) {
    clearTimeout(setupTimeout);
    setupTimeout = null;
  }

  // Wait for DOM update
  await nextTick();
  
  if (!videoElement.value || !props.videoUrl) return;

  // Destroy existing HLS instance
  destroyHLS();

  // Initialize new playback
  try {
    await initializeHLS(props.videoUrl, (hlsError) => {
      console.warn('HLS error in player:', hlsError);
    });
  } catch (err) {
    console.error('Setup video failed:', err);
  }
};

// Watch for videoUrl changes
watch(() => props.videoUrl, (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    // Reset state
    currentTime.value = 0;
    duration.value = 0;
    // Setup new video with debounce
    setupTimeout = setTimeout(setupVideo, 100);
  }
}, { immediate: false });

// Watch for play/pause state
watch(isPlaying, (newVal) => {
  if (newVal) {
    // Start saving position when playing
    if (!saveInterval) {
      saveInterval = setInterval(savePosition, 5000);
    }
  } else {
    // Save immediately on pause
    savePosition();
  }
});

// Override toggle functions to update local state
const togglePlayPauseLocal = () => {
  togglePlayPause();
};

const setVolumeLocal = (val) => {
  const numVal = parseFloat(val);
  volume.value = numVal;
  setPlayerVolume(numVal);
};

const toggleMuteLocal = () => {
  togglePlayerMute();
  isMuted.value = !isMuted.value;
};

const seekLocal = (val) => {
  const numVal = parseFloat(val);
  currentTime.value = numVal;
  seekPlayer(numVal);
};

// Request fullscreen for the player shell
const requestFullscreenLocal = () => {
  if (playerShell.value) {
    if (playerShell.value.requestFullscreen) {
      playerShell.value.requestFullscreen();
    } else if (playerShell.value.webkitRequestFullscreen) {
      playerShell.value.webkitRequestFullscreen();
    }
  }
};

onMounted(async () => {
  await setupVideo();
  
  // Auto play if enabled
  if (props.autoPlay) {
    setTimeout(async () => {
      try {
        await play();
      } catch (_) {}
    }, 500);
  }
});

onUnmounted(() => {
  // Save final position
  savePosition();
  
  // Clear interval
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  
  // Clear timeout
  if (setupTimeout) {
    clearTimeout(setupTimeout);
    setupTimeout = null;
  }
  
  // Destroy HLS
  destroyHLS();
});
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  overflow: hidden;
}

.video-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
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

.player-shell {
  position: relative;
  width: 100%;
  max-height: 72vh;
}

.video-player {
  width: 100%;
  height: 100%;
  max-height: 72vh;
  background: #000;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  flex-wrap: wrap;
}

.control-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.25rem 0.5rem;
}

.control-btn:hover {
  color: #ff9900;
}

.seek-bar {
  flex: 1;
  min-width: 60px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 153, 0, 0.2);
  outline: none;
  cursor: pointer;
}

.seek-bar::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff9900;
  cursor: pointer;
}

.seek-bar::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff9900;
  border: none;
  cursor: pointer;
}

.time-display {
  color: #fff;
  font-size: 0.85rem;
  min-width: 100px;
}

.volume-bar {
  width: 60px;
  min-width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 153, 0, 0.2);
  outline: none;
  cursor: pointer;
}

.volume-bar::-webkit-slider-thumb {
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff9900;
  cursor: pointer;
}

.volume-bar::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff9900;
  border: none;
  cursor: pointer;
}

.player-error {
  padding: 1rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  text-align: center;
}

.retry-btn {
  margin-left: 1rem;
  padding: 0.25rem 1rem;
  background: #ff9900;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
}

.retry-btn:hover {
  background: #ffb366;
}

@media (max-width: 640px) {
  .player-controls {
    gap: 0.25rem;
    padding: 0.5rem;
  }
  
  .time-display {
    min-width: 70px;
    font-size: 0.7rem;
  }
  
  .volume-bar {
    width: 40px;
    min-width: 30px;
  }
}
</style>