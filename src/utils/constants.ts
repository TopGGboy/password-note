// API接口路径常量
export const API_ENDPOINTS = {
  // 认证相关接口
  AUTH: {
    LOGIN: '/api/auth/login',

    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  
  // 验证码相关接口（纯JWT方案）
  CAPTCHA: {
    IMAGE: '/api/captcha/image'
  },

  // 邮件服务相关接口
  EMAIL: {
    VALIDATEEMAILCODE: '/api/email/validate-email-code',
    SEND2FACODE: '/api/email/send2FACode'
  },
  
  // 用户相关接口
  USER: {
    REGISTER: '/api/users/register',
    PROFILE: '/api/users/profile'
  }
} as const

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const

// 本地存储键名常量
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ID: 'userId',
  USERNAME: 'username',
  TOKEN_EXPIRES_AT: 'tokenExpiresAt'
} as const

// 路由路径常量
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  RESET_PASSWORD: '/reset-password'
} as const