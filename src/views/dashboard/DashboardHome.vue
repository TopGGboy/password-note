<template>
  <div class="dashboard-home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1>欢迎回来，{{ username }}！</h1>
          <p>您的密码安全管理中心，让数字生活更安全</p>
        </div>
        <div class="banner-stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalPasswords }}</div>
            <div class="stat-label">总密码数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.strongPasswords }}</div>
            <div class="stat-label">强密码</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.weakPasswords }}</div>
            <div class="stat-label">需要优化</div>
          </div>
        </div>
      </div>
      <div class="banner-illustration">
        <div class="security-shield">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 快速操作卡片 -->
    <div class="quick-actions-section">
      <h2 class="section-title">快速操作</h2>
      <div class="actions-grid">
        <div class="action-card primary" @click="$router.push('/passwords')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>查看密码</h3>
            <p>管理所有保存的密码</p>
            <div class="card-badge">{{ stats.totalPasswords }} 个</div>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="action-card secondary" @click="showAddModal = true">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>添加密码</h3>
            <p>保存新的登录信息</p>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="action-card secondary" @click="showGeneratorModal = true">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>生成密码</h3>
            <p>创建安全的随机密码</p>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="action-card secondary" @click="$router.push('/security')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>安全检查</h3>
            <p>检查密码安全状态</p>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容网格 -->
    <div class="content-grid">
      <!-- 最近密码 -->
      <div class="content-card recent-passwords">
        <div class="card-header">
          <h3>最近添加</h3>
          <router-link to="/passwords" class="view-all-link">
            查看全部
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </router-link>
        </div>
        <div class="card-body">
          <div v-if="recentPasswords.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p>还没有保存任何密码</p>
            <button @click="showAddModal = true" class="empty-action">添加第一个密码</button>
          </div>
          <div v-else class="passwords-list">
            <div
              v-for="password in recentPasswords"
              :key="password.id"
              class="password-item"
              @click="viewPassword(password.id)"
            >
              <div class="password-avatar">
                <div class="avatar-text">{{ getInitials(password.title) }}</div>
              </div>
              <div class="password-info">
                <h4>{{ password.title }}</h4>
                <p>{{ password.username }}</p>
              </div>
              <div class="password-meta">
                <span class="password-category">{{ password.category }}</span>
                <span class="password-date">{{ formatDate(password.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全提醒 -->
      <div class="content-card security-alerts">
        <div class="card-header">
          <h3>安全提醒</h3>
          <router-link to="/security" class="view-all-link">
            安全中心
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </router-link>
        </div>
        <div class="card-body">
          <div v-if="securityAlerts.length === 0" class="empty-state">
            <div class="empty-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <p>所有密码都很安全！</p>
          </div>
          <div v-else class="alerts-list">
            <div
              v-for="alert in securityAlerts"
              :key="alert.id"
              class="alert-item"
              :class="alert.type"
              @click="handleAlert(alert)"
            >
              <div class="alert-icon">
                <svg v-if="alert.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <svg v-else-if="alert.type === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <div class="alert-content">
                <h4>{{ alert.title }}</h4>
                <p>{{ alert.message }}</p>
              </div>
              <div class="alert-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用统计 -->
      <div class="content-card usage-stats">
        <div class="card-header">
          <h3>使用统计</h3>
        </div>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 20V10"/>
                  <path d="M12 20V4"/>
                  <path d="M6 20v-6"/>
                </svg>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.loginCount }}</div>
                <div class="stat-name">本月登录</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.addedThisMonth }}</div>
                <div class="stat-name">本月新增</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.updatedThisMonth }}</div>
                <div class="stat-name">本月更新</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <AddPasswordModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @success="handlePasswordAdded"
    />
    
    <PasswordGeneratorModal
      v-if="showGeneratorModal"
      @close="showGeneratorModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import AddPasswordModal from '../../components/modals/AddPasswordModal.vue'
import PasswordGeneratorModal from '../../components/modals/PasswordGeneratorModal.vue'

interface PasswordItem {
  id: string
  title: string
  username: string
  category: string
  createdAt: Date
}

interface SecurityAlert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
}

interface Stats {
  totalPasswords: number
  strongPasswords: number
  weakPasswords: number
  loginCount: number
  addedThisMonth: number
  updatedThisMonth: number
}

const router = useRouter()
const authStore = useAuthStore()

// 响应式状态
const showAddModal = ref(false)
const showGeneratorModal = ref(false)

const stats = ref<Stats>({
  totalPasswords: 42,
  strongPasswords: 28,
  weakPasswords: 14,
  loginCount: 23,
  addedThisMonth: 5,
  updatedThisMonth: 8
})

const recentPasswords = ref<PasswordItem[]>([
  {
    id: '1',
    title: 'GitHub',
    username: 'developer@email.com',
    category: '工作',
    createdAt: new Date('2024-03-10')
  },
  {
    id: '2',
    title: 'Netflix',
    username: 'user123',
    category: '娱乐',
    createdAt: new Date('2024-03-08')
  },
  {
    id: '3',
    title: 'Amazon',
    username: 'shopper@email.com',
    category: '购物',
    createdAt: new Date('2024-03-05')
  }
])

const securityAlerts = ref<SecurityAlert[]>([
  {
    id: '1',
    type: 'warning',
    title: '弱密码检测',
    message: '发现 3 个弱密码需要更新'
  },
  {
    id: '2',
    type: 'info',
    title: '密码重复',
    message: '有 2 个网站使用了相同的密码'
  }
])

