<template>
  <div class="auth-container">
    <div class="auth-background">
      <div class="gradient-mesh"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
      <div class="grid-pattern"></div>
    </div>
    
    <div class="auth-content">
      <div class="auth-card">
        <div class="brand-section">
          <div class="brand-logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
          <h1 class="brand-title">密码管家</h1>
          <p class="brand-subtitle">安全 · 简单 · 可靠的密码管理解决方案</p>
        </div>

        <div class="form-section">
          <div class="form-header">
            <h2>创建账户</h2>
            <p>注册一个新账户开始使用</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="username" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                用户名
              </label>
              <div class="input-wrapper">
                <input
                  id="username"
                  v-model="registerForm.username"
                  type="text"
                  required
                  placeholder="请输入用户名"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                邮箱
              </label>
              <div class="input-wrapper">
                <input
                  id="email"
                  v-model="registerForm.email"
                  type="email"
                  required
                  placeholder="请输入邮箱地址"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="emailCode" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                </svg>
                邮箱验证码
              </label>
              <div class="code-input-group">
                <input
                  id="emailCode"
                  v-model="registerForm.emailCode"
                  type="text"
                  required
                  placeholder="请输入验证码"
                  class="form-input code-input"
                  maxlength="6"
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
            </div>

            <div class="form-group">
              <label for="password" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                密码
              </label>
              <div class="input-wrapper">
                <input
                  id="password"
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="请输入密码"
                  class="form-input"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
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
              
              <div v-if="registerForm.password" class="password-strength">
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

            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                </svg>
                确认密码
              </label>
              <div class="input-wrapper">
                <input
                  id="confirmPassword"
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  placeholder="请再次输入密码"
                  class="form-input"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
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
              <div v-if="registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword" class="error-hint">
                两次输入的密码不一致
              </div>
            </div>

            <div v-if="errorMessage" class="error-banner">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <div class="error-content">
                <h4>注册失败</h4>
                <p>{{ errorMessage }}</p>
              </div>
            </div>

            <button
              type="submit"
              class="register-button"
              :disabled="isLoading"
            >
              <div v-if="isLoading" class="loading-spinner">
                <div class="spinner"></div>
              </div>
              <span v-if="!isLoading">注册</span>
              <span v-else>注册中...</span>
            </button>
          </form>

          <div class="auth-footer">
            <div class="auth-links">
              <span class="muted">已有账户？</span>
              <router-link to="/login" class="link-button primary">
                立即登录
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { ROUTES } from '../../constants/constants'
import { emailAPI } from '../../services/api'

interface RegisterForm {
  username: string
  email: string
  emailCode: string
  password: string
  confirmPassword: string
}

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  percentage: number
  text: string
}

export default defineComponent({
  name: 'Register',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    return {
      authStore,
      router
    }
  },
  data() {
    return {
      registerForm: {
        username: '',
        email: '',
        emailCode: '',
        password: '',
        confirmPassword: ''
      } as RegisterForm,
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      errorMessage: '',
      sendingCode: false,
      countdown: 0
    }
  },
  computed: {
    passwordStrength(): PasswordStrength {
      const password = this.registerForm.password
      if (!password) {
        return { level: 'weak', percentage: 0, text: '请输入密码' }
      }

      let score = 0
      let feedback = []

      if (password.length >= 8) score += 1
      else feedback.push('至少8位')

      if (password.length >= 12) score += 1

      if (/[a-z]/.test(password)) score += 1
      else feedback.push('小写字母')

      if (/[A-Z]/.test(password)) score += 1
      else feedback.push('大写字母')

      if (/\d/.test(password)) score += 1
      else feedback.push('数字')

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      else feedback.push('特殊字符')

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
      } else if (score <= 5) {
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
    },
    canSendCode(): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(this.registerForm.email) && this.countdown === 0
    }
  },
  methods: {
    async sendEmailCode() {
      if (!this.canSendCode || this.sendingCode) return

      this.sendingCode = true
      this.errorMessage = ''

      try {
        const response = await emailAPI.send2FACode({ email: this.registerForm.email })
        
        if (response.code === 1) {
          this.countdown = 60
          const timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          this.errorMessage = response.msg || '发送验证码失败'
        }
      } catch (error: any) {
        console.error('发送验证码失败:', error)
        this.errorMessage = error.response?.data?.msg || '发送验证码失败，请重试'
      } finally {
        this.sendingCode = false
      }
    },

    async handleRegister() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        if (!this.validateForm()) {
          return
        }

        const result = await this.authStore.register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password,
          emailCode: this.registerForm.emailCode
        })

        if (result.success) {
          this.router.push(ROUTES.LOGIN)
        }

      } catch (error: any) {
        this.handleRegisterError(error)
      } finally {
        this.isLoading = false
      }
    },

    validateForm(): boolean {
      if (!this.registerForm.username.trim()) {
        this.errorMessage = '请输入用户名'
        return false
      }

      if (!this.registerForm.email.trim()) {
        this.errorMessage = '请输入邮箱地址'
        return false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.registerForm.email)) {
        this.errorMessage = '请输入有效的邮箱地址'
        return false
      }

      if (!this.registerForm.emailCode.trim()) {
        this.errorMessage = '请输入邮箱验证码'
        return false
      }

      if (!this.registerForm.password) {
        this.errorMessage = '请输入密码'
        return false
      }

      if (this.registerForm.password.length < 8) {
        this.errorMessage = '密码长度至少为8位'
        return false
      }

      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errorMessage = '两次输入的密码不一致'
        return false
      }

      return true
    },

    handleRegisterError(error: any) {
      const errorData = error.response?.data

      if (errorData?.code === 'USERNAME_EXISTS') {
        this.errorMessage = '用户名已被使用'
      } else if (errorData?.code === 'EMAIL_EXISTS') {
        this.errorMessage = '邮箱已被注册'
      } else if (errorData?.code === 'INVALID_EMAIL') {
        this.errorMessage = '邮箱格式不正确'
      } else if (errorData?.code === 'WEAK_PASSWORD') {
        this.errorMessage = '密码强度不足'
      } else if (errorData?.code === 'INVALID_EMAIL_CODE') {
        this.errorMessage = '验证码错误或已过期'
      } else {
        this.errorMessage = errorData?.msg || '注册失败，请稍后重试'
      }
    }
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f766e 0%, #134e4a 50%, #115e59 100%);
  z-index: 1;
}

