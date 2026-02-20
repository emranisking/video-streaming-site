// === DOM elements ===
const historyGrid = document.getElementById("historyGrid");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeVideoOutside = document.getElementById("closeVideoOutside");
const watchLimitMsg = document.getElementById("watchLimitMsg");
const videoLoader = document.getElementById("videoLoader");
const playPauseBtn = document.getElementById("playPauseBtn");
const seekBar = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const muteBtn = document.getElementById("muteBtn");
const volumeBar = document.getElementById("volumeBar");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");

// Backend
const BACKEND_HOST = window.location.hostname === "http://192.168.10.128:7000"
  ? "http://http://192.168.10.128"
  : `http://${window.location.hostname}:7000`;
const HISTORY_URL = `${BACKEND_HOST}/history`;

let token = localStorage.getItem("token");
let sessionId = localStorage.getItem("sessionId") || 'guest';
localStorage.setItem("sessionId", sessionId);

let hlsInstance = null;

// === Helpers ===
function getFetchHeaders(extra = {}) {
  return {
    "ngrok-skip-browser-warning": "any-value",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function showAlert(message, type = "info") {
  Swal.fire({
    text: message,
    icon: type,
    confirmButtonColor: "#ff9900",
    background: "#1a1a1a",
    color: "#fff"
  });
}

function destroyHLS() {
  try { if (!videoPlayer.paused) videoPlayer.pause(); } catch (_) {}
  try { videoPlayer.removeAttribute('src'); } catch (_) {}
  try { videoPlayer.load(); } catch (_) {}
  if (hlsInstance) {
    try { hlsInstance.destroy(); } catch (_) {}
    hlsInstance = null;
  }
}

function once(hls, ev) {
  return new Promise((resolve) => {
    const handler = (...args) => {
      try { hls.off(ev, handler); } catch (_) {}
      resolve(args);
    };
    hls.on(ev, handler);
  });
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// === Load history ===
async function loadHistory() {
  if (!token) {
    showAlert("Login required to see history", "warning");
    return;
  }

  try {
    const res = await fetch(HISTORY_URL, { headers: getFetchHeaders() });
    if (!res.ok) throw new Error("Failed to fetch history");
    const history = await res.json();

    historyGrid.innerHTML = "";
    if (history.length === 0) {
      historyGrid.innerHTML = "<p style='text-align:center; color:#fff;'>No videos watched yet.</p>";
      return;
    }

    history.forEach((item) => {
      const video = item.video;
      const card = document.createElement("div");
      card.className = "video-card";
      card.innerHTML = `
        <img src="${BACKEND_HOST}${video.thumbnailUrl}" alt="${video.title}">
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.views} views • ${video.likes || 0} likes</p>
          <small>Watched at: ${new Date(item.watchedAt).toLocaleString()}</small>
        </div>
      `;
      card.onclick = () => openVideo(video);
      historyGrid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showAlert("Failed to load history", "error");
  }
}

// === Open video modal ===
async function openVideo(video) {
  videoModal.style.display = "block";
  watchLimitMsg.innerText = "";
  likeCount.innerText = `${video.likes || 0} likes`;

  destroyHLS();
  await playVideo(video);
}

// === Play video with HLS ===
async function playVideo(video) {
  videoLoader.style.display = "flex";
  videoPlayer.pause();
  videoPlayer.src = "";

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      autoStartLoad: false,
      startFragPrefetch: true,
    });

    hlsInstance.attachMedia(videoPlayer);
    hlsInstance.loadSource(`${BACKEND_HOST}${video.videoUrl}`);

    await once(hlsInstance, Hls.Events.MANIFEST_PARSED);
    try { hlsInstance.startLoad(0); } catch (_) { hlsInstance.startLoad(); }

    await Promise.race([
      once(hlsInstance, Hls.Events.FRAG_BUFFERED),
      once(hlsInstance, Hls.Events.BUFFER_APPENDED),
      new Promise((r) => setTimeout(r, 600))
    ]);

    videoLoader.style.display = "none";
    videoPlayer.play().catch(() => console.warn("Autoplay blocked"));

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.warn("HLS error", data);
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          try { hlsInstance.startLoad(); } catch (_) {}
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          try { hlsInstance.recoverMediaError(); } catch (_) {}
        } else {
          destroyHLS();
          videoPlayer.src = `${BACKEND_HOST}${video.videoUrl}`;
          videoPlayer.play();
        }
      }
    });
  } else {
    videoPlayer.src = `${BACKEND_HOST}${video.videoUrl}`;
    videoPlayer.oncanplay = () => {
      videoLoader.style.display = "none";
      videoPlayer.play();
    };
    videoPlayer.onerror = () => (videoLoader.style.display = "none");
  }
}

// === Close modal ===
closeVideoOutside.onclick = () => {
  videoModal.style.display = "none";
  destroyHLS();
};

// === Controls ===
playPauseBtn.onclick = () => {
  if (videoPlayer.paused) videoPlayer.play();
  else videoPlayer.pause();
};
muteBtn.onclick = () => videoPlayer.muted = !videoPlayer.muted;
fullscreenBtn.onclick = () => !document.fullscreenElement ? videoModal.requestFullscreen() : document.exitFullscreen();
seekBar.oninput = () => videoPlayer.currentTime = seekBar.value;
videoPlayer.ontimeupdate = () => {
  seekBar.max = videoPlayer.duration || 0;
  seekBar.value = videoPlayer.currentTime;
  currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
  durationEl.textContent = formatTime(videoPlayer.duration || 0);
};

// === Init ===
loadHistory();