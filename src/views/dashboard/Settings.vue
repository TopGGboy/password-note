<template>
  <div class="settings-container">
    <!-- 背景装饰 -->
    <div class="settings-bg">
      <div class="bg-gradient"></div>
      <div class="bg-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
        <div class="blob blob-4"></div>
        <div class="blob blob-5"></div>
      </div>
      <div class="bg-particles">
        <div v-for="i in 20" :key="'particle-' + i" class="particle" :style="{ '--delay': i * 0.1 + 's' }"></div>
      </div>
      <div class="bg-grid"></div>
    </div>

    <!-- 页面标题 -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-decoration-top">
          <div class="deco-dot deco-dot-1"></div>
          <div class="deco-dot deco-dot-2"></div>
          <div class="deco-dot deco-dot-3"></div>
        </div>
        <h1 class="settings-title">设置</h1>
        <p class="settings-subtitle">管理你的账户信息和安全设置</p>
        <div class="header-decoration">
          <div class="deco-circle deco-1"></div>
          <div class="deco-line"></div>
          <div class="deco-circle deco-2"></div>
        </div>
        <div class="header-decoration-bottom">
          <div class="deco-star deco-star-1"></div>
          <div class="deco-star deco-star-2"></div>
          <div class="deco-star deco-star-3"></div>
        </div>
      </div>
    </div>

    <!-- 设置选项卡 -->
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="settings-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <div class="tab-icon">{{ tab.icon }}</div>
        <span class="tab-label">{{ tab.label }}</span>
        <div class="tab-indicator"></div>
      </button>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 个人信息 -->
      <div v-if="activeTab === 'profile'" class="settings-section">
        <div class="section-header">
          <div class="section-decoration">
            <div class="section-icon">👤</div>
          </div>
          <h2 class="section-title">个人信息</h2>
          <p class="section-desc">查看和更新你的账户信息</p>
        </div>

        <div class="profile-card card">
          <div class="profile-avatar">
            <div class="avatar" :data-initials="userInitials">{{ userInitials }}</div>
            <button class="btn btn-primary" @click="isEditingProfile = !isEditingProfile">
              <div class="btn-icon">{{ isEditingProfile ? '✕' : '✏️' }}</div>
              <span>{{ isEditingProfile ? '取消' : '编辑' }}</span>
            </button>
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">👤</span>
                用户名
              </label>
              <div class="form-input-wrapper">
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="profileForm.username"
                  :disabled="!isEditingProfile"
                  required
                />
                <div class="input-icon">👤</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📧</span>
                邮箱
              </label>
              <div class="form-input-wrapper">
                <input 
                  type="email" 
                  class="form-input" 
                  v-model="profileForm.email"
                  :disabled="!isEditingProfile"
                  required
                />
                <div class="input-icon">📧</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📝</span>
                姓名
              </label>
              <div class="form-input-wrapper">
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="profileForm.name"
                  :disabled="!isEditingProfile"
                />
                <div class="input-icon">📝</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📱</span>
                手机号码
              </label>
              <div class="form-input-wrapper">
                <input 
                  type="tel" 
                  class="form-input" 
                  v-model="profileForm.phone"
                  :disabled="!isEditingProfile"
                />
                <div class="input-icon">📱</div>
              </div>
            </div>

            <div v-if="isEditingProfile" class="form-actions">
              <button type="button" class="btn btn-secondary" @click="isEditingProfile = false">
                <span>取消</span>
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <div v-if="isLoading" class="loading-spinner"></div>
                <span>{{ isLoading ? '保存中...' : '保存' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- 账户信息 -->
        <div class="account-info card">
          <h3 class="info-title">
            <span class="title-icon">ℹ️</span>
            账户信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon">📅</div>
              <span class="info-label">账户创建时间</span>
              <span class="info-value">{{ formatDate(accountInfo.createdAt) }}</span>
              <div class="info-glow"></div>
            </div>
            <div class="info-item">
              <div class="info-icon">⏰</div>
              <span class="info-label">最后登录时间</span>
              <span class="info-value">{{ formatDate(accountInfo.lastLoginAt) }}</span>
              <div class="info-glow"></div>
            </div>
            <div class="info-item">
              <div class="info-icon">📊</div>
              <span class="info-label">账户状态</span>
              <span class="info-value">
                <span class="status-badge active">
                  <span class="badge-icon">✅</span>
                  活跃
                </span>
              </span>
              <div class="info-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div v-if="activeTab === 'security'" class="settings-section">
        <div class="section-header">
          <div class="section-decoration">
            <div class="section-icon">🔒</div>
          </div>
          <h2 class="section-title">安全设置</h2>
          <p class="section-desc">保护你的账户安全</p>
        </div>

        <!-- 修改密码 -->
        <div class="security-card card">
          <div class="card-decoration">
            <div class="card-glow"></div>
          </div>
          <h3 class="card-title">
            <span class="card-icon">🔑</span>
            修改密码
          </h3>
          <p class="card-desc">定期更新你的账户密码以增强安全性</p>
          <button 
            class="btn btn-primary" 
            @click="showChangePasswordModal = true"
          >
            <div class="btn-icon">🔄</div>
            <span>修改密码</span>
          </button>
        </div>

        <!-- 修改主密码 -->
        <div class="security-card card">
          <div class="card-decoration">
            <div class="card-glow"></div>
          </div>
          <h3 class="card-title">
            <span class="card-icon">🗝️</span>
            修改主密码
          </h3>
          <p class="card-desc">主密码用于加密和保护你的所有密码数据</p>
          <button 
            class="btn btn-primary" 
            @click="showChangeMasterPasswordModal = true"
          >
            <div class="btn-icon">🔄</div>
            <span>修改主密码</span>
          </button>
        </div>

        <!-- 安全状态 -->
        <div class="security-status card">
          <div class="card-decoration">
            <div class="card-glow"></div>
          </div>
          <h3 class="card-title">
            <span class="card-icon">📊</span>
            安全状态
          </h3>
          <div class="security-stats">
            <div class="security-stat">
              <div class="stat-icon">🔒</div>
              <div class="stat-info">
                <div class="stat-value">安全</div>
                <div class="stat-label">账户状态</div>
              </div>
              <div class="stat-indicator safe"></div>
            </div>
            <div class="security-stat">
              <div class="stat-icon">🗝️</div>
              <div class="stat-info">
                <div class="stat-value">{{ hasMasterPassword ? '已设置' : '未设置' }}</div>
                <div class="stat-label">主密码</div>
              </div>
              <div class="stat-indicator" :class="hasMasterPassword ? 'safe' : 'warning'"></div>
            </div>
            <div class="security-stat">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <div class="stat-value">30天前</div>
                <div class="stat-label">密码更新</div>
              </div>
              <div class="stat-indicator warning"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div v-if="activeTab === 'data'" class="settings-section">
        <div class="section-header">
          <div class="section-decoration">
            <div class="section-icon">💾</div>
          </div>
          <h2 class="section-title">数据管理</h2>
          <p class="section-desc">管理你的密码数据</p>
        </div>

        <!-- 导出数据 -->
        <div class="data-card card">
          <div class="card-decoration">
            <div class="card-glow"></div>
          </div>
          <h3 class="card-title">
            <span class="card-icon">📤</span>
            导出数据
          </h3>
          <p class="card-desc">将你的密码数据导出为安全格式</p>
          <div class="data-actions">
            <button class="btn btn-secondary">
              <div class="btn-icon">📄</div>
              <span>导出为JSON</span>
            </button>
            <button class="btn btn-secondary">
              <div class="btn-icon">📊</div>
              <span>导出为CSV</span>
            </button>
          </div>
        </div>

        <!-- 导入数据 -->
        <div class="data-card card">
          <div class="card-decoration">
            <div class="card-glow"></div>
          </div>
          <h3 class="card-title">
            <span class="card-icon">📥</span>
            导入数据
          </h3>
          <p class="card-desc">从其他密码管理器导入数据</p>
          <button class="btn btn-primary">
            <div class="btn-icon">📁</div>
            <span>导入数据</span>
          </button>
        </div>

        <!-- 清除数据 -->
        <div class="data-card card danger">
          <div class="card-decoration danger">
            <div class="card-glow danger"></div>
          </div>
          <h3 class="card-title">
            <span class="card-icon">🗑️</span>
            清除数据
          </h3>
          <p class="card-desc danger">永久删除所有本地存储的密码数据</p>
          <button class="btn btn-danger">
            <div class="btn-icon">⚠️</div>
            <span>清除所有数据</span>
          </button>
        </div>
      </div>

      <!-- 关于 -->
      <div v-if="activeTab === 'about'" class="settings-section">
        <div class="section-header">
          <div class="section-decoration">
            <div class="section-icon">ℹ️</div>
          </div>
          <h2 class="section-title">关于</h2>
          <p class="section-desc">了解密码笔记应用</p>
        </div>

        <div class="about-card card">
          <div class="card-decoration">
            <div class="card-glow"></div>
          </div>
          <div class="about-logo">
            <div class="logo-icon">🔐</div>
            <div class="logo-text">
              <h3>密码笔记</h3>
              <p class="version">版本 1.0.0</p>
              <div class="logo-badge">安全可靠</div>
            </div>
          </div>
          
          <div class="about-info">
            <p class="about-desc">
              密码笔记是一个安全、私密的密码管理工具，帮助你轻松管理所有的账号和密码。
            </p>
            <div class="about-features">
              <div class="feature-item">
                <div class="feature-icon">🔒</div>
                <span>端到端加密</span>
                <div class="feature-glow"></div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">💾</div>
                <span>本地优先</span>
                <div class="feature-glow"></div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🔍</div>
                <span>一键检索</span>
                <div class="feature-glow"></div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📁</div>
                <span>分类管理</span>
                <div class="feature-glow"></div>
              </div>
            </div>
          </div>

          <div class="about-links">
            <a href="#" class="about-link">
              <div class="link-icon">❓</div>
              <span>使用帮助</span>
              <div class="link-arrow">→</div>
            </a>
            <a href="#" class="about-link">
              <div class="link-icon">🔒</div>
              <span>隐私政策</span>
              <div class="link-arrow">→</div>
            </a>
            <a href="#" class="about-link">
              <div class="link-icon">📝</div>
              <span>服务条款</span>
              <div class="link-arrow">→</div>
            </a>
            <a href="#" class="about-link">
              <div class="link-icon">📞</div>
              <span>联系我们</span>
              <div class="link-arrow">→</div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <ChangePasswordModal 
      v-if="showChangePasswordModal" 
      @close="showChangePasswordModal = false"
      @success="handleChangePasswordSuccess"
    />

    <!-- 修改主密码模态框 -->
    <ChangeMasterPasswordModal 
      v-if="showChangeMasterPasswordModal" 
      @close="showChangeMasterPasswordModal = false"
      @success="handleChangeMasterPasswordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import ChangePasswordModal from '../../components/modals/ChangePasswordModal.vue'
import ChangeMasterPasswordModal from '../../components/modals/ChangeMasterPasswordModal.vue'
import { KeyManager } from '../../utils/encryption/crypto'

// 状态管理
const authStore = useAuthStore()
const activeTab = ref('profile')
const isEditingProfile = ref(false)
const showChangePasswordModal = ref(false)
const showChangeMasterPasswordModal = ref(false)
const isLoading = ref(false)

// 选项卡配置
const tabs = [
  { id: 'profile', label: '个人信息', icon: '👤' },
  { id: 'security', label: '安全设置', icon: '🔒' },
  { id: 'data', label: '数据管理', icon: '💾' },
  { id: 'about', label: '关于', icon: 'ℹ️' }
]

// 用户信息
const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.username) return 'U'
  return user.value.username.charAt(0).toUpperCase()
})

