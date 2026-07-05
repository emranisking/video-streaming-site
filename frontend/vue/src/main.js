import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setupErrorHandler, setupApiErrorHandler } from './plugins/errorHandler';
import Swal from 'sweetalert2';
import './assets/styles/responsive.css';

// Make SweetAlert available globally
window.Swal = Swal;

const app = createApp(App);

// Setup global error handling
setupErrorHandler(app);
setupApiErrorHandler();

app.use(createPinia());
app.use(router);

app.mount('#app');