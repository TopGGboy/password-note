<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>安全登录</h2>
        <p>请输入您的登录凭据</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名/邮箱 -->
        <div class="form-group">
          <label for="username">用户名/邮箱</label>
          <input id="username" v-model="loginForm.username" type="text" placeholder="请输入用户名或邮箱" :disabled="isLocked"
            required />
        </div>

        <!-- 密码 -->
        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input">
            <input id="password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码" :disabled="isLocked" required />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" :disabled="isLocked">
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
          <div class="password-strength">
            <small>密码要求：至少8位，包含大小写字母、数字和特殊字符</small>
          </div>
        </div>

        <!-- 图形验证码 -->
        <div class="form-group">
          <label for="captcha">验证码</label>
          <div class="captcha-container">
            <input id="captcha" v-model="loginForm.captcha" type="text" placeholder="请输入验证码" :disabled="isLocked"
              required />
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" />
              <span class="refresh-hint">点击刷新</span>
            </div>
          </div>
        </div>

        <!-- 登录失败提示 -->
        <div v-if="failedAttempts > 0" class="warning-message">
          <p>登录失败 {{ failedAttempts }} 次，还有 {{ maxAttempts - failedAttempts }} 次机会</p>
          <p v-if="failedAttempts >= maxAttempts - 1" class="danger">
            再次失败将锁定账户 {{ lockoutDuration }} 分钟
          </p>
        </div>

        <!-- 账户锁定提示 -->
        <div v-if="isLocked" class="error-message">
          <p>账户已被锁定，请 {{ Math.ceil(lockoutTimeRemaining / 60) }} 分钟后重试</p>
          <p>或通过邮箱重置密码</p>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <button type="submit" class="login-button" :disabled="isLoading || isLocked">
          <span v-if="isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>

        <!-- 其他选项 -->
        <div class="login-options">
          <a href="#" @click.prevent="showForgotPassword = true">忘记密码？</a>
          <a href="#" @click.prevent="$router.push('/register')">注册账户</a>
        </div>
      </form>
    </div>

    <!-- 双因素认证弹窗 -->
    <div v-if="show2FA" class="modal-overlay">
      <div class="modal-content">
        <h3>双因素认证</h3>
        <p>验证码已发送至您的邮箱：{{ maskedEmail }}</p>
        <div class="form-group">
          <input v-model="twoFactorCode" type="text" placeholder="请输入6位验证码" maxlength="6"
            @input="validateTwoFactorCode" />
        </div>
        <div class="modal-actions">
          <button @click="verify2FA" :disabled="!isValidTwoFactorCode">验证</button>
          <button @click="resend2FA" :disabled="resendCooldown > 0">
            {{ resendCooldown > 0 ? `重发(${resendCooldown}s)` : '重新发送' }}
          </button>
          <button @click="cancel2FA">取消</button>
        </div>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <div v-if="showForgotPassword" class="modal-overlay">
      <div class="modal-content">
        <h3>重置密码</h3>
        <p>请输入您的邮箱地址，我们将发送重置链接</p>
        <div class="form-group">
          <input v-model="resetEmail" type="email" placeholder="请输入邮箱地址" required />
        </div>
        <div class="modal-actions">
          <button @click="sendResetEmail" :disabled="!resetEmail">发送重置链接</button>
          <button @click="showForgotPassword = false">取消</button>
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

        console.log('登录结果：', result)

        if (result.success) {
          console.log('登录成功，接下来检验是否需要双因素认证')
          console.log('登录结果：', result.twoFactorEnabled)

          if ((result as any).twoFactorEnabled) {
            // 需要双因素认证，发送验证码
            console.log('需要双因素认证，发送验证码到邮箱')

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
              console.error('发送2FA验证码失败:', error)
              this.errorMessage = '发送验证码失败，请重试'
            }
          } else {
            // 登录成功，跳转到home
            console.log('登录成功，准备跳转到home')
            try {
              // 确保状态已经更新
              await this.$nextTick()
              await this.router.push(ROUTES.HOME)
              console.log('跳转成功')
            } catch (error) {
              console.error('跳转失败:', error)
              // 使用window.location作为备选方案
              window.location.href = ROUTES.HOME
            }
          }
        } else {
          console.log('登录失败，result.success为false')
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
            console.error('跳转失败:', error)
             // 使用window.location作为备选方案
            window.location.href = ROUTES.HOME
          }
        } else {
          this.errorMessage = '验证码错误，请重新输入'
        }
      } catch (error: any) {
        console.error('2FA验证失败:', error)
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.password-strength {
  margin-top: 5px;
}

.password-strength small {
  color: #666;
  font-size: 12px;
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-container input {
  flex: 1;
}

.captcha-image {
  position: relative;
  cursor: pointer;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.captcha-image img {
  display: block;
  width: 120px;
  height: 40px;
}

.refresh-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.3s;
}

.captcha-image:hover .refresh-hint {
  opacity: 1;
}

.warning-message {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.warning-message p {
  margin: 0;
  color: #856404;
  font-size: 14px;
}

.warning-message .danger {
  color: #dc3545;
  font-weight: 600;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #721c24;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.login-options a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.login-options a:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #333;
}

.modal-content p {
  margin-bottom: 20px;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.modal-actions button:first-child {
  background: #667eea;
  color: white;
}

.modal-actions button:not(:first-child) {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>