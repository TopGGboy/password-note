<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isSetup ? '设置主密码' : '输入主密码' }}</h3>
        <div class="security-icon">🔐</div>
      </div>

      <div class="modal-body">
        <div class="description">
          <p v-if="isSetup">
            主密码用于加密您的所有密码数据。请设置一个强密码并牢记，<strong>忘记主密码将无法恢复您的数据</strong>。
          </p>
          <p v-else>
            请输入您的主密码以解锁密码库。
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="password-form">
          <div class="form-group">
            <label for="masterPassword">主密码</label>
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
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            
            <!-- 密码强度指示器（仅在设置模式下显示） -->
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
            <label for="confirmPassword">确认主密码</label>
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
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div v-if="confirmPassword && masterPassword !== confirmPassword" class="error-message">
              两次输入的密码不一致
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="!isFormValid || isLoading" 
              class="submit-btn"
            >
              {{ isLoading ? '处理中...' : (isSetup ? '设置主密码' : '解锁') }}
            </button>
          </div>
        </form>

        <div v-if="isSetup" class="security-tips">
          <h4>安全提示：</h4>
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
  
  // 长度检查
  if (password.length >= 12) score += 2
  else if (password.length >= 8) score += 1
  else feedback.push('至少12位')
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('小写字母')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('大写字母')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('数字')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('特殊字符')
  
  // 复杂性检查
  if (password.length >= 16) score += 1
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 1
  
  // 根据得分返回强度
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
      // 设置主密码
      KeyManager.setMasterPassword(masterPassword.value)
      console.log('主密码设置成功')
    } else {
      // 验证主密码
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 0;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.security-icon {
  font-size: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-body {
  padding: 0 32px 32px;
}

.description {
  margin-bottom: 24px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #3182ce;
}

.description p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

.password-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  width: 100%;
  padding: 16px 50px 16px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.password-input-group input:focus {
  outline: none;
  border-color: #3182ce;
}

.password-input-group input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #718096;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.password-toggle:hover:not(:disabled) {
  background: #f7fafc;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-fill.weak {
  background: #f56565;
}

.strength-fill.medium {
  background: #ed8936;
}

.strength-fill.strong {
  background: #48bb78;
}

.strength-fill.very-strong {
  background: #38a169;
}

.strength-text {
  font-size: 12px;
  color: #718096;
  white-space: nowrap;
  min-width: 120px;
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fed7d7;
  border-radius: 6px;
  border: 1px solid #feb2b2;
}

.form-actions {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.security-tips {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 16px;
}

.security-tips h4 {
  margin: 0 0 12px 0;
  color: #22543d;
  font-size: 14px;
  font-weight: 600;
}

.security-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #2f855a;
}

.security-tips li {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header,
  .modal-body {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .modal-header h3 {
    font-size: 24px;
  }
}
</style>