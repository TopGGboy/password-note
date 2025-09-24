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
          <p class="brand-subtitle">开始您的安全密码管理之旅</p>
        </div>

        <!-- 注册表单 -->
        <div class="form-section">
          <div class="form-header">
            <h2>创建账户</h2>
            <p>注册新账户，开始安全管理您的密码</p>
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
                  :disabled="loading"
                  placeholder="请输入用户名"
                  class="form-input"
                  :class="{ 'input-error': fieldErrors.username }"
                  @blur="validateUsername"
                />
                <div v-if="fieldErrors.username" class="field-error">
                  {{ fieldErrors.username }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                邮箱地址
              </label>
              <div class="input-wrapper">
                <input
                  id="email"
                  v-model="registerForm.email"
                  type="email"
                  required
                  :disabled="loading"
                  placeholder="请输入邮箱地址"
                  class="form-input"
                  :class="{ 'input-error': fieldErrors.email }"
                  @blur="validateEmail"
                />
                <div v-if="fieldErrors.email" class="field-error">
                  {{ fieldErrors.email }}
                </div>
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
                  :disabled="loading"
                  placeholder="请输入密码"
                  class="form-input"
                  :class="{ 'input-error': fieldErrors.password }"
                  @input="checkPasswordStrength"
                  @blur="validatePassword"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
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
                <div v-if="fieldErrors.password" class="field-error">
                  {{ fieldErrors.password }}
                </div>
              </div>
              
              <!-- 密码强度指示器 -->
              <div v-if="registerForm.password" class="password-strength-indicator">
                <div class="strength-bar">
                  <div 
                    class="strength-fill"
                    :class="getPasswordStrengthClass(passwordStrength)"
                    :style="{ width: getPasswordStrengthWidth(passwordStrength) }"
                  ></div>
                </div>
                <span class="strength-text">{{ getPasswordStrengthText(passwordStrength) }}</span>
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
                  :disabled="loading"
                  placeholder="请再次输入密码"
                  class="form-input"
                  :class="{ 'input-error': fieldErrors.confirmPassword }"
                  @blur="validateConfirmPassword"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :disabled="loading"
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
                <div v-if="fieldErrors.confirmPassword" class="field-error">
                  {{ fieldErrors.confirmPassword }}
                </div>
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
                  v-model="registerForm.captcha"
                  type="text"
                  required
                  :disabled="loading"
                  placeholder="请输入验证码"
                  class="form-input captcha-input"
                  :class="{ 'input-error': fieldErrors.captcha }"
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
              <div v-if="fieldErrors.captcha" class="field-error">
                {{ fieldErrors.captcha }}
              </div>
            </div>

            <!-- 服务条款 -->
            <div class="form-group">
              <label class="checkbox-wrapper">
                <input
                  v-model="registerForm.agreeToTerms"
                  type="checkbox"
                  required
                  :disabled="loading"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  我已阅读并同意
                  <a href="#" @click.prevent="showTerms = true" class="terms-link">服务条款</a>
                  和
                  <a href="#" @click.prevent="showPrivacy = true" class="terms-link">隐私政策</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              class="auth-button primary"
              :disabled="loading || !isFormValid"
            >
              <div v-if="loading" class="button-spinner">
                <svg class="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <span>{{ loading ? '注册中...' : '创建账户' }}</span>
            </button>

            <div v-if="error" class="error-banner">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <div class="error-content">
                <h4>注册失败</h4>
                <p>{{ error }}</p>
              </div>
            </div>
          </form>

          <div class="auth-footer">
            <div class="divider">
              <span>或</span>
            </div>
            <p class="footer-text">
              已有账户？
              <router-link to="/login" class="footer-link">立即登录</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 邮箱验证弹窗 -->
    <div v-if="showEmailVerification" class="modal-overlay" @click.self="cancelEmailVerification">
      <div class="modal-card">
        <div class="modal-header">
          <h3>邮箱验证</h3>
          <button @click="cancelEmailVerification" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="verification-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h4>验证您的邮箱</h4>
          <p>验证码已发送至：<strong>{{ maskedEmail }}</strong></p>
          <p class="verification-note">请查收邮件并输入6位验证码</p>
          <div class="verification-input">
            <input
              v-model="emailVerificationCode"
              type="text"
              placeholder="请输入6位验证码"
              maxlength="6"
              @input="validateEmailCode"
              class="code-input"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="verifyEmail" :disabled="!isValidEmailCode" class="auth-button primary">
            验证邮箱
          </button>
          <button @click="resendEmailCode" :disabled="resendCooldown > 0" class="auth-button secondary">
            {{ resendCooldown > 0 ? `重发(${resendCooldown}s)` : '重新发送' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 服务条款弹窗 -->
    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal-card large">
        <div class="modal-header">
          <h3>服务条款</h3>
          <button @click="showTerms = false" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="terms-content">
            <h4>1. 服务说明</h4>
            <p>密码管家是一款安全的密码管理工具，帮助用户安全地存储和管理各种账户密码。</p>
            
            <h4>2. 用户责任</h4>
            <p>用户需要妥善保管主密码，我们无法恢复遗忘的主密码。用户对账户安全负有完全责任。</p>
            
            <h4>3. 数据安全</h4>
            <p>我们采用端到端加密技术保护您的数据，服务器端无法访问您的明文密码。</p>
            
            <h4>4. 服务限制</h4>
            <p>我们保留在必要时暂停或终止服务的权利，但会提前通知用户。</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showTerms = false" class="auth-button primary">
            我已了解
          </button>
        </div>
      </div>
    </div>

    <!-- 隐私政策弹窗 -->
    <div v-if="showPrivacy" class="modal-overlay" @click.self="showPrivacy = false">
      <div class="modal-card large">
        <div class="modal-header">
          <h3>隐私政策</h3>
          <button @click="showPrivacy = false" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="terms-content">
            <h4>1. 信息收集</h4>
            <p>我们只收集必要的注册信息（用户名、邮箱），不会收集您的密码明文。</p>
            
            <h4>2. 信息使用</h4>
            <p>收集的信息仅用于提供密码管理服务，不会用于其他商业目的。</p>
            
            <h4>3. 信息保护</h4>
            <p>我们采用行业标准的安全措施保护您的个人信息，包括加密存储和传输。</p>
            
            <h4>4. 信息共享</h4>
            <p>我们不会向第三方分享您的个人信息，除非法律要求或获得您的明确同意。</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showPrivacy = false" class="auth-button primary">
            我已了解
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

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  captcha: string
  agreeToTerms: boolean
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
        password: '',
        confirmPassword: '',
        captcha: '',
        agreeToTerms: false
      } as RegisterForm,
      
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      error: '',
      
      // 验证码相关
      captchaUrl: '',
      sessionId: '',
      
      // 密码强度
      passwordStrength: 0,
      
      // 字段验证错误
      fieldErrors: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        captcha: ''
      },
      
      // 邮箱验证
      showEmailVerification: false,
      emailVerificationCode: '',
      maskedEmail: '',
      resendCooldown: 0,
      
      // 弹窗状态
      showTerms: false,
      showPrivacy: false
    }
  },
  
  computed: {
    isFormValid(): boolean {
      return !!(
        this.registerForm.username &&
        this.registerForm.email &&
        this.registerForm.password &&
        this.registerForm.confirmPassword &&
        this.registerForm.captcha &&
        this.registerForm.agreeToTerms &&
        !Object.values(this.fieldErrors).some(error => error)
      )
    },
    
    isValidEmailCode(): boolean {
      return /^\d{6}$/.test(this.emailVerificationCode)
    }
  },
  
  async mounted() {
    await this.refreshCaptcha()
  },
  
  methods: {
    async handleRegister() {
      if (!this.isFormValid) return
      
      this.loading = true
      this.error = ''
      
      try {
        // 确保有sessionId
        if (!this.sessionId) {
          await this.refreshCaptcha()
        }
        
        if (!this.sessionId) {
          this.error = '无法获取会话ID，请刷新页面重试'
          return
        }
        
        // 调用注册API
        const result = await this.authStore.register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password,
          emailCode: this.registerForm.captcha
        })
        
        if (result.success) {
          // 显示邮箱验证弹窗
          this.maskedEmail = this.maskEmail(this.registerForm.email)
          this.showEmailVerification = true
        }
        
      } catch (error: any) {
        this.handleRegisterError(error)
      } finally {
        this.loading = false
      }
    },
    
    async verifyEmail() {
      if (!this.isValidEmailCode) return
      
      try {
        // 使用 verify2FA 方法进行邮箱验证
        const result = await this.authStore.verify2FA(
          this.registerForm.email,
          this.emailVerificationCode
        )
        
        if (result.success) {
          this.showEmailVerification = false
          // 注册成功，跳转到登录页面
          this.router.push('/login?message=注册成功，请登录')
        } else {
          this.error = '验证码错误，请重新输入'
        }
      } catch (error: any) {
        this.error = error.response?.data?.msg || '验证失败，请重试'
      }
    },
    
    async resendEmailCode() {
      if (this.resendCooldown > 0) return
      
      try {
        // 使用 sendRegisterEmailCode 方法重新发送验证码
        const result = await this.authStore.sendRegisterEmailCode(this.registerForm.email)
        
        if (result.success) {
          // 开始倒计时
          this.resendCooldown = 60
          const timer = setInterval(() => {
            this.resendCooldown--
            if (this.resendCooldown <= 0) {
              clearInterval(timer)
            }
          }, 1000)
          
          this.error = ''
        } else {
          this.error = '发送失败，请稍后重试'
        }
      } catch (error: any) {
        this.error = error.response?.data?.msg || '发送失败，请稍后重试'
      }
    },
    
    cancelEmailVerification() {
      this.showEmailVerification = false
      this.emailVerificationCode = ''
      this.resendCooldown = 0
    },
    
    // 表单验证方法
    validateUsername() {
      const username = this.registerForm.username.trim()
      if (!username) {
        this.fieldErrors.username = '请输入用户名'
      } else if (username.length < 3) {
        this.fieldErrors.username = '用户名至少3个字符'
      } else if (username.length > 20) {
        this.fieldErrors.username = '用户名不能超过20个字符'
      } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
        this.fieldErrors.username = '用户名只能包含字母、数字、下划线和中文'
      } else {
        this.fieldErrors.username = ''
      }
    },
    
    validateEmail() {
      const email = this.registerForm.email.trim()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      if (!email) {
        this.fieldErrors.email = '请输入邮箱地址'
      } else if (!emailRegex.test(email)) {
        this.fieldErrors.email = '请输入有效的邮箱地址'
      } else {
        this.fieldErrors.email = ''
      }
    },
    
    validatePassword() {
      const password = this.registerForm.password
      if (!password) {
        this.fieldErrors.password = '请输入密码'
      } else if (password.length < 8) {
        this.fieldErrors.password = '密码至少8个字符'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        this.fieldErrors.password = '密码必须包含大小写字母和数字'
      } else {
        this.fieldErrors.password = ''
      }
      
      // 重新验证确认密码
      if (this.registerForm.confirmPassword) {
        this.validateConfirmPassword()
      }
    },
    
    validateConfirmPassword() {
      if (!this.registerForm.confirmPassword) {
        this.fieldErrors.confirmPassword = '请确认密码'
      } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.fieldErrors.confirmPassword = '两次输入的密码不一致'
      } else {
        this.fieldErrors.confirmPassword = ''
      }
    },
    
    validateEmailCode() {
      // 限制只能输入数字
      this.emailVerificationCode = this.emailVerificationCode.replace(/\D/g, '')
    },
    
    // 密码强度检查
    checkPasswordStrength() {
      const password = this.registerForm.password
      let strength = 0
      
      if (password.length >= 8) strength++
      if (password.length >= 12) strength++
      if (/[a-z]/.test(password)) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^A-Za-z0-9]/.test(password)) strength++
      
      this.passwordStrength = Math.min(strength, 5)
    },
    
    getPasswordStrengthClass(strength: number): string {
      if (strength <= 1) return 'weak'
      if (strength <= 3) return 'medium'
      return 'strong'
    },
    
    getPasswordStrengthWidth(strength: number): string {
      return `${(strength / 5) * 100}%`
    },
    
    getPasswordStrengthText(strength: number): string {
      if (strength <= 1) return '弱'
      if (strength <= 3) return '中等'
      return '强'
    },
    
    // 处理注册错误
    handleRegisterError(error: any) {
      const errorData = error.response?.data
      
      if (errorData?.code === 'USERNAME_EXISTS') {
        this.fieldErrors.username = '用户名已存在'
      } else if (errorData?.code === 'EMAIL_EXISTS') {
        this.fieldErrors.email = '邮箱已被注册'
      } else if (errorData?.code === 'INVALID_CAPTCHA') {
        this.fieldErrors.captcha = '验证码错误'
        this.refreshCaptcha()
      } else {
        this.error = errorData?.msg || '注册失败，请稍后重试'
      }
    },
    
    // 刷新验证码
    async refreshCaptcha() {
      try {
        const response = await captchaAPI.preloadCaptcha()
        
        const sessionId = response.headers['x-session-id'] ||
          response.headers['X-Session-Id']
        
        if (sessionId) {
          this.sessionId = sessionId
        }
        
        this.captchaUrl = captchaAPI.getCaptchaImage()
        this.registerForm.captcha = ''
        
      } catch (error) {
        console.error('刷新验证码失败:', error)
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        this.captchaUrl = captchaAPI.getCaptchaImage()
        this.registerForm.captcha = ''
      }
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
/* 继承登录页面的样式 */
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
  max-width: 520px;
  padding: var(--spacing-lg);
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input.input-error {
  border-color: var(--error-color);
}

.form-input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.field-error {
  color: var(--error-color);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
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

.password-strength-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: var(--error-color);
}

.strength-fill.medium {
  background: var(--warning-color);
}

.strength-fill.strong {
  background: var(--success-color);
}

.strength-text {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  white-space: nowrap;
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

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  color: var(--text-secondary);
}

.terms-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.terms-link:hover {
  text-decoration: underline;
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

.button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  margin: var(--spacing-md) 0;
}

.error-icon {
  width: 20px;
  height: 20px;
  color: var(--error-color);
  stroke-width: 2;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-content {
  flex: 1;
}

.error-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--error-color);
}

.error-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--error-text);
  line-height: 1.4;
}

.auth-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.divider {
  position: relative;
  margin: var(--spacing-xl) 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  background: white;
  padding: 0 var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.footer-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.footer-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.footer-link:hover {
  text-decoration: underline;
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

.modal-card.large {
  max-width: 600px;
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

.verification-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-icon svg {
  width: 30px;
  height: 30px;
  color: white;
  stroke-width: 2;
}

.modal-body h4 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.modal-body p {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.5;
}

.verification-note {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
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

.terms-content {
  text-align: left;
  max-height: 400px;
  overflow-y: auto;
}

.terms-content h4 {
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
}

.terms-content h4:first-child {
  margin-top: 0;
}

.terms-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
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
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>