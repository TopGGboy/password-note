import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import router from '../router'
import { HTTP_STATUS, STORAGE_KEYS, ROUTES, API_ENDPOINTS } from './constants'

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
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token（登录和注册接口除外）
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const isAuthEndpoint = config.url?.includes(API_ENDPOINTS.AUTH.LOGIN) || 
                          config.url?.includes(API_ENDPOINTS.USER.REGISTER) ||
                          config.url?.includes('/captcha')
    
    if (token && config.headers && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳
    if (config.headers) {
      config.headers['X-Timestamp'] = Date.now().toString()
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
    return response.data
  },
  async error => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER_ID)
          localStorage.removeItem(STORAGE_KEYS.USERNAME)
          if (router.currentRoute.value.path !== ROUTES.LOGIN) {
            router.push(ROUTES.LOGIN)
          }
          break
          
        case HTTP_STATUS.FORBIDDEN:
          // 禁止访问
          console.error('访问被拒绝')
          break
          
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          // 请求过于频繁
          console.error('请求过于频繁，请稍后重试')
          break
          
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          // 服务器错误
          console.error('服务器内部错误')
          break
          
        default:
          console.error('请求失败:', response.data?.message || '未知错误')
      }
    } else {
      // 网络错误
      console.error('网络连接失败，请检查网络设置')
    }
    
    return Promise.reject(error)
  }
)

export default http