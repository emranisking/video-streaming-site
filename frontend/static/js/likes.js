// === DOM elements ===
const likesGrid = document.getElementById("likesGrid");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeVideoOutside = document.getElementById("closeVideoOutside");
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

// === Backend ===
const BACKEND_HOST =
  window.location.hostname === "localhost"
    ? "http://192.168.0.197:7000"
    : `http://${window.location.hostname}:7000`;
const LIKES_URL = `${BACKEND_HOST}/likes`;

let token = localStorage.getItem("token");
let hlsInstance = null;

// === Helpers ===
function getFetchHeaders(extra = {}) {
  return {
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
    color: "#fff",
  });
}

function destroyHLS() {
  try {
    if (!videoPlayer.paused) videoPlayer.pause();
  } catch (_) {}
  try {
    videoPlayer.removeAttribute("src");
  } catch (_) {}
  try {
    videoPlayer.load();
  } catch (_) {}
  if (hlsInstance) {
    try {
      hlsInstance.destroy();
    } catch (_) {}
    hlsInstance = null;
  }
}

function once(hls, ev) {
  return new Promise((resolve) => {
    const handler = (...args) => {
      try {
        hls.off(ev, handler);
      } catch (_) {}
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

// === Load liked videos ===
async function loadLikes() {
  if (!token) {
    showAlert("Login required to see liked videos", "warning");
    return;
  }

  try {
    const res = await fetch(LIKES_URL, { headers: getFetchHeaders() });
    if (!res.ok) throw new Error("Failed to fetch likes");
    const likes = await res.json();

    likesGrid.innerHTML = "";
    if (!likes.length) {
      likesGrid.innerHTML =
        "<p style='text-align:center; color:#fff;'>No liked videos yet.</p>";
      return;
    }

    likes.forEach((item) => {
      const video = item.video;
      const card = document.createElement("div");
      card.className = "video-card";
      card.innerHTML = `
        <img src="${BACKEND_HOST}${video.thumbnailUrl}" alt="${video.title}">
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.views} views • ${video.likes || 0} likes</p>
          <small>Liked at: ${new Date(item.likedAt).toLocaleString()}</small>
        </div>
      `;
      card.onclick = () => openVideo(video, card);
      likesGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Likes load error:", err);
    showAlert("Failed to load liked videos", "error");
  }
}

// === Open video modal ===
async function openVideo(video, cardEl) {
  videoModal.style.display = "block";
  likeCount.textContent = `${video.likes || 0} likes`;
  destroyHLS();
  await playVideo(video);

  // Since this page lists liked videos, the button acts as "Unlike"
  likeButton.textContent = "💔 Unlike";
  likeButton.onclick = async () => {
    if (!token) return showAlert("Login to manage likes", "warning");
    try {
      const res = await fetch(`${LIKES_URL}/${video.id}`, {
        method: "DELETE",
        headers: getFetchHeaders(),
      });
      if (res.ok) {
        // Decrement local counter defensively
        const updatedLikes = Math.max((video.likes || 1) - 1, 0);
        video.likes = updatedLikes;
        likeCount.textContent = `${updatedLikes} likes`;

        // Remove the card from the grid and close modal
        try {
          if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
        } catch (_) {}
        showAlert("Removed from your liked videos", "success");
        videoModal.style.display = "none";
        destroyHLS();
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert(data.message || "Failed to remove like", "error");
      }
    } catch (e) {
      console.error("Unlike error:", e);
      showAlert("Something went wrong while unliking", "error");
    }
  };
}

// === Play video with HLS (robust flow) ===
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

    try {
      videoPlayer.crossOrigin = "anonymous";
    } catch (_) {}

    hlsInstance.attachMedia(videoPlayer);
    hlsInstance.loadSource(`${BACKEND_HOST}${video.videoUrl}`);

    await once(hlsInstance, Hls.Events.MANIFEST_PARSED);
    try {
      hlsInstance.startLoad(0);
    } catch (_) {
      try {
        hlsInstance.startLoad();
      } catch (_) {}
    }

    await Promise.race([
      once(hlsInstance, Hls.Events.FRAG_BUFFERED),
      once(hlsInstance, Hls.Events.BUFFER_APPENDED),
      new Promise((r) => setTimeout(r, 600)),
    ]);

    videoLoader.style.display = "none";
    videoPlayer.play().catch(() => console.warn("Autoplay blocked"));

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.warn("HLS error", data);
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          try {
            hlsInstance.startLoad();
          } catch (_) {}
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          try {
            hlsInstance.recoverMediaError();
          } catch (_) {}
        } else {
          destroyHLS();
          videoPlayer.src = `${BACKEND_HOST}${video.videoUrl}`;
          videoPlayer.play().catch(() => console.warn("Fallback play blocked"));
        }
      }
    });
  } else {
    // Native HLS (Safari)
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
  videoLoader.style.display = "none";
};

// === Controls ===
playPauseBtn.onclick = () => {
  if (videoPlayer.paused) {
    videoPlayer.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    videoPlayer.pause();
    playPauseBtn.textContent = "▶️";
  }
};

muteBtn.onclick = () => {
  videoPlayer.muted = !videoPlayer.muted;
  muteBtn.textContent = videoPlayer.muted ? "🔇" : "🔊";
};

fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) videoModal.requestFullscreen();
  else document.exitFullscreen();
};

volumeBar.oninput = () => {
  videoPlayer.volume = volumeBar.value;
};

videoPlayer.ontimeupdate = () => {
  seekBar.max = videoPlayer.duration || 0;
  seekBar.value = videoPlayer.currentTime;
  currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
  durationEl.textContent = formatTime(videoPlayer.duration || 0);
};

seekBar.oninput = () => (videoPlayer.currentTime = seekBar.value);

// === Init ===
loadLikes();