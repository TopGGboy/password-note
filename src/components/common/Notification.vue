<template>
  <Teleport to="body">
    <div v-if="visible" class="notification" :class="type" @click="close">
      <div class="notification-content">
        <div class="notification-icon">
          <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="notification-body">
          <h3 class="notification-title">{{ title }}</h3>
          <p v-if="message" class="notification-message">{{ message }}</p>
        </div>
        <button class="notification-close" @click.stop="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  title: string
  message?: string
  type?: 'success' | 'error'
  duration?: number
  modelValue?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '操作成功',
  message: '',
  type: 'success',
  duration: 3000,
  modelValue: true
})

const emit = defineEmits<Emits>()
const visible = ref(props.modelValue)
let timeoutId: ReturnType<typeof setTimeout> | null = null

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.duration > 0) {
    startTimer()
  }
})

onMounted(() => {
  if (props.modelValue && props.duration > 0) {
    startTimer()
  }
})

function startTimer() {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => {
    close()
  }, props.duration)
}

function close() {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  emit('update:modelValue', false)
  setTimeout(() => {
    emit('close')
  }, 300)
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100001;
  max-width: 400px;
  width: calc(100% - 40px);
  animation: slideInLeft 0.3s ease-out;
}

.notification-content {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 20px 24px;
  color: white;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification.success .notification-content {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  box-shadow: 0 10px 25px rgba(72, 187, 120, 0.4);
}

.notification.error .notification-content {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
  box-shadow: 0 10px 25px rgba(245, 101, 101, 0.4);
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
}

.notification.success .notification-icon {
  animation: pulse-success 2s infinite;
}

.notification.error .notification-icon {
  animation: pulse-error 2s infinite;
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
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.notification-message {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
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

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes pulse-success {
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

@keyframes pulse-error {
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

@media (max-width: 768px) {
  .notification {
    top: 10px;
    left: 10px;
    right: 10px;
    width: auto;
    max-width: none;
  }

  .notification-content {
    padding: 16px 20px;
  }

  .notification-title {
    font-size: 16px;
  }

  .notification-message {
    font-size: 13px;
  }
}
</style>
