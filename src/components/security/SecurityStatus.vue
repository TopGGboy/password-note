<template>
  <div v-if="showStatus" class="security-status" :class="{ 'expanded': isExpanded }">
    <div class="status-header" @click="toggleExpanded">
      <span class="status-icon" :class="statusIconClass">{{ statusIcon }}</span>
      <span class="status-text">安全状态</span>
      <span class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</span>
    </div>

    <div v-if="isExpanded" class="status-content">
      <!-- 认证状态 -->
      <div class="status-section">
        <h4>认证状态</h4>
        <div class="status-item">
          <span class="label">登录状态:</span>
          <span class="value"
            :class="{ 'success': securityStatus.isAuthenticated, 'error': !securityStatus.isAuthenticated }">
            {{ securityStatus.isAuthenticated ? '已登录' : '未登录' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Token状态:</span>
          <span class="value"
            :class="{ 'success': securityStatus.hasValidToken, 'error': !securityStatus.hasValidToken }">
            {{ securityStatus.hasValidToken ? '有效' : '无效' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Token过期:</span>
          <span class="value"
            :class="{ 'error': securityStatus.tokenExpired, 'success': !securityStatus.tokenExpired }">
            {{ securityStatus.tokenExpired ? '已过期' : '未过期' }}
          </span>
        </div>
      </div>

      <!-- Token信息 -->
      <div class="status-section" v-if="tokenInfo">
        <h4>Token信息</h4>
        <div class="status-item">
          <span class="label">过期时间:</span>
          <span class="value">{{ formatExpirationTime(tokenInfo.expirationTime) }}</span>
        </div>
        <div class="status-item">
          <span class="label">剩余时间:</span>
          <span class="value" :class="getTimeRemainingClass(tokenInfo.timeRemaining)">
            {{ formatTimeRemaining(tokenInfo.timeRemaining) }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">即将过期:</span>
          <span class="value" :class="{ 'warning': securityStatus.isTokenExpiringSoon }">
            {{ securityStatus.isTokenExpiringSoon ? '是' : '否' }}
          </span>
        </div>
      </div>

      <!-- 会话信息 -->
      <div class="status-section">
        <h4>会话信息</h4>
        <div class="status-item">
          <span class="label">会话剩余:</span>
          <span class="value" :class="getTimeRemainingClass(securityStatus.sessionRemaining)">
            {{ formatTimeRemaining(securityStatus.sessionRemaining) }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">最后活动:</span>
          <span class="value">{{ formatLastActivity() }}</span>
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="status-section" v-if="userInfo">
        <h4>用户信息</h4>
        <div class="status-item">
          <span class="label">用户名:</span>
          <span class="value">{{ userInfo.username }}</span>
        </div>
        <div class="status-item" v-if="userInfo.email">
          <span class="label">邮箱:</span>
          <span class="value">{{ userInfo.email }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="status-actions">
        <button @click="refreshToken" :disabled="refreshing" class="action-btn refresh-btn">
          {{ refreshing ? '刷新中...' : '刷新Token' }}
        </button>
        <button @click="clearAuth" class="action-btn clear-btn">
          清除认证
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { tokenManager } from '../../utils/auth/tokenManager'
import { SecurityUtils } from '../../utils/auth/security'
import { getAppSecurityStatus } from '../../utils/appInit'

export default defineComponent({
  name: 'SecurityStatus',
  setup() {
    const authStore = useAuthStore()

    const isExpanded = ref(false)
    const refreshing = ref(false)
    const securityStatus = ref({
      initialized: false,
      hasValidToken: false,
      tokenExpired: false,
      sessionRemaining: 0,
      isAuthenticated: false,
      isTokenExpiringSoon: false
    })

    let updateInterval: number | null = null

    // 隐藏安全状态组件
    const showStatus = computed(() => {
      return false
    })

    // 状态图标和样式
    const statusIcon = computed(() => {
      if (!securityStatus.value.initialized) return '⚠️'
      if (securityStatus.value.tokenExpired) return '🔴'
      if (securityStatus.value.isTokenExpiringSoon) return '🟡'
      if (securityStatus.value.isAuthenticated) return '🟢'
      return '⚪'
    })

    const statusIconClass = computed(() => {
      if (!securityStatus.value.initialized) return 'warning'
      if (securityStatus.value.tokenExpired) return 'error'
      if (securityStatus.value.isTokenExpiringSoon) return 'warning'
      if (securityStatus.value.isAuthenticated) return 'success'
      return 'neutral'
    })

    // Token信息
    const tokenInfo = computed(() => {
      const expirationTime = authStore.tokenExpirationTime
      if (!expirationTime) return null

      const timeRemaining = Math.max(0, expirationTime - Date.now())

      return {
        expirationTime,
        timeRemaining
      }
    })

    // 用户信息
    const userInfo = computed(() => authStore.userInfo)

    /**
     * 更新安全状态
     */
    const updateSecurityStatus = () => {
      const status = getAppSecurityStatus()
      securityStatus.value = {
        ...status,
        isAuthenticated: authStore.isLoggedIn,
        isTokenExpiringSoon: authStore.isTokenExpiringSoon
      }
    }

    /**
     * 切换展开状态
     */
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
    }

    /**
     * 格式化过期时间
     */
    const formatExpirationTime = (timestamp: number | null): string => {
      if (!timestamp) return '未知'
      return new Date(timestamp).toLocaleString('zh-CN')
    }

    /**
     * 格式化剩余时间
     */
    const formatTimeRemaining = (milliseconds: number): string => {
      if (milliseconds <= 0) return '已过期'

      const seconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}天${hours % 24}小时`
      if (hours > 0) return `${hours}小时${minutes % 60}分钟`
      if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`
      return `${seconds}秒`
    }

    /**
     * 获取时间剩余的样式类
     */
    const getTimeRemainingClass = (milliseconds: number): string => {
      if (milliseconds <= 0) return 'error'
      if (milliseconds < 5 * 60 * 1000) return 'warning' // 小于5分钟
      return 'success'
    }

    /**
     * 格式化最后活动时间
     */
    const formatLastActivity = (): string => {
      // 这里可以从SecurityUtils获取最后活动时间
      // 目前返回一个占位符
      return '刚刚'
    }

    /**
     * 刷新Token
     */
    const refreshToken = async () => {
      if (refreshing.value) return

      try {
        refreshing.value = true
        await tokenManager.refreshToken()
        updateSecurityStatus()
        console.log('✅ Token刷新成功')
      } catch (error) {
        console.error('❌ Token刷新失败:', error)
      } finally {
        refreshing.value = false
      }
    }

    /**
     * 清除认证信息
     */
    const clearAuth = () => {
      if (confirm('确定要清除认证信息吗？')) {
        authStore.clearAuth()
        updateSecurityStatus()
        console.log('🧹 认证信息已清除')
      }
    }

    onMounted(() => {
      updateSecurityStatus()

      // 每秒更新一次状态
      updateInterval = setInterval(updateSecurityStatus, 1000)
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })

    return {
      showStatus,
      isExpanded,
      refreshing,
      securityStatus,
      statusIcon,
      statusIconClass,
      tokenInfo,
      userInfo,
      toggleExpanded,
      formatExpirationTime,
      formatTimeRemaining,
      getTimeRemainingClass,
      formatLastActivity,
      refreshToken,
      clearAuth
    }
  }
})
</script>

<style scoped>
.security-status {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 200px;
  max-width: 400px;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.status-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #eee;
}

.status-header:hover {
  background: rgba(0, 0, 0, 0.05);
}

.status-icon {
  margin-right: 8px;
  font-size: 14px;
}

.status-icon.success {
  color: #27ae60;
}

.status-icon.warning {
  color: #f39c12;
}

.status-icon.error {
  color: #e74c3c;
}

.status-icon.neutral {
  color: #95a5a6;
}

.status-text {
  flex: 1;
  font-weight: 600;
  color: #333;
}

.toggle-icon {
  color: #666;
  font-size: 10px;
}

.status-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.status-section {
  margin-bottom: 16px;
}

.status-section:last-child {
  margin-bottom: 0;
}

.status-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding: 2px 0;
}

.status-item .label {
  color: #666;
  font-weight: 500;
}

.status-item .value {
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.value.success {
  color: #27ae60;
}

.value.warning {
  color: #f39c12;
}

.value.error {
  color: #e74c3c;
}

.status-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn {
  background: #667eea;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.clear-btn {
  background: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background: #c0392b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .security-status {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>