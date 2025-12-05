import axios from "axios";
import { API_ENDPOINTS } from "../../constants/constants";

// 验证码相关API
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
        t: Date.now(),
      },
    });
  },

  // 刷新验证码
  refreshCaptcha: () => {
    const baseURL = process.env.VUE_APP_API_BASE_URL || "http://localhost:8080";
    return `${baseURL}${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`;
  },
};
