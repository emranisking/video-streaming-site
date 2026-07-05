# Vue.js Frontend Migration Guide

## From Vanilla JS to Vue.js

### What Changed?

**Before**: 5 separate HTML pages with vanilla JavaScript
- `index.html` → `src/pages/Home.vue`
- `watch.html` → `src/pages/Watch.vue`
- `history.html` → `src/pages/History.vue`
- `likes.html` → `src/pages/Likes.vue`
- `playlist.html` → `src/pages/Playlist.vue`

**JavaScript Files** → **Composables**
- Video fetching logic → `src/composables/useVideo.js`
- Auth logic → `src/composables/useAuth.js`
- Player logic → `src/composables/usePlayer.js`
- User data → `src/composables/useUser.js`

**Direct API calls** → **Service layer**
- All fetch calls centralized in `src/services/`
- Consistent error handling
- Token management in one place
- Retry logic included

### Code Comparison

#### Loading Videos

**Before (Vanilla JS)**:
```javascript
async function loadVideos() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${BACKEND_URL}?page=${page}&limit=${limit}`, {
      headers: getFetchHeaders(),
    });
    if (!response.ok) throw new Error("Failed to load");
    const data = await response.json();
    videos.value = data.videos;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
```

**After (Vue.js)**:
```javascript
import { useVideo } from '@/composables/useVideo';

const { videos, loading, error, fetchVideos } = useVideo();

onMounted(() => {
  fetchVideos(1, 20);
});
```

#### Liking a Video

**Before**:
```javascript
async function likeVideo(videoId) {
  try {
    const response = await fetch(`${BACKEND_URL}/${videoId}/like`, {
      method: 'PATCH',
      headers: getFetchHeaders(),
    });
    const updated = await response.json();
    likeCount.value = updated.likes;
  } catch (err) {
    showAlert(err.message, 'error');
  }
}
```

**After**:
```javascript
import { useVideoDetail } from '@/composables/useVideo';

const { likeVideo } = useVideoDetail(videoId);

const handleLike = async () => {
  const result = await likeVideo(videoId);
  if (result.success) {
    // Show success
  } else {
    // Show error
  }
};
```

#### Component Rendering

**Before (Vanilla JS)**:
```javascript
videos.forEach(video => {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `<img src="${video.thumbnailUrl}">`;
  card.onclick = () => {
    window.location.href = `/watch/${video.id}`;
  };
  videoGrid.appendChild(card);
});
```

**After (Vue.js)**:
```vue
<template>
  <div class="video-grid">
    <div 
      v-for="video in videos"
      :key="video.id"
      @click="navigateToWatch(video.id)"
      class="grid-item"
    >
      <VideoCard :video="video" />
    </div>
  </div>
</template>

<script setup>
const navigateToWatch = (videoId) => {
  router.push({ name: 'Watch', params: { id: videoId } });
};
</script>
```

### Benefits of Vue.js

✅ **Cleaner Code** - Less boilerplate, more readable
✅ **Component Reusability** - `VideoCard` used in Home, History, Likes
✅ **Reactive Data** - Automatic UI updates
✅ **Built-in Routing** - Vue Router handles navigation
✅ **State Management** - Pinia for global state
✅ **Dev Tools** - Vue DevTools for debugging
✅ **Better Performance** - Virtual DOM optimization
✅ **Maintainability** - Organized file structure
✅ **Scalability** - Easy to add new features

### File Size Comparison

| Aspect | Vanilla JS | Vue.js |
|--------|-----------|--------|
| JS Size | ~50KB | ~180KB (includes framework) |
| CSS Size | ~20KB | ~20KB |
| **Total** | **~70KB** | **~200KB** |
| **With gzip** | **~20KB** | **~60KB** |

*Note: Bundle size is larger, but dev experience and code maintainability are significantly better.*

### Deployment

**Before**: Serve static files
```bash
npm run build
# Copy frontend/static to server
```

**After**: Build with Vite
```bash
cd frontend/vue
npm run build
# Copy dist/ to server
```

### Migration Checklist

- [x] Create Vue project structure
- [x] Convert pages to Vue components
- [x] Extract business logic to composables
- [x] Create service layer for API calls
- [x] Setup Vue Router for navigation
- [x] Create reusable components
- [x] Setup Pinia for auth state
- [x] Configure Vite build
- [x] Add documentation
- [ ] Test all features
- [ ] Deploy to production

### Next Steps

1. **Install dependencies**:
   ```bash
   cd frontend/vue
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Deploy** dist folder to your server

---

**For detailed documentation, see README.md**
