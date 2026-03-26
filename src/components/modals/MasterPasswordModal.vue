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
        <h3>{{ isSetup ? '设置主密码' : '输入主密码' }}</h3>
        <button @click="emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="description">
          <div class="desc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <p v-if="isSetup">
            主密码用于加密您的所有密码数据。请设置一个强密码并牢记，<strong>忘记主密码将无法恢复您的数据</strong>。
          </p>
          <p v-else>
            请输入您的主密码以解锁密码库。
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="password-form">
          <div class="form-group">
            <label for="masterPassword">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              主密码
            </label>
            <div class="password-input-group">
              <input
                id="masterPassword"
                v-model="masterPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="输入主密码"
                required
                :disabled="isLoading"
                @input="validatePassword"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :disabled="isLoading"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            
            <div v-if="isSetup && masterPassword" class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrength.level"
                  :style="{ width: passwordStrength.percentage + '%' }"
                ></div>
              </div>
              <span class="strength-text">{{ passwordStrength.text }}</span>
            </div>
          </div>

          <div v-if="isSetup" class="form-group">
            <label for="confirmPassword">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
              </svg>
              确认主密码
            </label>
            <div class="password-input-group">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次输入主密码"
                required
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
                :disabled="isLoading"
              >
                <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <div v-if="confirmPassword && masterPassword !== confirmPassword" class="error-message">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              两次输入的密码不一致
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="!isFormValid || isLoading" 
              class="submit-btn"
            >
              <div v-if="isLoading" class="loading-spinner"></div>
              {{ isLoading ? '处理中...' : (isSetup ? '设置主密码' : '解锁') }}
            </button>
          </div>
        </form>

        <div v-if="isSetup" class="security-tips">
          <div class="tips-header">
            <div class="tips-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h4>安全提示</h4>
          </div>
          <ul>
            <li>使用至少12位字符的强密码</li>
            <li>包含大小写字母、数字和特殊字符</li>
            <li>不要使用常见的密码或个人信息</li>
            <li>请将主密码保存在安全的地方</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { KeyManager } from '../../utils/encryption/crypto'

interface Props {
  isSetup?: boolean
}

interface Emits {
  (e: 'success'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  isSetup: false
})

const emit = defineEmits<Emits>()

const masterPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const passwordStrength = computed(() => {
  const password = masterPassword.value
  if (!password) {
    return { level: 'weak', percentage: 0, text: '请输入密码' }
  }
  
  let score = 0
  let feedback = []
  
  if (password.length >= 12) score += 2
  else if (password.length >= 8) score += 1
  else feedback.push('至少12位')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('小写字母')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('大写字母')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('数字')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('特殊字符')
  
  if (password.length >= 16) score += 1
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 1
  
  if (score <= 2) {
    return {
      level: 'weak',
      percentage: 25,
      text: `弱密码 (缺少: ${feedback.join('、')})`
    }
  } else if (score <= 4) {
    return {
      level: 'medium',
      percentage: 50,
      text: '中等强度'
    }
  } else if (score <= 6) {
    return {
      level: 'strong',
      percentage: 75,
      text: '强密码'
    }
  } else {
    return {
      level: 'very-strong',
      percentage: 100,
      text: '非常强的密码'
    }
  }
})

const isFormValid = computed(() => {
  if (props.isSetup) {
    return masterPassword.value.length >= 8 && 
           masterPassword.value === confirmPassword.value &&
           passwordStrength.value.level !== 'weak'
  } else {
    return masterPassword.value.length > 0
  }
})

const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const validatePassword = () => {
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    if (props.isSetup) {
      KeyManager.setMasterPassword(masterPassword.value)
      console.log('主密码设置成功')
    } else {
      const isValid = KeyManager.verifyMasterPassword(masterPassword.value)
      if (!isValid) {
        throw new Error('主密码错误，请重试')
      }
      console.log('主密码验证成功')
    }
    
    emit('success')
  } catch (error: any) {
    console.error('主密码操作失败:', error)
    errorMessage.value = error.message || '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-border);
  animation: gradientShift 3s ease infinite;
  background-size: 200% 100%;
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

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: 28px 32px;
  border-bottom: 1px solid var(--gray-200);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
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
  font-size: 1.375rem;
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0;
}

.close-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--gray-500);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--error-500);
  border-color: var(--error-500);
  color: white;
  transform: scale(1.05);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.modal-body {
  padding: 28px 32px 32px;
}

.description {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.8), rgba(204, 251, 241, 0.5));
  border-radius: var(--radius-xl);
  border-left: 4px solid var(--primary-500);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.desc-icon {
  width: 36px;
  height: 36px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.desc-icon svg {
  width: 18px;
  height: 18px;
  color: white;
  stroke-width: 2;
}

.description p {
  margin: 0;
  color: var(--gray-700);
  line-height: 1.6;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.description strong {
  color: var(--error-600);
  font-weight: var(--font-bold);
}

.password-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--gray-700);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.label-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-500);
  stroke-width: 2;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  width: 100%;
  padding: 14px 50px 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: white;
  color: var(--gray-800);
}

.password-input-group input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
}

.password-input-group input::placeholder {
  color: var(--gray-400);
  font-weight: var(--font-normal);
}

.password-input-group input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.password-toggle {
  position: absolute;
  right: 8px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  padding: 8px;
  transition: all var(--transition-normal);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
  color: var(--gray-500);
  stroke-width: 2;
}

.password-toggle:hover:not(:disabled) {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

.password-toggle:hover:not(:disabled) svg {
  color: white;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.password-strength {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
}

.strength-bar {
  flex: 1;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.4s ease, background-color 0.4s ease;
  border-radius: var(--radius-full);
  position: relative;
}

.strength-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.strength-fill.weak {
  background: var(--gradient-error);
}

.strength-fill.medium {
  background: var(--gradient-warning);
}

.strength-fill.strong {
  background: var(--gradient-success);
}

.strength-fill.very-strong {
  background: var(--gradient-primary);
}

.strength-text {
  font-size: var(--text-xs);
  color: var(--gray-600);
  white-space: nowrap;
  font-weight: var(--font-semibold);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--error-700);
  font-size: var(--text-sm);
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--error-50), var(--error-100));
  border-radius: var(--radius-xl);
  border: 1px solid var(--error-200);
  font-weight: var(--font-medium);
}

.error-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  flex-shrink: 0;
}

.form-actions {
  margin-top: 28px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.security-tips {
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(209, 250, 229, 0.5));
  border: 1px solid var(--success-200);
  border-radius: var(--radius-xl);
  padding: 20px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.tips-icon {
  width: 28px;
  height: 28px;
  background: var(--gradient-success);
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
}

.tips-icon svg {
  width: 14px;
  height: 14px;
  color: white;
  stroke-width: 2;
}

.security-tips h4 {
  margin: 0;
  color: var(--success-800);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
}

.security-tips ul {
  margin: 0;
  padding-left: 20px;
  color: var(--success-700);
}

.security-tips li {
  margin-bottom: 6px;
  font-size: var(--text-sm);
  line-height: 1.5;
  font-weight: var(--font-medium);
}

.security-tips li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-header h3 {
    font-size: 1.125rem;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .header-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .description {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
