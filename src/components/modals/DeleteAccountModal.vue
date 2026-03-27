<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>删除账户</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="warning-section">
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <h4>此操作无法撤销</h4>
            <p>删除账户将永久删除您的所有数据，包括：</p>
            <ul>
              <li>所有保存的密码和登录信息</li>
              <li>个人设置和偏好</li>
              <li>账户历史记录</li>
              <li>所有备份数据</li>
            </ul>
          </div>
        </div>
        
        <div class="confirmation-section">
          <h4>确认删除</h4>
          <p>请输入您的密码以确认删除账户：</p>
          
          <div class="form-group">
            <label>当前密码</label>
            <input
              v-model="password"
              type="password"
              required
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="请输入您的密码"
            />
            <span v-if="errors.password" class="error-text">
              {{ errors.password }}
            </span>
          </div>
          
          <div class="form-group">
            <label>确认文本</label>
            <p class="confirmation-hint">
              请输入 <strong>"删除我的账户"</strong> 以确认：
            </p>
            <input
              v-model="confirmationText"
              type="text"
              required
              class="form-input"
              :class="{ error: errors.confirmationText }"
              placeholder="删除我的账户"
            />
            <span v-if="errors.confirmationText" class="error-text">
              {{ errors.confirmationText }}
            </span>
          </div>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="dataExported"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">
                我已导出并备份了我需要的数据
              </span>
            </label>
          </div>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="understandConsequences"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">
                我理解此操作无法撤销，所有数据将被永久删除
              </span>
            </label>
          </div>
        </div>
        
        <div class="final-warning">
          <div class="warning-box">
            <strong>最后警告：</strong>
            一旦确认删除，您的账户和所有相关数据将在24小时内被永久删除。
            在此期间，您可以通过重新登录来取消删除操作。
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button 
            @click="handleDelete" 
            class="delete-btn"
            :disabled="!canDelete || loading"
          >
            {{ loading ? '删除中...' : '确认删除账户' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface FormErrors {
  password?: string
  confirmationText?: string
}

export default defineComponent({
  name: 'DeleteAccountModal',
  emits: ['close', 'confirm'],
  data() {
    return {
      loading: false,
      password: '',
      confirmationText: '',
      dataExported: false,
      understandConsequences: false,
      errors: {} as FormErrors
    }
  },
  computed: {
    canDelete(): boolean {
      return !!(
        this.password &&
        this.confirmationText === '删除我的账户' &&
        this.dataExported &&
        this.understandConsequences &&
        Object.keys(this.errors).length === 0
      )
    }
  },
  watch: {
    confirmationText(newValue: string) {
      if (newValue && newValue !== '删除我的账户') {
        this.errors.confirmationText = '请输入正确的确认文本'
      } else {
        delete this.errors.confirmationText
      }
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    
    async handleDelete() {
      if (!this.canDelete) return
      
      // 最后一次确认
      if (!confirm('您确定要删除账户吗？此操作无法撤销！')) {
        return
      }
      
      this.loading = true
      try {
        // 模拟API调用验证密码
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 模拟密码验证失败的情况（演示用）
        if (this.password === 'wrong') {
          this.errors.password = '密码错误'
          return
        }
        
        console.log('账户删除请求已提交')
        this.$emit('confirm')
      } catch (error) {
        console.error('删除账户失败:', error)
        this.errors.password = '验证失败，请重试'
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
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
  background: var(--gradient-border);
  animation: gradientShift 3s ease infinite;
  background-size: 200% 100%;
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

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #fed7d7;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #c53030;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #c53030;
  padding: 4px;
}

.close-btn:hover {
  color: #9c2626;
}

.modal-body {
  padding: 24px;
}

.warning-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
}

.warning-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.warning-content h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #c53030;
}

.warning-content p {
  margin: 0 0 12px 0;
  color: #744210;
  line-height: 1.5;
}

.warning-content ul {
  margin: 0;
  padding-left: 20px;
  color: #744210;
}

.warning-content li {
  margin-bottom: 4px;
}

.confirmation-section {
  margin-bottom: 24px;
}

.confirmation-section h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.confirmation-section > p {
  margin: 0 0 20px 0;
  color: #718096;
  line-height: 1.5;
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

.confirmation-hint {
  margin: 0 0 8px 0 !important;
  font-size: 14px;
  color: #718096;
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

.checkbox-group {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-input {
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-text {
  color: #2d3748;
  line-height: 1.5;
}

.final-warning {
  margin-bottom: 24px;
}

.warning-box {
  padding: 16px;
  background: #fef5e7;
  border: 1px solid #f6e05e;
  border-radius: 8px;
  color: #744210;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn,
.delete-btn {
  padding: 12px 24px;
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

.delete-btn {
  background: #e53e3e;
  color: white;
  border: 1px solid #e53e3e;
}

.delete-btn:hover:not(:disabled) {
  background: #c53030;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .warning-section {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .delete-btn {
    width: 100%;
  }
}
</style>