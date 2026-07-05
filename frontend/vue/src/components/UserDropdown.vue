<template>
  <div class="user-dropdown">
    <router-link 
      to="/playlist" 
      class="dropdown-item"
      @click="$emit('navigate')"
    >
      Playlist
    </router-link>
    <router-link 
      to="/history" 
      class="dropdown-item"
      @click="$emit('navigate')"
    >
      History
    </router-link>
    <router-link 
      to="/likes" 
      class="dropdown-item"
      @click="$emit('navigate')"
    >
      Likes
    </router-link>
    <router-link to="/subscribe" class="dropdown-item" @click="$emit('navigate')">
      🎬 Subscribe
    </router-link>
    <button 
      class="dropdown-item logout-btn"
      @click="$emit('logout')"
    >
      Logout
    </button>
  </div>
</template>

<script setup>
defineEmits(['close', 'logout', 'navigate']);
</script>

<style scoped>
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid rgba(255, 153, 0, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  padding: 0.75rem 1rem;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}

.logout-btn {
  border-top: 1px solid rgba(255, 153, 0, 0.2);
}
</style>
