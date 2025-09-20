import { TokenManager } from './tokenManager'
import { SecurityUtils, SECURITY_EVENTS, SecurityEventListener } from './security'
import { STORAGE_KEYS, ROUTES } from '../../constants/constants'
import router from '../../router'

/**
 * 统一认证管理器
 * 整合token管理、安全检查、状态管理等功能
 */
export class AuthManager {
  private static instance: AuthManager
  private tokenManager: TokenManager
  private isInitialized = false
  private authState = {
    isAuthenticated: false,
    user: null as any,
    lastActivity: Date.now()
  }

  private constructor() {
    this.tokenManager = TokenManager.getInstance()
    this.initializeEventListeners()
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  /**
   * 初始化认证管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 检查本地存储的认证状态
      await this.checkStoredAuth()
      
      // 启动自动刷新定时器
      this.startAutoRefresh()
      
      // 启动会话监控
      this.startSessionMonitoring()
      
      this.isInitialized = true
      console.log('🔐 认证管理器初始化完成')
    } catch (error) {
      console.error('❌ 认证管理器初始化失败:', error)
      await this.logout()
    }
  }

  /**
   * 检查存储的认证信息
   */
  private async checkStoredAuth(): Promise<void> {
    const token = this.tokenManager.getAccessToken()
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
    
    if (token && userId) {
      if (this.tokenManager.validateTokenFormat(token) && !this.tokenManager.isTokenExpired()) {
        this.authState.isAuthenticated = true
        this.authState.user = { id: userId }
        
        // 如果token即将过期，尝试刷新
        if (this.tokenManager.isTokenExpiringSoon()) {
          try {
            await this.tokenManager.refreshToken()
          } catch (error) {
            console.warn('⚠️ 初始化时token刷新失败:', error)
          }
        }
      } else {
        // Token无效或已过期，清除认证信息
        await this.logout()
      }
    }
  }

  /**
   * 登录
   */
  public async login(token: string, refreshToken?: string, expiresIn?: number, userInfo?: any): Promise<void> {
    try {
      // 存储token
      this.tokenManager.setTokens(token, refreshToken, expiresIn)
      
      // 更新认证状态
      this.authState.isAuthenticated = true
      this.authState.user = userInfo
      this.authState.lastActivity = Date.now()
      
      // 存储用户信息
      if (userInfo) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, userInfo.id?.toString() || '')
        localStorage.setItem(STORAGE_KEYS.USERNAME, userInfo.username || '')
      }
      
      // 触发登录成功事件
      SecurityEventListener.dispatchEvent('auth_login_success', userInfo)
      
      console.log('✅ 用户登录成功')
    } catch (error) {
      console.error('❌ 登录处理失败:', error)
      throw error
    }
  }

  /**
   * 登出
   */
  public async logout(reason?: string): Promise<void> {
    try {
      // 清除所有认证信息
      this.tokenManager.clearTokens()
      
      // 重置认证状态
      this.authState.isAuthenticated = false
      this.authState.user = null
      
      // 清除敏感数据
      SecurityUtils.clearSensitiveData(this.authState)
      
      // 触发登出事件
      SecurityEventListener.dispatchEvent('auth_logout', { reason })
      
      console.log('🚪 用户已登出', reason ? `原因: ${reason}` : '')
      
      // 跳转到登录页
      if (router.currentRoute.value.path !== ROUTES.LOGIN) {
        router.push(ROUTES.LOGIN)
      }
    } catch (error) {
      console.error('❌ 登出处理失败:', error)
    }
  }

  /**
   * 检查认证状态
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && 
           this.tokenManager.hasValidToken() && 
           !this.tokenManager.isTokenExpired()
  }

  /**
   * 获取当前用户信息
   */
  public getCurrentUser(): any {
    return this.authState.user
  }

  /**
   * 更新用户活动时间
   */
  public updateActivity(): void {
    this.authState.lastActivity = Date.now()
    SecurityUtils.updateActivity()
  }

  /**
   * 获取认证头
   */
  public getAuthHeader(): string | null {
    const token = this.tokenManager.getAccessToken()
    if (token && this.tokenManager.validateTokenFormat(token)) {
      return `Bearer ${token}`
    }
    return null
  }

  /**
   * 刷新token
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const newToken = await this.tokenManager.refreshToken()
      if (newToken) {
        this.updateActivity()
        SecurityEventListener.dispatchEvent(SECURITY_EVENTS.TOKEN_REFRESHED)
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Token刷新失败:', error)
      await this.logout('Token刷新失败')
      return false
    }
  }

  /**
   * 启动自动刷新定时器
   */
  private startAutoRefresh(): void {
    // 每1分钟检查一次token状态，更频繁的检查
    setInterval(async () => {
      if (this.isAuthenticated() && this.tokenManager.isTokenExpiringSoon()) {
        try {
          console.log('🔄 定时检查：Token即将过期，执行自动刷新')
          await this.refreshToken()
        } catch (error) {
          console.error('❌ 自动刷新失败:', error)
        }
      }
    }, 1 * 60 * 1000) // 1分钟
  }

  /**
   * 启动会话监控
   */
  private startSessionMonitoring(): void {
    SecurityUtils.startSessionMonitoring(
      () => {
        // 会话即将过期警告
        SecurityEventListener.dispatchEvent(SECURITY_EVENTS.SESSION_WARNING)
        console.warn('⚠️ 会话即将过期')
      },
      () => {
        // 会话已过期
        this.logout('会话超时')
      }
    )
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 监听页面活动，更新最后活动时间
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        if (this.isAuthenticated()) {
          this.updateActivity()
        }
      }, { passive: true })
    })

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isAuthenticated()) {
        // 页面重新可见时检查token状态
        if (this.tokenManager.isTokenExpired()) {
          this.logout('Token已过期')
        } else if (this.tokenManager.isTokenExpiringSoon()) {
          this.refreshToken()
        }
      }
    })

    // 监听存储变化（多标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.ACCESS_TOKEN) {
        if (!e.newValue) {
          // Token被清除，同步登出
          this.authState.isAuthenticated = false
          this.authState.user = null
        }
      }
    })
  }

  /**
   * 处理认证错误
   */
  public handleAuthError(error: any, context?: string): void {
    console.error(`🔒 认证错误 ${context ? `(${context})` : ''}:`, error)
    
    if (error.response?.status === 401) {
      SecurityEventListener.dispatchEvent(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, { context, error })
      this.logout('认证失败')
    } else if (error.response?.status === 403) {
      SecurityEventListener.dispatchEvent('auth_permission_denied', { context, error })
      console.error('🚫 权限不足')
    }
  }

  /**
   * 验证路由访问权限
   */
  public canAccessRoute(route: any): boolean {
    const requiresAuth = route.matched?.some((record: any) => record.meta?.requiresAuth)
    
    if (requiresAuth) {
      return this.isAuthenticated()
    }
    
    return true
  }

  /**
   * 获取认证状态摘要
   */
  public getAuthSummary(): any {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.authState.user,
      tokenValid: this.tokenManager.hasValidToken(),
      tokenExpired: this.tokenManager.isTokenExpired(),
      tokenExpiringSoon: this.tokenManager.isTokenExpiringSoon(),
      lastActivity: this.authState.lastActivity,
      sessionRemaining: SecurityUtils.getSessionRemainingTime()
    }
  }
}

// 导出单例实例
export const authManager = AuthManager.getInstance()