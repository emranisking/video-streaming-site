import { buildApiUrl } from '../utils/helpers';
import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

/**
 * HTTP Client for API calls
 */
class HttpClient {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'any-value',
    };
  }

  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      ...this.baseHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(method, path, data = null, options = {}) {
    const url = buildApiUrl(path);
    console.log('🌐 API Request:', method, url);
    const headers = this.getAuthHeaders();
    const maxAttempts = options.retry !== false ? API_CONFIG.RETRY_ATTEMPTS : 1;

    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const config = {
          method,
          headers,
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        };

        if (data) {
          config.body = JSON.stringify(data);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          
          // Handle specific status codes
          if (response.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            // Emit event for login modal
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
          
          throw new Error(errorMessage);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication errors
        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw error;
        }
        
        if (attempt < maxAttempts) {
          await sleep(API_CONFIG.RETRY_DELAY * attempt);
        }
      }
    }

    throw lastError;
  }

  get(path, options) { return this.request('GET', path, null, options); }
  post(path, data, options) { return this.request('POST', path, data, options); }
  patch(path, data, options) { return this.request('PATCH', path, data, options); }
  put(path, data, options) { return this.request('PUT', path, data, options); }
  delete(path, options) { return this.request('DELETE', path, null, options); }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default new HttpClient();