// 个人信息表单
const profileForm = ref({
  username: user.value?.username || '',
  email: user.value?.email || '',
  name: user.value?.name || '',
  phone: user.value?.phone || ''
})

// 账户信息
const accountInfo = ref({
  createdAt: user.value?.createdAt || new Date().toISOString(),
  lastLoginAt: user.value?.lastLoginAt || new Date().toISOString()
})

// 主密码状态
const hasMasterPassword = ref(false)

// 保存个人信息
const saveProfile = async () => {
  isLoading.value = true
  try {
    // 这里应该调用API更新用户信息
    console.log('保存个人信息:', profileForm.value)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新本地存储的用户信息
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

// 处理密码修改成功
const handleChangePasswordSuccess = () => {
  showChangePasswordModal.value = false
  alert('密码修改成功！')
}

// 处理主密码修改成功
const handleChangeMasterPasswordSuccess = () => {
  showChangeMasterPasswordModal.value = false
  alert('主密码修改成功！')
}

// 格式化日期
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

// 生命周期
onMounted(() => {
  // 检查主密码状态
  hasMasterPassword.value = KeyManager.hasMasterPassword()
  // 初始化表单数据
  if (user.value) {
    profileForm.value = {
      username: user.value.username || '',
      email: user.value.email || '',
      name: user.value.name || '',
      phone: user.value.phone || ''
    }
    accountInfo.value = {
      createdAt: user.value.createdAt || new Date().toISOString(),
      lastLoginAt: user.value.lastLoginAt || new Date().toISOString()
    }
  }
})
</script>

<style scoped>
/* 背景装饰样式 */
.settings-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(249, 250, 251, 0.9) 100%);
  animation: gradientShift 15s ease infinite;
}

