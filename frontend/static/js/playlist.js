// Check login
const token = localStorage.getItem("token");
if (!token) {
  alert("You must be logged in to access playlists.");
  window.location.href = "index.html";
}

const BACKEND_HOST = window.location.hostname === "localhost"
  ? "http://localhost:7000"
  : `http://${window.location.hostname}:7000`;

const playlistContainer = document.getElementById("playlistContainer");
const createPlaylistForm = document.getElementById("createPlaylistForm");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  alert("Logged out successfully");
  window.location.href = "index.html";
};

// Fetch all playlists
async function loadPlaylists() {
  try {
    const res = await fetch(`${BACKEND_HOST}/playlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch playlists");
    const playlists = await res.json();

    playlistContainer.innerHTML = "";

    playlists.forEach(pl => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.innerHTML = `
        <h3>${pl.name}</h3>
        <ul>
          ${pl.items.map(i => `<li>${i.video.title}</li>`).join('')}
        </ul>
      `;
      playlistContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading playlists:", err);
    alert("Failed to load playlists.");
  }
}

// Create new playlist
document.getElementById("createPlaylistForm").onclick = async () => {
  if (!token) return showToast("You must be logged in to create a playlist", true);

  const title = prompt("Enter playlist title:");
  if (!title) return showToast("Title is required", true);

  try {
    const res = await fetch(`${BACKEND_HOST}/playlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(`Playlist "${data.title}" created successfully!`);
      // Optionally, refresh playlist page or dropdown
    } else {
      showToast(data.message || "Failed to create playlist", true);
    }
  } catch (err) {
    console.error("Create playlist error:", err);
    showToast("Something went wrong. Check console.", true);
  }
};

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.borderLeftColor = isError ? "#ff3b3b" : "#ff9900";
  toast.textContent = message;

  const container = document.getElementById("toast-container");
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
// ===== User Dropdown =====
const userIcon = document.getElementById('userIcon');
const userDropdown = document.getElementById('userDropdown');

if (userIcon && userDropdown) {
  userIcon.addEventListener('click', () => {
    // toggle display
    if (userDropdown.style.display === 'none' || userDropdown.style.display === '') {
      userDropdown.style.display = 'block';
    } else {
      userDropdown.style.display = 'none';
    }
  });

  // Close dropdown if clicked outside
  window.addEventListener('click', (e) => {
    if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.style.display = 'none';
    }
  });
}


// Initialize
loadPlaylists();
