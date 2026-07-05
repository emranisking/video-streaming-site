# Vue.js Frontend - Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd /home/emran/project/video-streaming-site/frontend/vue
npm install
```

This will install:
- Vue 3 (UI framework)
- Vue Router (client-side routing)
- Pinia (state management)
- HLS.js (video streaming)
- SweetAlert2 (notifications)
- Vite (build tool)

### 2. Development Server

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:7000`

The dev server will automatically proxy API calls to the backend.

### 3. Build for Production

```bash
npm run build
```

Output: `frontend/vue/dist/`

### 4. Serve Production Build

```bash
npm run preview
```

## Deployment Options

### Option A: Serve with Express (Same as Vanilla)

Copy `dist/` files to your backend static folder:

```bash
npm run build
cp -r dist/* ../static/
```

Then modify `src/main.ts` to serve the built Vue app:

```typescript
app.use(express.static(join(process.cwd(), 'frontend', 'dist')));
```

### Option B: Separate Vue Dev Server

Keep frontend and backend separate:

```bash
# Terminal 1 - Backend
npm run start:dev  # Backend on :7000

# Terminal 2 - Frontend  
cd frontend/vue
npm run dev  # Frontend on :3000
```

### Option C: Docker Deployment

Build Docker image for Vue app and deploy separately.

## Project Structure

```
frontend/vue/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Route pages
│   ├── services/           # API layer
│   ├── composables/        # Business logic
│   ├── stores/             # Global state
│   ├── router/             # Routes config
│   ├── utils/              # Helpers
│   ├── App.vue             # Root component
│   └── main.js             # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── tsconfig.json           # TypeScript config
├── README.md               # Documentation
└── MIGRATION.md            # Migration guide
```

## Architecture Overview

### Clean Separation of Concerns

```
┌─────────────────────────────────────────────┐
│           Vue Components (UI)               │
│   Header, VideoCard, AuthModals, etc.       │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Composables (Business Logic)           │
│  useAuth, useVideo, usePlayer, useUser      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Services (API Communication)           │
│  api, videoService, authService, etc.       │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         Backend API (Port 7000)             │
└─────────────────────────────────────────────┘
```

### State Management

**Global State** (Pinia Store):
- Auth token
- User authentication status

**Local State** (Composables):
- Video list
- Player state
- User data (history, playlists)
- UI states (loading, error, etc.)

## Key Features

✅ **YouTube-Style Routing**
- `/watch/:id` format
- Clean URLs
- Shareable links

✅ **Video Playback**
- HLS.js streaming
- Adaptive bitrate
- Manual controls
- Fullscreen support

✅ **User Features**
- Authentication (login/signup)
- Watch history tracking
- Like/unlike videos
- Playlist management

✅ **Responsive Design**
- Mobile optimized
- Desktop optimized
- Adaptive grid layout

✅ **Performance**
- Code splitting per route
- Lazy component loading
- Optimized bundle size
- Image lazy loading

## Configuration

### Backend URL

The app detects backend port automatically:

```javascript
// In utils/helpers.js
const isDev = window.location.port === '3000';
const BACKEND_HOST = isDev 
  ? `http://${window.location.hostname}:7000`
  : window.location.origin;
