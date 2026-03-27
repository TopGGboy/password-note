<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <h3>{{ isEdit ? '编辑密码' : '添加密码' }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="password-form">
        <div class="form-content">
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h4>基本信息</h4>
            </div>

            <div class="form-group">
              <label for="title">
                <span class="label-text">网站/应用名称</span>
                <span class="required">*</span>
              </label>
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
              <label for="url">
                <span class="label-text">网站地址</span>
              </label>
              <input
                id="url"
                v-model="form.url"
                type="url"
                class="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div class="form-group">
              <label for="category">
                <span class="label-text">分类</span>
              </label>
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
            <div class="section-header">
              <div class="section-icon amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h4>账户信息</h4>
            </div>

            <div class="form-group">
              <label for="username">
                <span class="label-text">用户名/邮箱</span>
                <span class="required">*</span>
              </label>
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
              <label for="password">
                <span class="label-text">密码</span>
                <span class="required">*</span>
              </label>
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
                  class="password-toggle"
                  title="显示/隐藏密码"
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
                <button
                  type="button"
                  @click="generatePassword"
                  class="generate-btn"
                  title="生成随机密码"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <div class="section-icon sky">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <h4>备注信息</h4>
            </div>

            <div class="form-group">
              <label for="notes">
                <span class="label-text">备注</span>
              </label>
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
        
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            取消
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <div v-if="loading" class="loading-spinner"></div>
            {{ loading ? '保存中...' : (isEdit ? '更新' : '添加') }}
          </button>
        </div>
      </form>
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
      
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
      password += '0123456789'[Math.floor(Math.random() * 10)]
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
      
      for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }
      
      this.form.password = password.split('').sort(() => Math.random() - 0.5).join('')
    },
    
    async handleSubmit() {
      this.loading = true
      try {
        if (!KeyManager.hasKey()) {
          alert('未找到加密密钥，请先输入主密码')
          this.$emit('close')
          return
        }

        const encryptedData = DataEncryptionService.encryptPasswordEntry({
          username: this.form.username || '',
          password: this.form.password || '',
          notes: this.form.notes || '',
          customFields: []
        })

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
          result = await passwordEntriesAPI.update(this.entry.id, requestData)
        } else {
          result = await passwordEntriesAPI.create(requestData as CreatePasswordEntryRequest)
        }

        if (result.code === 1) {
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
  border-radius: var(--radius-3xl);
  width: 90%;
  max-width: 520px;
  max-height: 85vh;
  height: 60%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}


.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-500), var(--primary-500));
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
  z-index: 20;
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
  align-items: center;
  gap: var(--spacing-lg);
  padding: 28px 32px;
  background: white;
  border-bottom: 1px solid var(--gray-100);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.35);
}

.header-icon svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 2;
}

.modal-header h3 {
  flex: 1;
  font-size: 1.375rem;
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0;
}

.close-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--gray-500);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--error-500);
  border-color: var(--error-500);
  color: white;
  transform: scale(1.05);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.password-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.form-content {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) transparent;
}

.form-content::-webkit-scrollbar {
  width: 6px;
}

.form-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: var(--radius-full);
}

.form-content::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: var(--radius-full);
  transition: background var(--transition-normal);
}

.form-content::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

.form-section {
  margin-bottom: 36px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-200);
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.section-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-lg);
  z-index: -1;
}

.section-icon.teal {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  color: var(--primary-700);
}

.section-icon.teal::before {
  background: var(--gradient-primary);
}

.section-icon.amber {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9));
  color: var(--secondary-700);
}

.section-icon.amber::before {
  background: var(--gradient-secondary);
}

.section-icon.sky {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.9));
  color: var(--info-700);
}

.section-icon.sky::before {
  background: var(--gradient-info);
}

.section-icon svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.section-header h4 {
  font-size: 1rem;
  font-weight: var(--font-semibold);
  color: var(--gray-800);
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeInUp 0.4s ease backwards;
}

.form-group:nth-child(1) { animation-delay: 0.05s; }
.form-group:nth-child(2) { animation-delay: 0.1s; }
.form-group:nth-child(3) { animation-delay: 0.15s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--gray-700);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.label-text {
  color: var(--gray-700);
}

.required {
  color: var(--error-500);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: white;
  color: var(--gray-800);
}

.form-input:hover,
.form-textarea:hover {
  border-color: var(--gray-300);
  background: var(--gray-50);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 44px;
  cursor: pointer;
}

.form-select:hover {
  border-color: var(--primary-400);
  background-color: var(--gray-50);
}

.form-select option {
  padding: 12px;
  background: white;
  color: var(--gray-800);
  font-weight: var(--font-medium);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1), 0 2px 8px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
  background: white;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--gray-400);
  font-weight: var(--font-normal);
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
  padding-right: 100px;
}

.password-toggle,
.generate-btn {
  position: absolute;
  right: 8px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  padding: 8px;
  transition: all var(--transition-normal);
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
}

.password-toggle {
  right: 56px;
}

.password-toggle svg,
.generate-btn svg {
  width: 18px;
  height: 18px;
  color: var(--gray-500);
  stroke-width: 2;
}

.password-toggle:hover,
.generate-btn:hover {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

.password-toggle:hover svg,
.generate-btn:hover svg {
  color: white;
}

.modal-actions {
  display: flex;
  gap: 16px;
  padding: 24px 32px;
  border-top: 1px solid var(--gray-100);
  background: white;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 14px 28px;
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  min-width: 120px;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.btn:hover::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 2px solid var(--gray-200);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--gray-200);
  transform: translateY(-1px);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-md);
    align-items: flex-end;
  }

  .modal-content {
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    border-radius: var(--radius-3xl) var(--radius-3xl) 0 0;
  }

  .modal-header,
  .form-content,
  .modal-actions {
    padding: 20px;
  }

  .modal-header {
    padding: 24px 20px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .form-section {
    margin-bottom: 28px;
  }

  .modal-actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn {
    width: 100%;
    padding: 16px 24px;
  }
}
</style>
