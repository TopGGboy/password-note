import http from "../utils/http";
import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Send2FACodeRequest,
  Validate2FACodeRequest,
  RegisterRequest,
  RegisterResponse,



  UserInfoResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  CreatePasswordEntryRequest
} from "../types/api";

// 用户相关API（根据API接口文档）
export const userAPI = {
  // 登录
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return http.post(API_ENDPOINTS.USER.LOGIN, credentials);
  },

  // 登录邮箱验证
  loginEmailVerification: (
    data: Validate2FACodeRequest
  ): Promise<ApiResponse<LoginResponse>> => {
    return http.post(API_ENDPOINTS.USER.LOGINEMAILVERIFICATION, null, {
      params: {
        email: data.email,
        emailCode: data.emailCode,
      },
    });
  },

  // 刷新Token
  refreshToken: (): Promise<ApiResponse<any>> => {
    return http.post(API_ENDPOINTS.USER.REFRESH);
  },

  // 登出
  logout: (): Promise<ApiResponse<null>> => {
    return http.post(API_ENDPOINTS.USER.LOGOUT);
  },

  // 用户注册
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return http.post(API_ENDPOINTS.USER.REGISTER, data);
  },





  

  // 忘记密码
  forgotPassword: (data: ForgotPasswordRequest) => {
    return http.post("/api/auth/forgot-password", data);
  },

  // 重置密码
  resetPassword: (data: ResetPasswordRequest) => {
    return http.post("/api/auth/reset-password", data);
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<UserInfoResponse>> => {
    return http.get(API_ENDPOINTS.USER.ME);
  },

  // 修改密码
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return http.post("/api/auth/change-password", data);
  },
};

export const captchaAPI = {
  // 获取验证码图片URL
  getCaptchaImage: () => {
    const baseURL = process.env.VUE_APP_API_BASE_URL || "http://localhost:8080";
    return `${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`;
  },

  // 预加载验证码以建立session
  preloadCaptcha: () => {
    // 使用原始的 axios 实例来获取完整响应，包括 headers
    const baseURL = process.env.VUE_APP_API_BASE_URL || "http://localhost:8080";
    return axios.get(`${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}`, {
      responseType: "blob",
      withCredentials: true,
      // 添加时间戳避免缓存
      params: {
        t: Date.now()
      }
    });
  },

  // 刷新验证码
  refreshCaptcha: () => {
    const baseURL = process.env.VUE_APP_API_BASE_URL || "http://localhost:8080";
    return `${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`;
  },
};


// 邮箱验证码相关API
export const emailAPI = {
  // 发送2FA邮箱验证码
  send2FACode: (data: Send2FACodeRequest): Promise<ApiResponse<string>> => {
    return http.post("/api/email/send2FACode", null, {
      params: {
        email: data.email,
      },
    });
  },
};

// 密码条目相关API
export const passwordEntriesAPI = {
  // 创建密码条目
  create: (data: CreatePasswordEntryRequest): Promise<ApiResponse<any>> => {
    return http.post(API_ENDPOINTS.PASSWORDENTRIES.BASE, data)
  },
}

export default {
  user: userAPI,
  captcha: captchaAPI,
  email: emailAPI,
  passwordEntries: passwordEntriesAPI,
};