// 计算属性
const username = computed(() => authStore.user?.username || '用户')

// 方法
const getInitials = (title: string): string => {
  return title.charAt(0).toUpperCase()
}

const viewPassword = (id: string) => {
  router.push(`/passwords/${id}`)
}

const formatDate = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const handleAlert = (alert: SecurityAlert) => {
  if (alert.id === '1') {
    router.push('/security')
  } else if (alert.id === '2') {
    router.push('/passwords?filter=duplicate')
  }
}

const handlePasswordAdded = (password: PasswordItem) => {
  console.log('新密码已添加:', password)
  // 刷新数据
  recentPasswords.value.unshift(password)
  if (recentPasswords.value.length > 3) {
    recentPasswords.value.pop()
  }
  stats.value.totalPasswords++
  stats.value.addedThisMonth++
}

// 生命周期
onMounted(async () => {
  // 加载仪表板数据
  try {
    console.log('加载仪表板数据')
    // 这里可以调用API加载真实数据
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.dashboard-home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* 欢迎横幅 */
.welcome-banner {
  background: var(--gradient-primary);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-3xl);
  margin-bottom: var(--spacing-2xl);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.banner-content {
  flex: 1;
  z-index: 1;
}

.welcome-text h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  line-height: var(--leading-tight);
}

.welcome-text p {
  font-size: var(--text-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
}

.banner-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.8;
}

.banner-illustration {
  width: 120px;
  height: 120px;
  z-index: 1;
}

.security-shield {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.security-shield svg {
  width: 60px;
  height: 60px;
  stroke-width: 2;
}

/* 快速操作 */
.quick-actions-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--secondary-800);
  margin-bottom: var(--spacing-lg);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.action-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.action-card.primary {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
}

.action-card.primary .card-content h3,
.action-card.primary .card-content p {
  color: white;
}

.action-card.primary .card-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-card.primary .card-icon {
  background: rgba(255, 255, 255, 0.2);
}

.card-icon svg {
  width: 24px;
  height: 24px;
  color: var(--primary-600);
  stroke-width: 2;
}

.action-card.primary .card-icon svg {
  color: white;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--secondary-800);
  margin-bottom: var(--spacing-xs);
}

.card-content p {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  margin-bottom: var(--spacing-sm);
}

.card-badge {
  display: inline-block;
  background: var(--primary-100);
  color: var(--primary-700);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.card-arrow {
  width: 20px;
  height: 20px;
  color: var(--secondary-400);
  flex-shrink: 0;
}

.action-card.primary .card-arrow {
  color: rgba(255, 255, 255, 0.7);
}

.card-arrow svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.content-card {
  background: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: var(--spacing-xl) var(--spacing-xl) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--secondary-800);
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--primary-600);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: color var(--transition-fast);
}

.view-all-link:hover {
  color: var(--primary-700);
}

.view-all-link svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.card-body {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  color: var(--gray-400);
}

.empty-icon.success {
  background: var(--success-100);
  color: var(--success-600);
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  stroke-width: 2;
}

.empty-state p {
  color: var(--secondary-600);
  margin-bottom: var(--spacing-lg);
}

.empty-action {
  background: var(--primary-500);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.empty-action:hover {
  background: var(--primary-600);
}

/* 密码列表 */
.passwords-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.password-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.password-item:hover {
  border-color: var(--primary-300);
  background: var(--primary-50);
}

.password-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: white;
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}

.password-info {
  flex: 1;
  min-width: 0;
}

.password-info h4 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--secondary-800);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-info p {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.password-category {
  background: var(--success-100);
  color: var(--success-700);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.password-date {
  font-size: var(--text-xs);
  color: var(--secondary-500);
}

/* 安全提醒 */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.alert-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid;
}

.alert-item.warning {
  background: var(--warning-50);
  border-color: var(--warning-200);
}

.alert-item.warning:hover {
  background: var(--warning-100);
}

.alert-item.danger {
  background: var(--error-50);
  border-color: var(--error-200);
}

.alert-item.danger:hover {
  background: var(--error-100);
}

.alert-item.info {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.alert-item.info:hover {
  background: var(--primary-100);
}

.alert-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.alert-item.warning .alert-icon {
  color: var(--warning-600);
}

.alert-item.danger .alert-icon {
  color: var(--error-600);
}

.alert-item.info .alert-icon {
  color: var(--primary-600);
}

.alert-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--secondary-800);
  margin-bottom: 2px;
}

.alert-content p {
  font-size: var(--text-sm);
  color: var(--secondary-600);
}

.alert-arrow {
  width: 16px;
  height: 16px;
  color: var(--secondary-400);
  flex-shrink: 0;
}

.alert-arrow svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

/* 使用统计 */
.usage-stats {
  grid-column: 1 / -1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.stat-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-600);
  flex-shrink: 0;
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
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--secondary-800);
  margin-bottom: 2px;
}

.stat-name {
  font-size: var(--text-sm);
  color: var(--secondary-600);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .usage-stats {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-xl);
  }

  .banner-stats {
    justify-content: center;
  }

  .banner-illustration {
    order: -1;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .password-meta {
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: var(--spacing-xl);
  }

  .welcome-text h1 {
    font-size: var(--text-3xl);
  }

  .banner-stats {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .action-card {
    padding: var(--spacing-lg);
  }

  .password-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .password-meta {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>