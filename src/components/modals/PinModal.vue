<template>
  <div class="pin-modal-overlay">
    <div class="pin-modal-content">
      <div class="pin-modal-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>{{ isSetup ? '设置 PIN 码' : '输入 PIN 码' }}</h3>
        <button v-if="!isSetup" @click="$emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="pin-modal-body">
        <p class="description" v-if="isSetup">
          设置一个 4-6 位数字 PIN 码，用于保护您的密码数据
        </p>
        <p class="description" v-else>
          请输入 PIN 码以解锁密码库
        </p>

        <div class="pin-input-container" @click="focusPinInput">
          <div class="pin-dots">
            <div 
              v-for="i in pinLength" 
              :key="i" 
              class="pin-dot"
              :class="{ filled: i <= pin.length, active: activeField === 'pin' }"
            >
              <span v-if="i <= pin.length">●</span>
            </div>
          </div>
        </div>

        <div v-if="isSetup && pin.length >= 4" class="confirm-section">
          <label>确认 PIN 码</label>
          <div class="pin-input-container" @click="focusConfirmInput">
            <div class="pin-dots">
              <div 
                v-for="i in pinLength" 
                :key="i" 
                class="pin-dot"
                :class="{ filled: i <= confirmPin.length, active: activeField === 'confirm' }"
              >
                <span v-if="i <= confirmPin.length">●</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="pin-keypad">
          <button 
            v-for="n in 9" 
            :key="n" 
            class="keypad-btn"
            @click="addDigit(n.toString())"
          >
            {{ n }}
          </button>
          <button class="keypad-btn clear-btn" @click="clearCurrent">
            清除
          </button>
          <button class="keypad-btn" @click="addDigit('0')">
            0
          </button>
          <button class="keypad-btn backspace-btn" @click="removeDigit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
              <line x1="18" y1="9" x2="12" y2="15"/>
              <line x1="12" y1="9" x2="18" y2="15"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="pin-modal-footer">
        <button 
          v-if="!isSetup" 
          class="btn btn-secondary" 
          @click="$emit('close')"
        >
          跳过
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="!canSubmit || isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? '验证中...' : (isSetup ? '确认设置' : '解锁') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { pinManager } from '../../utils/auth/pinManager'
import { useAuthStore } from '../../store/auth'
import { useRouter } from 'vue-router'

interface Props {
  isSetup?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSetup: false
})

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'close'): void
}>()

const router = useRouter()
const authStore = useAuthStore()

const pin = ref('')
const confirmPin = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const pinLength = 6
const activeField = ref<'pin' | 'confirm'>('pin')

const canSubmit = computed(() => {
  if (props.isSetup) {
    return pin.value.length >= 4 && 
           confirmPin.value.length >= 4 && 
           pin.value === confirmPin.value
  }
  return pin.value.length >= 4
})

const focusPinInput = () => {
  activeField.value = 'pin'
}

const focusConfirmInput = () => {
  activeField.value = 'confirm'
}

const addDigit = (digit: string) => {
  errorMessage.value = ''
  
  if (activeField.value === 'pin') {
    if (pin.value.length < 6) {
      pin.value += digit
    }
  } else {
    if (confirmPin.value.length < 6) {
      confirmPin.value += digit
    }
  }
}

const removeDigit = () => {
  errorMessage.value = ''
  
  if (activeField.value === 'pin') {
    pin.value = pin.value.slice(0, -1)
  } else {
    confirmPin.value = confirmPin.value.slice(0, -1)
  }
}

const clearCurrent = () => {
  errorMessage.value = ''
  
  if (activeField.value === 'pin') {
    pin.value = ''
  } else {
    confirmPin.value = ''
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key >= '0' && e.key <= '9') {
    addDigit(e.key)
  } else if (e.key === 'Backspace') {
    removeDigit()
  } else if (e.key === 'Enter' && canSubmit.value) {
    handleSubmit()
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    if (props.isSetup) {
      if (pin.value !== confirmPin.value) {
        errorMessage.value = '两次输入的 PIN 码不一致'
        confirmPin.value = ''
        activeField.value = 'confirm'
        return
      }
      
      if (pin.value.length < 4) {
        errorMessage.value = 'PIN 码至少需要 4 位数字'
        return
      }
      
      pinManager.setPin(pin.value)
      emit('success')
    } else {
      const isValid = pinManager.verifyPin(pin.value)
      
      if (isValid) {
        emit('success')
      } else {
        errorMessage.value = 'PIN 码错误，请重试'
        pin.value = ''
        activeField.value = 'pin'
      }
    }
  } catch (error) {
    console.error('PIN 验证失败:', error)
    errorMessage.value = '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.pin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.pin-modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.pin-modal-header {
  text-align: center;
  padding: 32px 24px 16px;
  position: relative;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: var(--gradient-primary);
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
}

.header-icon svg {
  width: 32px;
  height: 32px;
  color: white;
  stroke-width: 2;
}

.pin-modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--gray-100);
  border-radius: 10px;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--gray-500);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--error-500);
  color: white;
}

.close-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.pin-modal-body {
  padding: 16px 24px 24px;
}

.description {
  text-align: center;
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 24px;
}

.pin-input-container {
  position: relative;
  margin-bottom: 16px;
  cursor: pointer;
}

.pin-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.pin-dot {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--gray-100);
  border: 2px solid var(--gray-200);
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  color: var(--primary-600);
  transition: all var(--transition-normal);
}

.pin-dot.filled {
  background: var(--primary-50);
  border-color: var(--primary-500);
}

.pin-dot.active {
  border-color: var(--primary-400);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
}

.confirm-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
}

.confirm-section label {
  display: block;
  text-align: center;
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 12px;
}

.error-message {
  text-align: center;
  color: var(--error-600);
  font-size: 0.875rem;
  padding: 12px;
  background: var(--error-50);
  border-radius: 12px;
  margin-bottom: 16px;
}

.pin-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.keypad-btn {
  height: 56px;
  border: none;
  border-radius: 12px;
  background: var(--gray-100);
  color: var(--gray-900);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.keypad-btn:hover {
  background: var(--gray-200);
  transform: scale(1.05);
}

.keypad-btn:active {
  transform: scale(0.95);
}

.clear-btn {
  background: var(--error-100);
  color: var(--error-700);
}

.clear-btn:hover {
  background: var(--error-200);
}

.backspace-btn {
  background: var(--gray-200);
}

.backspace-btn svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.pin-modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

@media (max-width: 480px) {
  .pin-modal-content {
    max-width: 100%;
    margin: 16px;
  }
  
  .pin-dot {
    width: 40px;
    height: 40px;
  }
  
  .keypad-btn {
    height: 48px;
    font-size: 1.125rem;
  }
}
</style>
