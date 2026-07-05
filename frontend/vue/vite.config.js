import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:7000',
      '/videos': 'http://localhost:7000',
      '/auth': 'http://localhost:7000',
      '/history': 'http://localhost:7000',
      '/likes': 'http://localhost:7000',
      '/playlist': 'http://localhost:7000',
      '/thumbnails': 'http://localhost:7000',
      '/videos_hls': 'http://localhost:7000',
      '/video_hls': 'http://localhost:7000',
    },
  },
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    minify: 'terser',
  },
});
