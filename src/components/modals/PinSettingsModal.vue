<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>{{ hasPin ? '修改 PIN 码' : '设置 PIN 码' }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="info-notice">
          <div class="notice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <p>PIN 码用于保护您的密码数据，每次访问密码库时需要输入</p>
        </div>

        <form @submit.prevent="handleSubmit" class="pin-form">
          <div v-if="hasPin" class="form-group">
            <label>当前 PIN 码</label>
            <div class="pin-input-wrapper">
              <input
                v-model="currentPin"
                type="password"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                placeholder="输入当前 PIN 码"
                class="pin-input"
              />
              <button type="button" @click="toggleCurrentPin" class="toggle-btn">
                <svg v-if="!showCurrentPin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>新 PIN 码</label>
            <div class="pin-input-wrapper">
              <input
                v-model="newPin"
                :type="showNewPin ? 'text' : 'password'"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                placeholder="输入 4-6 位数字 PIN 码"
                class="pin-input"
              />
              <button type="button" @click="showNewPin = !showNewPin" class="toggle-btn">
                <svg v-if="!showNewPin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div v-if="newPin" class="pin-strength">
              <span :class="pinStrength.class">{{ pinStrength.text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>确认新 PIN 码</label>
            <div class="pin-input-wrapper">
              <input
                v-model="confirmPin"
                :type="showConfirmPin ? 'text' : 'password'"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                placeholder="再次输入新 PIN 码"
                class="pin-input"
              />
              <button type="button" @click="showConfirmPin = !showConfirmPin" class="toggle-btn">
                <svg v-if="!showConfirmPin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <div v-if="confirmPin && newPin !== confirmPin" class="error-hint">
              两次输入的 PIN 码不一致
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" :disabled="!isFormValid || isLoading" class="btn btn-primary">
              {{ isLoading ? '处理中...' : (hasPin ? '修改 PIN 码' : '设置 PIN 码') }}
            </button>
          </div>
        </form>

        <div v-if="hasPin" class="danger-zone">
          <div v-if="!showRemoveConfirm" class="remove-info">
            <p>移除 PIN 码后将不再需要验证即可访问密码库</p>
            <button @click="showRemoveConfirm = true" class="btn btn-danger">
              移除 PIN 码
            </button>
          </div>
          <div v-else class="remove-confirm">
            <label>请输入当前 PIN 码以确认移除</label>
            <div class="pin-input-wrapper">
              <input
                v-model="removeConfirmPin"
                type="password"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                placeholder="输入当前 PIN 码"
                class="pin-input"
              />
            </div>
            <div v-if="removeError" class="error-hint">{{ removeError }}</div>
            <div class="remove-actions">
              <button @click="cancelRemove" class="btn btn-secondary">取消</button>
              <button @click="handleRemovePin" :disabled="removeConfirmPin.length < 4" class="btn btn-danger">
                确认移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pinManager } from '../../utils/auth/pinManager'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const hasPin = ref(false)

const currentPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const showCurrentPin = ref(false)
const showNewPin = ref(false)
const showConfirmPin = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showRemoveConfirm = ref(false)
const removeConfirmPin = ref('')
const removeError = ref('')

onMounted(() => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    pinManager.setCurrentUser(parseInt(userId))
    hasPin.value = pinManager.hasPin()
  }
})

const pinStrength = computed(() => {
  const len = newPin.value.length
  if (len < 4) return { text: 'PIN 码至少需要 4 位', class: 'weak' }
  if (len === 4) return { text: '中等强度', class: 'medium' }
  if (len === 5) return { text: '较强', class: 'strong' }
  return { text: '很强', class: 'very-strong' }
})

const isFormValid = computed(() => {
  if (hasPin.value) {
    return currentPin.value.length >= 4 &&
           newPin.value.length >= 4 &&
           confirmPin.value.length >= 4 &&
           newPin.value === confirmPin.value
  }
  return newPin.value.length >= 4 &&
         confirmPin.value.length >= 4 &&
         newPin.value === confirmPin.value
})

const handleOverlayClick = () => {
  emit('close')
}

const toggleCurrentPin = () => {
  const input = document.querySelector('input[type="password"]') as HTMLInputElement
  if (input) {
    input.type = showCurrentPin.value ? 'password' : 'text'
  }
  showCurrentPin.value = !showCurrentPin.value
}

const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    if (hasPin.value) {
      const result = pinManager.changePin(currentPin.value, newPin.value)
      if (!result.success) {
        errorMessage.value = result.message
        return
      }
    } else {
      pinManager.setPin(newPin.value)
    }
    
    emit('success')
    emit('close')
  } catch (error) {
    console.error('PIN 码设置失败:', error)
    errorMessage.value = '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const handleRemovePin = () => {
  removeError.value = ''
  
  if (removeConfirmPin.value.length < 4) {
    removeError.value = '请输入 PIN 码'
    return
  }
  
  const isValid = pinManager.verifyPin(removeConfirmPin.value)
  
  if (!isValid) {
    removeError.value = 'PIN 码错误，无法移除'
    removeConfirmPin.value = ''
    return
  }
  
  pinManager.removePin()
  emit('success')
  emit('close')
}

const cancelRemove = () => {
  showRemoveConfirm.value = false
  removeConfirmPin.value = ''
  removeError.value = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: 14px;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.35);
}

.header-icon svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 2;
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

.close-btn {
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

.modal-body {
  padding: 0 24px 24px;
}

.info-notice {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.8), rgba(204, 251, 241, 0.5));
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 3px solid var(--primary-500);
}

.notice-icon {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.notice-icon svg {
  width: 16px;
  height: 16px;
  color: white;
  stroke-width: 2;
}

.info-notice p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-700);
  line-height: 1.5;
}

.pin-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.pin-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.pin-input {
  width: 100%;
  padding: 12px 44px 12px 14px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  letter-spacing: 4px;
}

.pin-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
}

.toggle-btn {
  position: absolute;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--gray-400);
  display: grid;
  place-items: center;
  transition: color var(--transition-normal);
}

.toggle-btn:hover {
  color: var(--gray-600);
}

.toggle-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.pin-strength {
  font-size: 0.75rem;
}

.pin-strength .weak {
  color: var(--error-600);
}

.pin-strength .medium {
  color: var(--warning-600);
}

.pin-strength .strong {
  color: var(--success-600);
}

.pin-strength .very-strong {
  color: var(--primary-600);
}

.error-hint {
  font-size: 0.75rem;
  color: var(--error-600);
}

.error-message {
  padding: 12px;
  background: var(--error-50);
  border-radius: 10px;
  color: var(--error-700);
  font-size: 0.875rem;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
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
  transform: none;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

.danger-zone {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
}

.remove-info {
  text-align: center;
}

.remove-info p {
  margin: 0 0 12px;
  font-size: 0.875rem;
  color: var(--gray-500);
}

.remove-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.remove-confirm label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--error-700);
}

.remove-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.btn-danger {
  flex: 1;
  background: var(--error-50);
  color: var(--error-700);
  border: 1px solid var(--error-200);
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-100);
  border-color: var(--error-300);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
