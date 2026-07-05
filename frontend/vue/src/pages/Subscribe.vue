<template>
  <main class="subscribe-page">
    <div class="subscribe-container">
      <h1>Subscribe to TV</h1>
      <p class="subtitle">Get unlimited access to all content</p>

      <div class="pricing-grid">
        <div class="pricing-card" v-for="plan in plans" :key="plan.name">
          <h2>{{ plan.name }}</h2>
          <div class="price">${{ plan.price }}/month</div>
          <ul class="features">
            <li v-for="feature in plan.features" :key="feature">
              ✅ {{ feature }}
            </li>
          </ul>
          <button 
            class="subscribe-btn" 
            :class="{ 'current': plan.current }"
            @click="handleSubscribe(plan)"
            :disabled="plan.current"
          >
            {{ plan.current ? 'Current Plan' : 'Subscribe' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';

const plans = ref([
  {
    name: 'Free',
    price: 0,
    current: true,
    features: [
      'Watch 3 free videos per day',
      'Basic quality',
      'Ads supported'
    ]
  },
  {
    name: 'Premium',
    price: 9.99,
    current: false,
    features: [
      'Unlimited videos',
      'HD quality',
      'No ads',
      'Download videos',
      'Priority support'
    ]
  },
  {
    name: 'Family',
    price: 14.99,
    current: false,
    features: [
      'Everything in Premium',
      '5 family members',
      'Separate watch history',
      'Parental controls'
    ]
  }
]);

const handleSubscribe = async (plan) => {
  if (plan.current) return;
  
  const result = await Swal.fire({
    title: `Subscribe to ${plan.name}`,
    text: `You will be charged $${plan.price}/month`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff9900',
    cancelButtonColor: '#666',
    confirmButtonText: 'Subscribe',
    background: '#1a1a1a',
    color: '#fff',
  });

  if (result.isConfirmed) {
    // Here you would integrate with a payment provider
    Swal.fire({
      title: 'Coming Soon!',
      text: 'Payment integration will be added later.',
      icon: 'info',
      confirmButtonColor: '#ff9900',
      background: '#1a1a1a',
      color: '#fff',
    });
  }
};
</script>

<style scoped>
.subscribe-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, rgba(255, 153, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%),
              linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.subscribe-container {
  max-width: 1000px;
  width: 100%;
}

h1 {
  color: #ff9900;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #999;
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.pricing-card {
  background: rgba(17, 17, 17, 0.96);
  border: 1px solid rgba(255, 153, 0, 0.16);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 153, 0, 0.3);
  box-shadow: 0 12px 24px rgba(255, 153, 0, 0.1);
}

.pricing-card h2 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 2rem;
  color: #ff9900;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  text-align: left;
}

.features li {
  color: #999;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.subscribe-btn {
  width: 100%;
  padding: 0.75rem;
  background: #ff9900;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.subscribe-btn:hover:not(:disabled) {
  background: #ffb366;
}

.subscribe-btn.current {
  background: #666;
  color: #fff;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>