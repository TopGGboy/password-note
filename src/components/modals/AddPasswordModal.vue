<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>添加新密码</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="password-form">
        <!-- 表单内容区域 -->
        <div class="form-content">
          <!-- 基本信息 -->
          <div class="form-section">
            <h4>📋 基本信息</h4>

            <div class="form-group">
              <label for="title" data-required="*">网站/应用名称</label>
              <input id="title" v-model="form.title" type="text" placeholder="例如：GitHub、微信、支付宝" required />
            </div>

            <div class="form-group">
              <label for="url">网站地址</label>
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
              <label for="icon">图标</label>
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

          <!-- 登录信息 -->
          <div class="form-section">
            <h4>🔑 登录信息</h4>

            <div class="form-group">
              <label for="username" data-required="*">用户名/邮箱</label>
              <input id="username" v-model="form.username" type="text" placeholder="用户名或邮箱地址" required />
            </div>

            <div class="form-group">
              <label for="password" data-required="*">密码</label>
              <div class="password-input-group">
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="输入密码"
                  required />
                <button type="button" @click="showPassword = !showPassword" class="password-toggle" title="显示/隐藏密码">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button type="button" @click="generateRandomPassword" class="generate-btn" title="生成随机密码">
                  🎲
                </button>
              </div>

              <!-- 密码强度指示器 -->
              <div class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" :class="passwordStrength.level"
                    :style="{ width: passwordStrength.percentage + '%' }"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </div>
          </div>

          <!-- 附加信息 -->
          <div class="form-section">
            <h4>📝 附加信息</h4>

            <div class="form-group">
              <label for="notes">备注</label>
              <textarea id="notes" v-model="form.notes" placeholder="添加备注信息（可选）" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label for="tags">标签</label>
              <input id="tags" v-model="tagsInput" type="text" placeholder="输入标签，用逗号分隔" @input="updateTags" />
              <div class="tags-display" v-if="form.tags.length > 0">
                <span v-for="(tag, index) in form.tags" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeTag(index)" class="tag-remove" title="移除标签">
                    ✕
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            <span>取消</span>
          </button>
          <button type="submit" :disabled="!isFormValid" class="submit-btn">
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
        categoryId: '', // 保持为字符串类型以匹配select的空值
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

      // 分类ID到图标的映射（默认图标）
      categoryIconMap: {
        1: '📁', // 其他
        2: '💬', // 社交媒体
        3: '📧', // 邮箱服务
        4: '💰', // 金融服务
        5: '💻', // 开发工具
        6: '🛒', // 购物网站
        7: '🎵', // 娱乐平台
        8: '🔧'  // 工作相关
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
        this.form.categoryId !== '' && // 修复验证逻辑
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

      // 长度检查
      if (password.length >= 8) score += 1
      else feedback.push('至少8位')

      if (password.length >= 12) score += 1

      // 字符类型检查
      if (/[a-z]/.test(password)) score += 1
      else feedback.push('小写字母')

      if (/[A-Z]/.test(password)) score += 1
      else feedback.push('大写字母')

      if (/d/.test(password)) score += 1
      else feedback.push('数字')

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      else feedback.push('特殊字符')

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
        // 调用真实API
        const response = await this.savePassword()

        // 发送成功事件，传递创建的密码数据
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

        // 触发自定义事件，通知密码列表刷新
        window.dispatchEvent(new CustomEvent('passwordEntryAdded'))

        // 关闭模态框
        this.$emit('close')

        // 显示成功提示
        console.log('密码保存成功')
      } catch (error: any) {
        console.error('保存密码失败:', error)

        // 根据错误类型显示不同的提示信息
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
      // 检查是否有加密密钥
      if (!KeyManager.hasKey()) {
        // 触发需要主密码的事件，让父组件处理
        this.$emit('requireMasterPassword')
        throw new Error('未找到加密密钥，请先设置主密码')
      }

      try {
        // 加密敏感数据
        const encryptedData = DataEncryptionService.encryptPasswordEntry({
          username: this.form.username,
          password: this.form.password,
          notes: this.form.notes || '',
          customFields: this.form.tags.map(tag => ({
            name: 'tag',
            value: tag
          }))
        })

        // 构建API请求数据
        const requestData: CreatePasswordEntryRequest = {
          categoryId: typeof this.form.categoryId === 'number' ? this.form.categoryId : undefined,
          title: this.form.title, // 标题不加密，便于搜索和显示
          usernameEncrypted: encryptedData.usernameEncrypted,
          passwordEncrypted: encryptedData.passwordEncrypted,
          url: this.form.url || undefined,
          notesEncrypted: encryptedData.notesEncrypted,
          customFields: {
            tags: this.form.tags,
            icon: this.form.icon // 将图标存储在自定义字段中
          },
          favorite: false
        }

        // 调用真实API
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

      // 确保包含各种字符类型
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
      password += '0123456789'[Math.floor(Math.random() * 10)]
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)]

      // 填充剩余长度
      for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }

      // 打乱字符顺序
      this.form.password = password.split('').sort(() => Math.random() - 0.5).join('')
    },

    updateTags() {
      const tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      this.form.tags = [...new Set(tags)] // 去重
    },

    removeTag(index: number) {
      this.form.tags.splice(index, 1)
      this.tagsInput = this.form.tags.join(', ')
    },

    // 加载分类列表
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
        
        // 修复：检查code为1而不是200
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

    // 处理分类选择变化
    handleCategoryChange(category: Category) {
      console.log('分类选择变化:', category)
      // 可以在这里添加额外的逻辑，比如更新图标等
    },

    // 设置默认分类
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

    // 获取分类图标
    getCategoryIcon(categoryId: number) {
      // 修复图标获取逻辑
      const icons = ['📁', '💬', '📧', '💰', '💻', '🛒', '🎵', '🔧']
      
      // 首先检查映射表
      if (this.categoryIconMap[categoryId]) {
        return this.categoryIconMap[categoryId]
      }
      
      // 然后根据ID索引获取图标（减1因为ID从1开始但数组从0开始）
      const index = categoryId - 1
      if (index >= 0 && index < icons.length) {
        return icons[index]
      }
      
      // 默认图标
      return '📁'
    },

    // 获取选中分类的名称
    getSelectedCategoryName() {
      if (!this.form.categoryId) return ''
      
      const selectedCategory = this.categories.find(cat => cat.id === this.form.categoryId)
      return selectedCategory ? selectedCategory.name : ''
    }
  },

  async mounted() {
    // 组件挂载时加载分类列表
    console.log('AddPasswordModal mounted, 开始加载分类')
    console.log('当前用户ID:', this.userId)
    await this.loadCategories()
    console.log('分类加载完成，当前分类数量:', this.categories.length)
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

/* 模态框遮罩层 */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 模态框容器 */
.modal-container {
  background: #ffffff;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-sizing: border-box;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 模态框头部 */
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

/* 标题样式 */
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

/* 关闭按钮 */
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

/* 表单容器 */
.password-form {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* 表单内容区域 - 包含滚动 */
.form-content {
  padding: 32px;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-tertiary);
}

.form-content::-webkit-scrollbar {
  width: 8px;
}

.form-content::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.form-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
}

.form-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* 表单区域 */
.form-section {
  margin-bottom: 40px;
}

/* 区域标题 */
.form-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表单组 */
.form-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 表单标签 */
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

/* 表单输入框 */
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 400;
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

/* 输入框聚焦状态 */
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  background: var(--bg-primary);
  transform: translateY(-1px);
}

