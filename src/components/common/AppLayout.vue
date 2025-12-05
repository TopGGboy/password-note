<template>
  <div class="app-shell" :class="{ dark: isDarkMode }">
    <!-- 顶部导航 -->
    <header class="nav">
      <div class="nav-left">
        <router-link to="/dashboard" class="brand">
          <div class="brand-icon">🔐</div>
          <div class="brand-text">
            <div class="brand-title">密码笔记</div>
            <div class="brand-sub">安全 · 私有 · 高效</div>
          </div>
        </router-link>

        <nav class="nav-links">
          <router-link to="/passwords" class="nav-link" :class="{ active: $route.path.startsWith('/passwords') }">密码</router-link>
          <router-link to="/categories" class="nav-link" :class="{ active: $route.path.startsWith('/categories') }">分类</router-link>
          <router-link to="/security" class="nav-link" :class="{ active: $route.path.startsWith('/security') }">安全中心</router-link>
          <router-link to="/settings" class="nav-link" :class="{ active: $route.path.startsWith('/settings') }">设置</router-link>
        </nav>
      </div>

      <div class="nav-right">
        <div class="search-box" title="搜索（占位）">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="搜索条目..." @keydown.enter.prevent="goSearch" />
        </div>

        <button class="btn btn-primary" @click="showAddModal = true">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span class="hide-sm">新增密码</span>
        </button>

        <button class="btn btn-icon" @click="toggleTheme" :title="isDarkMode ? '切换为浅色' : '切换为深色'">
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

        <div class="user" :title="username">
          <div class="avatar">{{ userInitials }}</div>
          <span class="user-name hide-sm">{{ username }}</span>
          <button class="btn btn-danger outline hide-sm" @click="handleLogout">退出</button>
        </div>
      </div>
    </header>

    <!-- 首页：仅在 /dashboard 渲染 -->
    <section v-if="$route.path === '/dashboard'" class="home">
      <!-- 首屏 -->
      <div class="hero">
        <div class="hero-content">
          <h1>你的私人密码库</h1>
          <p>端到端加密 · 本地优先 · 一键检索 · 分类管理。用简单安全的方式，管理你所有的账号与密钥。</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" @click="showAddModal = true">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" />
              </svg>
              立即添加
            </button>
            <router-link to="/passwords" class="btn btn-secondary btn-lg">浏览所有密码</router-link>
          </div>
          <div class="hero-note">
            <span class="badge badge-success">已登录</span>
            <span class="muted">欢迎回来，{{ username }}！</span>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="lock"></div>
          <div class="shine"></div>
        </div>
      </div>

      <!-- 亮点功能 -->
      <div class="features">
        <div class="feature-card card">
          <div class="feature-icon gradient">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>本地加密</h3>
          <p>敏感数据仅在本地加密，密钥不出设备，零信任设计。</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon gradient2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </div>
          <h3>极速检索</h3>
          <p>键入即搜，多维度筛选与标签，秒级定位目标账号。</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon gradient3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3>分类与安全</h3>
          <p>多层分类、强度检测、安全提醒，持续优化你的密码健康度。</p>
        </div>
      </div>

      <!-- 快速入口 -->
      <div class="quick">
        <div class="quick-card card">
          <div class="qc-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div class="qc-info">
            <h4>新增密码</h4>
            <p>保存一个新的账号或密钥</p>
          </div>
          <button class="btn btn-link" @click="showAddModal = true">开始</button>
        </div>

        <router-link class="quick-card card" to="/passwords">
          <div class="qc-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </div>
          <div class="qc-info">
            <h4>全部密码</h4>
            <p>查看与管理所有条目</p>
          </div>
          <span class="btn btn-link">进入</span>
        </router-link>

        <router-link class="quick-card card" to="/categories">
          <div class="qc-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="qc-info">
            <h4>分类管理</h4>
            <p>按类别整理与筛选</p>
          </div>
          <span class="btn btn-link">进入</span>
        </router-link>

        <router-link class="quick-card card" to="/security">
          <div class="qc-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div class="qc-info">
            <h4>安全中心</h4>
            <p>查看强度与安全建议</p>
          </div>
          <span class="btn btn-link">进入</span>
        </router-link>
      </div>

      <!-- 提示 -->
      <div class="notice card">
        温馨提示：请定期更换重要账户密码并开启双因素认证。
      </div>
    </section>

    <!-- 其他页面：直接渲染内容区域（无侧栏） -->
    <section v-else class="content">
      <router-view />
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="left">
          <span class="muted">© {{ new Date().getFullYear() }} 密码笔记</span>
          <span class="dot">·</span>
          <a class="muted link" href="javascript:void(0)">隐私</a>
          <span class="dot">·</span>
          <a class="muted link" href="javascript:void(0)">协议</a>
        </div>
        <div class="right">
          <span class="muted">v1.0.0</span>
        </div>
      </div>
    </footer>

    <!-- 添加密码模态框 -->
    <AddPasswordModal v-if="showAddModal" @close="showAddModal = false" @success="handleAddSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import AddPasswordModal from '../modals/AddPasswordModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const showAddModal = ref(false)