.bg-blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: blobMove 20s ease-in-out infinite;
  opacity: 0.6;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: rgba(99, 102, 241, 0.2);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background: rgba(16, 185, 129, 0.2);
  top: 50%;
  right: 10%;
  animation-delay: -5s;
}

.blob-3 {
  width: 200px;
  height: 200px;
  background: rgba(245, 158, 11, 0.2);
  bottom: 10%;
  left: 20%;
  animation-delay: -10s;
}

.blob-4 {
  width: 180px;
  height: 180px;
  background: rgba(239, 68, 68, 0.2);
  top: 20%;
  right: 25%;
  animation-delay: -3s;
}

.blob-5 {
  width: 150px;
  height: 150px;
  background: rgba(139, 92, 246, 0.2);
  bottom: 20%;
  right: 30%;
  animation-delay: -7s;
}

.bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--primary-500);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  opacity: 0;
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

/* 容器样式 */
.settings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
  min-height: 80vh;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

/* 页面标题 */
.settings-header {
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  animation: fadeIn var(--transition-normal);
  position: relative;
}

.header-content {
  position: relative;
  z-index: 1;
}

/* 顶部装饰点 */
.header-decoration-top {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  animation: slideIn var(--transition-normal) 0.2s both;
}

.deco-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.deco-dot-1 {
  animation-delay: 0s;
}

