import { BaseService } from './baseService';
import httpClient from './api';
import { STORAGE_KEYS } from '../utils/constants';

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await httpClient.post(`${this.endpoint}/login`, {
      email,
      password,
    });

    // Store token if present
    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      if (response.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      }
    }

    return response;
  }

  /**
   * Sign up new user
   */
  async signup(email, password, name) {
    // Remove name if backend doesn't accept it
    const payload = { email, password };
    // Only include name if your backend supports it
    // if (name) payload.name = name;
    
    const response = await httpClient.post(`${this.endpoint}/register`, payload);

    // Store token if present
    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      if (response.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      }
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await httpClient.post(`${this.endpoint}/logout`);
    } catch (_) {
      // Ignore errors on logout
    }
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Get stored user
   */
  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();