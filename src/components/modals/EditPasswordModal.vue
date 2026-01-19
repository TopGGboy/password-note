<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑密码' : '添加密码' }}</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="password-form">
        <div class="form-content">
          <div class="form-section">
            <h4>📋 基本信息</h4>

            <div class="form-group">
              <label for="title" data-required="*">网站/应用名称</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="form-input"
                placeholder="例如：Google"
              />
            </div>

            <div class="form-group">
              <label for="url">网站地址</label>
              <input
                id="url"
                v-model="form.url"
                type="url"
                class="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div class="form-group">
              <label for="category">分类</label>
              <select 
                id="category"
                v-model="form.categoryId" 
                class="form-select"
              >
                <option :value="undefined">选择分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h4>🔐 账户信息</h4>

            <div class="form-group">
              <label for="username" data-required="*">用户名/邮箱</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="form-input"
                placeholder="用户名或邮箱地址"
              />
            </div>

            <div class="form-group">
              <label for="password" data-required="*">密码</label>
              <div class="password-input-group">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="form-input"
                  placeholder="输入密码"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="toggle-password"
                  title="显示/隐藏密码"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button
                  type="button"
                  @click="generatePassword"
                  class="generate-password"
                  title="生成随机密码"
                >
                  🎲
                </button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>📝 备注信息</h4>

            <div class="form-group">
              <label for="notes">备注</label>
              <textarea
                id="notes"
                v-model="form.notes"
                class="form-textarea"
                rows="3"
                placeholder="添加备注信息..."
              ></textarea>
            </div>
          </div>
        </div>
      </form>

      <div class="modal-actions">
        <button type="button" @click="$emit('close')" class="cancel-btn">
          <span>取消</span>
        </button>
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="loading"
        >
          <span v-if="loading">保存中...</span>
          <span v-else>{{ isEdit ? '更新' : '添加' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted } from 'vue'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import { DataEncryptionService, KeyManager } from '../../utils/encryption/crypto'
import { passwordEntriesAPI, categoriesAPI } from '../../services/api'
import type { CreatePasswordEntryRequest } from '../../types/api'
import type { Category } from '../../types/api'

export default defineComponent({
  name: 'EditPasswordModal',
  props: {
    entry: {
      type: Object as PropType<DecryptedPasswordEntry>,
      default: null
    }
  },
  emits: ['close', 'success'],
  data() {
    return {
      loading: false,
      showPassword: false,
      categories: [] as Category[],
      form: {
        title: '',
        url: '',
        username: '',
        password: '',
        categoryId: undefined,
        notes: ''
      } as Partial<DecryptedPasswordEntry>
    }
  },
  computed: {
    isEdit(): boolean {
      return !!this.entry
    }
  },
  async mounted() {
    // 加载分类数据
    await this.loadCategories()
    
    if (this.entry) {
      this.form = {
        title: this.entry.title || '',
        url: this.entry.url || '',
        username: this.entry.username || '',
        password: this.entry.password || '',
        categoryId: this.entry.categoryId,
        notes: this.entry.notes || ''
      }
    }
  },
  methods: {
    // 加载分类列表
    async loadCategories() {
      try {
        const response = await categoriesAPI.getAll()
        if (response.code === 1 && response.data) {
          this.categories = response.data
        }
      } catch (err) {
        console.error('加载分类失败:', err)
      }
    },
    
    handleOverlayClick() {
      this.$emit('close')
    },
    
    generatePassword() {
      const length = 16
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let password = ''
      
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      
      this.form.password = password
    },
    
    async handleSubmit() {
      this.loading = true
      try {
        // 检查是否有加密密钥
        if (!KeyManager.hasKey()) {
          alert('未找到加密密钥，请先输入主密码')
          this.$emit('close')
          return
        }

        // 加密敏感数据
        const encryptedData = DataEncryptionService.encryptPasswordEntry({
          username: this.form.username || '',
          password: this.form.password || '',
          notes: this.form.notes || '',
          customFields: []
        })

        // 准备请求数据
        const requestData: Partial<CreatePasswordEntryRequest> = {
          title: this.form.title,
          url: this.form.url || undefined,
          usernameEncrypted: encryptedData.usernameEncrypted,
          passwordEncrypted: encryptedData.passwordEncrypted,
          notesEncrypted: encryptedData.notesEncrypted,
          categoryId: this.form.categoryId || undefined,
          customFields: {}
        }

        let result
        if (this.isEdit && this.entry?.id) {
          // 更新现有密码条目
          console.log('更新密码条目，ID:', this.entry.id)
          result = await passwordEntriesAPI.update(this.entry.id, requestData)
        } else {
          // 创建新密码条目
          console.log('创建新密码条目')
          result = await passwordEntriesAPI.create(requestData as CreatePasswordEntryRequest)
        }

        if (result.code === 1) {
          console.log(this.isEdit ? '密码条目更新成功' : '密码条目创建成功')
          
          // 触发自定义事件，通知密码列表刷新
          if (this.isEdit) {
            window.dispatchEvent(new CustomEvent('passwordEntryUpdated'))
          } else {
            window.dispatchEvent(new CustomEvent('passwordEntryAdded'))
          }
          
          this.$emit('success', result.data)
          this.$emit('close')
        } else {
          throw new Error(result.msg || '操作失败')
        }
        
      } catch (error: any) {
        console.error('保存失败:', error)
        alert(error.message || '保存失败，请重试')
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

<style scoped>
/* 现代设计变量定义 */
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --secondary-color: #7c3aed;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
  --border-hover: #d1d5db;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --transition-fast: 0.2s ease-in-out;
  --transition-normal: 0.3s ease-in-out;
  --transition-slow: 0.5s ease-in-out;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding: 80px 20px 20px;
  animation: fadeIn 0.3s ease-out;
  overflow: auto;
}

.modal-container {
  background: #ffffff;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-sizing: border-box;
  border: 1px solid var(--border-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 10;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h3::before {
  content: "🔐";
  font-size: 1.25rem;
}

.close-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1.25rem;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.close-btn:hover {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.password-form {
  padding: 0;
  margin: 0;
}

.form-content {
  padding: 32px;
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: block;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.form-group label::after {
  content: attr(data-required);
  color: var(--error-color);
  margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 400;
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: #ffffff;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  background: #ffffff;
  transform: translateY(-1px);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.6;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group .form-input {
  padding-right: 110px;
}

.toggle-password,
.generate-password {
  position: absolute;
  right: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 1.125rem;
  padding: 8px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password {
  right: 68px;
}

.generate-password {
  right: 12px;
}

.toggle-password:hover,
.generate-password:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 24px 32px;
  border-top: 1px solid var(--border-color);
  margin-top: 0;
  background: #ffffff;
  position: relative;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.cancel-btn,
.submit-btn {
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  border: 1px solid var(--border-color);
  background: #ffffff;
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:disabled {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

/* 加载状态动画 */
.submit-btn:disabled::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 60px 16px 16px;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-header,
  .modal-body,
  .modal-actions {
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-header h3 {
    font-size: 1.25rem;
  }
}
</style>