/* 文本域样式 */
.form-group textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.6;
}

/* 图标选择器 */
.icon-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 图标选项容器 */
.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

/* 图标选项 */
.icon-option {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

/* 图标选项悬停状态 */
.icon-option:hover {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

/* 选中的图标选项 */
.icon-option.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* 密码输入组 */
.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

/* 密码输入框 */
.password-input-group input {
  padding-right: 110px;
}

/* 密码切换按钮 */
.password-toggle,
.generate-btn {
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

/* 密码切换按钮位置 */
.password-toggle {
  right: 68px;
}

/* 生成密码按钮位置 */
.generate-btn {
  right: 12px;
}

/* 按钮悬停状态 */
.password-toggle:hover,
.generate-btn:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

/* 强度条 */
.strength-bar {
  flex: 1;
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 强度填充 */
.strength-fill {
  height: 100%;
  transition: width 0.4s ease, background-color 0.4s ease;
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
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
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 不同强度的颜色 */
.strength-fill.weak {
  background: var(--error-color);
}

.strength-fill.medium {
  background: var(--warning-color);
}

.strength-fill.strong {
  background: var(--success-color);
}

.strength-fill.very-strong {
  background: var(--primary-color);
}

/* 强度文本 */
.strength-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 标签显示 */
.tags-display {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

/* 标签样式 */
.tag {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

/* 标签悬停 */
.tag:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

/* 标签移除按钮 */
.tag-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

/* 标签移除按钮悬停 */
.tag-remove:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.2);
}

/* 表单操作按钮 */
.form-actions {
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

/* 取消按钮 */
.cancel-btn {
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
}

/* 取消按钮悬停 */
.cancel-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 提交按钮 */
.submit-btn {
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 提交按钮悬停 */
.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 提交按钮禁用状态 */
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
  /* 调整移动端样式 */
  .modal-overlay {
    padding: 60px 16px 16px;
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

  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
  
  .form-section h4 {
    font-size: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.25rem;
  }
  
  .icon-options {
    gap: 10px;
    padding: 16px;
  }
  
  .icon-option {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .password-strength {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .strength-text {
    justify-content: center;
  }
}

/* 无障碍设计 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :root {
    --border-color: #000000;
    --text-primary: #000000;
    --text-secondary: #000000;
  }
}
</style>