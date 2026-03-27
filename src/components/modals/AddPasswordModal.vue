<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>添加新密码</h3>
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
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h4>基本信息</h4>
            </div>

            <div class="form-group">
              <label for="title">
                <span class="label-text">网站/应用名称</span>
                <span class="required">*</span>
              </label>
              <input id="title" v-model="form.title" type="text" placeholder="例如：GitHub、微信、支付宝" required />
            </div>

            <div class="form-group">
              <label for="url">
                <span class="label-text">网站地址</span>
              </label>
              <input id="url" v-model="form.url" type="url" placeholder="https://example.com" />
            </div>

            <div class="form-group">
              <CategorySelector
                v-model="form.categoryId"
                :categories="categories"
                :is-loading="isLoadingCategories"
                label="分类"
                placeholder="请选择分类"
                help-text="选择密码条目的分类，便于管理和查找"
                required
                @change="handleCategoryChange"
              />
            </div>

            <div class="form-group">
              <label for="icon">
                <span class="label-text">图标</span>
              </label>
              <div class="icon-selector">
                <input id="icon" v-model="form.icon" type="text" placeholder="选择一个表情符号" maxlength="2" />
                <div class="icon-options">
                  <button v-for="icon in commonIcons" :key="icon" type="button" @click="form.icon = icon"
                    class="icon-option" :class="{ active: form.icon === icon }">
                    {{ icon }}
                  </button>
                </div>
              </div>
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
              <h4>登录信息</h4>
            </div>

            <div class="form-group">
              <label for="username">
                <span class="label-text">用户名/邮箱</span>
                <span class="required">*</span>
              </label>
              <input id="username" v-model="form.username" type="text" placeholder="用户名或邮箱地址" required />
            </div>

            <div class="form-group">
              <label for="password">
                <span class="label-text">密码</span>
                <span class="required">*</span>
              </label>
              <div class="password-input-group">
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="输入密码"
                  required />
                <button type="button" @click="showPassword = !showPassword" class="password-toggle" title="显示/隐藏密码">
                  <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button type="button" @click="generateRandomPassword" class="generate-btn" title="生成随机密码">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01"/>
                  </svg>
                </button>
              </div>

              <div class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" :class="passwordStrength.level"
                    :style="{ width: passwordStrength.percentage + '%' }"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
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
              <h4>附加信息</h4>
            </div>

            <div class="form-group">
              <label for="notes">
                <span class="label-text">备注</span>
              </label>
              <textarea id="notes" v-model="form.notes" placeholder="添加备注信息（可选）" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label for="tags">
                <span class="label-text">标签</span>
              </label>
              <input id="tags" v-model="tagsInput" type="text" placeholder="输入标签，用逗号分隔" @input="updateTags" />
              <div class="tags-display" v-if="form.tags.length > 0">
                <span v-for="(tag, index) in form.tags" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeTag(index)" class="tag-remove" title="移除标签">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            取消
          </button>
          <button type="submit" :disabled="!isFormValid" class="btn btn-primary">
            <span v-if="isLoading">保存中...</span>
            <span v-else>保存密码</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { passwordEntriesAPI, categoriesAPI } from '../../services/api'
import type { CreatePasswordEntryRequest, Category } from '../../types/api'
import { DataEncryptionService, KeyManager } from '../../utils/encryption/crypto'
import { STORAGE_KEYS } from '../../constants/constants'
import CategorySelector from '../common/CategorySelector.vue'

interface PasswordForm {
  title: string
  url: string
  categoryId: number | ''
  icon: string
  username: string
  password: string
  notes: string
  tags: string[]
}

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  percentage: number
  text: string
}