.deco-dot-2 {
  animation-delay: 0.5s;
}

.deco-dot-3 {
  animation-delay: 1s;
}

.settings-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
  letter-spacing: -0.025em;
  animation: textGlow 3s ease-in-out infinite alternate;
  position: relative;
  display: inline-block;
}

.settings-title::before,
.settings-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  transform: translateY(-50%);
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.settings-title::before {
  left: -30px;
  animation-delay: 0s;
}

.settings-title::after {
  right: -30px;
  animation-delay: 1s;
}

.settings-subtitle {
  font-size: var(--text-base);
  color: var(--secondary-600);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-xl);
  position: relative;
  display: inline-block;
}

.settings-subtitle::before,
.settings-subtitle::after {
  content: '';
  position: absolute;
  bottom: -10px;
  width: 15px;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 1px;
}

.settings-subtitle::before {
  left: -20px;
}

.settings-subtitle::after {
  right: -20px;
}

/* 中间装饰 */
.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  animation: fadeIn var(--transition-normal) 0.4s both;
}

.deco-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.deco-1 {
  animation-delay: 0s;
}

.deco-2 {
  animation-delay: 1s;
}

.deco-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  border-radius: 1px;
}

/* 底部装饰星星 */
.header-decoration-bottom {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  animation: slideIn var(--transition-normal) 0.6s both;
}