```

### Environment Variables

Create `frontend/vue/.env`:

```
VITE_BACKEND_URL=http://localhost:7000
VITE_API_TIMEOUT=10000
```

## Development Workflow

### Adding a New Feature

1. **Create a composable** (`src/composables/useFeature.js`):
   ```javascript
   export function useFeature() {
     const data = ref([]);
     const loading = ref(false);
     
     const fetchData = async () => { /* ... */ };
     return { data, loading, fetchData };
   }
   ```

2. **Create API service** (`src/services/featureService.js`):
   ```javascript
   export const featureService = {
     async getData() {
       return httpClient.get('/feature');
     },
   };
   ```

3. **Use in component**:
   ```vue
   <script setup>
   import { useFeature } from '@/composables/useFeature';
   const { data, loading, fetchData } = useFeature();
   </script>
   ```

### Code Organization Rules

✅ **DO**:
- Keep components simple and focused
- Extract logic to composables
- Use services for API calls
- Reuse components

❌ **DON'T**:
- Put business logic in components
- Make direct API calls in components
- Create duplicate code
- Mix concerns

## Testing

### Manual Testing

1. **Test Videos Page**:
   - Load home page
   - Grid displays properly
   - Click video → navigate to watch page

2. **Test Watch Page**:
   - URL format: `/watch/13`
   - Video metadata loads
   - Player displays and plays
   - Like button works (with login)

3. **Test Auth**:
   - Login modal opens
   - Can login/signup
   - Token stored
   - Protected routes work

4. **Test Responsive**:
   - Resize browser
   - Mobile layout works
   - Touch interactions work

## Troubleshooting

### Dev Server Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API Calls Failing
- Check backend is running: `http://localhost:7000/videos`
- Check network tab in browser DevTools
- Verify proxy in `vite.config.js`
- Check CORS headers from backend

### Video Won't Play
- Check HLS manifest URL in network tab
- Verify backend is serving HLS files
- Check browser console for errors
- Try on different browser

### Build Fails
```bash
# Check for syntax errors
npm run build

# If still failing, check:
# - Vue version compatibility
# - ESM vs CJS modules
# - Missing dependencies
npm install
```

## Performance Tips

### Bundle Size
```bash
# Analyze bundle
npm run build
# Output shows bundle size by file
```

### Lazy Loading
Already implemented for routes. Add for components:
```javascript
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
```

### Image Optimization
Videos already use optimized thumbnails from backend.

## Deployment Checklist

- [ ] Run `npm run build`
- [ ] Test build locally with `npm run preview`
- [ ] Verify all routes work
- [ ] Test video playback
- [ ] Test on mobile
- [ ] Check console for errors
- [ ] Verify backend URLs are correct
- [ ] Check CORS headers
- [ ] Deploy `dist/` folder
- [ ] Monitor for errors in production

## Support & Documentation

- **Vue 3**: https://vuejs.org
- **Vue Router**: https://router.vuejs.org
- **Pinia**: https://pinia.vuejs.org
- **Vite**: https://vitejs.dev
- **HLS.js**: https://github.com/video-dev/hls.js

## File Structure Details

### Components

- **Header.vue**: Navigation bar with auth menu
- **UserDropdown.vue**: User menu dropdown
- **VideoCard.vue**: Individual video grid item
- **VideoPlayer.vue**: HLS video player with controls
- **AuthModals.vue**: Login/signup modals

### Pages

- **Home.vue**: Video grid (/)
- **Watch.vue**: Single video player (/watch/:id)
- **History.vue**: User watch history (/history)
- **Likes.vue**: User liked videos (/likes)
- **Playlist.vue**: User playlists (/playlist)

### Services

- **api.js**: HTTP client with retry logic
- **videoService.js**: Video API endpoints
- **authService.js**: Auth API endpoints
- **userService.js**: User data API endpoints
- **hlsService.js**: HLS.js wrapper

### Composables

- **useAuth.js**: Login, signup, logout logic
- **useVideo.js**: Video fetching and detail
- **usePlayer.js**: Video player controls
- **useUser.js**: User data (history, playlists)

## Next Steps

1. ✅ Vue.js frontend is ready
2. 🔄 Run `npm install` in `frontend/vue/`
3. ▶️ Start with `npm run dev`
4. 📦 Build with `npm run build`
5. 🚀 Deploy `dist/` folder

---

**Created**: Vue.js 3 + Vite frontend
**Size**: ~60KB gzipped
**Performance**: Optimized with code splitting
**Maintainability**: Clean architecture with separation of concerns
