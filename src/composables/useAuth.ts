import { ref, computed, onMounted, onUnmounted } from 'vue'
import { authManager } from '../utils/auth/authManager'
import { SecurityEventListener, SECURITY_EVENTS } from '../utils/auth/security'

/**
 * 认证状态管理 Composable
 * 提供响应式的认证状态和相关操作
 */
export function useAuth() {
  // 响应式状态
  const isAuthenticated = ref(false)
  const currentUser = ref<any>(null)
  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => isAuthenticated.value)
  const userName = computed(() => currentUser.value?.username || '')
  const userId = computed(() => {
    // 优先从当前用户获取ID
    const id = currentUser.value?.id
    if (id) {
      // 如果id是字符串，转换为数字
      if (typeof id === 'string') {
        const numId = parseInt(id, 10)
        return isNaN(numId) ? null : numId
      }
      
      // 如果id是数字，直接返回
      if (typeof id === 'number') {
        return isNaN(id) ? null : id
      }
    }
    
    // 如果当前用户没有ID，尝试从localStorage获取
    try {
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId) {
        const numId = parseInt(storedUserId, 10)
        return isNaN(numId) ? null : numId
      }
    } catch (error) {
      console.error('❌ 获取存储的用户ID失败:', error)
    }
    
    return null
  })

  // 更新认证状态
  const updateAuthState = () => {
    isAuthenticated.value = authManager.isAuthenticated()
    const user = authManager.getCurrentUser()
    
    // 如果没有用户信息但有认证状态，尝试从localStorage恢复
    if (isAuthenticated.value && !user) {
      try {
        const storedUserId = localStorage.getItem('userId')
        const storedUsername = localStorage.getItem('username')
        if (storedUserId) {
          currentUser.value = {
            id: parseInt(storedUserId, 10),
            username: storedUsername || ''
          }
        }
      } catch (error) {
        console.error('❌ 恢复用户信息失败:', error)
      }
    } else {
      currentUser.value = user
    }
  }

  // 登录
  const login = async (token: string, refreshToken?: string, expiresIn?: number, userInfo?: any) => {
    try {
      isLoading.value = true
      authError.value = null
      
      await authManager.login(token, refreshToken, expiresIn, userInfo)
      updateAuthState()
      
      return true
    } catch (error: any) {
      authError.value = error.message || '登录失败'
      console.error('❌ 登录失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async (reason?: string) => {
    try {
      isLoading.value = true
      await authManager.logout(reason)
      updateAuthState()
    } catch (error: any) {
      console.error('❌ 登出失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 刷新token
  const refreshToken = async () => {
    try {
      isLoading.value = true
      const success = await authManager.refreshToken()
      if (success) {
        updateAuthState()
      }
      return success
    } catch (error: any) {
      authError.value = error.message || 'Token刷新失败'
      console.error('❌ Token刷新失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 检查权限
  const hasPermission = (permission: string) => {
    // 这里可以根据实际需求实现权限检查逻辑
    return isAuthenticated.value
  }

  // 获取认证头
  const getAuthHeader = () => {
    return authManager.getAuthHeader()
  }

  // 获取认证状态摘要
  const getAuthSummary = () => {
    return authManager.getAuthSummary()
  }

  // 清除错误
  const clearError = () => {
    authError.value = null
  }

  // 事件监听器
  let eventListeners: Array<() => void> = []

  // 初始化
  const initialize = async () => {
    try {
      isLoading.value = true
      await authManager.initialize()
      updateAuthState()
    } catch (error: any) {
      authError.value = error.message || '初始化失败'
      console.error('❌ 认证初始化失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    // 监听登录成功事件
    const onLoginSuccess = (userInfo: any) => {
      updateAuthState()
      clearError()
    }

    // 监听登出事件
    const onLogout = (data: any) => {
      updateAuthState()
      if (data?.reason) {
        authError.value = `登出原因: ${data.reason}`
      }
    }

    // 监听token刷新事件
    const onTokenRefreshed = () => {
      updateAuthState()
      clearError()
    }

    // 监听会话警告
    const onSessionWarning = () => {
      console.warn('⚠️ 会话即将过期')
      // 可以在这里显示用户提示
    }

    // 监听未授权访问
    const onUnauthorizedAccess = (data: any) => {
      authError.value = '访问未授权，请重新登录'
      updateAuthState()
    }

    // 添加事件监听器
    SecurityEventListener.addEventListener('auth_login_success', onLoginSuccess)
    SecurityEventListener.addEventListener('auth_logout', onLogout)
    SecurityEventListener.addEventListener(SECURITY_EVENTS.TOKEN_REFRESHED, onTokenRefreshed)
    SecurityEventListener.addEventListener(SECURITY_EVENTS.SESSION_WARNING, onSessionWarning)
    SecurityEventListener.addEventListener(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, onUnauthorizedAccess)

    // 保存清理函数
    eventListeners = [
      () => SecurityEventListener.removeEventListener('auth_login_success', onLoginSuccess),
      () => SecurityEventListener.removeEventListener('auth_logout', onLogout),
      () => SecurityEventListener.removeEventListener(SECURITY_EVENTS.TOKEN_REFRESHED, onTokenRefreshed),
      () => SecurityEventListener.removeEventListener(SECURITY_EVENTS.SESSION_WARNING, onSessionWarning),
      () => SecurityEventListener.removeEventListener(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, onUnauthorizedAccess)
    ]
  }

  // 清理事件监听器
  const cleanupEventListeners = () => {
    eventListeners.forEach(cleanup => cleanup())
    eventListeners = []
  }

  // 组件挂载时初始化
  onMounted(async () => {
    setupEventListeners()
    await initialize()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    cleanupEventListeners()
  })

  return {
    // 状态
    isAuthenticated: isLoggedIn,
    currentUser,
    isLoading,
    authError,
    
    // 计算属性
    userName,
    userId,
    
    // 方法
    login,
    logout,
    refreshToken,
    hasPermission,
    getAuthHeader,
    getAuthSummary,
    clearError,
    initialize,
    
    // 工具方法
    updateAuthState
  }
}

/**
 * 全局认证状态（单例）
 * 用于在多个组件间共享认证状态
 */
let globalAuthState: ReturnType<typeof useAuth> | null = null

export function useGlobalAuth() {
  if (!globalAuthState) {
    globalAuthState = useAuth()
  }
  return globalAuthState
}