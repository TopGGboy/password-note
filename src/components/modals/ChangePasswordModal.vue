<template>
  <div class="modal-wrapper">
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
          <h3>修改密码</h3>
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
            <p>选择验证方式并设置新密码，定期更新密码可增强账户安全</p>
          </div>

          <form autocomplete="off" @submit.prevent>
          <input type="text" name="fake_username" style="display:none" tabindex="-1" />
          <input type="password" name="fake_password" style="display:none" tabindex="-1" />

          <div class="verify-type-selector">
            <div
              class="verify-type-option"
              :class="{ active: verifyType === 'PASSWORD' }"
              @click="verifyType = 'PASSWORD'"
            >
              <span class="verify-type-icon">🔑</span>
              <span class="verify-type-label">密码验证</span>
            </div>
            <div
              class="verify-type-option"
              :class="{ active: verifyType === 'EMAIL' }"
              @click="verifyType = 'EMAIL'"
            >
              <span class="verify-type-icon">📧</span>
              <span class="verify-type-label">邮箱验证</span>
            </div>
          </div>

          <div v-if="verifyType === 'PASSWORD'" class="form-section">
            <div class="form-group">
              <label>当前密码</label>
              <input
                v-model="form.oldPassword"
                type="password"
                autocomplete="off"
                required
                class="form-input"
                :class="{ error: errors.oldPassword }"
                placeholder="请输入当前密码"
              />
              <span v-if="errors.oldPassword" class="error-hint">
                {{ errors.oldPassword }}
              </span>
            </div>
          </div>

          <div v-if="verifyType === 'EMAIL'" class="form-section">
            <div class="form-group">
              <label>邮箱地址</label>
              <div class="email-input-group">
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input"
                  :class="{ error: errors.email }"
                  placeholder="请输入注册邮箱"
                />
                <button
                  type="button"
                  class="send-code-btn"
                  :disabled="!canSendCode || sendingCode"
                  @click="sendEmailCode"
                >
                  {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s后重发` : '发送验证码') }}
                </button>
              </div>
              <span v-if="errors.email" class="error-hint">
                {{ errors.email }}
              </span>
            </div>

            <div class="form-group">
              <label>邮箱验证码</label>
              <input
                v-model="form.emailCode"
                type="text"
                required
                class="form-input"
                :class="{ error: errors.emailCode }"
                placeholder="请输入6位验证码"
                maxlength="6"
              />
              <span v-if="errors.emailCode" class="error-hint">
                {{ errors.emailCode }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>新密码</label>
            <input
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              required
              class="form-input"
              :class="{ error: errors.newPassword }"
              @input="validatePassword"
              placeholder="请输入新密码（至少8位）"
            />
            <span v-if="errors.newPassword" class="error-hint">
              {{ errors.newPassword }}
            </span>

            <div v-if="form.newPassword" class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  :class="passwordStrength.level"
                  :style="{ width: passwordStrength.percentage + '%' }"
                ></div>
              </div>
              <span class="strength-text">密码强度：{{ passwordStrength.text }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>确认新密码</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="form-input"
              :class="{ error: errors.confirmPassword }"
              @input="validateConfirmPassword"
              placeholder="请再次输入新密码"
            />
            <span v-if="errors.confirmPassword" class="error-hint">
              {{ errors.confirmPassword }}
            </span>
          </div>

          <div v-if="errorMessage" class="error-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-secondary">
              取消
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!isFormValid || loading"
              @click="handleSubmit"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? '修改中...' : '确认修改' }}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <Notification
    v-model:modelValue="showSuccessNotification"
    title="密码修改成功"
    message="您的密码已成功修改"
    type="success"
    :duration="3000"
  />

  <Notification
    v-model:modelValue="showErrorNotification"
    :title="errorNotificationTitle"
    :message="errorNotificationMessage"
    type="error"
    :duration="4000"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { emailAPI } from '../../services/api/email'
import { userAPI } from '../../services/api/user'
import Notification from '../common/Notification.vue'
import type { ChangePasswordRequest } from '../../types/api'

const verifyType = ref<'PASSWORD' | 'EMAIL'>('PASSWORD')
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  email: '',
  emailCode: ''
})
const errors = ref<Record<string, string>>({})
const errorMessage = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const showSuccessNotification = ref(false)
const showErrorNotification = ref(false)
const errorNotificationTitle = ref('')
const errorNotificationMessage = ref('')

let countdownTimer: ReturnType<typeof setInterval> | null = null

const isFormValid = computed(() => {
  const baseValid = !!(
    form.value.newPassword &&
    form.value.confirmPassword &&
    form.value.newPassword === form.value.confirmPassword &&
    Object.keys(errors.value).length === 0
  )

  if (verifyType.value === 'PASSWORD') {
    return baseValid && !!form.value.oldPassword
  } else {
    return baseValid && !!form.value.email && !!form.value.emailCode
  }
})

const canSendCode = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(form.value.email) && countdown.value === 0
})

const passwordStrength = computed(() => {
  const password = form.value.newPassword
  if (!password) return { level: '', percentage: 0, text: '' }

  let score = 0
  if (password.length >= 8) score += 25
  if (/\d/.test(password)) score += 25
  if (/[a-z]/.test(password)) score += 25
  if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25

  let level = 'weak'
  let text = '弱'
  if (score >= 75) {
    level = 'strong'
    text = '强'
  } else if (score >= 50) {
    level = 'medium'
    text = '中等'
  }

  return { level, percentage: score, text }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

function handleOverlayClick() {
  emit('close')
}

function showNotification(title: string, message: string, type: 'success' | 'error' = 'success') {
  if (type === 'success') {
    showSuccessNotification.value = true
  } else {
    errorNotificationTitle.value = title
    errorNotificationMessage.value = message
    showErrorNotification.value = true
  }
}

function validatePassword() {
  if (form.value.newPassword.length < 8) {
    errors.value.newPassword = '密码长度至少8位'
  } else {
    delete errors.value.newPassword
  }
  validateConfirmPassword()
}

function validateConfirmPassword() {
  if (form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = '两次输入的密码不一致'
  } else {
    delete errors.value.confirmPassword
  }
}

async function sendEmailCode() {
  if (!canSendCode.value || sendingCode.value) return

  sendingCode.value = true
  errorMessage.value = ''
  delete errors.value.email

  try {
    const response: any = await emailAPI.send2FACode({ email: form.value.email })
    console.log('发送验证码响应:', response)

    if (response.code === 1) {
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0 && countdownTimer) {
          clearInterval(countdownTimer)
        }
      }, 1000)
      showNotification('验证码已发送', '验证码已发送到您的邮箱', 'success')
    } else {
      const errorMsg = response.msg || '发送验证码失败'
      showNotification('发送验证码失败', errorMsg, 'error')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    const errorMsg = error.response?.data?.msg || '发送验证码失败，请重试'
    showNotification('发送验证码失败', errorMsg, 'error')
  } finally {
    sendingCode.value = false
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const requestData: ChangePasswordRequest = {
      newPassword: form.value.newPassword,
      verifyType: verifyType.value
    }

    if (verifyType.value === 'PASSWORD') {
      requestData.oldPassword = form.value.oldPassword
    } else {
      requestData.emailCode = form.value.emailCode
    }

    console.log('修改密码请求:', requestData)
    const response: any = await userAPI.changePassword(requestData)
    console.log('修改密码响应:', response)

    if (response.code === 1) {
      showNotification('密码修改成功', '您的密码已成功修改', 'success')
      emit('success')
      setTimeout(() => {
        emit('close')
      }, 1500)
    } else {
      const errorMsg = response.msg || '修改密码失败'
      console.log('业务错误:', errorMsg)
      showNotification('修改密码失败', errorMsg, 'error')
    }
  } catch (error: any) {
    console.error('修改密码失败:', error)
    const errorMsg = error.response?.data?.msg || error.message || '修改密码失败，请重试'
    showNotification('修改密码失败', errorMsg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: var(--radius-2xl);
  width: 90%;
  max-width: 480px;
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
  background: var(--gradient-primary);
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

.verify-type-selector {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--gray-100);
  border-radius: 12px;
  margin-bottom: 20px;
}

.verify-type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  background: transparent;
}

.verify-type-option:hover {
  background: var(--gray-200);
}

.verify-type-option.active {
  background: white;
  border-color: var(--primary-500);
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.15);
}

.verify-type-icon {
  font-size: 18px;
}

.verify-type-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-600);
}

.verify-type-option.active .verify-type-label {
  color: var(--primary-600);
}

.form-section {
  animation: fadeIn 0.3s ease;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: 0.9375rem;
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: white;
  color: var(--gray-800);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: var(--gray-800) !important;
  caret-color: var(--gray-800);
}

.form-input.error {
  border-color: var(--error-500);
}

.form-input::placeholder {
  color: var(--gray-400);
}

.error-hint {
  color: var(--error-600);
  font-size: 0.75rem;
  margin-top: 6px;
  display: block;
}

.email-input-group {
  display: flex;
  gap: 8px;
}

.email-input-group .form-input {
  flex: 1;
}

.send-code-btn {
  padding: 12px 16px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.send-code-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
}

.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 2px;
}

.strength-fill.weak {
  background: var(--error-500);
}

.strength-fill.medium {
  background: var(--warning-500);
}

.strength-fill.strong {
  background: var(--success-500);
}

.strength-text {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.error-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 241, 242, 0.9), rgba(255, 228, 230, 0.9));
  border-radius: var(--radius-xl);
  margin-bottom: 16px;
  border-left: 3px solid var(--error-500);
}

.error-notice svg {
  width: 18px;
  height: 18px;
  color: var(--error-500);
  stroke-width: 2;
  flex-shrink: 0;
}

.error-notice span {
  font-size: 0.875rem;
  color: var(--error-600);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: var(--radius-xl);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
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
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 2px solid var(--gray-200);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<style>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100000;
  max-width: 380px;
  width: calc(100% - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  animation: slideInRight 0.3s ease-out;
}

.notification-toast.success {
  border-left: 4px solid #10b981;
}

.notification-toast.error {
  border-left: 4px solid #ef4444;
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-toast.success .notification-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.notification-toast.error .notification-icon {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
}

.notification-icon svg {
  width: 20px;
  height: 20px;
  color: white;
  stroke-width: 2;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #f7fafc;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  transition: all 0.2s;
}

.notification-close:hover {
  background: #edf2f7;
  color: #2d3748;
}

.notification-close svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-toast {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
}
</style>