export default defineComponent({
  name: 'AddPasswordModal',
  components: {
    CategorySelector
  },
  emits: ['close', 'success', 'requireMasterPassword'],
  data() {
    return {
      isLoading: false,
      isLoadingCategories: false,
      showPassword: false,
      tagsInput: '',
      categories: [] as Category[],

      form: {
        title: '',
        url: '',
        categoryId: '',
        icon: '🔐',
        username: '',
        password: '',
        notes: '',
        tags: []
      } as PasswordForm,

      commonIcons: [
        '🔐', '🌐', '📧', '💬', '🛒', '🎵', '📺', '🎮',
        '💰', '🏦', '📱', '💻', '🔧', '📊', '📝', '🎯'
      ],

      categoryIconMap: {
        1: '📁',
        2: '💬',
        3: '📧',
        4: '💰',
        5: '💻',
        6: '🛒',
        7: '🎵',
        8: '🔧'
      } as Record<number, string>
    }
  },
  computed: {
    userId(): number | null {
      const id = localStorage.getItem(STORAGE_KEYS.USER_ID)
      return id ? Number(id) : null
    },

    isFormValid(): boolean {
      return !!(
        this.form.title.trim() &&
        this.form.categoryId &&
        this.form.username.trim() &&
        this.form.password.trim()
      )
    },

    passwordStrength(): PasswordStrength {
      const password = this.form.password
      if (!password) {
        return { level: 'weak', percentage: 0, text: '请输入密码' }
      }

      let score = 0
      let feedback = []

      if (password.length >= 8) score += 1
      else feedback.push('至少8位')

      if (password.length >= 12) score += 1

      if (/[a-z]/.test(password)) score += 1
      else feedback.push('小写字母')

      if (/[A-Z]/.test(password)) score += 1
      else feedback.push('大写字母')

      if (/d/.test(password)) score += 1
      else feedback.push('数字')

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      else feedback.push('特殊字符')

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
      } else if (score <= 5) {
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
    }
  },
  methods: {
    handleOverlayClick(event: Event) {
      if (event.target === event.currentTarget) {
        this.$emit('close')
      }
    },

    async handleSubmit() {
      if (!this.isFormValid || this.isLoading) return

      this.isLoading = true

      try {
        const response = await this.savePassword()

        this.$emit('success', {
          id: response.data?.id || Date.now().toString(),
          title: this.form.title,
          url: this.form.url,
          categoryId: this.form.categoryId,
          icon: this.form.icon,
          username: this.form.username,
          password: this.form.password,
          notes: this.form.notes,
          tags: this.form.tags,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsed: new Date()
        })

        window.dispatchEvent(new CustomEvent('passwordEntryAdded'))

        this.$emit('close')

        console.log('密码保存成功')
      } catch (error: any) {
        console.error('保存密码失败:', error)

        let errorMessage = '保存失败，请重试'

        if (error.response?.status === 401) {
          errorMessage = '登录已过期，请重新登录'
        } else if (error.response?.status === 400) {
          errorMessage = '输入信息有误，请检查后重试'
        } else if (error.response?.data?.msg) {
          errorMessage = error.response.data.msg
        }

        alert(errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    async savePassword() {
      if (!KeyManager.hasKey()) {
        this.$emit('requireMasterPassword')
        throw new Error('未找到加密密钥，请先设置主密码')
      }

      try {
        const encryptedData = DataEncryptionService.encryptPasswordEntry({
          username: this.form.username,
          password: this.form.password,
          notes: this.form.notes || '',
          customFields: this.form.tags.map(tag => ({
            name: 'tag',
            value: tag
          }))
        })

        const requestData: CreatePasswordEntryRequest = {
          categoryId: typeof this.form.categoryId === 'number' ? this.form.categoryId : undefined,
          title: this.form.title,
          usernameEncrypted: encryptedData.usernameEncrypted,
          passwordEncrypted: encryptedData.passwordEncrypted,
          url: this.form.url || undefined,
          notesEncrypted: encryptedData.notesEncrypted,
          customFields: {
            tags: this.form.tags,
            icon: this.form.icon
          },
          favorite: false
        }

        const response = await passwordEntriesAPI.create(requestData)
        console.log('密码创建成功:', response)
        return response
      } catch (error) {
        console.error('创建密码条目失败:', error)
        throw error
      }
    },

    generateRandomPassword() {
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

    updateTags() {
      const tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      this.form.tags = [...new Set(tags)]
    },

    removeTag(index: number) {
      this.form.tags.splice(index, 1)
      this.tagsInput = this.form.tags.join(', ')
    },

    async loadCategories() {
      if (!this.userId || isNaN(Number(this.userId))) {
        console.warn('用户ID无效，无法加载分类')
        return
      }

      const userIdNum = Number(this.userId)
      this.isLoadingCategories = true

      try {
        const response = await categoriesAPI.getAll()
        console.log('分类API响应:', response)
        
        if (response.code === 1 && response.data) {
          this.categories = response.data
          console.log('分类加载成功:', this.categories)
        } else {
          console.warn('分类API返回异常:', response)
          this.setDefaultCategories(userIdNum)
        }
      } catch (error) {
        console.error('加载分类列表失败:', error)
        this.setDefaultCategories(userIdNum)
      } finally {
        this.isLoadingCategories = false
      }
    },

    handleCategoryChange(category: Category) {
      console.log('分类选择变化:', category)
    },

    setDefaultCategories(userIdNum: number) {
      this.categories = [
        { id: 1, userId: userIdNum, name: '其他' },
        { id: 2, userId: userIdNum, name: '社交媒体' },
        { id: 3, userId: userIdNum, name: '邮箱服务' },
        { id: 4, userId: userIdNum, name: '金融服务' },
        { id: 5, userId: userIdNum, name: '开发工具' },
        { id: 6, userId: userIdNum, name: '购物网站' },
        { id: 7, userId: userIdNum, name: '娱乐平台' },
        { id: 8, userId: userIdNum, name: '工作相关' }
      ]
      console.log('使用默认分类:', this.categories)
    },

    getCategoryIcon(categoryId: number) {
      const icons = ['📁', '💬', '📧', '💰', '💻', '🛒', '🎵', '🔧']
      
      if (this.categoryIconMap[categoryId]) {
        return this.categoryIconMap[categoryId]
      }
      
      const index = categoryId - 1
      if (index >= 0 && index < icons.length) {
        return icons[index]
      }
      
      return '📁'
    },

    getSelectedCategoryName() {
      if (!this.form.categoryId) return ''
      
      const selectedCategory = this.categories.find(cat => cat.id === this.form.categoryId)
      return selectedCategory ? selectedCategory.name : ''
    }
  },

  async mounted() {
    console.log('AddPasswordModal mounted, 开始加载分类')
    console.log('当前用户ID:', this.userId)
    await this.loadCategories()
    console.log('分类加载完成，当前分类数量:', this.categories.length)
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

.modal-container {
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

.modal-container::before {
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
  align-items: center;
  gap: var(--spacing-lg);
  padding: 24px 32px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid var(--gray-200);
  position: relative;
  z-index: 10;
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
  min-height: 300px;
}

.form-content {
  padding: 32px;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) var(--gray-100);
}

.form-content::-webkit-scrollbar {
  width: 8px;
}

.form-content::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: var(--radius-sm);
}

.form-content::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: var(--radius-sm);
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
  gap: 8px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--gray-700);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
}

.label-text {
  color: var(--gray-700);
}

.required {
  color: var(--error-500);
}

.form-group input,
.form-group select,
.form-group textarea {
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

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--gray-400);
  font-weight: var(--font-normal);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.6;
}

.icon-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
}

.icon-option {
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all var(--transition-normal);
}

.icon-option:hover {
  border-color: var(--primary-500);
  background: var(--primary-50);
  transform: scale(1.1);
}

.icon-option.active {
  border-color: var(--primary-500);
  background: var(--gradient-primary);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  padding-right: 100px;
}

.password-toggle,
.generate-btn {
  position: absolute;
  right: 8px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  padding: 8px;
  transition: all var(--transition-normal);
  width: 40px;
  height: 40px;
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

.password-strength {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
}

.strength-bar {
  flex: 1;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.4s ease, background-color 0.4s ease;
  border-radius: var(--radius-full);
  position: relative;
}

.strength-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.strength-fill.weak {
  background: var(--gradient-error);
}

.strength-fill.medium {
  background: var(--gradient-warning);
}

.strength-fill.strong {
  background: var(--gradient-success);
}

.strength-fill.very-strong {
  background: var(--gradient-primary);
}

.strength-text {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--gray-600);
  white-space: nowrap;
}

.tags-display {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
}

.tag {
  background: var(--gradient-primary);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-normal);
}

.tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.tag-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: all var(--transition-normal);
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.2);
}

.tag-remove svg {
  width: 10px;
  height: 10px;
  stroke-width: 3;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 32px;
  border-top: 1px solid var(--gray-200);
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  position: relative;
  z-index: 10;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  min-width: 100px;
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

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-md);
  }

  .modal-container {
    max-height: 90vh;
  }

  .modal-header,
  .form-content,
  .form-actions {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .section-header h4 {
    font-size: 0.9rem;
  }

  .modal-header h3 {
    font-size: 1.125rem;
  }

  .icon-options {
    gap: 8px;
    padding: 12px;
  }

  .icon-option {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  .password-strength {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .strength-text {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
