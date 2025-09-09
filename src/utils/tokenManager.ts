import { STORAGE_KEYS } from './constants'

/**
 * Token管理工具类
 * 负责token的存储、验证、刷新等安全操作
 */
export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string> | null = null
  private lastRefreshTime: number = 0
  private refreshAttempts: number = 0
  private maxRefreshAttempts: number = 3

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * 安全存储token
   * @param token 访问token
   * @param refreshToken 刷新token
   * @param expiresIn token过期时间（秒）
   */
  public setTokens(token: string, refreshToken?: string, expiresIn?: number): void {
    try {
      // 存储访问token
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
      
      // 存储刷新token
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      }
      
      // 计算并存储过期时间
      if (expiresIn) {
        const expiresAt = Date.now() + (expiresIn * 1000)
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())
      }
      
      console.log('🔐 Token已安全存储')
    } catch (error) {
      console.error('❌ Token存储失败:', error)
    }
  }

  /**
   * 获取访问token
   */
  public getAccessToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    } catch (error) {
      console.error('❌ 获取访问token失败:', error)
      return null
    }
  }

  /**
   * 获取刷新token
   */
  public getRefreshToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    } catch (error) {
      console.error('❌ 获取刷新token失败:', error)
      return null
    }
  }

  /**
   * 检查token是否存在
   */
  public hasValidToken(): boolean {
    const token = this.getAccessToken()
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
    return !!(token && userId && token.length > 0)
  }

  /**
   * 检查token是否即将过期（提前5分钟刷新）
   */
  public isTokenExpiringSoon(): boolean {
    try {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      if (!expiresAt) return false
      
      const expirationTime = parseInt(expiresAt)
      const currentTime = Date.now()
      const fiveMinutes = 5 * 60 * 1000 // 5分钟
      
      return (expirationTime - currentTime) <= fiveMinutes
    } catch (error) {
      console.error('❌ 检查token过期时间失败:', error)
      return false
    }
  }

  /**
   * 检查token是否已过期
   */
  public isTokenExpired(): boolean {
    try {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      if (!expiresAt) return false
      
      const expirationTime = parseInt(expiresAt)
      return Date.now() >= expirationTime
    } catch (error) {
      console.error('❌ 检查token过期状态失败:', error)
      return true // 出错时认为已过期，更安全
    }
  }

  /**
   * 解析JWT token获取payload（不验证签名，仅用于获取信息）
   */
  public parseJWTPayload(token: string): any {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('❌ 解析JWT失败:', error)
      return null
    }
  }

  /**
   * 验证token格式和基本信息
   */
  public validateTokenFormat(token: string): boolean {
    try {
      // 检查JWT格式
      const parts = token.split('.')
      if (parts.length !== 3) return false
      
      // 解析payload
      const payload = this.parseJWTPayload(token)
      if (!payload) return false
      
      // 检查必要字段
      if (!payload.sub || !payload.exp) return false
      
      // 检查是否过期
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp <= currentTime) return false
      
      return true
    } catch (error) {
      console.error('❌ Token格式验证失败:', error)
      return false
    }
  }

  /**
   * 清除所有token和相关信息
   */
  public clearTokens(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      localStorage.removeItem(STORAGE_KEYS.USER_ID)
      localStorage.removeItem(STORAGE_KEYS.USERNAME)
      
      // 清除刷新Promise
      this.refreshPromise = null
      
      console.log('🧹 所有token已清除')
    } catch (error) {
      console.error('❌ 清除token失败:', error)
    }
  }

  /**
   * 刷新token（防止并发刷新和频率限制）
   */
  public async refreshToken(): Promise<string | null> {
    // 如果已经有刷新请求在进行中，等待其完成
    if (this.refreshPromise) {
      try {
        return await this.refreshPromise
      } catch (error) {
        this.refreshPromise = null
        throw error
      }
    }

    // 检查刷新频率限制（30秒内最多刷新一次）
    const now = Date.now()
    if (now - this.lastRefreshTime < 30000) {
      console.warn('⚠️ Token刷新过于频繁，跳过本次刷新')
      throw new Error('Token refresh rate limited')
    }

    // 检查重试次数限制
    if (this.refreshAttempts >= this.maxRefreshAttempts) {
      console.error('❌ Token刷新重试次数超限，清除认证信息')
      this.clearTokens()
      throw new Error('Max refresh attempts exceeded')
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    // 创建刷新Promise
    this.refreshAttempts++
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newToken = await this.refreshPromise
      this.refreshPromise = null
      this.lastRefreshTime = now
      this.refreshAttempts = 0 // 成功后重置重试次数
      return newToken
    } catch (error) {
      this.refreshPromise = null
      throw error
    }
  }

  /**
   * 执行实际的token刷新请求
   */
  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'}/api/user/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.code === 1 && data.data) {
        const { token, refreshToken: newRefreshToken, expiresIn } = data.data
        
        // 存储新的token
        this.setTokens(token, newRefreshToken, expiresIn)
        
        console.log('🔄 Token刷新成功')
        
        // 通知其他组件token已刷新（如果需要的话）
        // 这里可以触发事件或调用回调
        
        return token
      } else {
        throw new Error(data.msg || 'Token refresh failed')
      }
    } catch (error) {
      console.error('❌ Token刷新失败:', error)
      // 刷新失败，清除所有token
      this.clearTokens()
      throw error
    }
  }

  /**
   * 自动刷新token（在即将过期时）
   */
  public async autoRefreshIfNeeded(): Promise<boolean> {
    try {
      if (!this.hasValidToken()) {
        return false
      }

      // 如果token已过期，不尝试刷新，直接返回false让调用方处理
      if (this.isTokenExpired()) {
        console.log('🔄 Token已过期，需要重新登录')
        return false
      }

      // 只有在token即将过期（5分钟内）且当前没有刷新请求时才刷新
      if (this.isTokenExpiringSoon() && !this.refreshPromise) {
        console.log('🔄 Token即将过期，提前刷新...')
        await this.refreshToken()
        return true
      }

      return false
    } catch (error) {
      console.error('❌ 自动刷新token失败:', error)
      return false
    }
  }

  /**
   * 启动token自动刷新定时器
   */
  public startAutoRefreshTimer(): void {
    // 每5分钟检查一次token状态，避免过度频繁
    setInterval(async () => {
      try {
        // 只在token即将过期时才刷新，避免不必要的刷新
        if (this.hasValidToken() && this.isTokenExpiringSoon() && !this.isTokenExpired()) {
          console.log('🔄 定时检查：Token即将过期，执行刷新')
          await this.refreshToken()
        }
      } catch (error) {
        console.error('❌ 定时刷新token失败:', error)
        // 刷新失败时清除token
        this.clearTokens()
      }
    }, 5 * 60 * 1000) // 5分钟
  }
}

// 导出单例实例
export const tokenManager = TokenManager.getInstance()