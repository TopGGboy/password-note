<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🔐</div>
          <Transition name="fade">
            <span v-if="!sidebarCollapsed" class="logo-text">密码笔记</span>
          </Transition>
        </div>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div v-if="!sidebarCollapsed" class="nav-title">主要功能</div>
          <router-link
            v-for="item in mainNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'active': $route.path === item.path }"
          >
            <div class="nav-icon" v-html="item.icon"></div>
            <Transition name="fade">
              <span v-if="!sidebarCollapsed" class="nav-text">{{ item.name }}</span>
            </Transition>
            <div v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</div>
          </router-link>
        </div>

        <div class="nav-section">
          <div v-if="!sidebarCollapsed" class="nav-title">设置</div>
          <router-link
            v-for="item in settingsNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'active': $route.path === item.path }"
          >
            <div class="nav-icon" v-html="item.icon"></div>
            <Transition name="fade">
              <span v-if="!sidebarCollapsed" class="nav-text">{{ item.name }}</span>
            </Transition>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" :class="{ 'collapsed': sidebarCollapsed }">
          <div class="user-avatar">
            <div class="avatar-icon">{{ userInitials }}</div>
          </div>
          <Transition name="fade">
            <div v-if="!sidebarCollapsed" class="user-details">
              <div class="user-name">{{ username }}</div>
              <div class="user-email">{{ userEmail }}</div>
            </div>
          </Transition>
          <button @click="handleLogout" class="logout-button" :title="sidebarCollapsed ? '退出登录' : ''">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="mobile-menu-toggle">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <div class="breadcrumb">
            <router-link
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
              :to="crumb.path"
              class="breadcrumb-item"
              :class="{ 'current': index === breadcrumbs.length - 1 }"
            >
              {{ crumb.name }}
            </router-link>
          </div>
        </div>

        <div class="header-right">
          <button @click="showSearchModal = true" class="header-action search-button">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span class="action-text">搜索</span>
          </button>

          <button @click="showAddModal = true" class="header-action add-button">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span class="action-text">添加</span>
          </button>

          <div class="theme-toggle">
            <button @click="toggleTheme" class="theme-button">
              <svg v-if="isDarkMode" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- 遮罩层（移动端） -->
    <div
      v-if="showMobileSidebar"
      class="sidebar-overlay"
      @click="closeMobileSidebar"
    ></div>

    <!-- 搜索模态框 -->
    <SearchModal v-if="showSearchModal" @close="showSearchModal = false" />

    <!-- 添加密码模态框 -->
    <AddPasswordModal v-if="showAddModal" @close="showAddModal = false" @success="handleAddSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import SearchModal from '../modals/SearchModal.vue'
import AddPasswordModal from '../modals/AddPasswordModal.vue'

interface NavItem {
  name: string
  path: string
  icon: string
  badge?: string
}

