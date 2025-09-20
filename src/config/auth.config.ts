/**
 * 认证相关配置
 * 统一管理所有认证、安全、token相关的配置项
 */

export const AUTH_CONFIG = {
  // Token配置
  TOKEN: {
    // Token刷新提前时间（5分钟）
    REFRESH_THRESHOLD: 5 * 60 * 1000,
    // 自动刷新检查间隔（2分钟）
    AUTO_REFRESH_INTERVAL: 2 * 60 * 1000,
    // Token最大有效期（24小时）
    MAX_VALIDITY: 24 * 60 * 60 * 1000,
    // 刷新频率限制（30秒）
    REFRESH_RATE_LIMIT: 30 * 1000,
    // 最大刷新重试次数
    MAX_REFRESH_ATTEMPTS: 3,
  },

  // 会话配置
  SESSION: {
    // 会话超时时间（30分钟无操作）
    TIMEOUT: 30 * 60 * 1000,
    // 会话警告时间（25分钟）
    WARNING_TIME: 25 * 60 * 1000,
    // 会话检查间隔（1分钟）
    CHECK_INTERVAL: 60 * 1000,
  },

  // HTTP请求配置
  HTTP: {
    // 请求超时时间（10秒）
    TIMEOUT: 10000,
    // 最大重试次数
    MAX_RETRIES: 3,
    // 重试延迟（毫秒）
    RETRY_DELAY: 1000,
    // 基础URL
    BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
  },

  // 安全配置
  SECURITY: {
    // 密码最小长度
    PASSWORD_MIN_LENGTH: 6,
    // 密码最大长度
    PASSWORD_MAX_LENGTH: 50,
    // 是否启用密码复杂度检查
    ENABLE_PASSWORD_COMPLEXITY: false,
    // 是否启用会话监控
    ENABLE_SESSION_MONITORING: true,
    // 是否启用自动刷新
    ENABLE_AUTO_REFRESH: true,
  },

  // 存储配置
  STORAGE: {
    // 敏感数据加密前缀
    ENCRYPTED_PREFIX: 'enc_',
    // 是否启用存储完整性检查
    ENABLE_INTEGRITY_CHECK: true,
  },

  // 日志配置
  LOGGING: {
    // 是否启用详细日志
    ENABLE_VERBOSE: process.env.NODE_ENV === 'development',
    // 是否记录认证事件
    LOG_AUTH_EVENTS: true,
    // 是否记录token操作
    LOG_TOKEN_OPERATIONS: true,
  },

  // 开发配置
  DEVELOPMENT: {
    // 是否跳过token验证（仅开发环境）
    SKIP_TOKEN_VALIDATION: false,
    // 是否启用调试模式
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    // 模拟网络延迟（毫秒）
    SIMULATE_NETWORK_DELAY: 0,
  }
} as const

/**
 * 环境相关配置
 */
export const ENV_CONFIG = {
  // 是否为生产环境
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  // 是否为开发环境
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  // 是否为测试环境
  IS_TEST: process.env.NODE_ENV === 'test',
  // API基础URL
  API_BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
  // 应用版本
  APP_VERSION: process.env.VUE_APP_VERSION || '1.0.0',
} as const

/**
 * 公开接口列表
 * 这些接口不需要认证token
 */
export const PUBLIC_ENDPOINTS = [
  '/api/user/login',
  '/api/user/register',
  '/api/user/refresh',
  '/api/user/forgot-password',
  '/api/user/reset-password',
  '/api/captcha/image',
  '/captcha',
  '/health',
  '/version'
] as const

/**
 * 安全事件类型
 */
export const SECURITY_EVENTS = {
  // 认证事件
  AUTH_LOGIN_SUCCESS: 'auth_login_success',
  AUTH_LOGIN_FAILED: 'auth_login_failed',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_PERMISSION_DENIED: 'auth_permission_denied',
  
  // Token事件
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_REFRESHED: 'token_refreshed',
  TOKEN_REFRESH_FAILED: 'token_refresh_failed',
  
  // 会话事件
  SESSION_WARNING: 'session_warning',
  SESSION_EXPIRED: 'session_expired',
  SESSION_EXTENDED: 'session_extended',
  
  // 安全事件
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SECURITY_VIOLATION: 'security_violation',
} as const

/**
 * 错误代码
 */
export const ERROR_CODES = {
  // 认证错误
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',
  
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  
  // 服务器错误
  SERVER_ERROR: 'SERVER_ERROR',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
  
  // 客户端错误
  CLIENT_ERROR: 'CLIENT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

/**
 * 获取配置值的工具函数
 */
export function getAuthConfig<T extends keyof typeof AUTH_CONFIG>(key: T): typeof AUTH_CONFIG[T] {
  return AUTH_CONFIG[key]
}

/**
 * 检查是否为公开接口
 */
export function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

/**
 * 获取环境配置
 */
export function getEnvConfig<T extends keyof typeof ENV_CONFIG>(key: T): typeof ENV_CONFIG[T] {
  return ENV_CONFIG[key]
}

/**
 * 日志工具函数
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (AUTH_CONFIG.LOGGING.ENABLE_VERBOSE) {
      console.log(`🔍 [DEBUG] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (AUTH_CONFIG.LOGGING.LOG_AUTH_EVENTS) {
      console.log(`ℹ️ [INFO] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ [WARN] ${message}`, ...args)
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [ERROR] ${message}`, ...args)
  },
  
  auth: (message: string, ...args: any[]) => {
    if (AUTH_CONFIG.LOGGING.LOG_AUTH_EVENTS) {
      console.log(`🔐 [AUTH] ${message}`, ...args)
    }
  },
  
  token: (message: string, ...args: any[]) => {
    if (AUTH_CONFIG.LOGGING.LOG_TOKEN_OPERATIONS) {
      console.log(`🎫 [TOKEN] ${message}`, ...args)
    }
  }
}