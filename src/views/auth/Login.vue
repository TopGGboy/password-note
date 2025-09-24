<template>
  <div class="auth-container">
    <div class="auth-background">
      <div class="background-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element" v-for="i in 6" :key="i"></div>
      </div>
    </div>
    
    <div class="auth-content">
      <div class="auth-card">
        <!-- Logo 和品牌 -->
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
          <p class="brand-subtitle">安全、简单、可靠的密码管理解决方案</p>
        </div>

        <!-- 登录表单 -->
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

            <!-- 验证码 -->
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

            <!-- 登录失败提示 -->
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

            <!-- 账户锁定提示 -->
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

            <!-- 错误信息 -->
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

    <!-- 双因素认证弹窗 -->
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

    <!-- 忘记密码弹窗 -->
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

      // 验证码相关
      captchaUrl: '',

      // 登录失败控制
      failedAttempts: 0,
      maxAttempts: 5,
      isLocked: false,
      lockoutDuration: 30, // 分钟
      lockoutTimeRemaining: 0,

      // 双因素认证
      show2FA: false,
      twoFactorCode: '',
      maskedEmail: '',
      originalEmail: '', // 存储原始邮箱用于API调用
      sessionId: '',
      resendCooldown: 0,

      // 忘记密码
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
    // 初始化验证码
    this.refreshCaptcha()
    // 检查锁定状态
    this.checkLockoutStatus()
  },
  methods: {
    // 处理登录
    async handleLogin() {
      if (this.isLocked) return

      this.isLoading = true
      this.errorMessage = ''

      try {
        // 前端基本验证
        if (!this.validateForm()) {
          return
        }

        // 确保有sessionId
        if (!this.sessionId) {
          await this.refreshCaptcha()
        }

        if (!this.sessionId) {
          this.errorMessage = '无法获取会话ID，请刷新页面重试'
          return
        }

        // 调用认证store登录
        const result = await this.authStore.login({
          username: this.loginForm.username,
          password: this.loginForm.password,
          captcha: this.loginForm.captcha,
          sessionId: this.sessionId
        })

        if (result.success) {
          if ((result as any).twoFactorEnabled) {
            // 需要双因素认证，发送验证码

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
            // 登录成功，跳转到home
            try {
              // 确保状态已经更新
              await this.$nextTick()
              await this.router.push(ROUTES.HOME)
            } catch (error) {
              // 使用window.location作为备选方案
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

        // 使用认证store验证2FA
        const result = await this.authStore.verify2FA(this.originalEmail, this.twoFactorCode)

        if (result.success) {
          this.show2FA = false
          this.twoFactorCode = ''
          this.errorMessage = ''

          // 跳转到home
          try {
             // 确保状态已更新
            await this.$nextTick()
            await this.router.push(ROUTES.HOME)
          } catch (error) {
             // 使用window.location作为备选方案
            window.location.href = ROUTES.HOME
          }
        } else {
          this.errorMessage = '验证码错误，请重新输入'
        }
      } catch (error: any) {
        this.errorMessage = error.response?.data?.msg || '验证失败，请重试'
      }
    },

    // 表单验证
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

    // 处理登录错误
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

    // 刷新验证码
    async refreshCaptcha() {
      try {
        // 调用API建立session并获取sessionId
        const response = await captchaAPI.preloadCaptcha()

        // 从响应头获取sessionId，尝试多种可能的header名称
        const sessionId = response.headers['x-session-id'] ||
          response.headers['X-Session-Id']

        console.log('Response headers:', response.headers)

        if (sessionId) {
          this.sessionId = sessionId
          console.log('成功获取sessionId:', sessionId)
        } else {
          console.error('无法获取sessionId')
        }

        // 设置验证码图片URL
        this.captchaUrl = captchaAPI.getCaptchaImage()
        this.loginForm.captcha = ''

      } catch (error) {
        console.error('刷新验证码失败:', error)
        this.errorMessage = '获取验证码失败，请重试'

        // 即使失败也生成一个sessionId和设置图片URL
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        this.captchaUrl = captchaAPI.getCaptchaImage()
        this.loginForm.captcha = ''
      }
    },

    // 检查锁定状态
    checkLockoutStatus() {
      // 后端需要：检查当前用户是否被锁定
      // 这里可以从localStorage或调用API获取锁定状态
    },

    // 开始锁定倒计时
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

    // 双因素认证相关方法
    validateTwoFactorCode() {
      // 限制只能输入数字
      this.twoFactorCode = this.twoFactorCode.replace(/\D/g, '')
    },

    async resend2FA() {
      try {
        if (this.resendCooldown > 0) {
          return
        }

        // 重新发送邮箱验证码
        const result = await this.authStore.send2FACode(this.originalEmail)

        if (result.success) {
          // 开始倒计时
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

    // 发送重置邮件
    async sendResetEmail() {
      // try {
      //   // 使用认证store发送重置邮件
      //   await this.authStore.forgotPassword(this.resetEmail)

      //   alert('重置链接已发送到您的邮箱，请查收')
      //   this.showForgotPassword = false
      //   this.resetEmail = ''

      // } catch (error) {
      //   this.errorMessage = '发送失败，请检查邮箱地址'
      // }
    },

    // 邮箱脱敏处理
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
/* 使用全局主题变量 */
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
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  z-index: 1;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  background-size: 100px 100px;
  animation: float 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-element {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.floating-element:nth-child(2) { top: 20%; right: 10%; animation-delay: 1s; }
.floating-element:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 2s; }
.floating-element:nth-child(4) { bottom: 20%; right: 20%; animation-delay: 3s; }
.floating-element:nth-child(5) { top: 50%; left: 5%; animation-delay: 4s; }
.floating-element:nth-child(6) { top: 60%; right: 5%; animation-delay: 5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
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
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 420px;
  width: 100%;
}

.brand-section {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.brand-logo {
  margin-bottom: var(--spacing-lg);
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
}

.logo-icon svg {
  width: 40px;
  height: 40px;
  color: white;
  stroke-width: 2;
}

.brand-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.brand-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.form-section {
  margin-top: var(--spacing-xl);
}

.form-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.form-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.form-header p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.label-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  stroke-width: 2;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.password-toggle {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: var(--primary-color);
  background: var(--bg-secondary);
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
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.captcha-image:hover {
  border-color: var(--primary-color);
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
  background: rgba(0, 0, 0, 0.7);
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
  width: 20px;
  height: 20px;
  color: white;
  stroke-width: 2;
}

.warning-banner, .error-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-md) 0;
}

.warning-banner {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
}

.error-banner {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
}

.warning-icon, .error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  stroke-width: 2;
}

.warning-icon {
  color: var(--warning-color);
}

.error-icon {
  color: var(--error-color);
}

.warning-content, .error-content {
  flex: 1;
}

.warning-content p, .error-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.warning-content p {
  color: var(--warning-text);
}

.error-content p {
  color: var(--error-text);
}

.error-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--error-color);
}

.danger {
  color: var(--error-color) !important;
  font-weight: var(--font-weight-semibold) !important;
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 52px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
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

.auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.auth-button.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: var(--shadow-md);
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.auth-button.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.auth-button.secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.auth-footer {
  margin-top: var(--spacing-xl);
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
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-decoration: none;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.link-button:hover {
  background: var(--bg-secondary);
  text-decoration: underline;
}

.link-button.primary {
  font-weight: var(--font-weight-medium);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-card {
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.modal-body {
  padding: var(--spacing-xl);
  text-align: center;
}

.verification-icon, .reset-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-icon svg, .reset-icon svg {
  width: 30px;
  height: 30px;
  color: white;
  stroke-width: 2;
}

.modal-body p {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.5;
}

.verification-input {
  margin: var(--spacing-xl) 0;
}

.code-input {
  width: 100%;
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-xl);
  text-align: center;
  letter-spacing: 0.5em;
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
}

.modal-actions .auth-button {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .auth-content {
    padding: var(--spacing-md);
  }
  
  .auth-card {
    padding: var(--spacing-xl);
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
}
</style>