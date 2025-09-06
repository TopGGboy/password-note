/**
 * 安全配置和工具函数
 * 用于增强应用的安全性
 */

// 安全配置常量
export const SECURITY_CONFIG = {
  // Token相关配置
  TOKEN: {
    // Token刷新提前时间（5分钟）
    REFRESH_THRESHOLD: 5 * 60 * 1000,
    // 自动刷新检查间隔（1分钟）
    AUTO_REFRESH_INTERVAL: 60 * 1000,
    // Token最大有效期（24小时）
    MAX_VALIDITY: 24 * 60 * 60 * 1000,
  },
  
  // 请求安全配置
  REQUEST: {
    // 请求超时时间（10秒）
    TIMEOUT: 10000,
    // 最大重试次数
    MAX_RETRIES: 3,
    // 重试延迟（毫秒）
    RETRY_DELAY: 1000,
  },
  
  // 存储安全配置
  STORAGE: {
    // 敏感数据加密前缀
    ENCRYPTED_PREFIX: 'enc_',
    // 存储数据完整性校验
    INTEGRITY_CHECK: true,
  },
  
  // 密码安全配置
  PASSWORD: {
    // 最小长度
    MIN_LENGTH: 6,
    // 最大长度
    MAX_LENGTH: 50,
    // 复杂度要求
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SYMBOLS: false,
  },
  
  // 会话安全配置
  SESSION: {
    // 会话超时时间（30分钟无操作）
    TIMEOUT: 30 * 60 * 1000,
    // 会话警告时间（25分钟）
    WARNING_TIME: 25 * 60 * 1000,
  }
} as const

/**
 * 安全工具类
 */
export class SecurityUtils {
  private static lastActivityTime = Date.now()
  private static sessionTimer: number | null = null

  /**
   * 更新最后活动时间
   */
  static updateActivity(): void {
    this.lastActivityTime = Date.now()
  }

  /**
   * 获取会话剩余时间
   */
  static getSessionRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivityTime
    return Math.max(0, SECURITY_CONFIG.SESSION.TIMEOUT - elapsed)
  }

  /**
   * 检查会话是否过期
   */
  static isSessionExpired(): boolean {
    return this.getSessionRemainingTime() <= 0
  }

  /**
   * 启动会话监控
   */
  static startSessionMonitoring(onWarning?: () => void, onExpired?: () => void): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }

    this.sessionTimer = setInterval(() => {
      const remaining = this.getSessionRemainingTime()
      
      if (remaining <= 0 && onExpired) {
        onExpired()
        this.stopSessionMonitoring()
      } else if (remaining <= (SECURITY_CONFIG.SESSION.TIMEOUT - SECURITY_CONFIG.SESSION.WARNING_TIME) && onWarning) {
        onWarning()
      }
    }, 60000) // 每分钟检查一次
  }

  /**
   * 停止会话监控
   */
  static stopSessionMonitoring(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
      this.sessionTimer = null
    }
  }

  /**
   * 验证密码强度
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // 长度检查
    if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
      feedback.push(`密码长度至少${SECURITY_CONFIG.PASSWORD.MIN_LENGTH}位`)
    } else if (password.length >= 8) {
      score += 1
    }

    if (password.length > SECURITY_CONFIG.PASSWORD.MAX_LENGTH) {
      feedback.push(`密码长度不能超过${SECURITY_CONFIG.PASSWORD.MAX_LENGTH}位`)
    }

    // 复杂度检查
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    // 常见密码检查
    const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123']
    if (commonPasswords.includes(password.toLowerCase())) {
      feedback.push('请避免使用常见密码')
      score = Math.max(0, score - 2)
    }

    const isValid = password.length >= SECURITY_CONFIG.PASSWORD.MIN_LENGTH && 
                   password.length <= SECURITY_CONFIG.PASSWORD.MAX_LENGTH &&
                   feedback.length === 0

    return { isValid, score, feedback }
  }

  /**
   * 生成安全的随机字符串
   */
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  }

  /**
   * 简单的数据混淆（不是真正的加密，仅用于基本保护）
   */
  static obfuscateData(data: string): string {
    return SECURITY_CONFIG.STORAGE.ENCRYPTED_PREFIX + btoa(data)
  }

  /**
   * 解混淆数据
   */
  static deobfuscateData(obfuscatedData: string): string {
    if (!obfuscatedData.startsWith(SECURITY_CONFIG.STORAGE.ENCRYPTED_PREFIX)) {
      return obfuscatedData
    }
    
    try {
      return atob(obfuscatedData.substring(SECURITY_CONFIG.STORAGE.ENCRYPTED_PREFIX.length))
    } catch (error) {
      console.error('数据解混淆失败:', error)
      return ''
    }
  }

  /**
   * 清理敏感数据（从内存中）
   */
  static clearSensitiveData(obj: any): void {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = ''
        } else if (typeof obj[key] === 'object') {
          this.clearSensitiveData(obj[key])
        }
      })
    }
  }

  /**
   * 检查是否为安全的URL
   */
  static isSecureUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      // 只允许https和http协议
      return ['https:', 'http:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  /**
   * 防止XSS的HTML转义
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 生成CSP nonce
   */
  static generateNonce(): string {
    return this.generateSecureRandom(16)
  }
}

/**
 * 安全事件监听器
 */
export class SecurityEventListener {
  private static listeners: Map<string, Function[]> = new Map()

  /**
   * 添加安全事件监听器
   */
  static addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 移除安全事件监听器
   */
  static removeEventListener(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 触发安全事件
   */
  static dispatchEvent(event: string, data?: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`安全事件处理器错误 (${event}):`, error)
        }
      })
    }
  }
}

// 导出安全事件常量
export const SECURITY_EVENTS = {
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_REFRESHED: 'token_refreshed',
  SESSION_WARNING: 'session_warning',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
} as const