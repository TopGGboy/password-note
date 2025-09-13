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
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="例如：GitHub、微信、支付宝"
              required
            />
          </div>

          <div class="form-group">
            <label for="url">网站地址</label>
            <input
              id="url"
              v-model="form.url"
              type="url"
              placeholder="https://example.com"
            />
          </div>

          <div class="form-group">
            <label for="category">分类 *</label>
            <select id="category" v-model="form.category" required>
              <option value="">请选择分类</option>
              <option value="社交媒体">社交媒体</option>
              <option value="邮箱服务">邮箱服务</option>
              <option value="金融服务">金融服务</option>
              <option value="开发工具">开发工具</option>
              <option value="购物网站">购物网站</option>
              <option value="娱乐平台">娱乐平台</option>
              <option value="工作相关">工作相关</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="form-group">
            <label for="icon">图标</label>
            <div class="icon-selector">
              <input
                id="icon"
                v-model="form.icon"
                type="text"
                placeholder="选择一个表情符号"
                maxlength="2"
              />
              <div class="icon-options">
                <button
                  v-for="icon in commonIcons"
                  :key="icon"
                  type="button"
                  @click="form.icon = icon"
                  class="icon-option"
                  :class="{ active: form.icon === icon }"
                >
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
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="用户名或邮箱地址"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">密码 *</label>
            <div class="password-input-group">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="输入密码"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
              <button
                type="button"
                @click="generateRandomPassword"
                class="generate-btn"
                title="生成随机密码"
              >
                🎲
              </button>
            </div>
            
            <!-- 密码强度指示器 -->
            <div class="password-strength">
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
        </div>

        <!-- 附加信息 -->
        <div class="form-section">
          <h4>附加信息</h4>
          
          <div class="form-group">
            <label for="notes">备注</label>
            <textarea
              id="notes"
              v-model="form.notes"
              placeholder="添加备注信息（可选）"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tags">标签</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="输入标签，用逗号分隔"
              @input="updateTags"
            />
            <div class="tags-display" v-if="form.tags.length > 0">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="tag"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="tag-remove"
                >
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
import { passwordEntriesAPI } from '../services/api'
import type { CreatePasswordEntryRequest } from '../types/api'

interface PasswordForm {
  title: string
  url: string
  category: string
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
  emits: ['close', 'success'],
  data() {
    return {
      isLoading: false,
      showPassword: false,
      tagsInput: '',
      
      form: {
        title: '',
        url: '',
        category: '',
        icon: '🔐',
        username: '',
        password: '',
        notes: '',
        tags: []
      } as PasswordForm,
      
      commonIcons: [
        '🔐', '🌐', '📧', '💬', '🛒', '🎵', '📺', '🎮',
        '💰', '🏦', '📱', '💻', '🔧', '📊', '📝', '🎯'
      ]
    }
  },
  computed: {
    isFormValid(): boolean {
      return !!(
        this.form.title.trim() &&
        this.form.category &&
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
          ...this.form,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsed: new Date()
        })
        
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
      // 分类名称到ID的映射（临时方案，实际应该从API获取）
      const categoryMap: Record<string, number> = {
        '社交媒体': 1,
        '邮箱服务': 2,
        '金融服务': 3,
        '开发工具': 4,
        '购物网站': 5,
        '娱乐平台': 6,
        '工作相关': 7,
        '其他': 8
      }
      
      // 构建API请求数据
      const requestData: CreatePasswordEntryRequest = {
        categoryId: categoryMap[this.form.category] || 8, // 默认为"其他"
        title: this.form.title,
        usernameEncrypted: this.form.username,
        passwordEncrypted: this.form.password,
        url: this.form.url || '',
        notesEncrypted: this.form.notes || '',
        favorite: false
      }
      
      try {
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4a5568;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.password-form {
  padding: 0 24px 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3182ce;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.icon-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #cbd5e0;
  background: #edf2f7;
}

.icon-option.active {
  border-color: #3182ce;
  background: #ebf8ff;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  padding-right: 80px;
}

.password-toggle,
.generate-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.password-toggle {
  right: 40px;
}

.generate-btn {
  right: 8px;
}

.password-toggle:hover,
.generate-btn:hover {
  background: #f7fafc;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
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
}

.tags-display {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #ebf8ff;
  color: #3182ce;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-remove {
  background: none;
  border: none;
  color: #3182ce;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  background: #3182ce;
  color: white;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.submit-btn {
  background: #3182ce;
  color: white;
  border: 2px solid #3182ce;
}

.submit-btn:hover:not(:disabled) {
  background: #2c5282;
  border-color: #2c5282;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
}
</style>