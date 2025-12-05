<template>
  <div class="dashboard-container">
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
          <button class="action-btn primary" @click="$router.push('/passwords')">
            <span class="btn-icon">📝</span>
            添加密码
          </button>
          <button class="action-btn secondary" @click="$router.push('/passwords')">
            <span class="btn-icon">🔍</span>
            搜索密码
          </button>
          <button class="action-btn secondary" @click="$router.push('/settings')">
            <span class="btn-icon">⚙️</span>
            设置
          </button>
          <button class="action-btn secondary" @click="$router.push('/security')">
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
        alert('复制失败')
      }
    },

    // 测试 token 刷新
    async testTokenRefresh() {
      try {

        await tokenManager.refreshToken()
        alert('Token 刷新成功！')
        this.refreshDebugInfo()
      } catch (error: any) {

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
  padding: 0;
  background: transparent;
}

.dashboard-content {
  padding: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: var(--spacing-3xl);
}

.welcome-card {
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.welcome-card h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}

.welcome-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--text-base);
  line-height: 1.6;
}

.user-details {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border-left: 4px solid var(--primary-500);
}

.user-details p {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.status-active {
  color: var(--success-600);
  font-weight: var(--font-semibold);
}

.quick-actions {
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.quick-actions:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.quick-actions h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border: none;
  border-radius: var(--radius-xl);
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.action-btn.secondary:hover {
  background: var(--bg-tertiary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: var(--text-xl);
}

/* 调试信息样式 */
.debug-info {
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--warning-400);
  overflow: hidden;
  transition: all 0.3s ease;
}

.debug-info:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-2xl);
  background: var(--warning-50);
  border-bottom: 1px solid var(--warning-200);
}

.debug-header h3 {
  margin: 0;
  color: var(--warning-800);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.toggle-debug-btn {
  background: var(--warning-500);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: background-color 0.3s ease;
}

.toggle-debug-btn:hover {
  background: var(--warning-600);
}

.debug-content {
  padding: var(--spacing-2xl);
}

.debug-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.debug-section h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-xs) 0;
}

.debug-item label {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  min-width: 150px;
  font-size: var(--text-sm);
}

.debug-value {
  font-family: 'Courier New', monospace;
  background: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-primary);
}

.token-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: flex-end;
}

.token-text {
  background: var(--bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: var(--text-xs);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  background: var(--primary-500);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-xs);
  transition: background-color 0.3s ease;
}

.copy-btn:hover {
  background: var(--primary-600);
}

.status-success {
  color: var(--success-600);
  font-weight: var(--font-semibold);
}

.status-warning {
  color: var(--warning-600);
  font-weight: var(--font-semibold);
}

.status-error {
  color: var(--error-600);
  font-weight: var(--font-semibold);
}

.debug-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.debug-action-btn {
  background: var(--secondary-500);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: background-color 0.3s ease;
}

.debug-action-btn:hover {
  background: var(--secondary-600);
}

.debug-action-btn.danger {
  background: var(--danger-500);
}

.debug-action-btn.danger:hover {
  background: var(--danger-600);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-content {
    padding: var(--spacing-xl);
    gap: var(--spacing-2xl);
  }
  
  .welcome-card,
  .quick-actions,
  .debug-info {
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
  }
  
  .welcome-card h2 {
    font-size: var(--text-xl);
  }
  
  .user-details {
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .debug-content {
    padding: var(--spacing-lg);
  }

  .debug-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
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
    gap: var(--spacing-xs);
  }

  .debug-action-btn {
    width: 100%;
  }
}
</style>