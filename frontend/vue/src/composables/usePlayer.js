import { ref, reactive } from 'vue';
import { hlsService } from '../services/hlsService';
import { ERROR_MESSAGES } from '../utils/constants';

/**
 * Composable for video player logic
 * Supports both HLS.js and native HLS fallback
 */
export function usePlayer(videoElement) {
  const hlsInstance = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isPlaying = ref(false);
  const isNativePlayback = ref(false);

  const playerState = reactive({
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  });

  const initializeHLS = async (videoUrl, onError = null) => {
    loading.value = true;
    error.value = null;
    isNativePlayback.value = false;

    // Ensure video element exists
    if (!videoElement.value) {
      error.value = 'Video element not found';
      loading.value = false;
      return;
    }

    // Clear previous state
    destroyHLS();

    // Check if HLS is supported
    const isSupported = hlsService.isSupported();
    
    if (!isSupported) {
      // Fallback to native playback
      error.value = 'HLS not supported';
      await setupNativePlayback(videoUrl, onError);
      return;
    }

    // Check if HLS.js is available for advanced features
    const isHlsJsAvailable = hlsService.isHlsJsAvailable();
    
    if (!isHlsJsAvailable) {
      // Use native HLS (Safari)
      console.log('Using native HLS playback');
      await setupNativePlayback(videoUrl, onError);
      return;
    }

    // Use HLS.js
    try {
      await setupHlsPlayback(videoUrl, onError);
    } catch (err) {
      console.warn('HLS.js failed, falling back to native:', err);
      await setupNativePlayback(videoUrl, onError);
    }
  };

  const setupHlsPlayback = async (videoUrl, onError) => {
    const hls = hlsService.createInstance();
    if (!hls) {
      throw new Error('Failed to create HLS instance');
    }

    hlsInstance.value = hls;
    const video = videoElement.value;

    try {
      video.crossOrigin = 'anonymous';
    } catch (_) {}

    hls.attachMedia(video);
    hls.loadSource(videoUrl);

    // Wait for manifest to be parsed
    await hlsService.waitForEvent(hls, 'hlsManifestParsed');

    // Start loading
    try {
      hls.startLoad(0);
    } catch (_) {
      try {
        hls.startLoad();
      } catch (_) {}
    }

    // Wait for initial buffer
    await Promise.race([
      hlsService.waitForEvent(hls, 'hlsFragBuffered'),
      hlsService.waitForEvent(hls, 'hlsBufferAppended'),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]);

    loading.value = false;
    isNativePlayback.value = false;

    // Error handling with recovery
    hls.on('hlsError', async (event, data) => {
      console.warn('HLS error:', data);
      if (onError) onError(data);

      if (data && data.fatal) {
        if (data.type === 'networkError' && data.details === 'manifestLoadError') {
          // Try native fallback on manifest load failure
          console.warn('Manifest load failed, falling back to native');
          destroyHLS();
          await setupNativePlayback(videoUrl, onError);
        } else if (data.type === 'networkError') {
          try {
            hls.startLoad();
          } catch (_) {}
        } else if (data.type === 'mediaError') {
          try {
            hls.recoverMediaError();
          } catch (_) {}
        } else {
          // Fallback to native playback
          destroyHLS();
          await setupNativePlayback(videoUrl, onError);
        }
      }
    });

    // Handle buffer stalled
    hls.on('hlsBufferStalled', () => {
      try {
        hls.recoverMediaError();
      } catch (_) {}
    });
  };

  const setupNativePlayback = async (videoUrl, onError) => {
    const video = videoElement.value;
    if (!video) return;

    isNativePlayback.value = true;

    try {
      video.crossOrigin = 'anonymous';
    } catch (_) {}

    // Clear any existing source
    video.removeAttribute('src');
    video.load();

    // Set native source
    video.src = videoUrl;

    return new Promise((resolve, reject) => {
      // Handle successful load
      video.oncanplay = () => {
        loading.value = false;
        resolve();
      };

      // Handle error
      video.onerror = (e) => {
        const errMsg = video.error ? video.error.message : 'Unknown error';
        error.value = errMsg;
        loading.value = false;
        if (onError) onError({ type: 'nativeError', message: errMsg });
        reject(new Error(errMsg));
      };

      // Handle load start
      video.onloadstart = () => {
        loading.value = true;
      };

      // Set timeout for loading
      const timeout = setTimeout(() => {
        if (loading.value) {
          loading.value = false;
          error.value = 'Loading timeout';
          reject(new Error('Loading timeout'));
        }
      }, 30000);

      // Cleanup timeout on load
      const cleanup = () => clearTimeout(timeout);
      video.oncanplay = () => {
        cleanup();
        loading.value = false;
        resolve();
      };
      video.onerror = () => {
        cleanup();
      };
    });
  };

  const play = async () => {
    try {
      await videoElement.value.play();
      isPlaying.value = true;
    } catch (err) {
      console.warn('Play failed:', err);
    }
  };

  const pause = () => {
    videoElement.value.pause();
    isPlaying.value = false;
  };

  const togglePlayPause = async () => {
    if (!videoElement.value) return;
    if (videoElement.value.paused) {
      await play();
    } else {
      pause();
    }
  };

  const seek = (time) => {
    if (videoElement.value) {
      videoElement.value.currentTime = time;
    }
  };

  const setVolume = (volume) => {
    if (videoElement.value) {
      const vol = Math.max(0, Math.min(1, volume));
      videoElement.value.volume = vol;
      playerState.volume = vol;
    }
  };

  const toggleMute = () => {
    if (videoElement.value) {
      videoElement.value.muted = !videoElement.value.muted;
      playerState.isMuted = videoElement.value.muted;
    }
  };

  const requestFullscreen = () => {
    if (videoElement.value) {
      if (videoElement.value.requestFullscreen) {
        videoElement.value.requestFullscreen();
      } else if (videoElement.value.webkitRequestFullscreen) {
        videoElement.value.webkitRequestFullscreen();
      }
    }
  };

  const destroyHLS = () => {
    if (hlsInstance.value) {
      hlsService.destroy(hlsInstance.value, videoElement.value);
      hlsInstance.value = null;
    }
    isNativePlayback.value = false;
  };

  // Update player state on time update
  const onTimeUpdate = () => {
    if (videoElement.value) {
      playerState.currentTime = videoElement.value.currentTime;
      playerState.duration = videoElement.value.duration || 0;
    }
  };

  // Attach event listeners
  if (videoElement.value) {
    videoElement.value.addEventListener('timeupdate', onTimeUpdate);
    videoElement.value.addEventListener('play', () => {
      isPlaying.value = true;
    });
    videoElement.value.addEventListener('pause', () => {
      isPlaying.value = false;
    });
  }

  return {
    hlsInstance,
    loading,
    error,
    isPlaying,
    isNativePlayback,
    playerState,
    initializeHLS,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    requestFullscreen,
    destroyHLS,
  };
}