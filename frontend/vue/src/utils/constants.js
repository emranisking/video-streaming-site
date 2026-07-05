// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  SESSION_ID: 'sessionId',
  USER: 'user', // Add this line
};

// UI Constants
export const UI_CONSTANTS = {
  VIDEOS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VIDEO_NOT_FOUND: 'Video not found.',
  AUTH_REQUIRED: 'Please login to perform this action.',
  VIEW_LIMIT_REACHED: "You've reached your free viewing limit. Please subscribe for unlimited access.",
  PLAYBACK_ERROR: 'Video playback could not be started.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  VIDEO_LIKED: 'Video liked ❤️',
  ADDED_TO_PLAYLIST: 'Added to playlist!',
};