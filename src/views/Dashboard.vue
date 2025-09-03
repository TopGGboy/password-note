<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>密码笔记 - 控制台</h1>
        <div class="user-info">
          <span class="welcome-text">欢迎，{{ username }}！</span>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="dashboard-content">
        <div class="welcome-card">
          <h2>欢迎回来！</h2>
          <p>您已成功登录到密码笔记系统</p>
          <div class="user-details">
            <p><strong>用户名：</strong>{{ username }}</p>
            <p><strong>登录时间：</strong>{{ loginTime }}</p>
            <p><strong>Token状态：</strong>
              <span class="status-active">已认证</span>
            </p>
          </div>
        </div>

        <div class="quick-actions">
          <h3>快速操作</h3>
          <div class="action-buttons">
            <button class="action-btn primary">
              <span class="btn-icon">📝</span>
              添加密码
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">🔍</span>
              搜索密码
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">⚙️</span>
              设置
            </button>
            <button class="action-btn secondary">
              <span class="btn-icon">📊</span>
              统计
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    return {
      authStore,
      router
    }
  },
  data() {
    return {
      loginTime: new Date().toLocaleString('zh-CN')
    }
  },
  computed: {
    username(): string {
      return this.authStore.user?.username || localStorage.getItem('username') || '用户'
    }
  },
  async mounted() {
    // 检查认证状态
    if (!this.authStore.token && !localStorage.getItem('accessToken')) {
      this.router.push('/login')
      return
    }
    
    console.log('Dashboard加载完成')
    console.log('当前用户:', this.username)
    console.log('Token存在:', !!this.authStore.token)
  },
  methods: {
    async handleLogout() {
      try {
        await this.authStore.logout()
        this.router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
        // 即使API调用失败，也清除本地数据并跳转
        this.authStore.clearAuth()
        this.router.push('/login')
      }
    }
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.dashboard-header h1 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text {
  color: #666;
  font-size: 16px;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c82333;
}

.dashboard-main {
  padding: 40px 20px;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 30px;
}

.welcome-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.welcome-card p {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.user-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #007bff;
}

.user-details p {
  margin: 8px 0;
  color: #333;
}

.status-active {
  color: #28a745;
  font-weight: 600;
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e9ecef;
}

.action-btn.secondary:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .user-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>