.deco-star {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: twinkle 2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
}

.deco-star-1 {
  animation-delay: 0s;
}

.deco-star-2 {
  animation-delay: 0.7s;
}

.deco-star-3 {
  animation-delay: 1.4s;
}

/* 选项卡样式 */
.settings-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-3xl);
  background: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-xs);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: slideIn var(--transition-normal);
}

.settings-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--secondary-700);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.settings-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left var(--transition-normal);
  z-index: -1;
}

.settings-tab:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  color: var(--secondary-900);
}

.settings-tab:hover::before {
  left: 100%;
}

.settings-tab.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
  transform: translateY(-3px);
}

.settings-tab.active::before {
  display: none;
}

.settings-tab.active .tab-icon {
  transform: scale(1.1) rotate(5deg);
  transition: transform var(--transition-fast);
}

.tab-icon {
  font-size: var(--text-lg);
  transition: transform var(--transition-fast);
}

.tab-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 1px;
  transition: all var(--transition-fast);
}

.settings-tab.active .tab-indicator {
  width: 40px;
  bottom: 0;
}

.settings-tab:hover .tab-indicator {
  width: 30px;
  bottom: 0;
  background: var(--primary-400);
}

/* 内容区域 */
.settings-content {
  animation: fadeIn 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

/* 选项卡内容过渡效果 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 区域标题 */
.section-header {
  margin-bottom: var(--spacing-lg);
  animation: fadeIn var(--transition-normal) 0.2s both;
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--secondary-900);
  margin-bottom: var(--spacing-xs);
}

.section-desc {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  font-weight: var(--font-medium);
}

/* 卡片样式 - 使用全局卡片样式 */
.profile-card, .account-info, .security-card, .security-status, .data-card, .about-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: var(--spacing-xl);
}

/* 卡片进入动画，添加延迟以创建层次感 */
.profile-card {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.account-info {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.security-card:nth-child(1) {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.security-card:nth-child(2) {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.security-status {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.data-card:nth-child(1) {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.data-card:nth-child(2) {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.data-card:nth-child(3) {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.about-card {
  animation: cardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }
}

.profile-card::before, .account-info::before, .security-card::before, .security-status::before, .data-card::before, .about-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transition: all var(--transition-fast);
}

.profile-card:hover, .account-info:hover, .security-card:hover, .security-status:hover, .data-card:hover, .about-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.profile-card:hover::before, .account-info:hover::before, .security-card:hover::before, .security-status:hover::before, .data-card:hover::before, .about-card:hover::before {
  height: 6px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #db2777);
}

/* 卡片内部元素动画 */
.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--secondary-800);
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.card-desc {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  line-height: 1.5;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-fast);
}

.profile-card:hover .card-title,
.account-info:hover .card-title,
.security-card:hover .card-title,
.security-status:hover .card-title,
.data-card:hover .card-title,
.about-card:hover .card-title {
  color: #6366f1;
  transform: translateY(-2px);
}

.profile-card:hover .card-desc,
.account-info:hover .card-desc,
.security-card:hover .card-desc,
.security-status:hover .card-desc,
.data-card:hover .card-desc,
.about-card:hover .card-desc {
  color: var(--secondary-700);
}

.profile-card {
  text-align: center;
}

.profile-avatar {
  margin-bottom: var(--spacing-2xl);
  animation: scaleInCenter var(--transition-normal) 0.4s both;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 auto var(--spacing-lg) auto;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0.8;
  animation: pulse 3s infinite;
}

.avatar::after {
  content: attr(data-initials);
  position: relative;
  z-index: 1;
}

.profile-card:hover .avatar {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.5);
}

/* 表单样式 - 使用全局表单样式 */
.profile-form {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  text-align: left;
  animation: fadeIn var(--transition-normal) 0.5s both;
}

.form-group:nth-child(2) {
  animation-delay: 0.6s;
}

.form-group:nth-child(3) {
  animation-delay: 0.7s;
}

.form-group:nth-child(4) {
  animation-delay: 0.8s;
}

.form-input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) var(--spacing-xl);
  border: 2px solid rgba(209, 213, 219, 0.8);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: all var(--transition-fast);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), 0 4px 16px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.form-input:disabled {
  background: rgba(243, 244, 246, 0.9);
  cursor: not-allowed;
  opacity: 0.7;
  border-color: rgba(209, 213, 219, 0.5);
}

/* 输入框图标样式 */
.input-icon {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-500);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  pointer-events: none;
}

