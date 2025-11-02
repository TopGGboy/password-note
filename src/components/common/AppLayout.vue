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

        <button class="btn primary" @click="showAddModal = true">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span class="hide-sm">新增密码</span>
        </button>

        <button class="btn ghost" @click="toggleTheme" :title="isDarkMode ? '切换为浅色' : '切换为深色'">
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
          <button class="btn danger outline hide-sm" @click="handleLogout">退出</button>
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
            <button class="btn primary lg" @click="showAddModal = true">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" />
              </svg>
              立即添加
            </button>
            <router-link to="/passwords" class="btn ghost lg">浏览所有密码</router-link>
          </div>
          <div class="hero-note">
            <span class="badge success">已登录</span>
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
        <div class="feature-card">
          <div class="feature-icon gradient">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>本地加密</h3>
          <p>敏感数据仅在本地加密，密钥不出设备，零信任设计。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon gradient2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </div>
          <h3>极速检索</h3>
          <p>键入即搜，多维度筛选与标签，秒级定位目标账号。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon gradient3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3>分类与安全</h3>
          <p>多层分类、强度检测、安全提醒，持续优化你的密码健康度。</p>
        </div>
      </div>

      <!-- 快速入口 -->
      <div class="quick">
        <div class="quick-card">
          <div class="qc-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div class="qc-info">
            <h4>新增密码</h4>
            <p>保存一个新的账号或密钥</p>
          </div>
          <button class="btn link" @click="showAddModal = true">开始</button>
        </div>

        <router-link class="quick-card" to="/passwords">
          <div class="qc-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </div>
          <div class="qc-info">
            <h4>全部密码</h4>
            <p>查看与管理所有条目</p>
          </div>
          <span class="btn link">进入</span>
        </router-link>

        <router-link class="quick-card" to="/categories">
          <div class="qc-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="qc-info">
            <h4>分类管理</h4>
            <p>按类别整理与筛选</p>
          </div>
          <span class="btn link">进入</span>
        </router-link>

        <router-link class="quick-card" to="/security">
          <div class="qc-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div class="qc-info">
            <h4>安全中心</h4>
            <p>查看强度与安全建议</p>
          </div>
          <span class="btn link">进入</span>
        </router-link>
      </div>

      <!-- 提示 -->
      <div class="notice">
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
  background: var(--bg-secondary);
}

/* 顶部导航 */
.nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: inherit;
  text-decoration: none;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  display: grid;
  place-items: center;
  color: #fff;
  font-size: var(--text-lg);
  box-shadow: var(--shadow-md);
}

.brand-text {
  line-height: 1.1;
}

.brand-title {
  font-weight: var(--font-bold);
  color: var(--secondary-800);
}

.brand-sub {
  font-size: var(--text-xs);
  color: var(--secondary-500);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.nav-link {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  color: var(--secondary-700);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.nav-link:hover {
  background: var(--gray-100);
  color: var(--secondary-900);
}

.nav-link.active {
  background: var(--primary-100);
  color: var(--primary-800);
  font-weight: var(--font-medium);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--gray-300);
  background: var(--bg-primary, #fff);
  padding: 6px 10px;
  border-radius: var(--radius-lg);
  min-width: 220px;
}

.search-box input {
  border: none;
  outline: none;
  width: 160px;
  background: transparent;
  color: var(--secondary-800);
  font-size: var(--text-sm);
}

.user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: var(--font-bold);
}

.user-name {
  color: var(--secondary-700);
  font-size: var(--text-sm);
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
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast), border var(--transition-fast);
  text-decoration: none;
}

.btn.ghost:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.btn.primary {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: #fff;
}

