<template>
  <main class="not-found-page">
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <router-link to="/" class="home-link">← Back to Home</router-link>
    </div>
  </main>
</template>

<script setup>
// No additional logic needed
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(ellipse at center, rgba(255, 153, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 2rem;
}

.not-found-container {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
  background: rgba(17, 17, 17, 0.96);
  border: 1px solid rgba(255, 153, 0, 0.16);
  border-radius: 0.5rem;
}

h1 {
  font-size: 6rem;
  color: #ff9900;
  margin: 0;
}

h2 {
  color: #fff;
  margin: 1rem 0 0.5rem;
}

p {
  color: #999;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #ff9900;
  color: #000;
  text-decoration: none;
  border-radius: 0.25rem;
  font-weight: bold;
  transition: background 0.2s;
}

.home-link:hover {
  background: #ffb366;
}
</style>