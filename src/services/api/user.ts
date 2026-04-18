import http from "../../utils/http";
import { API_ENDPOINTS } from "../../constants/constants";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Validate2FACodeRequest,
  RegisterRequest,
  RegisterResponse,
  UserInfoResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  AvatarUploadResponse,
} from "../../types/api";

// 用户相关API
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

  // 登出
  logout: (): Promise<ApiResponse<null>> => {
    return http.post(API_ENDPOINTS.USER.LOGOUT);
  },

  // 用户注册
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return http.post(API_ENDPOINTS.USER.REGISTER, data);
  },

  // 修改密码
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return http.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
  },

  // 忘记密码
  forgotPassword: (data: ForgotPasswordRequest) => {
    return http.post("/api/auth/forgot-password", data);
  },

  // 重置密码
  resetPassword: (data: ResetPasswordRequest) => {
    return http.post("/api/auth/reset-password", data);
  },

  // 获取当前用户信息（旧接口）
  getCurrentUser: (): Promise<ApiResponse<UserInfoResponse>> => {
    return http.get(API_ENDPOINTS.USER.ME);
  },

  // 获取当前用户详细信息（新接口）
  getUserInfo: (): Promise<ApiResponse<UserInfoResponse>> => {
    return http.get(API_ENDPOINTS.USER.INFO);
  },

  // 上传头像
  uploadAvatar: (file: File): Promise<ApiResponse<AvatarUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post(API_ENDPOINTS.USER.AVATAR_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  // 删除头像
  deleteAvatar: (): Promise<ApiResponse<null>> => {
    return http.delete(API_ENDPOINTS.USER.DELETE_AVATAR);
  },
};
