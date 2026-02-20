// === DOM elements ===
const videoGrid = document.getElementById("video-grid");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");
const watchLimitMsg = document.getElementById("watchLimitMsg");
const closeVideoOutside = document.getElementById("closeVideoOutside");
const videoLoader = document.getElementById("videoLoader");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const userMenuContainer = document.getElementById("userMenuContainer");
const userIcon = document.getElementById("userIcon");
const userDropdown = document.getElementById("userDropdown");
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginClose = document.getElementById("loginClose");
const signupClose = document.getElementById("signupClose");
const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");

const playPauseBtn = document.getElementById("playPauseBtn");
const seekBar = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const muteBtn = document.getElementById("muteBtn");
const volumeBar = document.getElementById("volumeBar");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// Backend Setup
const BACKEND_HOST = "http://192.168.10.137:7000";
const BACKEND_URL = `${BACKEND_HOST}/videos`;

// UUID fallback
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Auth
let token = localStorage.getItem("token");
const sessionId = localStorage.getItem("sessionId") || generateUUID();
localStorage.setItem("sessionId", sessionId);

// HLS instance
let hlsInstance = null;

// === SweetAlert helper ===
function showAlert(message, type = "info") {
  Swal.fire({
    text: message,
    icon: type,
    confirmButtonColor: "#ff9900",
    background: "#1a1a1a",
    color: "#fff",
    position: "center",
  });
}

// === AUTH UI ===
function updateAuthUI() {
  if (token) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    userMenuContainer.style.display = "flex";
  } else {
    loginBtn.style.display = "inline";
    signupBtn.style.display = "inline";
    userMenuContainer.style.display = "none";
    userDropdown.style.display = "none";
  }
}
updateAuthUI();

// Dropdown toggle
userIcon.onclick = () => {
  userDropdown.style.display =
    userDropdown.style.display === "block" ? "none" : "block";
};

// Close dropdown outside
window.addEventListener("click", (e) => {
  if (!userMenuContainer.contains(e.target)) userDropdown.style.display = "none";
});

// Logout / dropdown actions
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("token");
  token = null;
  showAlert("Logged out successfully", "success");
  updateAuthUI();
};
document.getElementById("playlistBtn").onclick = () => showAlert("Go to Playlist");
document.getElementById("historyBtn").onclick = () => showAlert("Go to History");
document.getElementById("likeBtn").onclick = () => showAlert("Go to Likes");

// Login/Signup modals
loginBtn.onclick = () => (loginModal.style.display = "block");
signupBtn.onclick = () => (signupModal.style.display = "block");
loginClose.onclick = () => (loginModal.style.display = "none");
signupClose.onclick = () => (signupModal.style.display = "none");

