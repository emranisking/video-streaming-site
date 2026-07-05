import { createRouter, createWebHistory } from 'vue-router';

// Lazy load routes for better performance
const Home = () => import('../pages/Home.vue');
const Watch = () => import('../pages/Watch.vue');
const History = () => import('../pages/History.vue');
const Likes = () => import('../pages/Likes.vue');
const Playlist = () => import('../pages/Playlist.vue');
const Subscribe = () => import('../pages/Subscribe.vue');
const NotFound = () => import('../pages/NotFound.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    component: Watch,
    props: route => ({ videoId: parseInt(route.params.id) }),
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true },
  },
  {
    path: '/likes',
    name: 'Likes',
    component: Likes,
    meta: { requiresAuth: true },
  },
  {
    path: '/playlist',
    name: 'Playlist',
    component: Playlist,
    meta: { requiresAuth: true },
  },
  {
    path: '/subscribe',
    name: 'Subscribe',
    component: Subscribe,
    meta: { requiresAuth: true },
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Smooth scroll behavior
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// ============ AUTHENTICATION GUARD ============
router.beforeEach((to, from, next) => {
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Dispatch event to show login modal
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    
    // Store the intended destination for redirect after login
    sessionStorage.setItem('redirectAfterLogin', to.fullPath);
    
    // Redirect to home page
    next({ name: 'Home' });
    return;
  }
  
  // If user is authenticated and trying to access login/signup page
  // Redirect to home (since we're using modals instead of dedicated pages)
  if (isAuthenticated && (to.name === 'Login' || to.name === 'Signup')) {
    next({ name: 'Home' });
    return;
  }
  
  // Allow navigation
  next();
});
// ============ END AUTHENTICATION GUARD ============

export default router;