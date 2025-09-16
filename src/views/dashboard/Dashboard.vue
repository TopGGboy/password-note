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

        <!-- 调试信息区域 -->
        <div class="debug-info" v-if="showDebugInfo">
          <div class="debug-header">
            <h3>🔧 调试信息</h3>
            <button @click="toggleDebugInfo" class="toggle-debug-btn">
              {{ debugExpanded ? '收起' : '展开' }}
            </button>
          </div>
          
          <div v-if="debugExpanded" class="debug-content">
            <!-- Token 信息 -->
            <div class="debug-section">
              <h4>🔑 Token 信息</h4>
              <div class="debug-item">
                <label>访问 Token (Access Token):</label>
                <div class="token-display">
                  <code class="token-text">{{ debugInfo.accessToken || '无' }}</code>
                  <button v-if="debugInfo.accessToken" @click="copyToClipboard(debugInfo.accessToken)" class="copy-btn">复制</button>
                </div>
              </div>
              <div class="debug-item">
                <label>刷新 Token (Refresh Token):</label>
                <div class="token-display">
                  <code class="token-text">{{ debugInfo.refreshToken || '无' }}</code>
                  <button v-if="debugInfo.refreshToken" @click="copyToClipboard(debugInfo.refreshToken)" class="copy-btn">复制</button>
                </div>
              </div>
              <div class="debug-item">
                <label>Token 过期时间:</label>
                <span class="debug-value">{{ debugInfo.tokenExpiresAt || '未知' }}</span>
              </div>
              <div class="debug-item">
                <label>Token 剩余时间:</label>
                <span class="debug-value" :class="getTokenStatusClass()">{{ debugInfo.tokenTimeRemaining }}</span>
              </div>
            </div>

            <!-- 用户信息 -->
            <div class="debug-section">
              <h4>👤 用户信息</h4>
              <div class="debug-item">
                <label>用户名:</label>
                <span class="debug-value">{{ debugInfo.username || '无' }}</span>
              </div>
              <div class="debug-item">
                <label>邮箱:</label>
                <span class="debug-value">{{ debugInfo.email || '无' }}</span>
              </div>
              <div class="debug-item">
                <label>用户ID:</label>
                <span class="debug-value">{{ debugInfo.userId || '无' }}</span>
              </div>
            </div>

            <!-- 认证状态 -->
            <div class="debug-section">
              <h4>🔐 认证状态</h4>
              <div class="debug-item">
                <label>登录状态:</label>
                <span class="debug-value" :class="{ 'status-success': debugInfo.isLoggedIn, 'status-error': !debugInfo.isLoggedIn }">
                  {{ debugInfo.isLoggedIn ? '已登录' : '未登录' }}
                </span>
              </div>
              <div class="debug-item">
                <label>Token 有效:</label>
                <span class="debug-value" :class="{ 'status-success': debugInfo.hasValidToken, 'status-error': !debugInfo.hasValidToken }">
                  {{ debugInfo.hasValidToken ? '有效' : '无效' }}
                </span>
              </div>
              <div class="debug-item">
                <label>Token 过期:</label>
                <span class="debug-value" :class="{ 'status-error': debugInfo.isTokenExpired, 'status-success': !debugInfo.isTokenExpired }">
                  {{ debugInfo.isTokenExpired ? '已过期' : '未过期' }}
                </span>
              </div>
              <div class="debug-item">
                <label>即将过期:</label>
                <span class="debug-value" :class="{ 'status-warning': debugInfo.isTokenExpiringSoon, 'status-success': !debugInfo.isTokenExpiringSoon }">
                  {{ debugInfo.isTokenExpiringSoon ? '是' : '否' }}
                </span>
              </div>
            </div>

            <!-- 本地存储信息 -->
            <div class="debug-section">
              <h4>💾 本地存储</h4>
              <div class="debug-item" v-for="(value, key) in debugInfo.localStorage" :key="key">
                <label>{{ key }}:</label>
                <span class="debug-value">{{ value || '空' }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="debug-actions">
              <button @click="refreshDebugInfo" class="debug-action-btn">🔄 刷新信息</button>
              <button @click="testTokenRefresh" class="debug-action-btn">🔄 测试Token刷新</button>
              <button @click="clearAllTokens" class="debug-action-btn danger">🗑️ 清除所有Token</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { tokenManager } from '../../utils/auth/tokenManager'
import { STORAGE_KEYS } from '../../constants/constants'

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
      loginTime: new Date().toLocaleString('zh-CN'),
      showDebugInfo: process.env.NODE_ENV === 'development', // 只在开发环境显示
      debugExpanded: false,
      debugInfo: {
        accessToken: '',
        refreshToken: '',
        tokenExpiresAt: '',
        tokenTimeRemaining: '',
        username: '',
        email: '',
        userId: '',
        isLoggedIn: false,
        hasValidToken: false,
        isTokenExpired: false,
        isTokenExpiringSoon: false,
        localStorage: {}
      }
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
    
    // 初始化调试信息
    this.refreshDebugInfo()
    
    // 每5秒更新一次调试信息
    if (this.showDebugInfo) {
      setInterval(() => {
        this.refreshDebugInfo()
      }, 5000)
    }
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
    },

    // 切换调试信息展开状态
    toggleDebugInfo() {
      this.debugExpanded = !this.debugExpanded
      if (this.debugExpanded) {
        this.refreshDebugInfo()
      }
    },

    // 刷新调试信息
    refreshDebugInfo() {
      const accessToken = tokenManager.getAccessToken()
      const refreshToken = tokenManager.getRefreshToken()
      const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      
      // 计算剩余时间
      let timeRemaining = '未知'
      if (expiresAt) {
        const remaining = parseInt(expiresAt) - Date.now()
        if (remaining > 0) {
          const minutes = Math.floor(remaining / (1000 * 60))
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
          timeRemaining = `${minutes}分${seconds}秒`
        } else {
          timeRemaining = '已过期'
        }
      }

      this.debugInfo = {
        accessToken: accessToken ? this.truncateToken(accessToken) : '',
        refreshToken: refreshToken ? this.truncateToken(refreshToken) : '',
        tokenExpiresAt: expiresAt ? new Date(parseInt(expiresAt)).toLocaleString('zh-CN') : '',
        tokenTimeRemaining: timeRemaining,
        username: localStorage.getItem(STORAGE_KEYS.USERNAME) || '',
        email: localStorage.getItem('email') || '',
        userId: localStorage.getItem(STORAGE_KEYS.USER_ID) || '',
        isLoggedIn: this.authStore.isLoggedIn,
        hasValidToken: tokenManager.hasValidToken(),
        isTokenExpired: tokenManager.isTokenExpired(),
        isTokenExpiringSoon: tokenManager.isTokenExpiringSoon(),
        localStorage: {
          [STORAGE_KEYS.ACCESS_TOKEN]: accessToken ? '存在' : '不存在',
          [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken ? '存在' : '不存在',
          [STORAGE_KEYS.TOKEN_EXPIRES_AT]: localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT) || '无',
          [STORAGE_KEYS.USERNAME]: localStorage.getItem(STORAGE_KEYS.USERNAME) || '无',
          [STORAGE_KEYS.USER_ID]: localStorage.getItem(STORAGE_KEYS.USER_ID) || '无',
          'email': localStorage.getItem('email') || '无'
        }
      }
    },

    // 截断 token 显示（显示前后部分，中间用...代替）
    truncateToken(token: string): string {
      if (!token) return ''
      if (token.length <= 50) return token
      return `${token.substring(0, 20)}...${token.substring(token.length - 20)}`
    },

    // 获取 token 状态样式类
    getTokenStatusClass(): string {
      if (this.debugInfo.isTokenExpired) return 'status-error'
      if (this.debugInfo.isTokenExpiringSoon) return 'status-warning'
      return 'status-success'
    },

    // 复制到剪贴板
    async copyToClipboard(text: string) {
      try {
        // 获取完整的 token
        const fullToken = text.includes('...') 
          ? (text.startsWith(tokenManager.getAccessToken()?.substring(0, 20) || '') 
             ? tokenManager.getAccessToken() 
             : tokenManager.getRefreshToken())
          : text
        
        await navigator.clipboard.writeText(fullToken || text)
        alert('已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        alert('复制失败')
      }
    },

    // 测试 token 刷新
    async testTokenRefresh() {
      try {
        console.log('🔄 开始测试 Token 刷新...')
        await tokenManager.refreshToken()
        alert('Token 刷新成功！')
        this.refreshDebugInfo()
      } catch (error: any) {
        console.error('Token 刷新失败:', error)
        alert(`Token 刷新失败: ${error?.message || '未知错误'}`)
      }
    },

    // 清除所有 tokens
    clearAllTokens() {
      if (confirm('确定要清除所有 Token 吗？这将导致退出登录。')) {
        tokenManager.clearTokens()
        this.authStore.clearAuth()
        alert('所有 Token 已清除')
        this.refreshDebugInfo()
        setTimeout(() => {
          this.router.push('/login')
        }, 1000)
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

/* 调试信息样式 */
.debug-info {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #ffc107;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #fff3cd;
  border-bottom: 1px solid #ffeaa7;
}

.debug-header h3 {
  margin: 0;
  color: #856404;
  font-size: 18px;
}

.toggle-debug-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.toggle-debug-btn:hover {
  background: #e0a800;
}

.debug-content {
  padding: 30px;
}

.debug-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.debug-section h4 {
  color: #495057;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
}

.debug-item label {
  font-weight: 500;
  color: #6c757d;
  min-width: 150px;
}

.debug-value {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.token-text {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #495057;
  border: 1px solid #dee2e6;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background: #0056b3;
}

.status-success {
  color: #28a745;
  font-weight: 600;
}

.status-warning {
  color: #ffc107;
  font-weight: 600;
}

.status-error {
  color: #dc3545;
  font-weight: 600;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.debug-action-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.debug-action-btn:hover {
  background: #5a6268;
}

.debug-action-btn.danger {
  background: #dc3545;
}

.debug-action-btn.danger:hover {
  background: #c82333;
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

  .debug-content {
    padding: 20px;
  }

  .debug-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .debug-item label {
    min-width: auto;
  }

  .token-display {
    width: 100%;
    justify-content: flex-start;
  }

  .token-text {
    max-width: 100%;
  }

  .debug-actions {
    flex-direction: column;
  }

  .debug-action-btn {
    width: 100%;
  }
}
</style>