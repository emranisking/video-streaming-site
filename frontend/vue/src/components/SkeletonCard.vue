<template>
  <div class="skeleton-card">
    <div class="skeleton-thumbnail"></div>
    <div class="skeleton-info">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta"></div>
      <div class="skeleton-meta short"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 153, 0, 0.1);
}

.skeleton-thumbnail {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  padding: 1rem;
}

.skeleton-title {
  height: 16px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-meta {
  height: 12px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.3rem;
  width: 70%;
}

.skeleton-meta.short {
  width: 40%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>