.gradient-mesh {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(244, 63, 94, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 70%, rgba(16, 185, 129, 0.12) 0%, transparent 50%);
  animation: meshMove 20s ease-in-out infinite;
}

@keyframes meshMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-2%, 2%) scale(1.02); }
  50% { transform: translate(1%, -1%) scale(0.98); }
  75% { transform: translate(-1%, -2%) scale(1.01); }
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: floatShape 15s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  top: 20%;
  right: -50px;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #f43f5e, #fb7185);
  bottom: 30%;
  left: 10%;
  animation-delay: 4s;
}

.shape-4 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #10b981, #34d399);
  bottom: -100px;
  right: 20%;
  animation-delay: 1s;
}

.shape-5 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #14b8a6, #2dd4bf);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 3s;
}

.shape-6 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  top: 10%;
  left: 60%;
  animation-delay: 5s;
}

@keyframes floatShape {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(30px, -30px) rotate(90deg);
  }
  50% {
    transform: translate(-20px, 20px) rotate(180deg);
  }
  75% {
    transform: translate(10px, 40px) rotate(270deg);
  }
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridPulse 10s ease-in-out infinite;
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.auth-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  padding: var(--spacing-lg);
}

.auth-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 48px 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 440px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #14b8a6, #f59e0b, #0ea5e9);
  animation: gradientShift 3s ease infinite;
  background-size: 200% 100%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.brand-section {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.brand-logo {
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 30px rgba(20, 184, 166, 0.3),
    inset 0 -2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.logo-icon svg {
  width: 40px;
  height: 40px;
  color: white;
  stroke-width: 2;
  position: relative;
  z-index: 1;
}

.brand-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: var(--gray-500);
  font-size: var(--text-sm);
  font-weight: 500;
}

.form-section {
  margin-top: var(--spacing-2xl);
}

.form-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.form-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.form-header p {
  color: var(--gray-500);
  font-size: var(--text-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: var(--gray-700);
  font-size: var(--text-sm);
}

.label-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-500);
  stroke-width: 2;
}

.input-wrapper {
  position: relative;
}

.code-input-group {
  display: flex;
  gap: var(--spacing-sm);
}

.code-input {
  flex: 1;
}

.send-code-btn {
  padding: 14px 16px;
  background: var(--gradient-secondary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
}

.send-code-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--gray-400);
  font-weight: 400;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--gray-100);
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: var(--primary-600);
  background: var(--primary-50);
}

.password-toggle svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
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

.error-hint {
  color: var(--error-600);
  font-size: var(--text-sm);
  margin-top: var(--spacing-xs);
  font-weight: 500;
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: 12px;
  margin: var(--spacing-sm) 0;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid var(--error-300);
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  stroke-width: 2;
  color: var(--error-600);
}

.error-content {
  flex: 1;
}

.error-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--error-800);
}

.error-content p {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
  font-weight: 500;
  color: var(--error-700);
}

.register-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 54px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.register-button:hover:not(:disabled)::before {
  left: 100%;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.5);
  background: linear-gradient(135deg, #0d9488, #0f766e);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: var(--spacing-2xl);
  text-align: center;
}

.auth-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.muted {
  color: var(--gray-500);
  font-size: var(--text-sm);
  font-weight: 500;
}

.link-button {
  background: none;
  border: none;
  color: var(--gray-600);
  font-size: var(--text-sm);
  cursor: pointer;
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.link-button:hover {
  background: var(--gray-100);
  color: var(--primary-600);
}

.link-button.primary {
  color: var(--primary-600);
  font-weight: 600;
}

.link-button.primary:hover {
  background: var(--primary-50);
  color: var(--primary-700);
}

@media (max-width: 640px) {
  .auth-content {
    padding: var(--spacing-md);
  }
  
  .auth-card {
    padding: var(--spacing-xl);
    border-radius: 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .logo-icon {
    width: 64px;
    height: 64px;
  }
  
  .logo-icon svg {
    width: 32px;
    height: 32px;
  }

  .auth-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