.form-input:focus + .input-icon {
  color: #6366f1;
  transform: translateY(-50%) scale(1.1);
}

/* 表单标签样式 */
.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--secondary-800);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.form-group:hover .form-label {
  color: #6366f1;
}

.label-icon {
  font-size: var(--text-xs);
  transition: all var(--transition-fast);
}

.form-group:hover .label-icon {
  transform: scale(1.1) rotate(5deg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  animation: fadeIn var(--transition-normal) 0.9s both;
}

/* 账户信息 */
.account-info {
  margin-top: var(--spacing-xl);
}

.info-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--secondary-800);
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
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-fast);
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-400);
}

.info-label {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  font-weight: var(--font-medium);
}

.info-value {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--secondary-900);
}

/* 按钮样式增强 */
.btn {
  position: relative;
  overflow: hidden;
  transition: all var(--transition-fast);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: var(--secondary-800);
  border: 1px solid var(--gray-200);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-400);
  background: rgba(255, 255, 255, 1);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-normal);
}

.btn:hover::before {
  left: 100%;
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 加载状态动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-xs);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 按钮图标动画 */
.btn-icon {
  transition: transform var(--transition-fast);
}

.btn:hover .btn-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 安全卡片 */
.security-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--secondary-800);
}

.card-desc {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  line-height: 1.5;
}

/* 安全状态 */
.security-status {
  margin-top: var(--spacing-xl);
}

.security-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
}

.security-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-fast);
}

.security-stat:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-400);
}

.stat-icon {
  font-size: var(--text-2xl);
  transition: transform var(--transition-fast);
}

.security-stat:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--secondary-900);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--secondary-600);
  font-weight: var(--font-medium);
}

/* 数据管理 */
.data-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.data-card.danger {
  border-color: var(--error-200);
  background: var(--error-50);
}

.data-actions {
  display: flex;
  gap: var(--spacing-md);
}

.data-actions .btn {
  flex: 1;
}

/* 关于卡片 */
.about-card {
  text-align: center;
}

.about-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  animation: scaleInCenter var(--transition-normal) 0.4s both;
}

.logo-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-xl);
  background: var(--gradient-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: var(--text-3xl);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0.8;
  animation: pulse 3s infinite;
}

.logo-icon::after {
  content: '🔐';
  position: relative;
  z-index: 1;
}

.about-card:hover .logo-icon {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.5);
}

.logo-text h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--secondary-900);
  margin: 0;
}

.version {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  margin: var(--spacing-xs) 0 0 0;
}

.about-desc {
  font-size: var(--text-base);
  color: var(--secondary-700);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeIn var(--transition-normal) 0.6s both;
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  animation: fadeIn var(--transition-normal) 0.8s both;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-full);
  border: 1px solid var(--gray-200);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--secondary-800);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-400);
  background: rgba(255, 255, 255, 0.95);
}

.feature-icon {
  font-size: var(--text-base);
  transition: transform var(--transition-fast);
}

.feature-item:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.about-links {
  display: flex;
  gap: var(--spacing-xl);
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeIn var(--transition-normal) 1s both;
}

.about-link {
  color: var(--primary-700);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  position: relative;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-lg);
}

