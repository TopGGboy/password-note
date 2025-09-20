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
  id: number
  username: string
  email: string
  token: string
  refreshToken: string
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
  emailCode: string
}

// 用户注册响应数据
export interface RegisterResponse {
  username: string
  email: string
}


// 新增密码条目请求参数
export interface CreatePasswordEntryRequest {
  categoryId?: number
  title: string
  usernameEncrypted: string
  passwordEncrypted: string
  url?: string
  notesEncrypted?: string
  customFields?: any
  favorite?: boolean
}


// 分页获取用户密码条目请求参数
export interface GetPasswordEntriesRequest {
  page: number // 页码，从1开始
  pageSize: number // 每页条数
  keyword?: string // 搜索关键词
  categoryId?: number // 分类筛选
  favorite?: boolean // 收藏筛选
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'timesUsed' // 排序字段
  sortOrder?: 'asc' | 'desc' // 排序方向
}

// 分页查询响应数据
export interface PagedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 密码条目分页响应
export interface GetPasswordEntriesResponse extends PagedResponse<PasswordEntry> {}

// 创建默认的分页查询参数
export function createDefaultPasswordEntriesQuery(): GetPasswordEntriesRequest {
  return {
    page: 1,
    pageSize: 10,
    keyword: undefined,
    categoryId: undefined,
    favorite: undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  }
}

// 验证分页查询参数
export function validatePasswordEntriesQuery(query: Partial<GetPasswordEntriesRequest>): GetPasswordEntriesRequest {
  return {
    page: Math.max(1, query.page || 1),
    pageSize: Math.min(Math.max(1, query.pageSize || 10), 100), // 限制最大每页100条
    keyword: query.keyword?.trim() || undefined,
    categoryId: query.categoryId,
    favorite: query.favorite,
    sortBy: query.sortBy || 'updatedAt',
    sortOrder: query.sortOrder || 'desc'
  }
}


// 分类信息 - 匹配后端CategoriesVO
export interface Category {
  id: number
  userId: number
  name: string
  color?: string
  sortOrder?: number
  icon?: number
  description?: string
  createdAt?: string
  updatedAt?: string
  entryCount?: number
}

// 获取分类列表响应 - 后端直接返回Category数组
export type CategoriesResponse = Category[]














// 密码条目信息
export interface PasswordEntry {
  id: number
  userId: number
  categoryId?: number
  title: string
  usernameEncrypted: string
  passwordEncrypted: string
  url?: string
  notesEncrypted?: string
  customFields?: any
  strengthScore?: number
  favorite: boolean
  timesUsed: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
  // 解密后的字段（前端使用）
  username?: string
  password?: string
  notes?: string
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
  expiresIn?: number
}

// 邮箱验证码登录请求参数
export interface EmailVerificationLoginRequest {
  email: string
  emailCode: string
}

// 登出请求（无需参数，通过Header传递token）
export interface LogoutRequest {}

// 登出响应（返回void，但包装在ApiResponse中）
export interface LogoutResponse {}