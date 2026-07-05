import Swal from 'sweetalert2';

/**
 * Global error handler for Vue
 */
export function setupErrorHandler(app) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('Global error:', err);
    console.error('Error info:', info);
    
    // Don't show for network errors (handled separately)
    if (err?.message?.includes('Network') || err?.message?.includes('fetch')) {
      return;
    }
    
    Swal.fire({
      title: 'Error',
      text: err?.message || 'An unexpected error occurred',
      icon: 'error',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  };
}

/**
 * Global API error interceptor
 */
export function setupApiErrorHandler() {
  // This will be used in HttpClient
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Network') || 
        event.reason?.message?.includes('fetch')) {
      // Show a toast instead of a modal for network errors
      showToast('Network error. Please check your connection.', 'error');
    }
  });
}

function showToast(message, type = 'info') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}