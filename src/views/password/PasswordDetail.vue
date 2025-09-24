<template>
  <div class="password-detail-container">
    <div class="detail-header">
      <button @click="goBack" class="back-btn">
        ← 返回
      </button>
      <div class="header-actions">
        <button @click="editPassword" class="edit-btn">
          ✏️ 编辑
        </button>
        <button @click="deletePassword" class="delete-btn">
          🗑️ 删除
        </button>
      </div>
    </div>

    <div v-if="password" class="password-card">
      <div class="card-header">
        <div class="site-info">
          <div class="site-icon">🔐</div>
          <div class="site-details">
            <h1>{{ password.title }}</h1>
            <a v-if="password.url" :href="password.url" target="_blank" class="site-url">
              {{ password.url }}
            </a>
          </div>
        </div>
        <div class="password-strength">
          <div class="strength-indicator" :class="passwordStrength.level">
            <div class="strength-bar" :style="{ width: passwordStrength.percentage + '%' }"></div>
          </div>
          <span class="strength-text">{{ passwordStrength.text }}</span>
        </div>
      </div>

      <div class="card-content">
        <div class="info-section">
          <div class="info-item">
            <label>用户名/邮箱</label>
            <div class="info-value">
              <span>{{ password.username }}</span>
              <button @click="copyToClipboard(password.username)" class="copy-btn">
                📋
              </button>
            </div>
          </div>

          <div class="info-item">
            <label>密码</label>
            <div class="info-value">
              <span :class="{ 'password-hidden': !showPassword }">
                {{ showPassword ? password.password : '••••••••••••' }}
              </span>
              <div class="password-actions">
                <button @click="showPassword = !showPassword" class="toggle-btn">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button @click="copyToClipboard(password.password)" class="copy-btn">
                  📋
                </button>
              </div>
            </div>
          </div>

          <div v-if="password.category" class="info-item">
            <label>分类</label>
            <div class="info-value">
              <span class="category-tag">{{ password.category }}</span>
            </div>
          </div>

          <div v-if="password.notes" class="info-item">
            <label>备注</label>
            <div class="info-value">
              <span class="notes-text">{{ password.notes }}</span>
            </div>
          </div>
        </div>

        <div class="meta-section">
          <div class="meta-item">
            <label>创建时间</label>
            <span>{{ formatDate(password.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <label>最后更新</label>
            <span>{{ formatDate(password.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>密码记录未找到</h2>
      <p>请检查链接是否正确，或返回密码列表。</p>
      <button @click="goBack" class="back-btn">返回列表</button>
    </div>

    <!-- 编辑模态框 -->
    <EditPasswordModal
      v-if="showEditModal"
      :entry="password"
      @close="showEditModal = false"
      @success="handlePasswordUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditPasswordModal from '../../components/modals/EditPasswordModal.vue'
import { KeyManager } from '../../utils/encryption/crypto'
import { tokenManager } from '../../utils/auth/tokenManager'
import { passwordEntriesAPI } from '../../services/api'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'

// 使用与 Passwords.vue 相同的类型定义
type PasswordItem = DecryptedPasswordEntry & {
  category: string
}

interface PasswordStrength {
  level: string
  percentage: number
  text: string
}

const route = useRoute()
const router = useRouter()

const showPassword = ref(false)
const showEditModal = ref(false)
const password = ref<PasswordItem | null>(null)

const passwordStrength = computed((): PasswordStrength => {
  if (!password.value) return { level: 'weak', percentage: 0, text: '未知' }
  
  const pwd = password.value.password
  let score = 0
  
  if (pwd.length >= 8) score += 25
  if (/\d/.test(pwd)) score += 25
  if (/[a-z]/.test(pwd)) score += 25
  if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25
  
  let level = 'weak'
  let text = '弱'
  
  if (score >= 75) {
    level = 'strong'
    text = '强'
  } else if (score >= 50) {
    level = 'medium'
    text = '中等'
  }
  
  return { level, percentage: score, text }
})

const loadPassword = async () => {
  const id = route.params.id as string
  
  try {
    // 首先检查用户是否已登录（有有效的API token）
    if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
      console.log('🚫 用户未登录或token已过期，跳转到登录页面')
      router.push('/login')
      return
    }

    // 检查是否已有加密密钥（用户是否已通过主密码验证）
    if (!KeyManager.hasKey()) {
      // 如果没有密钥，跳转回密码列表页面，让用户重新验证主密码
      console.warn('未找到加密密钥，跳转回密码列表')
      router.push('/passwords')
      return
    }
    
    // 调用真实的API获取密码详情
    const response = await passwordEntriesAPI.getById(parseInt(id))
    
    if (response.code === 200 && response.data) {
      const entry = response.data
      
      // 使用与 usePasswordEntries 相同的解密逻辑
      const { DataEncryptionService } = await import('../../utils/encryption/crypto')
      
      const decryptedData = DataEncryptionService.decryptPasswordEntry({
        usernameEncrypted: entry.usernameEncrypted,
        passwordEncrypted: entry.passwordEncrypted,
        notesEncrypted: entry.notesEncrypted || '',
        customFieldsEncrypted: []
      })
      
      // 构造符合 PasswordItem 类型的对象
      password.value = {
        ...entry,
        username: decryptedData.username,
        password: decryptedData.password,
        notes: decryptedData.notes,
        category: '其他', // 这里需要根据 categoryId 获取分类名称
        icon: '🔐',
        tags: []
      } as PasswordItem
    } else {
      throw new Error(response.msg || '获取密码详情失败')
    }
  } catch (error: any) {
    console.error('加载密码详情失败:', error)
    
    // 检查是否是认证相关的错误
    if (error.message?.includes('未授权') || error.message?.includes('401')) {
      console.log('🚫 认证失败，跳转到登录页面')
      router.push('/login')
      return
    }
    
    // 如果是其他错误（如解密失败），设置为null显示错误页面
    password.value = null
  }
}

const goBack = () => {
  router.go(-1)
}

const editPassword = () => {
  showEditModal.value = true
}

const deletePassword = async () => {
  if (!password.value) return
  
  if (confirm(`确定要删除密码 "${password.value.title}" 吗？此操作无法撤销。`)) {
    try {
      // 模拟API调用
      console.log('删除密码:', password.value.id)
      router.push('/passwords')
    } catch (error) {
      console.error('删除密码失败:', error)
    }
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以显示一个临时的成功提示
    console.log('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const handlePasswordUpdated = (updatedPassword: PasswordItem) => {
  password.value = updatedPassword
  console.log('密码已更新:', updatedPassword)
}

onMounted(async () => {
  await loadPassword()
})
</script>

<style scoped>
.password-detail-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.edit-btn,
.delete-btn {
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn {
  background: #ebf8ff;
  color: #3182ce;
  border: 1px solid #bee3f8;
}

.edit-btn:hover {
  background: #bee3f8;
}

.delete-btn {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.delete-btn:hover {
  background: #feb2b2;
}

.password-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.site-icon {
  font-size: 48px;
  background: rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 12px;
}

.site-details h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.site-url {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
}

.site-url:hover {
  text-decoration: underline;
}

.password-strength {
  text-align: right;
}

.strength-indicator {
  width: 100px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s;
}

.strength-indicator.weak .strength-bar {
  background: #fc8181;
}

.strength-indicator.medium .strength-bar {
  background: #f6ad55;
}

.strength-indicator.strong .strength-bar {
  background: #68d391;
}

.strength-text {
  font-size: 14px;
  opacity: 0.9;
}

.card-content {
  padding: 32px;
}

.info-section {
  margin-bottom: 32px;
}

.info-item {
  margin-bottom: 24px;
}

.info-item label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-value span {
  font-size: 16px;
  color: #2d3748;
  flex: 1;
}

.password-hidden {
  font-family: monospace;
  letter-spacing: 2px;
}

.password-actions {
  display: flex;
  gap: 8px;
}

.copy-btn,
.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  color: #718096;
  transition: color 0.2s;
}

.copy-btn:hover,
.toggle-btn:hover {
  color: #2d3748;
}

.category-tag {
  background: #e6fffa;
  color: #234e52;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.notes-text {
  line-height: 1.6;
  color: #4a5568;
}

.meta-section {
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.meta-item label {
  display: block;
  font-weight: 600;
  color: #718096;
  margin-bottom: 4px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-item span {
  color: #2d3748;
  font-size: 14px;
}

.not-found {
  text-align: center;
  padding: 64px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.not-found h2 {
  margin: 0 0 16px 0;
  color: #2d3748;
}

.not-found p {
  color: #718096;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .password-detail-container {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .meta-section {
    grid-template-columns: 1fr;
  }
  
  .info-value {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .password-actions {
    align-self: flex-end;
  }
}
</style>