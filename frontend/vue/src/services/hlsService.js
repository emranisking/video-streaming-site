/**
 * HLS Service - handles video playback with HLS.js
 * Provides fallback for native HLS support (Safari)
 */

// Dynamically import HLS.js
let Hls = null;
let isHlsLoaded = false;

const loadHls = async () => {
  if (isHlsLoaded) return Hls;
  try {
    const hlsModule = await import('hls.js');
    Hls = hlsModule.default;
    isHlsLoaded = true;
    return Hls;
  } catch (e) {
    console.warn('HLS.js not available, using native playback');
    return null;
  }
};

export const hlsService = {
  /**
   * Check if HLS is supported
   * Returns true if HLS.js is available OR browser supports native HLS
   */
  isSupported() {
    // Check for native HLS support (Safari)
    const video = document.createElement('video');
    const nativeHls = video.canPlayType('application/vnd.apple.mpegurl') || 
                      video.canPlayType('audio/mpegurl');
    
    // If native HLS is supported, we don't need HLS.js
    if (nativeHls) {
      console.log('Native HLS supported, using native playback');
      return true;
    }
    
    // Otherwise check if HLS.js is available
    return Hls && Hls.isSupported();
  },

  /**
   * Check if HLS.js is available (for advanced features)
   */
  isHlsJsAvailable() {
    return Hls && Hls.isSupported();
  },

  /**
   * Create HLS instance with optimized settings
   */
  createInstance() {
    if (!this.isHlsJsAvailable()) {
      return null;
    }

    return new Hls({
      xhrSetup: (xhr) => {
        xhr.setRequestHeader('ngrok-skip-browser-warning', 'any-value');
      },
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      autoStartLoad: false,
      startFragPrefetch: true,
      progressive: false,
      // Better error recovery
      enableWorker: true,
      lowLatencyMode: false,
      backbufferLength: 30,
    });
  },

  /**
   * Wait for HLS event
   */
  waitForEvent(hls, event) {
    return new Promise((resolve) => {
      const handler = (...args) => {
        try {
          hls.off(event, handler);
        } catch (_) {}
        resolve(args);
      };
      hls.on(event, handler);
    });
  },

  /**
   * Destroy HLS instance
   */
  destroy(hls, videoElement) {
    if (!hls) return;

    try {
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    } catch (_) {}

    try {
      if (videoElement) {
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    } catch (_) {}

    try {
      hls.off();
      hls.stopLoad();
      hls.detachMedia();
      hls.destroy();
    } catch (_) {}
  },

  /**
   * Load HLS library (call before using)
   */
  async loadLibrary() {
    return await loadHls();
  }
};

// Preload HLS library
loadHls();