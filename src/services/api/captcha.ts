import { rawHttp } from "../../utils/http";
import { API_ENDPOINTS } from "../../constants/constants";

// 验证码相关API
export const captchaAPI = {
  // 获取验证码图片URL
  getCaptchaImage: () => {
    return `${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`;
  },

  // 预加载验证码以建立session
  preloadCaptcha: () => {
    return rawHttp.get(API_ENDPOINTS.CAPTCHA.IMAGE, {
      responseType: "blob",
      params: {
        t: Date.now(),
      },
    });
  },

  // 刷新验证码
  refreshCaptcha: () => {
    return `${API_ENDPOINTS.CAPTCHA.IMAGE}?t=${Date.now()}`;
  },
};
