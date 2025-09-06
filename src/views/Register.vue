<template>
  <div class="register-container">
    <div class="register-card">
      <h2>用户注册</h2>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="registerForm.username"
            type="text"
            placeholder="请输入用户名"
            :class="{ 'error': errors.username }"
            @blur="validateUsername"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <!-- 邮箱输入 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            :class="{ 'error': errors.email }"
            @blur="validateEmail"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :class="{ 'error': errors.password }"
            @blur="validatePassword"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <!-- 确认密码输入 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :class="{ 'error': errors.confirmPassword }"
            @blur="validateConfirmPassword"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <!-- 邮箱验证码 -->
        <div class="form-group">
          <label for="emailCode">邮箱验证码</label>
          <div class="code-input-group">
            <input
              id="emailCode"
              v-model="registerForm.emailCode"
              type="text"
              placeholder="请输入邮箱验证码"
              :class="{ 'error': errors.emailCode }"
              @blur="validateEmailCode"
            />
            <button
              type="button"
              class="send-code-btn"
              :disabled="!canSendCode || sendingCode"
              @click="sendEmailCode"
            >
              {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '发送验证码') }}
            </button>
          </div>
          <span v-if="errors.emailCode" class="error-message">{{ errors.emailCode }}</span>
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          class="register-btn"
          :disabled="!isFormValid || registering"
        >
          {{ registering ? '注册中...' : '注册' }}
        </button>

        <!-- 错误消息 -->
        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <!-- 成功消息 -->
        <div v-if="successMessage" class="success-alert">
          {{ successMessage }}
        </div>
      </form>

      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import type { RegisterRequest } from '../types/api'

export default defineComponent({
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // 表单数据
    const registerForm = reactive<RegisterRequest>({
      username: '',
      email: '',
      password: '',
      emailCode: ''
    })

    const confirmPassword = ref('')
    const registering = ref(false)
    const sendingCode = ref(false)
    const countdown = ref(0)
    const errorMessage = ref('')
    const successMessage = ref('')

    // 表单验证错误
    const errors = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailCode: ''
    })

    // 验证规则
    const validateUsername = () => {
      if (!registerForm.username) {
        errors.username = '请输入用户名'
      } else if (registerForm.username.length < 3) {
        errors.username = '用户名至少3个字符'
      } else if (registerForm.username.length > 20) {
        errors.username = '用户名不能超过20个字符'
      } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
        errors.username = '用户名只能包含字母、数字和下划线'
      } else {
        errors.username = ''
      }
    }

    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!registerForm.email) {
        errors.email = '请输入邮箱地址'
      } else if (!emailRegex.test(registerForm.email)) {
        errors.email = '请输入有效的邮箱地址'
      } else {
        errors.email = ''
      }
    }

    const validatePassword = () => {
      if (!registerForm.password) {
        errors.password = '请输入密码'
      } else if (registerForm.password.length < 6) {
        errors.password = '密码至少6个字符'
      } else if (registerForm.password.length > 50) {
        errors.password = '密码不能超过50个字符'
      } else {
        errors.password = ''
      }
    }

    const validateConfirmPassword = () => {
      if (!confirmPassword.value) {
        errors.confirmPassword = '请确认密码'
      } else if (confirmPassword.value !== registerForm.password) {
        errors.confirmPassword = '两次输入的密码不一致'
      } else {
        errors.confirmPassword = ''
      }
    }

    const validateEmailCode = () => {
      if (!registerForm.emailCode) {
        errors.emailCode = '请输入邮箱验证码'
      } else if (!/^\d{6}$/.test(registerForm.emailCode)) {
        errors.emailCode = '验证码应为6位数字'
      } else {
        errors.emailCode = ''
      }
    }

    // 计算属性
    const canSendCode = computed(() => {
      return registerForm.email && !errors.email && countdown.value === 0
    })

    const isFormValid = computed(() => {
      return registerForm.username &&
             registerForm.email &&
             registerForm.password &&
             confirmPassword.value &&
             registerForm.emailCode &&
             !errors.username &&
             !errors.email &&
             !errors.password &&
             !errors.confirmPassword &&
             !errors.emailCode
    })

    // 发送邮箱验证码
    const sendEmailCode = async () => {
      if (!canSendCode.value) return

      validateEmail()
      if (errors.email) return

      try {
        sendingCode.value = true
        errorMessage.value = ''

        const result = await authStore.sendRegisterEmailCode(registerForm.email)
        
        if (result.success) {
          successMessage.value = '验证码发送成功，请查收邮件'
          startCountdown()
        } else {
          errorMessage.value = result.message || '验证码发送失败'
        }
      } catch (error) {
        errorMessage.value = '网络错误，请稍后重试'
      } finally {
        sendingCode.value = false
      }
    }

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }

    // 处理注册
    const handleRegister = async () => {
      // 验证所有字段
      validateUsername()
      validateEmail()
      validatePassword()
      validateConfirmPassword()
      validateEmailCode()

      if (!isFormValid.value) {
        errorMessage.value = '请检查表单信息'
        return
      }

      try {
        registering.value = true
        errorMessage.value = ''
        successMessage.value = ''

        const result = await authStore.register(registerForm)

        if (result.success) {
          successMessage.value = '注册成功！即将跳转到登录页面...'
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          errorMessage.value = result.message || '注册失败'
        }
      } catch (error) {
        errorMessage.value = '注册失败，请稍后重试'
      } finally {
        registering.value = false
      }
    }

    return {
      registerForm,
      confirmPassword,
      registering,
      sendingCode,
      countdown,
      errorMessage,
      successMessage,
      errors,
      canSendCode,
      isFormValid,
      validateUsername,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      validateEmailCode,
      sendEmailCode,
      handleRegister
    }
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.register-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group input {
  flex: 1;
}

.send-code-btn {
  padding: 12px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.send-code-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.send-code-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.register-btn {
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.register-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-alert {
  background: #ffeaea;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  text-align: center;
  margin-top: 10px;
}

.success-alert {
  background: #eafaf1;
  color: #27ae60;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  text-align: center;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }
  
  .code-input-group {
    flex-direction: column;
  }
  
  .send-code-btn {
    width: 100%;
  }
}
</style>