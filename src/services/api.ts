import http from '../utils/http'
import { API_ENDPOINTS } from '../utils/constants'
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse,
  RegisterRequest, 
  CaptchaTokenResponse,
  UserInfo,
  UserInfoResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Send2FACodeRequest,
  Validate2FACodeRequest,
} from '../types/api'

// 认证相关API（根据API接口文档）
export const authAPI = {
  // 登录
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return http.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
  },




  // 忘记密码
  forgotPassword: (data: ForgotPasswordRequest) => {
    return http.post('/api/auth/forgot-password', data)
  },

  // 重置密码
  resetPassword: (data: ResetPasswordRequest) => {
    return http.post('/api/auth/reset-password', data)
  },

  // 登出
  logout: () => {
    return http.post('/api/auth/logout')
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<UserInfoResponse>> => {
    return http.get('/api/auth/me')
  },

  // 修改密码
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return http.post('/api/auth/change-password', data)
  }
}


export const captchaAPI = {

  // 获取验证码图片URL
  getCaptchaImage: () => {
    const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
    return `${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`
  },

  // 预加载验证码以建立session
  preloadCaptcha: () => {
    // 使用原始的 axios 实例来获取完整响应，包括 headers
    const axios = require('axios')
    const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
    return axios.get(`${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}`, {
      responseType: 'blob',
      withCredentials: true
    })
  },

  // 刷新验证码
  refreshCaptcha: () => {
    const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
    return `${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`
  }
}

// 用户相关API
export const userAPI = {
  // 注册
  register: (data: RegisterRequest): Promise<ApiResponse<null>> => {
    return http.post(API_ENDPOINTS.USER.REGISTER, data)
  },

  // 获取用户资料
  getProfile: (): Promise<ApiResponse<UserInfo>> => {
    return http.get(API_ENDPOINTS.USER.PROFILE)
  },

  // 更新用户资料
  updateProfile: (data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> => {
    return http.put(API_ENDPOINTS.USER.PROFILE, data)
  }
}

// 邮箱验证码相关API
export const emailAPI = {
  // 发送2FA邮箱验证码
  send2FACode: (data: Send2FACodeRequest): Promise<ApiResponse<string>> => {
    return http.post('/api/email/send2FACode', null, {
      params: {
        email: data.email
      }
    })
  },

  // 验证2FA邮箱验证码
  validate2FACode: (data: Validate2FACodeRequest): Promise<ApiResponse<LoginResponse>> => {
    return http.post('/api/email/validateEmailCode', null, {
      params: {
        email: data.email,
        emailCode: data.emailCode
      }
    })
  }
}

export default {
  auth: authAPI,
  captcha: captchaAPI,
  user: userAPI,
  email: emailAPI
}