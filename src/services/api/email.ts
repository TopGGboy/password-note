import http from "../../utils/http";
import type {
  ApiResponse,
  Send2FACodeRequest
} from "../../types/api";

// 邮箱验证码相关API
export const emailAPI = {
  // 发送2FA邮箱验证码
  send2FACode: (data: Send2FACodeRequest): Promise<ApiResponse<string>> => {
    return http.post("/api/email/send2FACode", null, {
      params: {
        email: data.email,
      },
    });
  },
};
