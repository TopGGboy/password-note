// API接口路径常量
export const API_ENDPOINTS = {
  // 用户相关接口
  USER: {
    LOGIN: "/api/user/login", // 登录
    LOGINEMAILVERIFICATION: "/api/user/login-email-verification", // 登录邮箱验证
    REGISTER: "/api/user/register", // 注册
    REFRESH: "/api/user/refresh", // 刷新token
    LOGOUT: "/api/user/logout", // 登出

    ME: "/api/user/me",
    CHANGE_PASSWORD: "/api/user/change-password",
    FORGOT_PASSWORD: "/api/user/forgot-password",
    RESET_PASSWORD: "/api/user/reset-password",
  },

  PASSWORDENTRIES: {
    BASE: "/api/password-entries",
    PAGE: "/api/password-entries/page",
    DELETE: "/api/password-entries/:id",
    PUT: "/api/password-entries/:id",
    SEARCH: "/api/password-entries/search",
    FAVORITES: "/api/password-entries/favorites"
  },

  CATEGORIES: {
    BASE: "/api/categories",
    DELETE: "/api/categories/:id",
  },

  // 验证码相关接口
  CAPTCHA: {
    IMAGE: "/api/captcha/image",
  },

  // 邮件服务相关接口
  EMAIL: {
    SEND2FACODE: "/api/email/send2FACode",
  },
} as const;

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// 本地存储键名常量
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_ID: "userId",
  USERNAME: "username",
  TOKEN_EXPIRES_AT: "tokenExpiresAt",
} as const;

// 路由路径常量
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  RESET_PASSWORD: "/reset-password",
  PASSWORDS: "/passwords",
  CATEGORIES: "/categories",
  SETTINGS: "/settings",
} as const;
