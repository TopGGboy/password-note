<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑密码' : '添加密码' }}</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label>网站名称 *</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="form-input"
            placeholder="例如：Google"
          />
        </div>

        <div class="form-group">
          <label>网站地址</label>
          <input
            v-model="form.url"
            type="url"
            class="form-input"
            placeholder="https://example.com"
          />
        </div>

        <div class="form-group">
          <label>用户名/邮箱 *</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="form-input"
            placeholder="用户名或邮箱地址"
          />
        </div>

        <div class="form-group">
          <label>密码 *</label>
          <div class="password-input-group">
            <input
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
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
            <button
              type="button"
              @click="generatePassword"
              class="generate-password"
            >
              🎲
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>分类</label>
          <select v-model="form.category" class="form-select">
            <option value="">选择分类</option>
            <option value="社交媒体">社交媒体</option>
            <option value="邮箱">邮箱</option>
            <option value="购物">购物</option>
            <option value="银行">银行</option>
            <option value="工作">工作</option>
            <option value="娱乐">娱乐</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>备注</label>
          <textarea
            v-model="form.notes"
            class="form-textarea"
            rows="3"
            placeholder="添加备注信息..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading"
          >
            {{ loading ? '保存中...' : (isEdit ? '更新' : '添加') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface PasswordItem {
  id?: string
  title: string
  url: string
  username: string
  password: string
  category: string
  notes: string
  createdAt?: Date
  updatedAt?: Date
}

export default defineComponent({
  name: 'EditPasswordModal',
  props: {
    password: {
      type: Object as PropType<PasswordItem>,
      default: null
    }
  },
  emits: ['close', 'success'],
  data() {
    return {
      loading: false,
      showPassword: false,
      form: {
        title: '',
        url: '',
        username: '',
        password: '',
        category: '',
        notes: ''
      } as PasswordItem
    }
  },
  computed: {
    isEdit(): boolean {
      return !!this.password
    }
  },
  mounted() {
    if (this.password) {
      this.form = { ...this.password }
    }
  },
  methods: {
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
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log(this.isEdit ? '更新密码:' : '添加密码:', this.form)
        
        this.$emit('success', {
          ...this.form,
          id: this.form.id || Date.now().toString(),
          createdAt: this.form.createdAt || new Date(),
          updatedAt: new Date()
        })
        this.$emit('close')
      } catch (error) {
        console.error('保存失败:', error)
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

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3182ce;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group .form-input {
  padding-right: 80px;
}

.toggle-password,
.generate-password {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  color: #718096;
}

.toggle-password {
  right: 40px;
}

.generate-password {
  right: 8px;
}

.toggle-password:hover,
.generate-password:hover {
  color: #2d3748;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
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
  color: white;
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