.about-link:hover {
  color: var(--primary-900);
  background: var(--primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.about-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: all var(--transition-fast);
  transform: translateX(-50%);
}

.about-link:hover::after {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: var(--spacing-xl);
  }

  .settings-header {
    margin-bottom: var(--spacing-2xl);
  }

  /* 标题装饰元素响应式调整 */
  .header-decoration-top {
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .header-decoration-bottom {
    gap: var(--spacing-lg);
  }

  .settings-title::before,
  .settings-title::after {
    width: 16px;
    height: 16px;
  }

  .settings-title::before {
    left: -25px;
  }

  .settings-title::after {
    right: -25px;
  }

  .settings-subtitle::before,
  .settings-subtitle::after {
    width: 12px;
  }

  .settings-subtitle::before {
    left: -16px;
  }

  .settings-subtitle::after {
    right: -16px;
  }

  /* 选项卡响应式调整 */
  .settings-tabs {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .settings-tab {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* 卡片响应式调整 */
  .profile-card, .account-info, .security-card, .security-status, .data-card, .about-card {
    padding: var(--spacing-lg);
  }

  /* 网格布局响应式调整 */
  .info-grid {
    grid-template-columns: 1fr;
  }

  .security-stats {
    grid-template-columns: 1fr;
  }

  /* 按钮组响应式调整 */
  .data-actions {
    flex-direction: column;
  }

  /* 关于部分响应式调整 */
  .about-logo {
    flex-direction: column;
    text-align: center;
  }

  .about-links {
    flex-direction: column;
    align-items: center;
  }

  /* 表单响应式调整 */
  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }

  /* 背景装饰响应式调整 */
  .blob-1 {
    width: 200px;
    height: 200px;
  }

  .blob-2 {
    width: 180px;
    height: 180px;
  }

  .blob-3 {
    width: 150px;
    height: 150px;
  }

  .blob-4 {
    width: 120px;
    height: 120px;
  }

  .blob-5 {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: var(--spacing-lg);
  }

  .settings-title {
    font-size: var(--text-xl);
  }

  .settings-subtitle {
    font-size: var(--text-sm);
  }

  .section-title {
    font-size: var(--text-lg);
  }

  .section-desc {
    font-size: var(--text-xs);
  }

  /* 卡片响应式调整 */
  .profile-card, .account-info, .security-card, .security-status, .data-card, .about-card {
    padding: var(--spacing-md);
  }

  /* 头像和logo响应式调整 */
  .avatar {
    width: 80px;
    height: 80px;
    font-size: var(--text-lg);
  }

  .logo-icon {
    width: 60px;
    height: 60px;
    font-size: var(--text-2xl);
  }

  /* 特性项响应式调整 */
  .about-features {
    flex-direction: column;
    align-items: center;
  }

  .feature-item {
    width: 100%;
    justify-content: center;
  }

  /* 输入框响应式调整 */
  .form-input {
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) var(--spacing-lg);
  }

  .input-icon {
    left: var(--spacing-sm);
  }

  /* 按钮响应式调整 */
  .btn {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* 标题装饰响应式调整 */
  .header-decoration-top {
    gap: var(--spacing-md);
  }

  .header-decoration-bottom {
    gap: var(--spacing-md);
  }

  .deco-dot {
    width: 4px;
    height: 4px;
  }

  .deco-star {
    width: 10px;
    height: 10px;
  }
}

/* 平板横屏响应式调整 */
@media (min-width: 769px) and (max-width: 1024px) {
  .settings-container {
    max-width: 800px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .security-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleInCenter {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes blobMove {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -20px) scale(1.05);
  }
  50% {
    transform: translate(0, 20px) scale(1);
  }
  75% {
    transform: translate(-20px, -10px) scale(0.95);
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(100px);
    opacity: 0;
  }
}

@keyframes gridMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}

@keyframes textGlow {
  0% {
    text-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
  }
  100% {
    text-shadow: 0 4px 12px rgba(99, 102, 241, 0.4), 0 0 20px rgba(139, 92, 246, 0.2);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.8);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(-50%) translateY(0px);
  }
  50% {
    transform: translateY(-50%) translateY(-10px);
  }
}
</style>