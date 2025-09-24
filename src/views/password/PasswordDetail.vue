<template>
  <div class="password-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载密码详情...</p>
    </div>

    <!-- 主要内容 -->
    <div v-else class="main-content">
      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <router-link to="/dashboard" class="breadcrumb-item">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          首页
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <router-link to="/passwords" class="breadcrumb-item">密码管理</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ password?.title || '密码详情' }}</span>
      </nav>

      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <button @click="goBack" class="back-button">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回
          </button>
          <div class="page-title">
            <h1>密码详情</h1>
            <p v-if="password">查看和管理 "{{ password.title }}" 的详细信息</p>
          </div>
        </div>
        
        <div v-if="password" class="header-actions">
          <button @click="editPassword" class="action-btn edit-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑
          </button>
          <button @click="deletePassword" class="action-btn delete-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
            </svg>
            删除
          </button>
        </div>
      </div>

      <!-- 密码卡片 -->
      <div v-if="password" class="password-card">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="site-info">
            <div class="site-avatar">
              <div class="avatar-icon">{{ getInitials(password.title) }}</div>
            </div>
            <div class="site-details">
              <h2>{{ password.title }}</h2>
              <a v-if="password.url" :href="password.url" target="_blank" class="site-url">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                {{ formatUrl(password.url) }}
              </a>
            </div>
          </div>
          
          <div class="password-strength-card">
            <div class="strength-label">密码强度</div>
            <div class="strength-indicator" :class="passwordStrength.level">
              <div class="strength-fill" :style="{ width: passwordStrength.percentage + '%' }"></div>
            </div>
            <div class="strength-text">{{ passwordStrength.text }}</div>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-body">
          <!-- 主要信息 -->
          <div class="info-grid">
            <div class="info-card">
              <div class="info-header">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>用户名/邮箱</span>
              </div>
              <div class="info-content">
                <span class="info-text">{{ password.username || '未设置' }}</span>
                <button 
                  v-if="password.username" 
                  @click="copyToClipboard(password.username, '用户名')" 
                  class="copy-button"
                  :class="{ 'copied': copiedField === 'username' }"
                >
                  <svg v-if="copiedField !== 'username'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="info-card">
              <div class="info-header">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>密码</span>
              </div>
              <div class="info-content">
                <span class="password-text" :class="{ 'hidden': !showPassword }">
                  {{ showPassword ? password.password : '••••••••••••' }}
                </span>
                <div class="password-actions">
                  <button @click="togglePasswordVisibility" class="action-button">
                    <svg v-if="!showPassword" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                  <button 
                    @click="copyToClipboard(password.password, '密码')" 
                    class="copy-button"
                    :class="{ 'copied': copiedField === 'password' }"
                  >
                    <svg v-if="copiedField !== 'password'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="password.category" class="info-card">
              <div class="info-header">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span>分类</span>
              </div>
              <div class="info-content">
                <span class="category-badge">{{ password.category }}</span>
              </div>
            </div>

            <div v-if="password.notes" class="info-card notes-card">
              <div class="info-header">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span>备注</span>
              </div>
              <div class="info-content">
                <p class="notes-text">{{ password.notes }}</p>
              </div>
            </div>
          </div>

          <!-- 元数据信息 -->
          <div class="metadata-section">
            <h3>记录信息</h3>
            <div class="metadata-grid">
              <div class="metadata-item">
                <div class="metadata-label">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  创建时间
                </div>
                <div class="metadata-value">{{ formatDate(password.createdAt) }}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  最后更新
                </div>
                <div class="metadata-value">{{ formatDate(password.updatedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未找到状态 -->
      <div v-else-if="!loading" class="not-found-container">
        <div class="not-found-content">
          <div class="not-found-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <h2>密码记录未找到</h2>
          <p>抱歉，我们找不到您要查看的密码记录。可能是链接有误或记录已被删除。</p>
          <div class="not-found-actions">
            <button @click="goBack" class="primary-btn">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              返回上一页
            </button>
            <router-link to="/passwords" class="secondary-btn">
              查看所有密码
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <svg v-if="toastType === 'success'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        <svg v-else-if="toastType === 'error'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- 确认删除对话框 -->
    <Transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
        <div class="confirm-dialog" @click.stop>
          <div class="confirm-header">
            <div class="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3>确认删除</h3>
          </div>
          <div class="confirm-body">
            <p>您确定要删除密码 <strong>"{{ password?.title }}"</strong> 吗？</p>
            <p class="warning-text">此操作无法撤销，请谨慎操作。</p>
          </div>
          <div class="confirm-actions">
            <button @click="showDeleteConfirm = false" class="cancel-btn">取消</button>
            <button @click="confirmDelete" class="danger-btn" :disabled="deleting">
              <span v-if="deleting">删除中...</span>
              <span v-else>确认删除</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 编辑模态框 -->
    <EditPasswordModal
      v-if="showEditModal && password"
      :entry="password"
      @close="showEditModal = false"
      @success="handlePasswordUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// 状态管理
const loading = ref(true)
const showPassword = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const password = ref<PasswordItem | null>(null)

// 提示相关
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const copiedField = ref<string | null>(null)

let toastTimer: NodeJS.Timeout | null = null
let copiedTimer: NodeJS.Timeout | null = null

// 计算属性
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

// 工具函数
const getInitials = (title: string): string => {
  return title.charAt(0).toUpperCase()
}

const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 主要功能函数
const loadPassword = async () => {
  loading.value = true
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
    showToastMessage('加载密码详情失败', 'error')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

const editPassword = () => {
  showEditModal.value = true
}

const deletePassword = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!password.value) return
  
  deleting.value = true
  try {
    // 这里应该调用真实的删除API
    await passwordEntriesAPI.delete(password.value.id)
    showToastMessage('密码已成功删除')
    setTimeout(() => {
      router.push('/passwords')
    }, 1500)
  } catch (error) {
    console.error('删除密码失败:', error)
    showToastMessage('删除密码失败，请重试', 'error')
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const copyToClipboard = async (text: string, fieldName: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = fieldName.toLowerCase()
    showToastMessage(`${fieldName}已复制到剪贴板`)
    
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    showToastMessage('复制失败，请手动复制', 'error')
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
  showToastMessage('密码信息已更新')
}

// 生命周期
onMounted(async () => {
  await loadPassword()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<style scoped>
/* 基础样式 */
.password-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 面包屑导航 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #3b82f6;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 500;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-title h1 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.page-title p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.edit-btn:hover {
  background: #bfdbfe;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

/* 密码卡片 */
.password-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.card-header {
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.site-avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.avatar-icon {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.site-details h2 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.site-url {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  transition: color 0.2s;
}

.site-url:hover {
  color: white;
}

.password-strength-card {
  text-align: right;
}

.strength-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.strength-indicator {
  width: 120px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 4px;
}

.strength-indicator.weak .strength-fill {
  background: #ef4444;
}

.strength-indicator.medium .strength-fill {
  background: #f59e0b;
}

.strength-indicator.strong .strength-fill {
  background: #10b981;
}

.strength-text {
  font-size: 16px;
  font-weight: 600;
}

/* 卡片内容 */
.card-body {
  padding: 40px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
}

.info-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notes-card {
  grid-column: 1 / -1;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #475569;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.info-text {
  font-size: 16px;
  color: #1e293b;
  flex: 1;
  word-break: break-all;
}

.password-text {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 16px;
  color: #1e293b;
  flex: 1;
  letter-spacing: 1px;
}

.password-text.hidden {
  letter-spacing: 2px;
}

.password-actions {
  display: flex;
  gap: 8px;
}

.action-button,
.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s;
}

.action-button:hover,
.copy-button:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.copy-button.copied {
  color: #10b981;
  background: #dcfce7;
}

.category-badge {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
  color: #065f46;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.notes-text {
  line-height: 1.6;
  color: #475569;
  white-space: pre-wrap;
}

/* 元数据部分 */
.metadata-section {
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.metadata-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.metadata-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.metadata-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  font-size: 14px;
}

.metadata-value {
  color: #1e293b;
  font-size: 16px;
}

/* 未找到状态 */
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.not-found-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: #94a3b8;
}

.not-found-icon svg {
  width: 100%;
  height: 100%;
}

.not-found-content h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #1e293b;
}

.not-found-content p {
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.primary-btn {
  background: #3b82f6;
  color: white;
}

.primary-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.secondary-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.secondary-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* 提示消息 */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  min-width: 300px;
}

.toast.success {
  border-color: #10b981;
  color: #065f46;
}

.toast.success .icon {
  color: #10b981;
}

.toast.error {
  border-color: #ef4444;
  color: #991b1b;
}

.toast.error .icon {
  color: #ef4444;
}

/* 确认对话框 */
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
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.confirm-header {
  text-align: center;
  margin-bottom: 24px;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #ef4444;
}

.confirm-icon svg {
  width: 100%;
  height: 100%;
}

.confirm-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1e293b;
}

.confirm-body {
  margin-bottom: 32px;
  text-align: center;
}

.confirm-body p {
  margin: 0 0 8px 0;
  color: #475569;
  line-height: 1.6;
}

.warning-text {
  color: #dc2626;
  font-size: 14px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn,
.danger-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.danger-btn {
  background: #dc2626;
  color: white;
}

.danger-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-dialog,
.modal-leave-to .confirm-dialog {
  transform: scale(0.9) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 32px 24px;
  }
  
  .card-body {
    padding: 24px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .info-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .password-actions {
    align-self: flex-end;
  }
  
  .not-found-actions {
    flex-direction: column;
  }
  
  .toast {
    right: 16px;
    left: 16px;
    min-width: auto;
  }
  
  .confirm-dialog {
    margin: 16px;
    width: auto;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    font-size: 12px;
  }
  
  .page-title h1 {
    font-size: 24px;
  }
  
  .site-details h2 {
    font-size: 24px;
  }
  
  .action-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>