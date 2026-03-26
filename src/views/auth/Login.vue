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
            <h2>欢迎回来</h2>
            <p>请登录您的账户继续使用</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="username" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                用户名/邮箱
              </label>
              <div class="input-wrapper">
                <input
                  id="username"
                  v-model="loginForm.username"
                  type="text"
                  required
                  :disabled="isLocked"
                  placeholder="请输入用户名或邮箱"
                  class="form-input"
                />
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
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="isLocked"
                  placeholder="请输入密码"
                  class="form-input"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :disabled="isLocked"
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
            </div>

            <div class="form-group">
              <label for="captcha" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                </svg>
                验证码
              </label>
              <div class="captcha-group">
                <input
                  id="captcha"
                  v-model="loginForm.captcha"
                  type="text"
                  required
                  :disabled="isLocked"
                  placeholder="请输入验证码"
                  class="form-input captcha-input"
                />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img :src="captchaUrl" alt="验证码" />
                  <div class="refresh-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="23 4 23 10 17 10"/>
                      <polyline points="1 20 1 14 7 14"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="failedAttempts > 0" class="warning-banner">
              <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div class="warning-content">
                <p>登录失败 {{ failedAttempts }} 次，还有 {{ maxAttempts - failedAttempts }} 次机会</p>
                <p v-if="failedAttempts >= maxAttempts - 1" class="danger">
                  再次失败将锁定账户 {{ lockoutDuration }} 分钟
                </p>
              </div>
            </div>

            <div v-if="isLocked" class="error-banner">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <div class="error-content">
                <h4>账户已锁定</h4>
                <p>请 {{ Math.ceil(lockoutTimeRemaining / 60) }} 分钟后重试，或通过邮箱重置密码</p>
              </div>
            </div>

            <div v-if="errorMessage" class="error-banner">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <div class="error-content">
                <h4>登录失败</h4>
                <p>{{ errorMessage }}</p>
              </div>
            </div>

            <button
              type="submit"
              class="login-button"
              :disabled="isLoading || isLocked"
            >
              <div v-if="isLoading" class="loading-spinner">
                <div class="spinner"></div>
              </div>
              <span v-if="!isLoading">登录</span>
              <span v-else>登录中...</span>
            </button>
          </form>

          <div class="auth-footer">
            <div class="auth-links">
              <button @click="showForgotPassword = true" class="link-button">
                忘记密码？
              </button>
              <router-link to="/register" class="link-button primary">
                注册账户
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="show2FA" class="modal-overlay" @click.self="cancel2FA">
      <div class="modal-card">
        <div class="modal-header">
          <h3>双因素认证</h3>
          <button @click="cancel2FA" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="verification-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            </svg>
          </div>
          <p>验证码已发送至您的邮箱：<strong>{{ maskedEmail }}</strong></p>
          <div class="verification-input">
            <input
              v-model="twoFactorCode"
              type="text"
              placeholder="请输入6位验证码"
              maxlength="6"
              @input="validateTwoFactorCode"
              class="code-input"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="verify2FA" :disabled="!isValidTwoFactorCode" class="auth-button primary">
            验证
          </button>
          <button @click="resend2FA" :disabled="resendCooldown > 0" class="auth-button secondary">
            {{ resendCooldown > 0 ? `重发(${resendCooldown}s)` : '重新发送' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showForgotPassword" class="modal-overlay" @click.self="showForgotPassword = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>重置密码</h3>
          <button @click="showForgotPassword = false" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="reset-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <p>请输入您的邮箱地址，我们将发送重置链接</p>
          <div class="form-group">
            <input
              v-model="resetEmail"
              type="email"
              placeholder="请输入邮箱地址"
              required
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="sendResetEmail" :disabled="!resetEmail" class="auth-button primary">
            发送重置链接
          </button>
          <button @click="showForgotPassword = false" class="auth-button secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { captchaAPI } from '../../services/api'
import { ROUTES } from '../../constants/constants'

interface LoginForm {
  username: string
  password: string
  captcha: string
}

export default defineComponent({
  name: 'Login',
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
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      } as LoginForm,
      showPassword: false,
      isLoading: false,
      errorMessage: '',
      captchaUrl: '',
      failedAttempts: 0,
      maxAttempts: 5,
      isLocked: false,
      lockoutDuration: 30,
      lockoutTimeRemaining: 0,
      show2FA: false,
      twoFactorCode: '',
      maskedEmail: '',
      originalEmail: '',
      sessionId: '',
      resendCooldown: 0,
      showForgotPassword: false,
      resetEmail: ''
    }
  },
  computed: {
    isValidTwoFactorCode(): boolean {
      return /^\d{6}$/.test(this.twoFactorCode)
    }
  },
  async mounted() {
    this.refreshCaptcha()
    this.checkLockoutStatus()
  },
  methods: {
    async handleLogin() {
      if (this.isLocked) return

      this.isLoading = true
      this.errorMessage = ''

      try {
        if (!this.validateForm()) {
          return
        }

        if (!this.sessionId) {
          await this.refreshCaptcha()
        }

        if (!this.sessionId) {
          this.errorMessage = '无法获取会话ID，请刷新页面重试'
          return
        }

        const result = await this.authStore.login({
          username: this.loginForm.username,
          password: this.loginForm.password,
          captcha: this.loginForm.captcha,
          sessionId: this.sessionId
        })

        if (result.success) {
          if ((result as any).twoFactorEnabled) {
            try {
              const send2FAResult = await this.authStore.send2FACode(result.data?.email)

              if (send2FAResult.success) {
                this.originalEmail = result.data?.email || ''
                this.maskedEmail = this.maskEmail(this.originalEmail)
                this.show2FA = true
              } else {
                this.errorMessage = '发送验证码失败，请重试'
              }
            } catch (error) {
              this.errorMessage = '发送验证码失败，请重试'
            }
          } else {
            try {
              await this.$nextTick()
              await this.router.push(ROUTES.HOME)
            } catch (error) {
              window.location.href = ROUTES.HOME
            }
          }
        }

      } catch (error) {
        this.handleLoginError(error)
      } finally {
        this.isLoading = false
      }
    },

    async verify2FA() {
      try {
        if (!this.isValidTwoFactorCode) {
          this.errorMessage = '请输入6位数字验证码'
          return
        }

        const result = await this.authStore.verify2FA(this.originalEmail, this.twoFactorCode)

        if (result.success) {
          this.show2FA = false
          this.twoFactorCode = ''
          this.errorMessage = ''

          try {
            await this.$nextTick()
            await this.router.push(ROUTES.HOME)
          } catch (error) {
            window.location.href = ROUTES.HOME
          }
        } else {
          this.errorMessage = '验证码错误，请重新输入'
        }
      } catch (error: any) {
        this.errorMessage = error.response?.data?.msg || '验证失败，请重试'
      }
    },

    validateForm() {
      if (!this.loginForm.username.trim()) {
        this.errorMessage = '请输入用户名或邮箱'
        return false
      }

      if (!this.loginForm.password) {
        this.errorMessage = '请输入密码'
        return false
      }

      if (!this.loginForm.captcha) {
        this.errorMessage = '请输入验证码'
        return false
      }

      return true
    },

    handleLoginError(error: any) {
      const errorData = error.response?.data

      if (errorData?.code === 'INVALID_CREDENTIALS') {
        this.failedAttempts = errorData.failedAttempts
        this.errorMessage = '用户名或密码错误'

        if (this.failedAttempts >= this.maxAttempts) {
          this.isLocked = true
          this.lockoutTimeRemaining = this.lockoutDuration * 60
          this.startLockoutTimer()
        }
      } else if (errorData?.code === 'ACCOUNT_LOCKED') {
        this.isLocked = true
        this.lockoutTimeRemaining = errorData.lockoutTimeRemaining
        this.startLockoutTimer()
        this.errorMessage = '账户已被锁定'
      } else if (errorData?.code === 'INVALID_CAPTCHA') {
        this.errorMessage = '验证码错误'
        this.refreshCaptcha()
      } else {
        this.errorMessage = '登录失败，请稍后重试'
      }
    },

    async refreshCaptcha() {
      try {
        const response = await captchaAPI.preloadCaptcha()

        const sessionId = response.headers['x-session-id'] ||
          response.headers['X-Session-Id']

        console.log('Response headers:', response.headers)

        if (sessionId) {
          this.sessionId = sessionId
          console.log('成功获取sessionId:', sessionId)
        } else {
          console.error('无法获取sessionId')
        }

        this.captchaUrl = captchaAPI.getCaptchaImage()
        this.loginForm.captcha = ''

      } catch (error) {
        console.error('刷新验证码失败:', error)
        this.errorMessage = '获取验证码失败，请重试'

        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        this.captchaUrl = captchaAPI.getCaptchaImage()
        this.loginForm.captcha = ''
      }
    },

    checkLockoutStatus() {
    },

    startLockoutTimer() {
      const timer = setInterval(() => {
        this.lockoutTimeRemaining--
        if (this.lockoutTimeRemaining <= 0) {
          this.isLocked = false
          this.failedAttempts = 0
          clearInterval(timer)
        }
      }, 1000)
    },

    validateTwoFactorCode() {
      this.twoFactorCode = this.twoFactorCode.replace(/\D/g, '')
    },

    async resend2FA() {
      try {
        if (this.resendCooldown > 0) {
          return
        }

        const result = await this.authStore.send2FACode(this.originalEmail)

        if (result.success) {
          this.resendCooldown = 60
          const timer = setInterval(() => {
            this.resendCooldown--
            if (this.resendCooldown <= 0) {
              clearInterval(timer)
            }
          }, 1000)

          this.errorMessage = ''
        } else {
          this.errorMessage = '发送失败，请稍后重试'
        }
      } catch (error: any) {
        console.error('重发验证码失败:', error)
        this.errorMessage = error.response?.data?.msg || '发送失败，请稍后重试'
      }
    },

    cancel2FA() {
      this.show2FA = false
      this.twoFactorCode = ''
      this.originalEmail = ''
      this.maskedEmail = ''
      this.errorMessage = ''
      this.resendCooldown = 0
    },

    async sendResetEmail() {
    },

    maskEmail(email: string): string {
      if (!email || !email.includes('@')) {
        return email
      }

      const [username, domain] = email.split('@')
      if (username.length <= 2) {
        return `${username[0]}***@${domain}`
      }

      const maskedUsername = `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
      return `${maskedUsername}@${domain}`
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

.form-input:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.6;
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

.captcha-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  position: relative;
  cursor: pointer;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.captcha-image:hover {
  border-color: var(--primary-500);
  transform: scale(1.02);
}

.captcha-image img {
  display: block;
  width: 120px;
  height: 48px;
  object-fit: cover;
}

.refresh-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 184, 166, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.captcha-image:hover .refresh-overlay {
  opacity: 1;
}

.refresh-overlay svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 2;
}

.warning-banner, .error-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: 12px;
  margin: var(--spacing-sm) 0;
}

.warning-banner {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid var(--warning-300);
}

.error-banner {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid var(--error-300);
}

.warning-icon, .error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  stroke-width: 2;
}

.warning-icon {
  color: var(--warning-600);
}

.error-icon {
  color: var(--error-600);
}

.warning-content, .error-content {
  flex: 1;
}

.warning-content p, .error-content p {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
  font-weight: 500;
}

.warning-content p {
  color: var(--warning-800);
}

.error-content p {
  color: var(--error-700);
}

.error-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--error-800);
}

.danger {
  color: var(--error-600) !important;
  font-weight: 700 !important;
}

.login-button {
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

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-button:hover:not(:disabled)::before {
  left: 100%;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.5);
  background: linear-gradient(135deg, #0d9488, #0f766e);
}

.login-button:disabled {
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
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
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
  z-index: 1000;
  padding: var(--spacing-lg);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
  position: relative;
}

.modal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #14b8a6, #f59e0b);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
}

.modal-close {
  background: var(--gray-100);
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-700);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.modal-body {
  padding: var(--spacing-2xl);
  text-align: center;
}

.verification-icon, .reset-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-xl);
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.3);
}

.verification-icon svg, .reset-icon svg {
  width: 30px;
  height: 30px;
  color: white;
  stroke-width: 2;
}

.modal-body p {
  margin-bottom: var(--spacing-xl);
  color: var(--gray-600);
  line-height: 1.6;
  font-size: var(--text-sm);
}

.verification-input {
  margin: var(--spacing-xl) 0;
}

.code-input {
  width: 100%;
  padding: var(--spacing-lg);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 20px;
  text-align: center;
  letter-spacing: 0.5em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-2xl) var(--spacing-2xl);
}

.auth-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: 10px;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.auth-button.primary {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
}

.auth-button.secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.auth-button.secondary:hover:not(:disabled) {
  background: var(--gray-200);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

@media (max-width: 640px) {
  .auth-content {
    padding: var(--spacing-md);
  }
  
  .auth-card {
    padding: var(--spacing-xl);
    border-radius: 20px;
  }
  
  .captcha-group {
    flex-direction: column;
  }
  
  .captcha-image {
    align-self: center;
  }
  
  .auth-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .modal-actions {
    flex-direction: column;
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
}
</style>