interface Breadcrumb {
  name: string
  path: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式状态
const sidebarCollapsed = ref(false)
const showMobileSidebar = ref(false)
const showSearchModal = ref(false)
const showAddModal = ref(false)
const isDarkMode = ref(false)

// 导航项配置
const mainNavItems: NavItem[] = [
  {
    name: '首页',
    path: '/dashboard',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
  },
  {
    name: '密码管理',
    path: '/passwords',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    badge: '42'
  },
  {
    name: '分类管理',
    path: '/categories',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/></svg>'
  },
  {
    name: '安全中心',
    path: '/security',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
  }
]

const settingsNavItems: NavItem[] = [
  {
    name: '设置',
    path: '/settings',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  }
]

// 计算属性
const username = computed(() => authStore.user?.username || '用户')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')
const userInitials = computed(() => {
  const name = username.value
  return name.charAt(0).toUpperCase()
})

const breadcrumbs = computed((): Breadcrumb[] => {
  const path = route.path
  const breadcrumbs: Breadcrumb[] = []

  if (path === '/dashboard') {
    breadcrumbs.push({ name: '首页', path: '/dashboard' })
  } else if (path === '/passwords') {
    breadcrumbs.push({ name: '首页', path: '/dashboard' })
    breadcrumbs.push({ name: '密码管理', path: '/passwords' })
  } else if (path.startsWith('/passwords/')) {
    breadcrumbs.push({ name: '首页', path: '/dashboard' })
    breadcrumbs.push({ name: '密码管理', path: '/passwords' })
    breadcrumbs.push({ name: '密码详情', path: path })
  } else if (path === '/categories') {
    breadcrumbs.push({ name: '首页', path: '/dashboard' })
    breadcrumbs.push({ name: '分类管理', path: '/categories' })
  } else if (path === '/security') {
    breadcrumbs.push({ name: '首页', path: '/dashboard' })
    breadcrumbs.push({ name: '安全中心', path: '/security' })
  } else if (path === '/settings') {
    breadcrumbs.push({ name: '首页', path: '/dashboard' })
    breadcrumbs.push({ name: '设置', path: '/settings' })
  }

  return breadcrumbs
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    // 强制清除本地状态并跳转
    authStore.clearAuth()
    router.push('/login')
  }
}

const handleAddSuccess = () => {
  showAddModal.value = false
  // 可以触发数据刷新等操作
}

// 响应式处理
const handleResize = () => {
  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true
  }
}

// 生命周期
onMounted(() => {
  // 恢复侧边栏状态
  const savedCollapsed = localStorage.getItem('sidebarCollapsed')
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }

  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  // 响应式处理
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听路由变化，在移动端自动关闭侧边栏
watch(() => route.path, () => {
  if (window.innerWidth < 768) {
    showMobileSidebar.value = false
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--gradient-background);
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-lg);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  color: white;
}

.logo-text {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--secondary-800);
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--secondary-600);
  transition: all var(--transition-fast);
}

.sidebar-toggle:hover {
  background: var(--gray-100);
  color: var(--secondary-800);
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--spacing-xl);
}

.nav-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--secondary-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  color: var(--secondary-700);
  text-decoration: none;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-xs);
  position: relative;
}

.nav-item:hover {
  background: var(--primary-50);
  color: var(--primary-700);
}

.nav-item.active {
  background: var(--primary-100);
  color: var(--primary-800);
  font-weight: var(--font-medium);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

.nav-text {
  flex: 1;
  font-size: var(--text-sm);
}

.nav-badge {
  background: var(--primary-500);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--gray-50);
  transition: all var(--transition-fast);
}

.user-info.collapsed {
  justify-content: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  color: white;
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--secondary-800);
  margin-bottom: 2px;
}

.user-email {
  font-size: var(--text-xs);
  color: var(--secondary-500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--secondary-500);
  transition: all var(--transition-fast);
}

.logout-button:hover {
  background: var(--error-100);
  color: var(--error-600);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-normal);
}

.sidebar-collapsed .main-content {
  margin-left: 80px;
}

.top-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--secondary-600);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.breadcrumb-item {
  color: var(--secondary-600);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--transition-fast);
}

.breadcrumb-item:hover:not(.current) {
  color: var(--primary-600);
}

.breadcrumb-item.current {
  color: var(--secondary-800);
  font-weight: var(--font-medium);
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin-left: var(--spacing-sm);
  color: var(--secondary-400);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: 1px solid var(--gray-300);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--secondary-700);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.header-action:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.search-button:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
  color: var(--primary-700);
}

.add-button {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.add-button:hover {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

.theme-button {
  background: none;
  border: 1px solid var(--gray-300);
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--secondary-600);
  transition: all var(--transition-fast);
}

.theme-button:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.page-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

/* 遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
  display: none;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .action-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .sidebar-collapsed .main-content {
    margin-left: 0;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }

  .breadcrumb {
    display: none;
  }

  .page-content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .top-header {
    padding: 0 var(--spacing-lg);
  }

  .header-right {
    gap: var(--spacing-sm);
  }

  .header-action {
    padding: var(--spacing-sm);
  }

  .page-content {
    padding: var(--spacing-md);
  }
}
</style>