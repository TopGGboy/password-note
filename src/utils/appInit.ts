/**
 * 应用初始化工具
 * 负责应用启动时的安全初始化和配置
 */

import { tokenManager } from './tokenManager'
import { SecurityUtils, SecurityEventListener, SECURITY_EVENTS } from './security'
import { useAuthStore } from '../store/auth'
import router from '../router'
import { ROUTES } from './constants'

/**
 * 应用安全初始化类
 */
export class AppInitializer {
  private static initialized = false
  private static authStore: any = null

  /**
   * 初始化应用安全机制
   */
  static async initializeSecurity(): Promise<void> {
    if (this.initialized) {
      console.log('🔒 应用安全机制已初始化')
      return
    }

    console.log('🚀 开始初始化应用安全机制...')

    try {
      // 1. 初始化认证状态
      await this.initializeAuth()

      // 2. 设置安全事件监听器
      this.setupSecurityEventListeners()

      // 3. 启动会话监控
      this.startSessionMonitoring()

      // 4. 设置活动监听器
      this.setupActivityListeners()

      // 5. 启动token自动刷新
      this.startTokenAutoRefresh()

      // 6. 设置页面可见性监听
      this.setupVisibilityListener()

      this.initialized = true
      console.log('✅ 应用安全机制初始化完成')

    } catch (error) {
      console.error('❌ 应用安全机制初始化失败:', error)
      throw error
    }
  }

  /**
   * 初始化认证状态
   */
  private static async initializeAuth(): Promise<void> {
    try {
      // 获取auth store实例
      this.authStore = useAuthStore()

      // 检查并恢复认证状态
      const hasValidToken = tokenManager.hasValidToken()
      
      if (hasValidToken) {
        console.log('🔍 发现有效token，检查认证状态...')
        
        // 检查token是否过期
        if (tokenManager.isTokenExpired()) {
          console.log('⏰ Token已过期，尝试刷新...')
          try {
            await tokenManager.refreshToken()
            console.log('🔄 Token刷新成功')
          } catch (error) {
            console.error('❌ Token刷新失败，清除认证状态:', error)
            tokenManager.clearTokens()
            return
          }
        }

        // 验证认证状态
        const isAuthenticated = await this.authStore.checkAuth()
        if (isAuthenticated) {
          console.log('✅ 认证状态恢复成功')
        } else {
          console.log('❌ 认证状态验证失败')
        }
      } else {
        console.log('ℹ️ 未发现有效token')
      }
    } catch (error) {
      console.error('❌ 认证状态初始化失败:', error)
      tokenManager.clearTokens()
    }
  }

  /**
   * 设置安全事件监听器
   */
  private static setupSecurityEventListeners(): void {
    // Token过期事件
    SecurityEventListener.addEventListener(SECURITY_EVENTS.TOKEN_EXPIRED, () => {
      console.log('🔒 Token已过期，跳转登录页')
      tokenManager.clearTokens()
      if (this.authStore) {
        this.authStore.clearAuth()
      }
      router.push(ROUTES.LOGIN)
    })

    // Token刷新事件
    SecurityEventListener.addEventListener(SECURITY_EVENTS.TOKEN_REFRESHED, (data: any) => {
      console.log('🔄 Token已刷新:', data)
    })

    // 会话警告事件
    SecurityEventListener.addEventListener(SECURITY_EVENTS.SESSION_WARNING, () => {
      console.log('⚠️ 会话即将过期')
      // 可以在这里显示警告提示
    })

    // 会话过期事件
    SecurityEventListener.addEventListener(SECURITY_EVENTS.SESSION_EXPIRED, () => {
      console.log('⏰ 会话已过期，自动登出')
      this.performSecureLogout()
    })

    // 未授权访问事件
    SecurityEventListener.addEventListener(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, (data: any) => {
      console.warn('🚫 检测到未授权访问:', data)
      this.performSecureLogout()
    })

    // 可疑活动事件
    SecurityEventListener.addEventListener(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, (data: any) => {
      console.warn('🔍 检测到可疑活动:', data)
      // 可以在这里实现额外的安全措施
    })
  }

  /**
   * 启动会话监控
   */
  private static startSessionMonitoring(): void {
    SecurityUtils.startSessionMonitoring(
      // 会话警告回调
      () => {
        SecurityEventListener.dispatchEvent(SECURITY_EVENTS.SESSION_WARNING)
      },
      // 会话过期回调
      () => {
        SecurityEventListener.dispatchEvent(SECURITY_EVENTS.SESSION_EXPIRED)
      }
    )
  }

  /**
   * 设置用户活动监听器
   */
  private static setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const updateActivity = () => {
      SecurityUtils.updateActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    console.log('👂 用户活动监听器已设置')
  }

  /**
   * 启动token自动刷新
   */
  private static startTokenAutoRefresh(): void {
    tokenManager.startAutoRefreshTimer()
    console.log('🔄 Token自动刷新已启动')
  }

  /**
   * 设置页面可见性监听
   */
  private static setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，检查token状态
        this.checkTokenOnVisibilityChange()
      }
    })
  }

  /**
   * 页面可见性变化时检查token
   */
  private static async checkTokenOnVisibilityChange(): Promise<void> {
    try {
      if (tokenManager.hasValidToken()) {
        if (tokenManager.isTokenExpired()) {
          console.log('🔄 页面重新可见，token已过期，尝试刷新...')
          await tokenManager.refreshToken()
        } else if (tokenManager.isTokenExpiringSoon()) {
          console.log('🔄 页面重新可见，token即将过期，提前刷新...')
          await tokenManager.refreshToken()
        }
      }
    } catch (error) {
      console.error('❌ 页面可见性检查token失败:', error)
      SecurityEventListener.dispatchEvent(SECURITY_EVENTS.TOKEN_EXPIRED)
    }
  }

  /**
   * 执行安全登出
   */
  private static async performSecureLogout(): Promise<void> {
    try {
      // 清除所有认证信息
      tokenManager.clearTokens()
      
      if (this.authStore) {
        await this.authStore.logout()
      }

      // 停止会话监控
      SecurityUtils.stopSessionMonitoring()

      // 跳转到登录页
      router.push(ROUTES.LOGIN)

      console.log('🔒 安全登出完成')
    } catch (error) {
      console.error('❌ 安全登出失败:', error)
      // 即使登出失败，也要清除本地状态
      tokenManager.clearTokens()
      router.push(ROUTES.LOGIN)
    }
  }

  /**
   * 获取应用安全状态
   */
  static getSecurityStatus(): {
    initialized: boolean
    hasValidToken: boolean
    tokenExpired: boolean
    sessionRemaining: number
  } {
    return {
      initialized: this.initialized,
      hasValidToken: tokenManager.hasValidToken(),
      tokenExpired: tokenManager.isTokenExpired(),
      sessionRemaining: SecurityUtils.getSessionRemainingTime()
    }
  }

  /**
   * 重置安全状态（用于测试或重新初始化）
   */
  static reset(): void {
    this.initialized = false
    this.authStore = null
    SecurityUtils.stopSessionMonitoring()
    console.log('🔄 应用安全状态已重置')
  }
}

/**
 * 便捷的初始化函数
 */
export const initializeApp = async (): Promise<void> => {
  await AppInitializer.initializeSecurity()
}

/**
 * 获取应用状态
 */
export const getAppSecurityStatus = () => {
  return AppInitializer.getSecurityStatus()
}