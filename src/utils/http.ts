import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import router from '../router'
import { HTTP_STATUS, STORAGE_KEYS, ROUTES, API_ENDPOINTS } from './constants'
import { tokenManager } from './tokenManager'

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  withCredentials: true, // 重要：包含cookie以支持session
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 检查是否为认证相关接口（不需要token的接口）
    const isAuthEndpoint = config.url?.includes(API_ENDPOINTS.USER.LOGIN) || 
                          config.url?.includes(API_ENDPOINTS.USER.REGISTER) ||
                          config.url?.includes('/captcha') ||
                          config.url?.includes('/refresh')
    
    if (!isAuthEndpoint) {
      // 添加认证token（不在这里刷新token，避免并发问题）
      const token = tokenManager.getAccessToken()
      if (token && config.headers) {
        // 验证token格式
        if (tokenManager.validateTokenFormat(token)) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('⚠️ Token格式无效，清除并跳转登录页')
          tokenManager.clearTokens()
          if (router.currentRoute.value.path !== ROUTES.LOGIN) {
            router.push(ROUTES.LOGIN)
          }
          return Promise.reject(new Error('Invalid token format'))
        }
      }
    }
    
    // 添加请求时间戳和安全头
    if (config.headers) {
      config.headers['X-Timestamp'] = Date.now().toString()
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查响应中是否包含新的token信息
    const newToken = response.headers['x-new-token']
    const newRefreshToken = response.headers['x-new-refresh-token']
    const expiresIn = response.headers['x-token-expires-in']
    
    if (newToken) {
      console.log('🔄 收到新token，更新本地存储')
      tokenManager.setTokens(
        newToken, 
        newRefreshToken, 
        expiresIn ? parseInt(expiresIn) : undefined
      )
    }
    
    return response.data
  },
  async error => {
    const { response, config } = error
    
    if (response) {
      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          console.log('🔒 收到401未授权响应，URL:', config.url)
          
          // 如果是刷新token的请求失败，直接清除认证信息
          if (config.url?.includes('/refresh')) {
            console.log('🧹 刷新token请求失败，清除认证信息')
            tokenManager.clearTokens()
            if (router.currentRoute.value.path !== ROUTES.LOGIN) {
              router.push(ROUTES.LOGIN)
            }
            break
          }
          
          // 如果有refresh token，尝试刷新后重试
          if (tokenManager.getRefreshToken()) {
            try {
              console.log('🔄 尝试刷新token后重试请求:', config.url)
              await tokenManager.refreshToken()
              
              // 更新请求头中的token
              const newToken = tokenManager.getAccessToken()
              if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`
                console.log('🔄 使用新token重试请求')
              }
              
              // 重试原请求
              return http.request(config)
            } catch (refreshError) {
              console.error('🔄 Token刷新失败，跳转登录页:', refreshError)
              tokenManager.clearTokens()
              if (router.currentRoute.value.path !== ROUTES.LOGIN) {
                router.push(ROUTES.LOGIN)
              }
            }
          } else {
            // 没有refresh token，清除认证信息
            console.log('🧹 无refresh token，清除认证信息并跳转登录页')
            tokenManager.clearTokens()
            if (router.currentRoute.value.path !== ROUTES.LOGIN) {
              router.push(ROUTES.LOGIN)
            }
          }
          break
          
        case HTTP_STATUS.FORBIDDEN:
          console.error('🚫 访问被拒绝 - 权限不足')
          // 可以显示权限不足的提示
          break
          
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          console.error('⏰ 请求过于频繁，请稍后重试')
          // 可以实现退避重试机制
          break
          
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          console.error('💥 服务器内部错误')
          break
          
        default:
          console.error('❌ 请求失败:', response.data?.msg || response.data?.message || '未知错误')
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 网络连接失败，请检查网络设置')
    } else {
      console.error('❌ 请求异常:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default http