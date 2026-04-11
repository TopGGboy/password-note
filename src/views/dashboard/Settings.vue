<template>
  <div class="settings-container">
    <div class="settings-header card">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <div class="title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            设置
          </h1>
          <p class="page-subtitle">管理你的账户信息和安全设置</p>
        </div>
      </div>
    </div>

    <div class="settings-tabs card">
      <button v-for="tab in tabs" :key="tab.id" class="settings-tab" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        <div class="tab-icon">{{ tab.icon }}</div>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="settings-content">
      <div v-if="activeTab === 'profile'" class="settings-section">
        <div class="section-header">
          <h2 class="section-title">个人信息</h2>
          <p class="section-desc">查看和更新你的账户信息</p>
        </div>

        <div class="profile-card card">
          <div class="profile-avatar">
            <div class="avatar" :data-initials="userInitials">{{ userInitials }}</div>
            <button class="btn btn-primary" @click="isEditingProfile = !isEditingProfile">
              {{ isEditingProfile ? '取消' : '编辑' }}
            </button>
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input type="text" class="form-input" v-model="profileForm.username" :disabled="!isEditingProfile" required />
            </div>

            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input type="email" class="form-input" v-model="profileForm.email" :disabled="!isEditingProfile" required />
            </div>

            <div v-if="isEditingProfile" class="form-actions">
              <button type="button" class="btn btn-secondary" @click="isEditingProfile = false">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <div v-if="isLoading" class="loading-spinner"></div>
                {{ isLoading ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>

        <div class="account-info card">
          <h3 class="info-title">账户信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span class="info-label">账户创建时间</span>
              <span class="info-value">{{ formatDate(accountInfo.createdAt) }}</span>
            </div>
            <div class="info-item">
              <div class="info-icon amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <span class="info-label">最后登录时间</span>
              <span class="info-value">{{ formatDate(accountInfo.lastLoginAt) }}</span>
            </div>
            <div class="info-item">
              <div class="info-icon sky">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span class="info-label">账户状态</span>
              <span class="info-value">
                <span class="status-badge active">活跃</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'security'" class="settings-section">
        <div class="section-header">
          <h2 class="section-title">安全设置</h2>
          <p class="section-desc">保护你的账户安全</p>
        </div>

        <div class="security-card card">
          <div class="card-icon teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">修改密码</h3>
            <p class="card-desc">定期更新你的账户密码以增强安全性</p>
          </div>
          <button class="btn btn-primary" @click="showChangePasswordModal = true">修改密码</button>
        </div>

        <div class="security-card card">
          <div class="card-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ hasPin ? '修改 PIN 码' : '设置 PIN 码' }}</h3>
            <p class="card-desc">{{ hasPin ? 'PIN 码用于保护密码库访问' : '设置 PIN 码保护您的密码数据' }}</p>
          </div>
          <button class="btn btn-primary" @click="showPinSettingsModal = true">{{ hasPin ? '修改 PIN 码' : '设置 PIN 码' }}</button>
        </div>



        <div class="security-status card">
          <h3 class="info-title">安全状态</h3>
          <div class="security-stats">
            <div class="security-stat">
              <div class="stat-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="stat-info">
                <div class="stat-value">安全</div>
                <div class="stat-label">账户状态</div>
              </div>
              <div class="stat-indicator safe"></div>
            </div>
            <div class="security-stat">
              <div class="stat-icon amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ hasPin ? '已设置' : '未设置' }}</div>
                <div class="stat-label">PIN 码</div>
              </div>
              <div class="stat-indicator" :class="hasPin ? 'safe' : 'warning'"></div>
            </div>
            <div class="security-stat">
              <div class="stat-icon sky">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div class="stat-info">
                <div class="stat-value">30天前</div>
                <div class="stat-label">密码更新</div>
              </div>
              <div class="stat-indicator warning"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'data'" class="settings-section">
        <div class="section-header">
          <h2 class="section-title">数据管理</h2>
          <p class="section-desc">管理你的密码数据</p>
        </div>

        <div class="data-card card">
          <div class="card-icon teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">导出数据</h3>
            <p class="card-desc">将你的密码数据导出为安全格式</p>
          </div>
          <div class="data-actions">
            <button class="btn btn-secondary">导出为JSON</button>
            <button class="btn btn-secondary">导出为CSV</button>
          </div>
        </div>

        <div class="data-card card">
          <div class="card-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">导入数据</h3>
            <p class="card-desc">从其他密码管理器导入数据</p>
          </div>
          <button class="btn btn-primary">导入数据</button>
        </div>

        <div class="data-card card danger">
          <div class="card-icon rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">清除数据</h3>
            <p class="card-desc danger">永久删除所有本地存储的密码数据</p>
          </div>
          <button class="btn btn-danger">清除所有数据</button>
        </div>
      </div>

      <div v-if="activeTab === 'about'" class="settings-section">
        <div class="section-header">
          <h2 class="section-title">关于</h2>
          <p class="section-desc">了解密码笔记应用</p>
        </div>

        <div class="about-card card">
          <div class="about-logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="logo-text">
              <h3>密码笔记</h3>
              <p class="version">版本 1.0.0</p>
            </div>
          </div>
          
          <p class="about-desc">
            密码笔记是一个安全、私密的密码管理工具，帮助你轻松管理所有的账号和密码。
          </p>

          <div class="about-features">
            <div class="feature-item">
              <div class="feature-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>端到端加密</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <span>本地优先</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon sky">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <span>一键检索</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon rose">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span>分类管理</span>
            </div>
          </div>

          <div class="about-links">
            <a href="#" class="about-link">使用帮助</a>
            <a href="#" class="about-link">隐私政策</a>
            <a href="#" class="about-link">服务条款</a>
            <a href="#" class="about-link">联系我们</a>
          </div>
        </div>
      </div>
    </div>

    <ChangePasswordModal v-if="showChangePasswordModal" @close="showChangePasswordModal = false" @success="handleChangePasswordSuccess" />
    <PinSettingsModal v-if="showPinSettingsModal" @close="showPinSettingsModal = false" @success="handlePinSettingsSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import ChangePasswordModal from '../../components/modals/ChangePasswordModal.vue'
import PinSettingsModal from '../../components/modals/PinSettingsModal.vue'
import { userAPI } from '../../services/api/user'
import { pinManager } from '../../utils/auth/pinManager'

const authStore = useAuthStore()
const activeTab = ref('profile')
const isEditingProfile = ref(false)
const showChangePasswordModal = ref(false)
const showPinSettingsModal = ref(false)
const isLoading = ref(false)
const hasPin = ref(false)

const tabs = [
  { id: 'profile', label: '个人信息', icon: '👤' },
  { id: 'security', label: '安全设置', icon: '🔒' },
  { id: 'data', label: '数据管理', icon: '💾' },
  { id: 'about', label: '关于', icon: 'ℹ️' }
]

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.username) return 'U'
  return user.value.username.charAt(0).toUpperCase()
})

