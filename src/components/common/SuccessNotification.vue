<template>
  <div v-if="visible" class="success-notification" @click="close">
    <div class="notification-content">
      <div class="notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="notification-body">
        <h3 class="notification-title">{{ title }}</h3>
        <p class="notification-message">{{ message }}</p>
        <ul v-if="items && items.length > 0" class="notification-items">
          <li v-for="(item, index) in items" :key="index" class="notification-item">
            <span class="item-bullet">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <button class="notification-close" @click.stop="close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  title: string
  message: string
  items?: string[]
  duration?: number
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '操作成功',
  message: '',
  items: () => [],
  duration: 5000
})

const emit = defineEmits<Emits>()
const visible = ref(true)

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // 等待动画完成
}

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(close, props.duration)
  }
})
</script>

<style scoped>
.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(72, 187, 120, 0.4);
  padding: 24px;
  color: white;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.notification-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.notification-message {
  font-size: 14px;
  margin: 0 0 12px 0;
  opacity: 0.9;
  line-height: 1.4;
}

.notification-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  font-size: 13px;
  margin-bottom: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  opacity: 0.8;
  line-height: 1.3;
}

.item-bullet {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-close {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.notification-close svg {
  width: 16px;
  height: 16px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .success-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification-content {
    padding: 20px;
  }
  
  .notification-title {
    font-size: 16px;
  }
  
  .notification-message {
    font-size: 13px;
  }
  
  .notification-item {
    font-size: 12px;
  }
}
</style>