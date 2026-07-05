<template>
  <div id="app">
    <Header @login="showLoginModal = true" @signup="showSignupModal = true" />

    <!-- Auth Modals -->
    <AuthModals 
      :isOpen="showLoginModal"
      initialMode="login"
      @close="showLoginModal = false"
    />
    <AuthModals 
      :isOpen="showSignupModal"
      initialMode="signup"
      @close="showSignupModal = false"
    />

    <!-- Router View -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from './components/Header.vue';
import AuthModals from './components/AuthModals.vue';

const router = useRouter();
const showLoginModal = ref(false);
const showSignupModal = ref(false);

// Handle unauthorized event from router guard
const handleUnauthorized = () => {
  showLoginModal.value = true;
};

// Handle successful login to redirect to intended page
const handleLoginSuccess = () => {
  const redirectPath = sessionStorage.getItem('redirectAfterLogin');
  if (redirectPath) {
    sessionStorage.removeItem('redirectAfterLogin');
    router.push(redirectPath);
  }
};

// Handle logout
const handleLogout = () => {
  // Close any open modals
  showLoginModal.value = false;
  showSignupModal.value = false;
};

onMounted(() => {
  // Listen for unauthorized event
  window.addEventListener('auth:unauthorized', handleUnauthorized);
  
  // Listen for login success event
  window.addEventListener('auth:login-success', handleLoginSuccess);
  
  // Listen for logout event
  window.addEventListener('auth:logout', handleLogout);
});

onUnmounted(() => {
  window.removeEventListener('auth:unauthorized', handleUnauthorized);
  window.removeEventListener('auth:login-success', handleLoginSuccess);
  window.removeEventListener('auth:logout', handleLogout);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
}

body {
  background: #0a0a0a;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: #ff9900;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ffb366;
}

/* Firefox Scrollbar */
* {
  scrollbar-color: #ff9900 rgba(255, 255, 255, 0.05);
  scrollbar-width: thin;
}
</style>