import { ref, computed } from 'vue';
import { authService } from '../services/authService';
import { STORAGE_KEYS, SUCCESS_MESSAGES } from '../utils/constants';
import { useAuthStore } from '../stores/authStore';

/**
 * Composable for authentication logic
 */
export function useAuth() {
  const authStore = useAuthStore();
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN));
  const isAuthenticated = computed(() => !!token.value);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // Store token and user data
      if (response.token) {
        authStore.login(response.user, response.token);
        token.value = response.token;
      }
      
      return { 
        success: true, 
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: response.user
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await authService.signup(email, password, name);
      
      // Store token and user data
      if (response.token) {
        authStore.login(response.user, response.token);
        token.value = response.token;
      }
      
      return { 
        success: true, 
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: response.user
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authStore.logout();
    token.value = null;
  };

  return {
    token,
    isAuthenticated,
    login,
    signup,
    logout,
  };
}