// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  msg: string | null
  data: T
}

// 登录请求参数（纯JWT方案）
export interface LoginRequest{
  username: string
  password: string
  captcha: string
  sessionId: string
}

// 登录的响应
export interface LoginResponse {
  username: string
  email: string
  token: string
  twoFactorEnabled: boolean
}


// 发送2FA邮箱验证码请求参数
export interface Send2FACodeRequest {
  email: string
}

// 验证2FA邮箱验证码请求参数
export interface Validate2FACodeRequest {
  email: string
  emailCode: string
}


// 用户注册请求参数
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 验证码Token响应数据
export interface CaptchaTokenResponse {
  captchaToken: string
  captchaImage: string
  expiresIn: number
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

// 用户信息响应（包含user字段）
export interface UserInfoResponse {
  user: UserInfo
}

// 修改密码请求参数
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// 重置密码请求参数
export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

// 忘记密码请求参数
export interface ForgotPasswordRequest {
  email: string
}

// 刷新Token请求参数
export interface RefreshTokenRequest {
  refreshToken: string
}

// 刷新Token响应数据
export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}