const profileForm = ref({
  username: user.value?.username || '',
  email: user.value?.email || ''
})

const accountInfo = ref({
  createdAt: user.value?.createdAt || new Date().toISOString(),
  lastLoginAt: user.value?.lastLoginAt || new Date().toISOString()
})

const saveProfile = async () => {
  isLoading.value = true
  try {
    console.log('保存个人信息:', profileForm.value)
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (user.value) {
      Object.assign(user.value, profileForm.value)
    }
    isEditingProfile.value = false
    alert('个人信息保存成功！')
  } catch (error) {
    console.error('保存个人信息失败:', error)
    alert('保存失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const handleChangePasswordSuccess = () => {
  showChangePasswordModal.value = false
}

const handlePinSettingsSuccess = () => {
  showPinSettingsModal.value = false
  hasPin.value = pinManager.hasPin()
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    pinManager.setCurrentUser(parseInt(userId))
    hasPin.value = pinManager.hasPin()
  }
  
  try {
    const response = await userAPI.getUserInfo()
    const userInfo = response.data
    profileForm.value = {
      username: userInfo.username || '',
      email: userInfo.email || ''
    }
    accountInfo.value = {
      createdAt: userInfo.createdAt || new Date().toISOString(),
      lastLoginAt: userInfo.lastLoginAt || userInfo.createdAt || new Date().toISOString()
    }
  } catch (error) {
    console.error('获取用户详细信息失败:', error)
    if (user.value) {
      profileForm.value = {
        username: user.value.username || '',
        email: user.value.email || ''
      }
      accountInfo.value = {
        createdAt: user.value.createdAt || new Date().toISOString(),
        lastLoginAt: user.value.lastLoginAt || new Date().toISOString()
      }
    }
  }
})
</script>

<style scoped>
.settings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
}

.settings-header {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  border: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%);
  position: relative;
  overflow: hidden;
}

.settings-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.title-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.35);
  transition: all var(--transition-normal);
}

.title-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.45);
}

.title-icon svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 2;
}

.page-subtitle {
  color: var(--gray-600);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.settings-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.9);
  border: none;
}

.settings-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-600);
}

.settings-tab:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.settings-tab.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
}

.tab-icon {
  font-size: var(--text-lg);
}

.settings-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-xs);
}

.section-desc {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.profile-card, .account-info, .security-card, .security-status, .data-card, .about-card {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-2xl);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.profile-card::before, .account-info::before, .security-card::before, .security-status::before, .data-card::before, .about-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.profile-card:hover, .account-info:hover, .security-card:hover, .security-status:hover, .data-card:hover, .about-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(20, 184, 166, 0.15);
}

.profile-card {
  text-align: center;
}

.profile-avatar {
  margin-bottom: var(--spacing-2xl);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: grid;
  place-items: center;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0 auto var(--spacing-lg);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
  transition: all var(--transition-normal);
}

.profile-card:hover .avatar {
  transform: scale(1.05) rotate(5deg);
}

.profile-form {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-group {
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  font-size: var(--text-sm);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: white;
  color: var(--gray-800);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
}

.form-input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.8;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.account-info {
  position: relative;
}

.info-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-normal);
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-300);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.info-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-lg);
  z-index: -1;
}