const isDarkMode = ref(false)

const username = computed(() => authStore.user?.username || '用户')
const userInitials = computed(() => username.value.charAt(0).toUpperCase())

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (e) {
    authStore.clearAuth()
    router.push('/login')
  }
}

const handleAddSuccess = () => {
  showAddModal.value = false
}

const goSearch = () => {
  // 可在此触发搜索弹窗或跳转到搜索页
  router.push('/passwords')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
})
</script>

<style scoped>
/* 基础布局 */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--gradient-background);
}

/* 顶部导航 */
.nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-2xl);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: all var(--transition-normal);
}

.nav:hover {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

/* 暗色主题导航栏 */
.app-shell.dark .nav {
  background: rgba(17, 24, 39, 0.95);
  border-bottom-color: var(--gray-700);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: inherit;
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.brand:hover {
  transform: translateY(-2px);
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  background: var(--gradient-primary);
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  transition: all var(--transition-normal);
  animation: pulse 3s infinite;
}

.brand:hover .brand-icon {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  transform: scale(1.05) rotate(5deg);
}

.brand-text {
  line-height: 1.1;
}

.brand-title {
  font-weight: var(--font-extrabold);
  font-size: var(--text-lg);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all var(--transition-normal);
}

.brand:hover .brand-title {
  background-position: 200% center;
}

.brand-sub {
  font-size: var(--text-xs);
  color: var(--secondary-500);
  font-weight: var(--font-medium);
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  padding: 6px;
  border-radius: var(--radius-full);
  border: 1px solid var(--gray-200);
  backdrop-filter: blur(10px);
}

/* 暗色主题导航链接容器 */
.app-shell.dark .nav-links {
  background: rgba(31, 41, 55, 0.5);
  border-color: var(--gray-700);
}

.nav-link {
  padding: 10px 16px;
  border-radius: var(--radius-full);
  color: var(--secondary-700);
  text-decoration: none;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--gradient-primary-soft);
  transition: left var(--transition-normal);
  z-index: -1;
}

.nav-link:hover {
  color: var(--primary-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.nav-link:hover::before {
  left: 0;
}

.nav-link.active {
  background: var(--gradient-primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.nav-link.active::before {
  background: none;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--gray-300);
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 16px;
  border-radius: var(--radius-full);
  min-width: 260px;
  transition: all var(--transition-fast);
  backdrop-filter: blur(10px);
}

/* 暗色主题搜索框 */
.app-shell.dark .search-box {
  background: rgba(31, 41, 55, 0.8);
  border-color: var(--gray-700);
}

.search-box:hover,
.search-box:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  background: transparent;
  color: var(--secondary-800);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.search-box input::placeholder {
  color: var(--secondary-500);
  font-weight: var(--font-normal);
}

.user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-fast);
}

/* 暗色主题用户区域 */
.app-shell.dark .user {
  background: rgba(31, 41, 55, 0.8);
  border-color: var(--gray-700);
}

.user:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-500);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: var(--font-bold);
  font-size: var(--text-base);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all var(--transition-fast);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
}

.avatar::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
}

