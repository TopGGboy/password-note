<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>修改主密码</h3>
        <div class="security-icon">🔐</div>
      </div>

      <div class="modal-body">
        <div class="warning-notice">
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <h4>重要提醒</h4>
            <p>修改主密码后，您需要使用新的主密码来解锁密码库。请确保牢记新密码，<strong>忘记主密码将无法恢复您的数据</strong>。</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="password-form">
          <!-- 当前主密码 -->
          <div class="form-group">
            <label for="currentMasterPassword">当前主密码</label>
            <div class="password-input-group">
              <input
                id="currentMasterPassword"
                v-model="currentMasterPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="输入当前主密码"
                required
                :disabled="isLoading"
                @input="clearErrors"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="password-toggle"
                :disabled="isLoading"
              >
                {{ showCurrentPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <!-- 新主密码 -->
          <div class="form-group">
            <label for="newMasterPassword">新主密码</label>
            <div class="password-input-group">
              <input
                id="newMasterPassword"
                v-model="newMasterPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="输入新主密码"
                required
                :disabled="isLoading"
                @input="validateNewPassword"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="password-toggle"
                :disabled="isLoading"
              >
                {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            
            <!-- 密码强度指示器 -->
            <div v-if="newMasterPassword" class="password-strength">
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

          <!-- 确认新主密码 -->
          <div class="form-group">
            <label for="confirmNewPassword">确认新主密码</label>
            <div class="password-input-group">
              <input
                id="confirmNewPassword"
                v-model="confirmNewPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次输入新主密码"
                required
                :disabled="isLoading"
                @input="validateConfirmPassword"
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
            <div v-if="confirmNewPassword && newMasterPassword !== confirmNewPassword" class="error-message">
              两次输入的新密码不一致
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              @click="$emit('close')" 
              class="cancel-btn"
              :disabled="isLoading"
            >
              取消
            </button>
            <button 
              type="submit" 
              :disabled="!isFormValid || isLoading" 
              class="submit-btn"
            >
              {{ isLoading ? '修改中...' : '修改主密码' }}
            </button>
          </div>
        </form>

        <div class="security-tips">
          <h4>安全提示：</h4>
          <ul>
            <li>新主密码应使用至少12位字符的强密码</li>
            <li>包含大小写字母、数字和特殊字符</li>
            <li>不要使用与当前密码相似的密码</li>
            <li>请将新主密码保存在安全的地方</li>
            <li>修改后所有设备都需要重新输入新主密码</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 成功通知 -->
    <SuccessNotification 
      v-if="showSuccessNotification" 
      title="主密码修改成功"
      message="您的主密码已成功修改，请使用新密码重新登录。"
      :items="[
        '请使用新主密码重新登录',
        '现有的密码条目需要重新加密',
        '建议立即备份您的数据',
        '修改后所有设备都需要重新输入新主密码'
      ]"
      :duration="8000"
      @close="showSuccessNotification = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { KeyManager, DataEncryptionService } from '../../utils/encryption/crypto'
import SuccessNotification from '../common/SuccessNotification.vue'

interface Emits {
  (e: 'success'): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
const currentMasterPassword = ref('')
const newMasterPassword = ref('')
const confirmNewPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showSuccessNotification = ref(false)

const passwordStrength = computed(() => {
  const password = newMasterPassword.value
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
  return currentMasterPassword.value.length > 0 &&
         newMasterPassword.value.length >= 8 && 
         newMasterPassword.value === confirmNewPassword.value &&
         passwordStrength.value.level !== 'weak' &&
         currentMasterPassword.value !== newMasterPassword.value
})

const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const clearErrors = () => {
  errorMessage.value = ''
}

const validateNewPassword = () => {
  errorMessage.value = ''
  if (newMasterPassword.value && currentMasterPassword.value === newMasterPassword.value) {
    errorMessage.value = '新密码不能与当前密码相同'
  }
}

const validateConfirmPassword = () => {
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 1. 验证当前主密码
    const isCurrentPasswordValid = KeyManager.verifyMasterPassword(currentMasterPassword.value)
    if (!isCurrentPasswordValid) {
      throw new Error('当前主密码错误，请重试')
    }
    
    // 2. 获取当前的加密密钥（用于重新加密数据）
    const currentEncryptionKey = KeyManager.getEncryptionKey()
    if (!currentEncryptionKey) {
      throw new Error('无法获取当前加密密钥')
    }
    
    // 3. 设置新的主密码（这会生成新的加密密钥）
    KeyManager.setMasterPassword(newMasterPassword.value)
    
    console.log('主密码修改成功')
    
    // 4. 显示成功通知
    showSuccessNotification.value = true
    
    // 延迟发送成功事件，让用户有时间看到通知
    setTimeout(() => {
      emit('success')
    }, 1000)
  } catch (error: any) {
    console.error('主密码修改失败:', error)
    errorMessage.value = error.message || '修改失败，请重试'
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
  max-width: 550px;
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

.warning-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #fef5e7;
  border-radius: 8px;
  border-left: 4px solid #f6ad55;
}

.warning-icon {
  font-size: 20px;
  margin-top: 2px;
}

.warning-content h4 {
  margin: 0 0 8px 0;
  color: #c05621;
  font-size: 16px;
  font-weight: 600;
}

.warning-content p {
  margin: 0;
  color: #744210;
  line-height: 1.5;
  font-size: 14px;
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
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover:not(:disabled) {
  background: #edf2f7;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #5B21B6;
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

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>