// === Fetch headers helper ===
function getFetchHeaders(extra = {}) {
  return {
    "ngrok-skip-browser-warning": "any-value",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ================= VIDEO LOGIC =================

// Robust destroy for HLS + video element (fully remove listeners and GC-friendly)
function destroyHLS() {
  try { if (!videoPlayer.paused) videoPlayer.pause(); } catch (_) {}
  try { videoPlayer.removeAttribute('src'); } catch (_) {}
  try { videoPlayer.load(); } catch (_) {}

  if (hlsInstance) {
    try { hlsInstance.off(); } catch (_) {}
    try { hlsInstance.stopLoad(); } catch (_) {}
    try { hlsInstance.detachMedia(); } catch (_) {}
    try { hlsInstance.destroy(); } catch (_) {}
    hlsInstance = null;
  }

  try { videoPlayer.oncanplay = null; } catch (_) {}
  try { videoPlayer.onerror = null; } catch (_) {}
  try { videoPlayer.onloadedmetadata = null; } catch (_) {}
  try { videoPlayer.ontimeupdate = null; } catch (_) {}
  try { videoPlayer.currentTime = 0; } catch (_) {}
}

// Wait-for-single-event helper for Hls instance
function once(hls, ev) {
  return new Promise((resolve) => {
    const handler = (...args) => {
      try { hls.off(ev, handler); } catch (_) {}
      resolve(args);
    };
    hls.on(ev, handler);
  });
}

// Optional: longer teardown that gives browser/GC time to finalize MediaSource
async function fullTeardownAndWait() {
  destroyHLS();
  await new Promise((r) => setTimeout(r, 160));
  try { if (window.gc) window.gc(); } catch (_) {}
}

// Restore quick resume from localStorage if server resume not available
function getLocalResumePosition(videoId) {
  const sessionKey = `pos_${videoId}_${sessionId}`;
  const v = localStorage.getItem(sessionKey);
  return v ? Number(v) : 0;
}

// Load videos
async function loadVideos() {
  try {
    const res = await fetch(BACKEND_URL, { headers: getFetchHeaders() });
    if (!res.ok) throw new Error("Failed to fetch videos");
    const videos = await res.json();

    videoGrid.innerHTML = "";
    videos.forEach((video) => {
      const card = document.createElement("div");
      card.className = "video-card";
      card.innerHTML = `
        <img src="${BACKEND_HOST}${video.thumbnailUrl}" alt="${video.title}">
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.views} views • ${video.likes || 0} likes</p>
        </div>
      `;
      card.onclick = () => openVideo(video);
      videoGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load videos:", err);
  }
}

// Open video modal
async function openVideo(video) {
  try {
    videoModal.style.display = "block";
    watchLimitMsg.innerText = "";
    likeCount.innerText = `${video.likes || 0} likes`;

    const headers = getFetchHeaders();

    const limitRes = await fetch(
      `${BACKEND_URL}/${video.id}/check-limit?sessionId=${sessionId}`,
      { headers }
    );
    const limitData = await limitRes.json();

    if (limitData.locked) {
      watchLimitMsg.innerText =
        "⚠️ You've reached your free viewing limit. Please subscribe for unlimited access.";
      videoPlayer.src = "";
      return;
    }

    // Ensure clean playback
    await fullTeardownAndWait();
    await playVideo(video);

    // ✅ Track views and increment
    await fetch(`${BACKEND_URL}/${video.id}/increment?sessionId=${sessionId}`, {
      method: "POST",
      headers,
    });
    await fetch(`${BACKEND_URL}/${video.id}/views`, {
      method: "PATCH",
      headers,
    });

    // ✅ Save to history ONLY if logged in
    if (token) {
      await fetch(`${BACKEND_HOST}/history/${video.id}`, {
        method: "POST",
        headers,
      });
    }

    // ✅ Like button event
    likeButton.onclick = async () => {
      if (!token) return showAlert("Login to like videos", "warning");
      try {
        const res = await fetch(`${BACKEND_URL}/${video.id}/like`, {
          method: "PATCH",
          headers: getFetchHeaders(),
        });
        const updated = await res.json();
        if (res.ok && updated.likes !== undefined) {
          likeCount.innerText = `${updated.likes} likes`;
          likeButton.classList.add("liked");
          showAlert("Video liked ❤️", "success");
        } else showAlert("Failed to like video", "error");
      } catch (err) {
        console.error("Like error:", err);
        showAlert("Something went wrong!", "error");
      }
    };
  } catch (err) {
    console.error("Error opening video:", err);
  }
}

// Play video (HLS or native) — deterministic replay flow with retries and resume
async function playVideo(video) {
  videoLoader.style.display = "flex";
  videoPlayer.pause();
  videoPlayer.src = "";

  // Try to get last watched time for resume (only if logged in)
  let resumeTime = getLocalResumePosition(video.id);
  if (token) {
    try {
      const res = await fetch(`${BACKEND_HOST}/history/last/${video.id}`, {
        headers: getFetchHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.watchedAt && json.position) {
          resumeTime = Number(json.position) || resumeTime || 0;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch resume time", e);
    }
  }

  if (Hls.isSupported()) {
    // tuned options for smoother playback on LAN
    hlsInstance = new Hls({
      xhrSetup: (xhr) => xhr.setRequestHeader("ngrok-skip-browser-warning", "any-value"),
      maxBufferLength: 30,         // moderate buffer for VOD
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      autoStartLoad: false,        // explicit control
      startFragPrefetch: true,     // prefetch fragments for faster start
      progressive: false,
    });

    try { videoPlayer.crossOrigin = "anonymous"; } catch (_) {}

    hlsInstance.attachMedia(videoPlayer);
    hlsInstance.loadSource(`${BACKEND_HOST}${video.videoUrl}`);

    // manifest parsed -> start loading
    await once(hlsInstance, Hls.Events.MANIFEST_PARSED);
    try { hlsInstance.startLoad(0); } catch (_) { try { hlsInstance.startLoad(); } catch (_) {} }

    // Wait for buffer appended or a short timeout
    await Promise.race([
      once(hlsInstance, Hls.Events.FRAG_BUFFERED),
      once(hlsInstance, Hls.Events.BUFFER_APPENDED),
      new Promise((r) => setTimeout(r, 600))
    ]);

    // Seek to resume position if available and valid
    if (resumeTime > 1 && !isNaN(resumeTime)) {
      try {
        videoPlayer.currentTime = resumeTime;
      } catch (e) { console.warn("Resume seek failed", e); }
    }

    // hide loader and play
    videoLoader.style.display = "none";
    videoPlayer.play().catch(() => console.warn("Autoplay blocked"));

    // Error handling with exponential backoff retry for network errors
    let retryCount = 0;
    const maxRetries = 4;
    hlsInstance.on(Hls.Events.ERROR, async (event, data) => {
      console.warn("HLS error", data);
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount < maxRetries) {
          retryCount++;
          const backoff = Math.min(3000 * Math.pow(2, retryCount - 1), 15000);
          console.warn(`Network error, retry ${retryCount} in ${backoff}ms`);
          try { hlsInstance.stopLoad(); } catch (_) {}
          await new Promise(r => setTimeout(r, backoff));
          try { hlsInstance.startLoad(); } catch (_) {}
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          try { hlsInstance.recoverMediaError(); } catch (e) { console.warn("Recover failed", e); destroyHLS(); }
        } else {
          // fallback to native src
          destroyHLS();
          videoPlayer.src = `${BACKEND_HOST}${video.videoUrl}`;
          videoPlayer.play().catch(() => console.warn("Fallback play blocked"));
        }
      }
    });

    // Keep UI responsive: if buffer stalls, attempt media recovery
    hlsInstance.on(Hls.Events.BUFFER_STALLED, () => {
      try { hlsInstance.recoverMediaError(); } catch (e) { console.warn("buffer stalled recover", e); }
    });

    // Save periodic playback position to localStorage for quick resume even when not logged in
    const sessionKey = `pos_${video.id}_${sessionId}`;
    const savePosition = () => {
      try { localStorage.setItem(sessionKey, String(videoPlayer.currentTime || 0)); } catch (_) {}
    };
    const posInterval = setInterval(savePosition, 5000);
    videoPlayer.addEventListener('pause', savePosition);
    videoPlayer.addEventListener('ended', () => { savePosition(); clearInterval(posInterval); });

    // Clean up when modal closed
    const hideHandler = () => { clearInterval(posInterval); };
    videoModal.addEventListener('hide', hideHandler, { once: true });

  } else {
    // native fallback
    videoPlayer.src = `${BACKEND_HOST}${video.videoUrl}`;
    videoPlayer.oncanplay = () => {
      videoLoader.style.display = "none";
      if (resumeTime > 1) try { videoPlayer.currentTime = resumeTime; } catch (_) {}
      videoPlayer.play();
    };
    videoPlayer.onerror = () => (videoLoader.style.display = "none");
  }
}

// Close modal
closeVideoOutside.onclick = () => {
  videoModal.style.display = "none";
  videoPlayer.pause();
  destroyHLS();
  videoLoader.style.display = "none";
};

// Single/double click: play/pause and fullscreen
let clickTimeout = null;
videoPlayer.onclick = () => {
  if (clickTimeout !== null) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
    if (!document.fullscreenElement) videoModal.requestFullscreen();
    else document.exitFullscreen();
  } else {
    clickTimeout = setTimeout(() => {
      clickTimeout = null;
      if (videoPlayer.paused) {
        videoPlayer.play();
        playPauseBtn.textContent = "⏸️";
      } else {
        videoPlayer.pause();
        playPauseBtn.textContent = "▶️";
      }
    }, 250);
  }
};

// Play/pause button
playPauseBtn.onclick = () => {
  if (videoPlayer.paused) {
    videoPlayer.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    videoPlayer.pause();
    playPauseBtn.textContent = "▶️";
  }
};

// Fullscreen button
fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) videoModal.requestFullscreen();
  else document.exitFullscreen();
};

// Mute/unmute
muteBtn.onclick = () => {
  videoPlayer.muted = !videoPlayer.muted;
  muteBtn.textContent = videoPlayer.muted ? "🔇" : "🔊";
};

// Volume
volumeBar.oninput = () => {
  videoPlayer.volume = volumeBar.value;
};

// Seek bar
videoPlayer.ontimeupdate = () => {
  seekBar.max = videoPlayer.duration || 0;
  seekBar.value = videoPlayer.currentTime;
  currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
  durationEl.textContent = formatTime(videoPlayer.duration || 0);
};
seekBar.oninput = () => (videoPlayer.currentTime = seekBar.value);

// Format time
function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Disable right-click
videoPlayer.addEventListener("contextmenu", (e) => e.preventDefault());

// Pause when tab hidden to avoid unnecessary buffering
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    try { videoPlayer.pause(); } catch (_) {}
  } else {
    try { /* keep state */ } catch (_) {}
  }
});

// ================= AUTH =================

// Login
document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;
  try {
    const res = await fetch(`${BACKEND_HOST}/auth/login`, {
      method: "POST",
      headers: getFetchHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      localStorage.setItem("token", token);
      showAlert("Login successful!", "success");
      loginModal.style.display = "none";
      updateAuthUI();
    } else showAlert(data.message || "Login failed", "error");
  } catch (err) {
    console.error("Login error:", err);
    showAlert("Login failed. Please try again.", "error");
  }
};

// Signup
document.getElementById("signupForm").onsubmit = async (e) => {
  e.preventDefault();
  const fullName = e.target[0].value;
  const email = e.target[1].value;
  const password = e.target[2].value;
  try {
    const res = await fetch(`${BACKEND_HOST}/auth/register`, {
      method: "POST",
      headers: getFetchHeaders(),
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      showAlert("Account created successfully! You can now log in.", "success");
      signupModal.style.display = "none";
    } else showAlert(data.message || "Signup failed", "error");
  } catch (err) {
    console.error("Signup error:", err);
    showAlert("Signup failed. Please try again.", "error");
  }
};

// Initialize
loadVideos();