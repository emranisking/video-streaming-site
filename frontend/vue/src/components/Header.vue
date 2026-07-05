<template>
  <header>
    <div class="logo">TV</div>
    <nav>
      <ul>
        <li v-if="!isAuthenticated">
          <a href="#" @click.prevent="$emit('login')">Login</a>
        </li>
        <li v-if="!isAuthenticated">
          <a href="#" @click.prevent="$emit('signup')">Create Account</a>
        </li>
        <li v-if="isAuthenticated" class="user-menu-container">
          <img 
            src="/icons/user.png" 
            alt="User"
            class="user-icon"
            @click="toggleDropdown"
          >
          <UserDropdown 
            v-show="showDropdown"
            @close="showDropdown = false"
            @logout="handleLogout"
            @navigate="handleNavigate"
          />
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import UserDropdown from './UserDropdown.vue';

const authStore = useAuthStore();
const showDropdown = ref(false);
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Listen for auth changes
const handleAuthChange = () => {
  // This will trigger reactivity when auth state changes
  console.log('🔄 Auth state changed:', isAuthenticated.value);
};

onMounted(() => {
  // Listen for login success event
  window.addEventListener('auth:login-success', handleAuthChange);
  // Listen for logout event
  window.addEventListener('auth:logout', handleAuthChange);
});

onUnmounted(() => {
  window.removeEventListener('auth:login-success', handleAuthChange);
  window.removeEventListener('auth:logout', handleAuthChange);
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  authStore.logout();
  showDropdown.value = false;
  // Dispatch logout event
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

const handleNavigate = (path) => {
  showDropdown.value = false;
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu-container')) {
    showDropdown.value = false;
  }
});
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, rgba(22, 22, 22, 0.95), rgba(45, 45, 45, 0.9));
  border-bottom: 1px solid rgba(255, 153, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff9900;
}

nav ul {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s ease;
}

nav a:hover {
  color: #ff9900;
}

.user-menu-container {
  position: relative;
}

.user-icon {
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 50%;
  border: 2px solid transparent;
}

.user-icon:hover {
  transform: scale(1.1);
  border-color: #ff9900;
}
</style>