.user:hover .avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.user-name {
  color: var(--secondary-800);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  cursor: pointer;
  border: 1px solid var(--gray-300);
  color: var(--secondary-700);
  background: #fff;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-icon {
  padding: var(--spacing-sm);
  width: 36px;
  height: 36px;
}

.btn-primary {
  background: var(--gradient-primary);
  border-color: var(--primary-500);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #764ba2 100%);
  border-color: var(--primary-600);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--secondary-100);
  color: var(--secondary-800);
  border-color: var(--secondary-200);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--secondary-200);
  border-color: var(--secondary-300);
}

.btn-danger {
  border-color: var(--error-400);
  color: var(--error-600);
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-50);
  border-color: var(--error-500);
}

.btn-link {
  background: transparent;
  border: none;
  color: var(--primary-700);
  padding: 0;
}

.btn-link:hover:not(:disabled) {
  color: var(--primary-900);
  text-decoration: underline;
}

.btn-lg {
  padding: 12px 16px;
  font-weight: var(--font-medium);
}

.icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* 首页 hero */
.home {
  flex: 1;
  padding: var(--spacing-4xl) var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.hero {
  background: var(--gradient-hero);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-3xl);
  padding: var(--spacing-5xl);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-5xl);
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15);
  position: relative;
  overflow: hidden;
}

/* 暗色主题Hero */
.app-shell.dark .hero {
  border-color: var(--gray-700);
  box-shadow: 0 20px 60px rgba(79, 70, 229, 0.2);
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 200%;
  background: var(--gradient-primary-glow);
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 60%;
  height: 120%;
  background: var(--gradient-secondary-glow);
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 8s ease-in-out infinite reverse;
}

.hero-content {
  position: relative;
  z-index: 2;
  animation: fadeIn 0.8s ease-out;
}

.hero-content h1 {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: var(--font-black);
  color: var(--secondary-900);
  margin-bottom: var(--spacing-xl);
  line-height: 1.1;
  letter-spacing: -0.5px;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  font-size: clamp(16px, 2vw, 18px);
  color: var(--secondary-600);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.6;
  font-weight: var(--font-medium);
  max-width: 500px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.8);
  padding: 12px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--gray-200);
  backdrop-filter: blur(10px);
  width: fit-content;
  animation: slideIn 0.8s ease-out 0.3s both;
}

/* 暗色主题Hero Note */
.app-shell.dark .hero-note {
  background: rgba(31, 41, 55, 0.8);
  border-color: var(--gray-700);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
}

.badge-success {
  background: var(--success-100);
  color: var(--success-800);
}

.muted {
  color: var(--secondary-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.hero-visual {
  position: relative;
  min-height: 280px;
  background: var(--gradient-hero-accent);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  border: 2px solid transparent;
  background-clip: padding-box;
  animation: scaleIn 0.8s ease-out 0.2s both;
}

.hero-visual::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-2xl);
  background: var(--gradient-border);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 0;
  animation: rotateBorder 8s linear infinite;
}

@keyframes rotateBorder {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.hero-visual .lock {
  position: absolute;
  inset: 32px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(238, 242, 255, 0.9));
  box-shadow: inset 0 0 0 1px var(--gray-200), var(--shadow-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  z-index: 1;
  animation: bounce 2s infinite;
}

/* 暗色主题锁图标背景 */
.app-shell.dark .hero-visual .lock {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.9));
}

.hero-visual .shine {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 140%;
  height: 80%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: rotate(20deg);
  filter: blur(15px);
  animation: shine 6s linear infinite;
  z-index: 2;
}

@keyframes shine {
  0% { transform: translateX(-60%) rotate(20deg); }
  100% { transform: translateX(60%) rotate(20deg); }
}

/* 功能亮点 */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-5xl);
  position: relative;
}

.features::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 40%;
  background: var(--gradient-primary-glow);
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  z-index: -1;
}

.feature-card {
  padding: var(--spacing-2xl);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 1px solid var(--gray-200);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.6s ease-out forwards;
}

/* 暗色主题功能卡片 */
.app-shell.dark .feature-card {
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%);
  border-color: var(--gray-700);
}