.info-icon.teal {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  color: var(--primary-700);
}

.info-icon.teal::before {
  background: var(--gradient-primary);
}

.info-icon.amber {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9));
  color: var(--secondary-700);
}

.info-icon.amber::before {
  background: var(--gradient-secondary);
}

.info-icon.sky {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.9));
  color: var(--info-700);
}

.info-icon.sky::before {
  background: var(--gradient-info);
}

.info-icon.rose {
  background: linear-gradient(135deg, rgba(255, 241, 242, 0.9), rgba(255, 228, 230, 0.9));
  color: var(--accent-700);
}

.info-icon.rose::before {
  background: var(--gradient-accent);
}

.info-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.info-label {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.info-value {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--gray-900);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.status-badge.active {
  background: var(--success-100);
  color: var(--success-700);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
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
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--gradient-error);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.security-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
  flex-shrink: 0;
}

.card-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-xl);
  z-index: -1;
}

.card-icon.teal {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  color: var(--primary-700);
}

.card-icon.teal::before {
  background: var(--gradient-primary);
}

.card-icon.amber {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9));
  color: var(--secondary-700);
}

.card-icon.amber::before {
  background: var(--gradient-secondary);
}

.card-icon.rose {
  background: linear-gradient(135deg, rgba(255, 241, 242, 0.9), rgba(255, 228, 230, 0.9));
  color: var(--accent-700);
}

.card-icon.rose::before {
  background: var(--gradient-accent);
}

.card-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-xs);
}

.card-desc {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.card-desc.danger {
  color: var(--error-600);
}

.security-status {
  position: relative;
}

.security-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-lg);
}

.security-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-normal);
}

.security-stat:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-300);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.stat-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-lg);
  z-index: -1;
}

.stat-icon.teal {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  color: var(--primary-700);
}

.stat-icon.teal::before {
  background: var(--gradient-primary);
}

.stat-icon.amber {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9));
  color: var(--secondary-700);
}

.stat-icon.amber::before {
  background: var(--gradient-secondary);
}

.stat-icon.sky {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.9));
  color: var(--info-700);
}

.stat-icon.sky::before {
  background: var(--gradient-info);
}

.stat-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--gray-900);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.stat-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stat-indicator.safe {
  background: var(--success-500);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.stat-indicator.warning {
  background: var(--warning-500);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.data-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.data-card.danger::before {
  background: var(--gradient-error);
}

.data-actions {
  display: flex;
  gap: var(--spacing-md);
}

.about-card {
  text-align: center;
}

.about-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.logo-icon {
  width: 72px;
  height: 72px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
  transition: all var(--transition-normal);
}

.about-card:hover .logo-icon {
  transform: scale(1.05) rotate(5deg);
}

.logo-icon svg {
  width: 36px;
  height: 36px;
  color: white;
  stroke-width: 2;
}

.logo-text h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0;
}

.version {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin: var(--spacing-xs) 0 0 0;
  font-weight: var(--font-medium);
}

.about-desc {
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: 1.6;
  margin-bottom: var(--spacing-2xl);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  font-weight: var(--font-medium);
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-full);
  border: 1px solid var(--gray-200);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-300);
}

.feature-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.feature-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-lg);
  z-index: -1;
}

.feature-icon.teal {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  color: var(--primary-700);
}

.feature-icon.teal::before {
  background: var(--gradient-primary);
}

.feature-icon.amber {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9));
  color: var(--secondary-700);
}

.feature-icon.amber::before {
  background: var(--gradient-secondary);
}

.feature-icon.sky {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.9));
  color: var(--info-700);
}

.feature-icon.sky::before {
  background: var(--gradient-info);
}

.feature-icon.rose {
  background: linear-gradient(135deg, rgba(255, 241, 242, 0.9), rgba(255, 228, 230, 0.9));
  color: var(--accent-700);
}

.feature-icon.rose::before {
  background: var(--gradient-accent);
}

.feature-icon svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.about-links {
  display: flex;
  gap: var(--spacing-xl);
  justify-content: center;
  flex-wrap: wrap;
}

.about-link {
  color: var(--primary-600);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-lg);
}

.about-link:hover {
  color: var(--primary-800);
  background: var(--primary-50);
}

@media (max-width: 768px) {
  .settings-tabs {
    flex-direction: column;
  }

  .settings-tab {
    justify-content: flex-start;
  }

  .profile-card, .account-info, .security-card, .security-status, .data-card, .about-card {
    padding: var(--spacing-lg);
  }

  .security-card, .data-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }

  .security-stats {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .data-actions {
    flex-direction: column;
    width: 100%;
  }

  .data-actions .btn {
    width: 100%;
  }

  .about-logo {
    flex-direction: column;
    text-align: center;
  }

  .about-links {
    flex-direction: column;
    align-items: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--text-2xl);
  }

  .avatar {
    width: 80px;
    height: 80px;
    font-size: var(--text-2xl);
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-icon svg {
    width: 28px;
    height: 28px;
  }
}
</style>
