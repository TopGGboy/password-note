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
          <select v-model="form.categoryId" class="form-select">
            <option :value="undefined">选择分类</option>
            <option :value="1">社交媒体</option>
            <option :value="2">邮箱</option>
            <option :value="3">购物</option>
            <option :value="4">银行</option>
            <option :value="5">工作</option>
            <option :value="6">娱乐</option>
            <option :value="7">其他</option>
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
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import { DataEncryptionService, KeyManager } from '../../utils/encryption/crypto'
import { passwordEntriesAPI } from '../../services/api'
import type { CreatePasswordEntryRequest } from '../../types/api'

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
  mounted() {
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