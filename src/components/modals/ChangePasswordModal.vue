<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>修改密码</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label>当前密码</label>
          <input
            v-model="form.currentPassword"
            type="password"
            required
            class="form-input"
            :class="{ error: errors.currentPassword }"
          />
          <span v-if="errors.currentPassword" class="error-text">
            {{ errors.currentPassword }}
          </span>
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input
            v-model="form.newPassword"
            type="password"
            required
            class="form-input"
            :class="{ error: errors.newPassword }"
            @input="validatePassword"
          />
          <span v-if="errors.newPassword" class="error-text">
            {{ errors.newPassword }}
          </span>
          
          <!-- 密码强度指示器 -->
          <div v-if="form.newPassword" class="password-strength">
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
          <label>确认新密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="form-input"
            :class="{ error: errors.confirmPassword }"
            @input="validateConfirmPassword"
          />
          <span v-if="errors.confirmPassword" class="error-text">
            {{ errors.confirmPassword }}
          </span>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!isFormValid || loading"
          >
            {{ loading ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface PasswordStrength {
  level: string
  percentage: number
  text: string
}

export default defineComponent({
  name: 'ChangePasswordModal',
  emits: ['close', 'success'],
  data() {
    return {
      loading: false,
      form: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      } as PasswordForm,
      errors: {} as FormErrors
    }
  },
  computed: {
    isFormValid(): boolean {
      return !!(
        this.form.currentPassword &&
        this.form.newPassword &&
        this.form.confirmPassword &&
        this.form.newPassword === this.form.confirmPassword &&
        Object.keys(this.errors).length === 0
      )
    },
    
    passwordStrength(): PasswordStrength {
      const password = this.form.newPassword
      if (!password) return { level: '', percentage: 0, text: '' }
      
      let score = 0
      let feedback = []
      
      // 长度检查
      if (password.length >= 8) score += 25
      else feedback.push('至少8位字符')
      
      // 包含数字
      if (/\d/.test(password)) score += 25
      else feedback.push('包含数字')
      
      // 包含小写字母
      if (/[a-z]/.test(password)) score += 25
      else feedback.push('包含小写字母')
      
      // 包含大写字母或特殊字符
      if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25
      else feedback.push('包含大写字母或特殊字符')
      
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
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    
    validatePassword() {
      if (this.form.newPassword.length < 8) {
        this.errors.newPassword = '密码长度至少8位'
      } else {
        delete this.errors.newPassword
      }
      this.validateConfirmPassword()
    },
    
    validateConfirmPassword() {
      if (this.form.confirmPassword && this.form.newPassword !== this.form.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致'
      } else {
        delete this.errors.confirmPassword
      }
    },
    
    async handleSubmit() {
      if (!this.isFormValid) return
      
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('修改密码:', this.form)
        
        this.$emit('success')
        this.$emit('close')
      } catch (error) {
        console.error('修改密码失败:', error)
        this.errors.currentPassword = '当前密码错误'
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

<style scoped>
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
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
  padding: 4px;
}

.close-btn:hover {
  color: #2d3748;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3182ce;
}

.form-input.error {
  border-color: #e53e3e;
}

.error-text {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
}

.strength-fill.weak {
  background: #e53e3e;
}

.strength-fill.medium {
  background: #dd6b20;
}

.strength-fill.strong {
  background: #38a169;
}

.strength-text {
  font-size: 12px;
  color: #718096;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
}

.submit-btn {
  background: #3182ce;
  color: #5B21B6;
  border: 1px solid #3182ce;
}

.submit-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>