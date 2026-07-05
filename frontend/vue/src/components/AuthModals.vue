<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="close">
      <div class="modal-content auth-modal">
        <button class="modal-close" @click="close">&times;</button>
        
        <!-- Login Form -->
        <div v-if="isLogin">
          <h2>Login</h2>
          <form @submit.prevent="handleLogin">
            <input
              v-model="form.email"
              type="email"
              placeholder="Email"
              required
            />
            <input
              v-model="form.password"
              type="password"
              placeholder="Password"
              required
            />
            <button type="submit" :disabled="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
            <p class="toggle-form">
              Don't have an account?
              <button type="button" @click="toggleForm">Sign Up</button>
            </p>
          </form>
        </div>

        <!-- Signup Form -->
        <div v-else>
          <h2>Create Account</h2>
          <form @submit.prevent="handleSignup">
            <input
              v-model="form.name"
              type="text"
              placeholder="Full Name"
              required
            />
            <input
              v-model="form.email"
              type="email"
              placeholder="Email"
              required
            />
            <input
              v-model="form.password"
              type="password"
              placeholder="Password"
              required
            />
            <button type="submit" :disabled="loading">
              {{ loading ? 'Creating Account...' : 'Sign Up' }}
            </button>
            <p class="toggle-form">
              Already have an account?
              <button type="button" @click="toggleForm">Login</button>
            </p>
          </form>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="modal-error">{{ error }}</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
  isOpen: Boolean,
  initialMode: {
    type: String,
    default: 'login',
  },
});

const emit = defineEmits(['close']);

const { login, signup } = useAuth();
const isLogin = ref(props.initialMode === 'login');
const loading = ref(false);
const error = ref('');

const form = ref({
  email: '',
  password: '',
  name: '',
});

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
};

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  const result = await login(form.value.email, form.value.password);
  
  if (result.success) {
    // Emit login success event - this will trigger header update
    window.dispatchEvent(new CustomEvent('auth:login-success'));
    close();
  } else {
    error.value = result.error || 'Login failed';
  }

  loading.value = false;
};

const handleSignup = async () => {
  loading.value = true;
  error.value = '';

  const result = await signup(form.value.email, form.value.password, form.value.name);
  
  if (result.success) {
    // Emit login success event - this will trigger header update
    window.dispatchEvent(new CustomEvent('auth:login-success'));
    close();
  } else {
    error.value = result.error || 'Signup failed';
  }

  loading.value = false;
};

const close = () => {
  form.value = { email: '', password: '', name: '' };
  error.value = '';
  emit('close');
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 153, 0, 0.2);
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #ff9900;
}

h2 {
  color: #ff9900;
  margin-bottom: 1.5rem;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 153, 0, 0.2);
  border-radius: 0.25rem;
  color: #fff;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #ff9900;
  background: rgba(255, 153, 0, 0.05);
}

button[type="submit"] {
  padding: 0.75rem;
  background: #ff9900;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

button[type="submit"]:hover {
  background: #ffb366;
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-form {
  text-align: center;
  color: #999;
  margin-top: 1rem;
}

.toggle-form button {
  background: none;
  border: none;
  color: #ff9900;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.toggle-form button:hover {
  color: #ffb366;
}

.modal-error {
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 0.25rem;
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
}
</style>