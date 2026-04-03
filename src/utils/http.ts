import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { HTTP_STATUS, API_ENDPOINTS } from "../constants/constants";
import { useAuthStore } from "../store/auth";
import { tokenManager } from "./auth/tokenManager";

/**
 * 优化后的HTTP客户端
 * 简化token处理逻辑，统一错误处理
 */
const baseURL = "";

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: "",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 不需要认证的接口列表
const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.USER.LOGIN,
  API_ENDPOINTS.USER.REGISTER,
  API_ENDPOINTS.USER.REFRESH,
  API_ENDPOINTS.CAPTCHA.IMAGE,
  API_ENDPOINTS.EMAIL.SEND2FACODE,
  "/captcha",
  "/api/user/forgot-password",
  "/api/user/reset-password",
];

/**
 * 检查是否为公开接口
 */
function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// 请求拦截器
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 添加安全头
    if (config.headers) {
      config.headers["X-Timestamp"] = Date.now().toString();
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }

    // 为需要认证的接口添加token
    if (!isPublicEndpoint(config.url)) {
      console.log('=== HTTP请求拦截器调试 ===')
      console.log('请求URL:', config.url)
      console.log('请求方法:', config.method)
      
      // 获取token
      const token = tokenManager.getAccessToken();
      console.log('获取到的token:', token ? `${token.substring(0, 20)}...` : 'null')
      
      // 检查token有效性
      const hasValidToken = tokenManager.hasValidToken();
      const isTokenExpired = tokenManager.isTokenExpired();
      console.log('Token有效性:', hasValidToken)
      console.log('Token是否过期:', isTokenExpired)

      if (token && hasValidToken && !isTokenExpired && config.headers) {
        // Token有效，直接使用
        config.headers.Authorization = `Bearer ${token}`;
        
        // 添加额外的认证相关头部
        config.headers['X-Auth-Token'] = token;
        config.headers['X-User-ID'] = localStorage.getItem('userId') || '';
        
        console.log('✅ 已添加有效token到请求头')
        console.log('Authorization头:', config.headers.Authorization)
        console.log('X-Auth-Token头:', config.headers['X-Auth-Token'])
        console.log('X-User-ID头:', config.headers['X-User-ID'])
      } else if (token && hasValidToken && isTokenExpired) {
        // Token过期，尝试刷新
        console.log('⚠️ Token已过期，尝试刷新')
        try {
          const newToken = await tokenManager.refreshToken();
          if (newToken && config.headers) {
            config.headers.Authorization = `Bearer ${newToken}`;
            config.headers['X-Auth-Token'] = newToken;
            config.headers['X-User-ID'] = localStorage.getItem('userId') || '';
            console.log('✅ Token刷新成功，已添加新token到请求头')
            console.log('新Authorization头:', config.headers.Authorization)
          } else {
            console.log('❌ Token刷新失败')
            tokenManager.clearTokens();
            return Promise.reject(new Error("Token refresh failed"));
          }
        } catch (error) {
          console.log('❌ Token刷新异常:', error)
          tokenManager.clearTokens();
          return Promise.reject(new Error('Token refresh error'))
        }
      } else {
        console.log('❌ 没有有效token，无法添加认证头')
        // 对于需要认证的接口，如果没有token，直接拒绝请求
        return Promise.reject(new Error("No valid token available"));
      }
      
      console.log('最终请求头Authorization:', config.headers?.Authorization)
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查响应头中的新token
    const newToken = response.headers["x-new-token"];
    const newRefreshToken = response.headers["x-new-refresh-token"];
    const expiresIn = response.headers["x-token-expires-in"];

    if (newToken) {
      console.log('🔄 收到新token，更新存储')
      tokenManager.setTokens(
        newToken,
        newRefreshToken,
        expiresIn ? parseInt(expiresIn) : undefined
      );
    }

    return response.data;
  },
  async (error) => {
    const { response, config } = error;

    console.log('=== HTTP响应拦截器错误处理 ===')
    console.log('请求URL:', config?.url)
    console.log('响应状态:', response?.status)
    console.log('错误信息:', error.message)

    if (!response) {
      console.log('❌ 没有响应对象，可能是网络错误')
      return Promise.reject(error);
    }

    // 处理HTTP错误状态码
    switch (response.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        console.log('🔒 收到401未授权错误，开始处理')
        await handleUnauthorizedError(config, error);
        break;

      case HTTP_STATUS.FORBIDDEN:
        console.log('🚫 收到403权限不足错误')
        // 权限不足，清除认证信息
        tokenManager.clearTokens();
        break;

      case HTTP_STATUS.TOO_MANY_REQUESTS:
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      default:
        console.log('⚠️ 收到其他HTTP错误:', response.status)
        // 统一错误处理，不打印日志
        break;
    }

    return Promise.reject(error);
  }
);

/**
 * 处理401未授权错误
 */
async function handleUnauthorizedError(config: any, error: any): Promise<any> {
  console.log('=== 处理401未授权错误 ===')
  console.log('请求URL:', config.url)
  console.log('重试次数:', config._retryCount || 0)
  
  // 如果是刷新token的请求失败，直接清除token
  if (config.url?.includes("/refresh")) {
    console.log('❌ 刷新token请求失败，清除所有token')
    tokenManager.clearTokens();
    return Promise.reject(error);
  }

  // 如果是公开接口返回401，直接抛出错误
  if (isPublicEndpoint(config.url)) {
    console.log('❌ 公开接口返回401，直接抛出错误')
    return Promise.reject(error);
  }

  // 检查是否已经在刷新token，避免重复刷新
  if (config._retryCount && config._retryCount >= 1) {
    console.log('❌ 重试次数超限，停止重试')
    tokenManager.clearTokens();
    return Promise.reject(error);
  }

  // 尝试刷新token并重试请求
  try {
    console.log('🔄 尝试刷新token并重试请求')
    const newToken = await tokenManager.refreshToken();

    if (newToken && config.headers) {
      // 更新请求头中的token
      config.headers.Authorization = `Bearer ${newToken}`;
      config._retryCount = (config._retryCount || 0) + 1;
      console.log('✅ Token刷新成功，重新发送请求，重试次数:', config._retryCount)
      return http.request(config);
    }

    console.log('❌ Token刷新失败')
    throw new Error("Token刷新失败");
  } catch (refreshError) {
    console.log('❌ Token刷新重试失败:', refreshError)
    tokenManager.clearTokens();
    return Promise.reject(error);
  }
}

/**
 * 创建不带拦截器的axios实例（用于特殊场景）
 */
export const rawHttp = axios.create({
  baseURL: "",
  timeout: 10000,
  withCredentials: true,
});

export default http;
