// Re-export from formatters.js for backward compatibility
export { 
  formatTime, 
  formatDuration, 
  formatViewCount, 
  formatDate 
} from './formatters';

/**
 * Get backend API URL from environment
 */
export function getApiUrl() {
  const url = import.meta.env.VITE_API_URL || window.location.origin;
  console.log('🔧 Backend API URL:', url);
  return url;
}

/**
 * Build absolute URL for API endpoints
 */
export function buildApiUrl(path) {
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}${path}`;
  console.log('🔗 Built URL:', fullUrl);
  return fullUrl;
}

/**
 * Get backend host (for video URLs)
 */
export function getBackendHost() {
  const url = getApiUrl();
  console.log('🏠 Backend host:', url);
  return url;
}

/**
 * Get full URL for a path (thumbnail, video, etc.)
 */
export function getFullUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendUrl = getBackendHost();
  return `${backendUrl}${path}`;
}