.feature-card:nth-child(1) {
  animation-delay: 0.1s;
  opacity: 0;
}

.feature-card:nth-child(2) {
  animation-delay: 0.2s;
  opacity: 0;
}

.feature-card:nth-child(3) {
  animation-delay: 0.3s;
  opacity: 0;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2);
  border-color: var(--primary-400);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-2xl);
  display: grid;
  place-items: center;
  margin-bottom: var(--spacing-lg);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  font-size: 24px;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.feature-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-2xl);
  z-index: -1;
}

.feature-icon.gradient {
  background: linear-gradient(135deg, rgba(219, 226, 254, 0.8), rgba(238, 242, 255, 0.8));
  color: var(--primary-700);
}

.feature-icon.gradient::before {
  background: var(--gradient-primary);
}

.feature-icon.gradient2 {
  background: linear-gradient(135deg, rgba(220, 252, 231, 0.8), rgba(240, 253, 244, 0.8));
  color: var(--success-700);
}

.feature-icon.gradient2::before {
  background: var(--gradient-success);
}

.feature-icon.gradient3 {
  background: linear-gradient(135deg, rgba(254, 226, 226, 0.8), rgba(255, 247, 237, 0.8));
  color: var(--error-700);
}

.feature-icon.gradient3::before {
  background: var(--gradient-error);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.feature-card h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--secondary-900);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  line-height: 1.3;
  transition: all var(--transition-normal);
}

.feature-card:hover h3 {
  color: var(--primary-700);
}

.feature-card p {
  color: var(--secondary-600);
  font-size: var(--text-base);
  line-height: 1.6;
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

/* 快速入口 */
.quick {
  margin-top: var(--spacing-5xl);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
  position: relative;
}

.quick-card {
  padding: var(--spacing-2xl);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 1px solid var(--gray-200);
  backdrop-filter: blur(10px);
  animation: scaleIn 0.6s ease-out forwards;
  opacity: 0;
}

/* 暗色主题快速入口卡片 */
.app-shell.dark .quick-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%);
  border-color: var(--gray-700);
}

.quick-card:nth-child(1) { animation-delay: 0.1s; }
.quick-card:nth-child(2) { animation-delay: 0.2s; }
.quick-card:nth-child(3) { animation-delay: 0.3s; }
.quick-card:nth-child(4) { animation-delay: 0.4s; }

.quick-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.2);
  border-color: var(--primary-500);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
}

/* 暗色主题快速入口卡片hover */
.app-shell.dark .quick-card:hover {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(31, 41, 55, 0.7) 100%);
}

.qc-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-2xl);
  display: grid;
  place-items: center;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  font-size: 22px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.qc-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-2xl);
  z-index: -1;
}

.qc-icon.blue { 
  background: rgba(238, 242, 255, 0.8); 
  color: var(--primary-700); 
}

.qc-icon.blue::before {
  background: var(--gradient-primary);
}

.qc-icon.green { 
  background: rgba(236, 254, 255, 0.8); 
  color: var(--info-700); 
}

.qc-icon.green::before {
  background: var(--gradient-info);
}

.qc-icon.purple { 
  background: rgba(245, 243, 255, 0.8); 
  color: var(--secondary-700); 
}

.qc-icon.purple::before {
  background: var(--gradient-secondary);
}

.qc-icon.orange { 
  background: rgba(255, 247, 237, 0.8); 
  color: var(--accent-700); 
}

.qc-icon.orange::before {
  background: var(--gradient-accent);
}

.quick-card:hover .qc-icon {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.qc-info h4 {
  margin: 0 0 4px 0;
  color: var(--secondary-900);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  transition: all var(--transition-fast);
}

.quick-card:hover .qc-info h4 {
  color: var(--primary-700);
}

.qc-info p {
  margin: 0;
  color: var(--secondary-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
}

.quick-card:hover .qc-info p {
  color: var(--secondary-600);
}

/* 提示 */
.notice {
  margin-top: var(--spacing-4xl);
  background: var(--gradient-accent-soft);
  border: 1px solid var(--accent-200);
  color: var(--accent-800);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  text-align: center;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out 0.5s both;
}

.notice::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-accent);
  animation: pulse 2s infinite;
}

