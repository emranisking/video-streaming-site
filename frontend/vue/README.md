# Vue.js Frontend - Video Streaming Application

A clean, maintainable Vue 3 frontend for a video streaming application with YouTube-style routing.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.vue       # Navigation header
│   ├── UserDropdown.vue # User menu dropdown
│   ├── VideoCard.vue    # Video grid item
│   ├── VideoPlayer.vue  # HLS video player
│   └── AuthModals.vue   # Login/signup modals
├── pages/               # Page components (routes)
│   ├── Home.vue        # Video grid page
│   ├── Watch.vue       # Single video watch page
│   ├── History.vue     # User watch history
│   ├── Likes.vue       # User liked videos
│   └── Playlist.vue    # User playlists
├── services/           # API integration layer
│   ├── api.js         # HTTP client with retry logic
│   ├── videoService.js
│   ├── authService.js
│   ├── userService.js
│   └── hlsService.js   # HLS.js wrapper
├── composables/        # Business logic hooks (Composition API)
│   ├── useAuth.js     # Auth state management
│   ├── useVideo.js    # Video fetching logic
│   ├── usePlayer.js   # Player controls logic
│   └── useUser.js     # User data (history, playlists)
├── stores/            # Global state (Pinia)
│   └── authStore.js   # Auth global store
├── router/            # Vue Router configuration
│   └── index.js
├── utils/             # Helper functions
│   ├── constants.js   # Constants and config
│   ├── helpers.js     # Utility functions
│   └── formatters.js  # Text formatting
├── App.vue            # Root component
└── main.js            # Application entry point
```

## Architecture Principles

### Separation of Concerns

- **Components**: Pure UI presentation layer
- **Composables**: Business logic and state management
- **Services**: API communication layer
- **Utils**: Pure helper functions

### State Management

- **Global State**: Auth store (Pinia)
- **Local State**: Page-specific composables
- **API Cache**: Service methods (can be enhanced with caching)

### Code Organization

1. **UI Layer** (`components/`, `pages/`)
   - Completely decoupled from business logic
   - Only handle presentation and user interaction
   - Call composables for data and actions

2. **Business Logic** (`composables/`)
   - Pure business logic independent of UI
   - Handle data transformations
   - Manage reactive state
   - Call services for external data

3. **Data Layer** (`services/`)
   - Encapsulate all API calls
   - Handle HTTP requests and retries
   - Error handling and logging
   - Authentication token management

4. **Utilities** (`utils/`)
   - Pure functions with no side effects
   - Reusable across the app
   - No dependencies on Vue or services

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend/vue
npm install
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output: `frontend/dist/`

## Key Features

### Video Routing
- Clean URL format: `/watch/:id`
- RESTful API integration
- Automatic video ID extraction from URL

### Authentication
- Login/Signup with modals
- Token-based auth
- Global auth state
- Protected routes

### Video Playback
- HLS.js adaptive streaming
- Fallback to native playback
- Error recovery
- Manual controls (play, volume, fullscreen)

### User Features
- Watch history tracking
- Like/unlike videos
- Playlist management
- Responsive design

## API Integration

### Services

All API calls go through the HTTP client in `api.js`:

```javascript
// In a composable
import { videoService } from '@/services/videoService';

const videos = await videoService.getVideos(page, limit);
const video = await videoService.getVideoById(id);
await videoService.likeVideo(id);
```

### Authentication

```javascript
import { authService } from '@/services/authService';

await authService.login(email, password);
await authService.signup(email, password, name);
authService.logout();
```

### User Data

```javascript
import { userService } from '@/services/userService';

const history = await userService.getHistory();
const playlists = await userService.getPlaylists();
await userService.addToHistory(videoId);
```

## Composables Usage

### useAuth
```javascript
const { login, signup, logout, isAuthenticated } = useAuth();
```

### useVideo
```javascript
const { videos, loading, fetchVideos, loadMore } = useVideo();
```

### usePlayer
```javascript
const { initializeHLS, play, pause, seek } = usePlayer(videoElement);
```

### useUserData
```javascript
const { history, fetchHistory, likedVideos, fetchLikedVideos } = useUserData();
```

## Environment Variables

Create `.env` file:

```
VITE_BACKEND_URL=http://localhost:7000
VITE_API_TIMEOUT=10000
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Lazy component loading via router
- Code splitting per route
- Image lazy loading
- Debounced search/filter
- HLS adaptive bitrate streaming

## Best Practices

1. **Keep components simple** - Only render UI
2. **Use composables for logic** - Reusable and testable
3. **Service methods are pure** - No side effects
4. **Error handling** - Try-catch in composables
5. **Loading states** - Always show feedback to user
6. **Type safety** - Use JSDoc comments (or TypeScript)

## Troubleshooting

### Video won't play
1. Check backend is running on port 7000
2. Verify HLS manifest URL is correct
3. Check browser console for errors
4. Ensure CORS headers are set

### Login not working
1. Verify auth endpoint is reachable
2. Check token is stored in localStorage
3. Verify token format in Authorization header

### API calls failing
1. Check network tab for actual requests
2. Verify backend proxy in vite.config.js
3. Check CORS configuration
4. Look for 401/403 auth errors

## Future Enhancements

- [ ] TypeScript support
- [ ] Unit tests with Vitest
- [ ] E2E tests with Cypress
- [ ] Video search functionality
- [ ] Advanced filtering
- [ ] Recommendation engine
- [ ] Analytics tracking
- [ ] Dark/light theme toggle
