# Token 管理指南

## Token 分工明确

### 1. 访问 Token (Access Token)
- **用途**: 用于 API 请求的身份验证
- **有效期**: 较短（通常 15-30 分钟）
- **存储位置**: localStorage (`ACCESS_TOKEN`)
- **使用场景**: 每次 API 请求的 Authorization 头

### 2. 刷新 Token (Refresh Token)
- **用途**: 用于获取新的访问 token
- **有效期**: 较长（通常 7-30 天）
- **存储位置**: localStorage (`REFRESH_TOKEN`)
- **使用场景**: 当访问 token 过期时，用于刷新获取新的访问 token

## 修复的问题

### 1. 登录状态检查问题
**问题**: SecurityStatus 组件显示未登录，但实际已登录
**原因**: Auth Store 的 `isLoggedIn` getter 逻辑不完整
**修复**: 
- 增加详细的登录状态检查日志
- 确保 token、用户信息、过期状态都正确验证

### 2. 页面刷新后跳转登录问题
**问题**: 刷新页面后直接跳转到登录界面
**原因**: 
- 应用初始化时没有正确恢复用户状态
- checkAuth 方法没有处理 token 刷新逻辑
**修复**:
- 改进应用初始化流程，使用 `checkAuth` 方法完整恢复状态
- 在 `checkAuth` 中增加自动 token 刷新逻辑
- 从本地存储恢复用户信息

### 3. Token 刷新逻辑问题
**问题**: 前端传递错误的 token 给刷新接口
**原因**: `performTokenRefresh` 方法传递的是访问 token 而不是刷新 token
**修复**: 修改为正确传递刷新 token

## 工作流程

### 登录流程
1. 用户输入凭据
2. 后端验证成功，返回访问 token 和刷新 token
3. 前端存储两个 token 和用户信息
4. 设置认证状态为已登录

### Token 刷新流程
1. 检测到访问 token 即将过期或已过期
2. 使用刷新 token 调用刷新接口
3. 后端验证刷新 token，返回新的访问 token 和刷新 token
4. 前端更新存储的 token
5. 继续正常的 API 请求

### 应用启动流程
1. 检查本地存储中的 token
2. 如果有有效的访问 token，恢复用户状态
3. 如果访问 token 过期但有刷新 token，自动刷新
4. 如果都无效，清除认证状态

### 路由守卫流程
1. 检查目标路由是否需要认证
2. 使用 tokenManager 检查 token 有效性
3. 如果无效或过期，跳转登录页
4. 如果有效，允许访问

## 关键修改点

### 1. Auth Store 状态初始化
```typescript
state: (): AuthState => {
  // 从存储中恢复用户信息
  const token = tokenManager.getAccessToken()
  const refreshToken = tokenManager.getRefreshToken()
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME)
  
  let user: User | null = null
  if (token && username) {
    user = {
      username,
      email: localStorage.getItem('email') || undefined,
      token,
      twoFactorEnabled: false
    }
  }
  
  return {
    user,
    token,
    refreshToken,
    isAuthenticated: !!(token && user && !tokenManager.isTokenExpired()),
    // ...
  }
}
```

### 2. checkAuth 方法增强
- 增加自动 token 刷新逻辑
- 从本地存储恢复用户信息
- 详细的日志记录

### 3. 应用初始化改进
- 使用完整的 `checkAuth` 方法而不是简单检查
- 确保认证状态正确恢复

### 4. Token 刷新修复
- 正确传递刷新 token 而不是访问 token
- 刷新成功后更新 store 状态

## 测试验证

### 测试场景
1. **正常登录**: 验证登录后状态正确
2. **页面刷新**: 验证刷新后状态保持
3. **Token 过期**: 验证自动刷新机制
4. **刷新失败**: 验证清除状态并跳转登录
5. **安全状态组件**: 验证显示正确的登录状态

### 预期结果
- 登录成功后，SecurityStatus 显示"已登录"
- 页面刷新后，保持登录状态，不跳转登录页
- Token 即将过期时，自动刷新成功
- 刷新失败时，清除状态并跳转登录页