/* 暗色主题提示 */
.app-shell.dark .notice {
  background: rgba(79, 70, 229, 0.1);
  border-color: rgba(79, 70, 229, 0.3);
  color: var(--primary-300);
}

.app-shell.dark .notice::before {
  background: var(--gradient-primary);
}

/* 其他页面容器 */
.content {
  flex: 1;
  padding: var(--spacing-xl);
}

/* 页脚 */
.footer {
  border-top: 1px solid var(--gray-200);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.link {
  text-decoration: none;
  color: var(--secondary-600);
  transition: color var(--transition-fast);
}

.link:hover {
  color: var(--secondary-900);
}

.dot {
  margin: 0 8px;
  color: var(--secondary-400);
}

/* 响应式 */
.hide-sm {
  display: inline;
}

.hide-xs {
  display: inline;
}

/* 平板设备 */
@media (max-width: 1024px) {
  .features { 
    grid-template-columns: repeat(2, 1fr); 
    gap: var(--spacing-xl);
  }
  
  .quick { 
    grid-template-columns: repeat(2, 1fr); 
    gap: var(--spacing-lg);
  }
  
  .hero {
    gap: var(--spacing-3xl);
    padding: var(--spacing-3xl);
  }
  
  .hero-visual {
    min-height: 240px;
  }
  
  .nav {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
}

/* 手机设备 */
@media (max-width: 768px) {
  .nav { 
    padding: var(--spacing-md) var(--spacing-lg); 
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
  
  .nav-left {
    gap: var(--spacing-lg);
    flex: 1;
  }
  
  .nav-right {
    order: -1;
    width: 100%;
    justify-content: space-between;
  }
  
  .nav-links { 
    display: none; 
  }
  
  .search-box { 
    min-width: 0;
    flex: 1;
  }
  
  .search-box input { 
    width: 100%;
  }
  
  .user {
    padding: 6px 10px;
  }
  
  .user-name {
    display: none;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    font-size: var(--text-sm);
  }
  
  .brand-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .brand-title {
    font-size: var(--text-base);
  }
  
  .brand-sub {
    display: none;
  }
  
  .hero { 
    grid-template-columns: 1fr; 
    padding: var(--spacing-2xl);
    gap: var(--spacing-2xl);
    border-radius: var(--radius-2xl);
  }
  
  .hero-content h1 {
    font-size: clamp(24px, 5vw, 32px);
    text-align: center;
  }
  
  .hero-content p {
    text-align: center;
    max-width: 100%;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-note {
    margin: 0 auto;
  }
  
  .hero-visual {
    min-height: 200px;
  }
  
  .hero-visual .lock {
    font-size: 60px;
  }
  
  .home {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
  
  .features,
  .quick {
    margin-top: var(--spacing-3xl);
  }
  
  .feature-card {
    padding: var(--spacing-xl);
  }
  
  .quick-card {
    padding: var(--spacing-xl);
  }
  
  .hide-sm {
    display: none;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .features { 
    grid-template-columns: 1fr; 
    gap: var(--spacing-xl);
  }
  
  .quick { 
    grid-template-columns: 1fr; 
    gap: var(--spacing-lg);
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-actions .btn {
    justify-content: center;
  }
  
  .nav {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .nav-left {
    gap: var(--spacing-md);
  }
  
  .brand-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .brand-title {
    font-size: var(--text-sm);
  }
  
  .search-box {
    padding: 8px 12px;
  }
  
  .hero {
    padding: var(--spacing-xl);
  }
  
  .home {
    padding: var(--spacing-xl) var(--spacing-md);
  }
  
  .feature-card {
    padding: var(--spacing-lg);
  }
  
  .feature-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .qc-icon {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  
  .feature-card h3 {
    font-size: var(--text-lg);
  }
  
  .qc-info h4 {
    font-size: var(--text-base);
  }
  
  .hide-xs {
    display: none;
  }
  
  .content {
    padding: var(--spacing-lg);
  }
}
</style>