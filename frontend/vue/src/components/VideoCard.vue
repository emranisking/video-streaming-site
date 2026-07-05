<template>
  <div class="video-card" @click="handleClick">
    <div class="thumbnail-wrapper">
      <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="video-thumbnail" @error="handleImageError">
      <div v-if="video.isLiked" class="liked-badge">❤️</div>
      <div v-if="video.duration" class="duration-badge">{{ formatDuration(video.duration) }}</div>
    </div>
    <div class="video-info">
      <h4>{{ truncate(video.title, 50) }}</h4>
      <p>{{ formatViewCount(video.views) }} views • {{ video.likes || 0 }} likes</p>
    </div>
  </div>
</template>

<script setup>
import { formatViewCount, formatDuration, getFullUrl } from '../utils/helpers';

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click']);

const truncate = (text, len = 50) => {
  return text && text.length > len ? text.substring(0, len) + '...' : text;
};

const handleClick = () => {
  console.log('🖱️ Video clicked:', props.video.id, props.video.title);
  emit('click', props.video);
};

const handleImageError = (event) => {
  console.warn('⚠️ Failed to load thumbnail for video:', props.video.id);
  event.target.src = ''; // Or use a placeholder image
  event.target.style.backgroundColor = '#333';
};
</script>

<style scoped>
.video-card {
  background: rgba(30, 30, 30, 0.8);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 153, 0, 0.1);
}

.video-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 153, 0, 0.3);
  box-shadow: 0 8px 16px rgba(255, 153, 0, 0.1);
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.3);
}

.liked-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.duration-badge {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  color: #fff;
}

.video-info {
  padding: 0.75rem;
}

.video-info h4 {
  margin: 0 0 0.5rem 0;
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-info p {
  margin: 0;
  color: #999;
  font-size: 0.8rem;
}
</style>