.btn.primary:hover {
  background: var(--primary-600);
  border-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn.outline {
  background: transparent;
}

.btn.danger {
  border-color: var(--error-400);
  color: var(--error-600);
}

.btn.danger:hover {
  background: var(--error-50);
  border-color: var(--error-500);
}

.btn.link {
  background: transparent;
  border: none;
  color: var(--primary-700);
  padding: 0;
}

.btn.lg {
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
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.hero {
  background: linear-gradient(135deg, var(--primary-50), #fff);
  border: 1px solid var(--border-color, var(--gray-200));
  border-radius: 16px;
  padding: var(--spacing-2xl);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
}

.hero-content h1 {
  font-size: clamp(24px, 4vw, 36px);
  color: var(--secondary-900);
  margin-bottom: var(--spacing-md);
}

.hero-content p {
  color: var(--secondary-600);
  margin-bottom: var(--spacing-xl);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.hero-note {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.badge.success {
  background: #e6f9f0;
  color: #16a34a;
  border: 1px solid #86efac;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.muted {
  color: var(--secondary-500);
  font-size: 12px;
}

.hero-visual {
  position: relative;
  min-height: 220px;
  background: radial-gradient(120px 120px at 70% 30%, rgba(59,130,246,0.15), transparent 60%),
              radial-gradient(140px 140px at 30% 70%, rgba(99,102,241,0.15), transparent 60%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px dashed var(--gray-200);
}

.hero-visual .lock {
  position: absolute;
  inset: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff, var(--primary-50));
  box-shadow: inset 0 0 0 1px var(--gray-200), var(--shadow-sm);
}

.hero-visual .shine {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 140%;
  height: 80%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  transform: rotate(20deg);
  filter: blur(10px);
  animation: shine 5s linear infinite;
}

@keyframes shine {
  0% { transform: translateX(-60%) rotate(20deg); }
  100% { transform: translateX(60%) rotate(20deg); }
}

/* 功能亮点 */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.feature-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border var(--transition-fast);
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--gray-200);
}

.feature-icon.gradient {
  background: linear-gradient(135deg, #dbeafe, #eef2ff);
}
.feature-icon.gradient2 {
  background: linear-gradient(135deg, #dcfce7, #f0fdf4);
}
.feature-icon.gradient3 {
  background: linear-gradient(135deg, #fee2e2, #fff7ed);
}

.feature-card h3 {
  margin-bottom: 6px;
  color: var(--secondary-900);
}

.feature-card p {
  color: var(--secondary-600);
  font-size: var(--text-sm);
}

/* 快速入口 */
.quick {
  margin-top: var(--spacing-2xl);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.quick-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--spacing-lg);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: inherit;
  transition: border var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.quick-card:hover {
  border-color: var(--gray-300);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.qc-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  border: 1px solid var(--gray-200);
}

.qc-icon.blue { background: #eff6ff; color: #2563eb; }
.qc-icon.green { background: #ecfeff; color: #0891b2; }
.qc-icon.purple { background: #f5f3ff; color: #7c3aed; }
.qc-icon.orange { background: #fff7ed; color: #ea580c; }

.qc-info h4 {
  margin: 0 0 4px 0;
  color: var(--secondary-900);
}

.qc-info p {
  margin: 0;
  color: var(--secondary-500);
  font-size: var(--text-sm);
}

/* 提示 */
.notice {
  margin-top: var(--spacing-xl);
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  padding: 12px 14px;
  border-radius: 10px;
  box-shadow: var(--shadow-xs);
}

/* 其他页面容器 */
.content {
  flex: 1;
  padding: var(--spacing-xl);
}

/* 页脚 */
.footer {
  border-top: 1px solid var(--gray-200);
  background: #fff;
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

@media (max-width: 1024px) {
  .features { grid-template-columns: repeat(2, 1fr); }
  .quick { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .nav { padding: var(--spacing-md) var(--spacing-lg); }
  .nav-links { display: none; }
  .search-box { min-width: 0; }
  .search-box input { width: 100px; }
  .hero { grid-template-columns: 1fr; }
  .hide-sm { display: none; }
}

@media (max-width: 480px) {
  .features { grid-template-columns: 1fr; }
  .quick { grid-template-columns: 1fr; }
}
</style>