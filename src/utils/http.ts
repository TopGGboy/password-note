import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { HTTP_STATUS, API_ENDPOINTS } from "../constants/constants";
import { authManager } from "./auth/authManager";

/**
 * 优化后的HTTP客户端
 * 简化token处理逻辑，统一错误处理
 */

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || "http://localhost:8080",
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
    // 更新用户活动时间
    authManager.updateActivity();

    // 添加安全头
    if (config.headers) {
      config.headers["X-Timestamp"] = Date.now().toString();
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }

    // 为需要认证的接口添加token
    if (!isPublicEndpoint(config.url)) {
      console.log("🚀 正在处理需要认证的请求:", config.url);

      let authHeader = authManager.getAuthHeader();

      // 打印当前认证状态
      console.log("🔐 认证状态:", {
        isAuthenticated: authManager.isAuthenticated(),
        tokenExists: !!authHeader,
        token: authHeader ? "存在" : "不存在",
      });

      // 如果有认证头且格式正确，直接使用
      if (authHeader && config.headers) {
        config.headers.Authorization = authHeader;
        console.log("✅ 已添加 Authorization 头:", authHeader);
      } else if (authManager.isAuthenticated()) {
        // 有认证状态但没有有效token，可能需要刷新
        console.warn("⚠️ 认证状态异常，尝试刷新token");
        try {
          const refreshSuccess = await authManager.refreshToken();
          if (refreshSuccess) {
            authHeader = authManager.getAuthHeader();
            if (authHeader && config.headers) {
              config.headers.Authorization = authHeader;
              console.log("🔄 成功刷新token并添加到请求头:", authHeader);
            }
          } else {
            console.error("❌ Token刷新失败，执行登出");
            authManager.logout("Token刷新失败");
            return Promise.reject(new Error("Authentication failed"));
          }
        } catch (error) {
          console.error('❌ 请求前token刷新失败:', error)
          authManager.logout('Token刷新异常')
          return Promise.reject(new Error('Authentication failed'))
        }
      }
    }

    // 打印最终的请求配置
    console.log('📤 最终请求配置:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data ? '存在数据' : '无数据'
    })

    return config;
  },
  (error) => {
    console.error("❌ 请求配置错误:", error);
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
      console.log("🔄 收到服务器下发的新token");
      authManager.login(
        newToken,
        newRefreshToken,
        expiresIn ? parseInt(expiresIn) : undefined
      );
    }

    return response.data;
  },
  async (error) => {
    const { response, config } = error;

    if (!response) {
      // 网络错误
      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        console.error("🌐 网络连接失败，请检查网络设置");
      } else if (error.code === "ECONNABORTED") {
        console.error("⏰ 请求超时，请稍后重试");
      } else {
        console.error("❌ 请求异常:", error.message);
      }
      return Promise.reject(error);
    }

    // 处理HTTP错误状态码
    switch (response.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        await handleUnauthorizedError(config, error);
        break;

      case HTTP_STATUS.FORBIDDEN:
        console.error("🚫 访问被拒绝 - 权限不足");
        authManager.handleAuthError(error, "权限不足");
        break;

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        console.error("⏰ 请求过于频繁，请稍后重试");
        break;

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        console.error("💥 服务器内部错误");
        break;

      default:
        console.error(
          "❌ 请求失败:",
          response.data?.msg || response.data?.message || "未知错误"
        );
    }

    return Promise.reject(error);
  }
);

/**
 * 处理401未授权错误
 */
async function handleUnauthorizedError(config: any, error: any): Promise<any> {
  console.log("🔒 收到401未授权响应，URL:", config.url);

  // 如果是刷新token的请求失败，直接登出
  if (config.url?.includes("/refresh")) {
    console.log("🧹 刷新token请求失败，执行登出");
    authManager.handleAuthError(error, "Token刷新失败");
    return Promise.reject(error);
  }

  // 如果是公开接口返回401，直接抛出错误
  if (isPublicEndpoint(config.url)) {
    console.log("🔒 公开接口返回401，可能是凭据错误");
    return Promise.reject(error);
  }

  // 检查是否已经在刷新token，避免重复刷新
  if (config._retryCount && config._retryCount >= 1) {
    console.log("🚫 请求已重试过，避免无限循环");
    authManager.handleAuthError(error, "重试次数超限");
    return Promise.reject(error);
  }

  // 尝试刷新token并重试请求
  try {
    console.log("🔄 尝试刷新token后重试请求:", config.url);
    const refreshSuccess = await authManager.refreshToken();

    if (refreshSuccess) {
      // 更新请求头中的token
      const newAuthHeader = authManager.getAuthHeader();
      if (newAuthHeader && config.headers) {
        config.headers.Authorization = newAuthHeader;
        config._retryCount = (config._retryCount || 0) + 1;
        console.log("🔄 使用新token重试请求");
        return http.request(config);
      }
    }

    throw new Error("Token刷新后仍无有效认证信息");
  } catch (refreshError) {
    console.error("🔄 Token刷新失败:", refreshError);
    authManager.handleAuthError(error, "Token刷新重试失败");
    return Promise.reject(error);
  }
}

/**
 * 创建不带拦截器的axios实例（用于特殊场景）
 */
export const rawHttp = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  withCredentials: true,
});

export default http;
