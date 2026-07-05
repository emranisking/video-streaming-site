# Vue.js Frontend - Quick Reference

## 📍 Project Location

```
/home/emran/project/video-streaming-site/frontend/vue/
```

## 🗂️ Directory Structure at a Glance

```
vue/
├── src/
│   ├── components/          # Reusable UI pieces
│   ├── pages/              # Route pages
│   ├── services/           # API communication
│   ├── composables/        # Business logic
│   ├── stores/             # Global state
│   ├── router/             # Route config
│   ├── utils/              # Helpers
│   ├── App.vue             # Root
│   └── main.js             # Entry
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── tsconfig.json           # TS config
├── .gitignore
├── README.md               # Full docs
├── SETUP.md                # Deployment
├── MIGRATION.md            # Migration guide
└── SUMMARY.md              # This project
```

## 🚀 Commands

```bash
# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## 📄 File Guide

### Core Application
| File | Purpose | Size |
|------|---------|------|
| `src/main.js` | Vue app bootstrap | 10 lines |
| `src/App.vue` | Root component | 100 lines |
| `index.html` | HTML template | 20 lines |
| `vite.config.js` | Build config | 30 lines |

### Components (5 files)
| Component | Purpose |
|-----------|---------|
| `Header.vue` | Top navigation bar |
| `UserDropdown.vue` | User menu |
| `VideoCard.vue` | Video grid item |
| `VideoPlayer.vue` | Video player |
| `AuthModals.vue` | Login/signup |

### Pages (5 files)
| Page | Route | Purpose |
|------|-------|---------|
| `Home.vue` | `/` | Video grid |
| `Watch.vue` | `/watch/:id` | Single video |
| `History.vue` | `/history` | Watch history |
| `Likes.vue` | `/likes` | Liked videos |
| `Playlist.vue` | `/playlist` | Playlists |

### Services (5 files)
| Service | Purpose |
|---------|---------|
| `api.js` | HTTP client |
| `videoService.js` | Video API |
| `authService.js` | Auth API |
| `userService.js` | User data API |
| `hlsService.js` | Video streaming |

### Composables (4 files)
| Composable | Exports |
|-----------|---------|
| `useAuth.js` | `login`, `signup`, `logout`, `isAuthenticated` |
| `useVideo.js` | `fetchVideos`, `likeVideo`, `video`, `loading` |
| `usePlayer.js` | `play`, `pause`, `seek`, `setVolume`, etc. |
| `useUser.js` | `history`, `playlists`, `likedVideos` |

### Utils (3 files)
| Utility | Contains |
|---------|----------|
| `constants.js` | API config, messages, UI constants |
| `helpers.js` | UUID gen, debounce, throttle, etc. |
| `formatters.js` | formatTime, formatViews, etc. |

### Configuration
| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `vite.config.js` | Build & dev server |
| `tsconfig.json` | TypeScript config |
| `.gitignore` | Git ignore rules |

### Documentation
| Doc | Content |
|-----|---------|
| `README.md` | Full documentation |
| `SETUP.md` | Setup & deployment |
| `MIGRATION.md` | Vanilla → Vue migration |
| `SUMMARY.md` | Project summary |

## 💻 Common Tasks

### Add a new API endpoint

1. Add to `services/`:
```javascript
// services/newService.js
export const newService = {
  async getData() {
    return httpClient.get('/endpoint');
  },
};
```

2. Use in composable:
```javascript
// composables/useNew.js
import { newService } from '@/services/newService';

export function useNew() {
  const data = ref([]);
  const fetchData = async () => {
    data.value = await newService.getData();
  };
  return { data, fetchData };
}
```

### Add a new page

1. Create component:
```vue
<!-- pages/NewPage.vue -->
<template>
  <main>Content</main>
</template>

<script setup>
import { useNew } from '@/composables/useNew';
</script>
```

2. Add route in `router/index.js`:
```javascript
{
  path: '/new',
  name: 'NewPage',
  component: () => import('../pages/NewPage.vue'),
}
```

### Add a reusable component

1. Create component:
```vue
<!-- components/MyComponent.vue -->
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({ title: String });
defineEmits(['click']);
</script>
```

2. Use in pages:
```vue
<script setup>
import MyComponent from '@/components/MyComponent.vue';
</script>

<template>
  <MyComponent @click="handleClick">Content</MyComponent>
</template>
```

## 🔗 File Relationships

```
App.vue (Root)
  ├── Header.vue
  │   └── UserDropdown.vue
  └── Router View
      ├── Home.vue
      │   ├── VideoCard.vue (reused)
      │   └── useVideo composable
      ├── Watch.vue
      │   ├── VideoPlayer.vue
      │   └── useVideoDetail composable
      ├── History.vue
      │   ├── VideoCard.vue (reused)
      │   └── useUserData composable
      ├── Likes.vue
      │   ├── VideoCard.vue (reused)
      │   └── useUserData composable
      └── Playlist.vue
          └── useUserData composable
```

## 📚 Learning Path

1. **Understand the Structure**
   - Read SUMMARY.md
   - Check README.md for architecture

2. **Learn Vue 3**
   - Single File Components (*.vue)
   - Composition API (script setup)
   - Reactive data (ref, computed)

3. **Explore Composables**
   - How they manage state
   - How they call services
   - How components use them

4. **Check Services**
   - API layer abstraction
   - Retry logic implementation
   - Error handling

5. **Build Features**
   - Create new composable
   - Add service methods
   - Create components
   - Update router

## ❓ FAQs

**Q: Where do I fetch data?**
A: In services (api.js, videoService.js, etc.)

**Q: Where do I manage state?**
A: In composables (useVideo.js, useAuth.js) or authStore for global

**Q: How do I add a page?**
A: Create pages/MyPage.vue and add route in router/index.js

**Q: Where do I put UI?**
A: In components/ if reusable, in pages/ if specific

**Q: How do I make API calls?**
A: Through services, never directly in components

**Q: How do the video IDs work?**
A: URL `/watch/:id` → extracted in composable → passed to service

## 🎯 Entry Points

- **App Start**: `src/main.js`
- **Root UI**: `src/App.vue`
- **Routes**: `src/router/index.js`
- **Auth**: `src/composables/useAuth.js`
- **Videos**: `src/composables/useVideo.js`

## 📊 Quick Stats

- **Total Files**: 30+
- **Lines of Code**: ~3000
- **Components**: 5
- **Pages**: 5
- **Services**: 5
- **Composables**: 4
- **Build Tool**: Vite
- **State Manager**: Pinia
- **Bundle Size**: ~60KB (gzipped)

## 🔥 Performance Tips

1. Use lazy route loading (already done)
2. Use ref() instead of reactive() for simple values
3. Use computed() for derived values
4. Avoid direct DOM manipulation
5. Use v-show for frequently toggled elements

## 🎓 Vue 3 Essentials

```javascript
// Refs - Reactive variables
const count = ref(0);

// Computed - Derived values
const doubled = computed(() => count.value * 2);

// Watch - React to changes
watch(count, (newVal) => {
  console.log(newVal);
});

// Lifecycle
onMounted(() => { /* runs after mount */ });
onUnmounted(() => { /* cleanup */ });

// Composable - Reusable logic
function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
}
```

## 🚀 Ready to Go!

```bash
cd frontend/vue
npm install
npm run dev
```

Now open: `http://localhost:3000`

---

**Need help?** Check README.md or SETUP.md
