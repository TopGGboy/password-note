<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>添加新密码</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="password-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h4>基本信息</h4>

          <div class="form-group">
            <label for="title">网站/应用名称 *</label>
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
              label="分类 *"
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
          <h4>登录信息</h4>

          <div class="form-group">
            <label for="username">用户名/邮箱 *</label>
            <input id="username" v-model="form.username" type="text" placeholder="用户名或邮箱地址" required />
          </div>

          <div class="form-group">
            <label for="password">密码 *</label>
            <div class="password-input-group">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="输入密码"
                required />
              <button type="button" @click="showPassword = !showPassword" class="password-toggle">
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
          <h4>附加信息</h4>

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
                <button type="button" @click="removeTag(index)" class="tag-remove">
                  ✕
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button type="submit" :disabled="!isFormValid" class="submit-btn">
            {{ isLoading ? '保存中...' : '保存密码' }}
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

      if (/\d/.test(password)) score += 1
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border-radius: var(--radius-2xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border-color);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-500), transparent);
}

.modal-header h3 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.close-btn:hover {
  background: var(--error-50);
  border-color: var(--error-200);
  color: var(--error-600);
  transform: scale(1.1);
}

.password-form {
  padding: 0 24px 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
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
  gap: 16px;
}

.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.icon-option {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.icon-option:hover {
  border-color: var(--primary-300);
  background: var(--primary-50);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.icon-option.active {
  border-color: var(--primary-500);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  transform: scale(1.2);
  box-shadow: var(--shadow-lg);
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
  right: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle {
  right: 60px;
}

.generate-btn {
  right: 12px;
}

.password-toggle:hover,
.generate-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.password-strength {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.strength-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: var(--shadow-inset);
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.strength-fill.weak {
  background: linear-gradient(90deg, var(--error-500), var(--error-700));
}

.strength-fill.medium {
  background: linear-gradient(90deg, var(--warning-500), var(--warning-700));
}

.strength-fill.strong {
  background: linear-gradient(90deg, var(--success-500), var(--success-700));
}

.strength-fill.very-strong {
  background: linear-gradient(90deg, var(--primary-500), var(--primary-700));
}

.strength-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.tags-display {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.tag {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.tag:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.tag-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.2);
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 2px solid var(--border-color);
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  padding: 14px 32px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-300);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: 2px solid var(--primary-500);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border-color: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header,
  .password-form {
    padding-left: 16px;
    padding-right: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
  
  .form-section h4 {
    font-size: 18px;
  }
  
  .modal-header h3 {
    font-size: 24px;
  }
}
</style>