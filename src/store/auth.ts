import { defineStore } from "pinia";
import { userAPI, emailAPI } from "../services/api";
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "src/types/api";
import { tokenManager } from "../utils/tokenManager";
import { STORAGE_KEYS } from "../utils/constants";

interface User {
  username: string;
  email?: string;
  token: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: tokenManager.getAccessToken(),
    refreshToken: tokenManager.getRefreshToken(),
    isAuthenticated: false,
    loginAttempts: 0,
    isLocked: false,
    lockoutEndTime: null,
  }),

  getters: {
    isLoggedIn: (state): boolean => {
      // 使用token管理器验证登录状态
      return tokenManager.hasValidToken() && !!state.user && !tokenManager.isTokenExpired()
    },
    userInfo: (state): User | null => state.user,
    remainingLockoutTime: (state): number => {
      if (!state.lockoutEndTime) return 0;
      const remaining = state.lockoutEndTime - Date.now();
      return Math.max(0, Math.ceil(remaining / 1000));
    },
    tokenExpirationTime: (): number | null => {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      return expiresAt ? parseInt(expiresAt) : null
    },
    isTokenExpiringSoon: (): boolean => tokenManager.isTokenExpiringSoon(),
  },

  actions: {
    // 刷新Token
    async refreshAccessToken(): Promise<{ success: boolean; data?: any }> {
      try {
        const response = await userAPI.refreshToken();
        
        if (response.code === 1 && response.data) {
          const { token, refreshToken } = response.data;
          
          // 更新token信息
          this.token = token;
          this.refreshToken = refreshToken;
          
          // 使用token管理器更新存储
          tokenManager.setTokens(token, refreshToken);
          
          return { success: true, data: response.data };
        }
        
        return { success: false };
      } catch (error) {
        console.error("刷新Token失败:", error);
        // 刷新失败，清除认证信息
        this.clearAuth();
        throw error;
      }
    },

    // 登出
    async logout(): Promise<void> {
      try {
        // 调用后端登出接口
        await userAPI.logout();
      } catch (error) {
        console.error("登出请求失败:", error);
      } finally {
        this.clearAuth();
      }
    },
    // 登录
    async login(
      credentials: LoginRequest
    ): Promise<{ success: boolean; twoFactorEnabled?: boolean; data?:  any}> {
      try {
        const response: ApiResponse<LoginResponse> = await userAPI.login(
          credentials
        );
        console.log("响应数据:", response);
        console.log("登录码:", response.code);
        // 输出：登录码: undefined

        // 检查响应是否成功
        if (response.code === 1) {
          const { username, email, token, refreshToken, twoFactorEnabled } = response.data;

          // 如果需要2FA验证，不保存认证信息，返回需要验证的状态
          if (twoFactorEnabled) {
            return {
              success: true,
              twoFactorEnabled: true,
              data: { username, email },
            };
          }

          // 如果不需要2FA验证，直接保存认证信息
          const user: User = {
            username,
            email,
            token,
            twoFactorEnabled: false,
          };
          console.log("用户信息:", user);

          // 解析token获取过期时间
          const tokenPayload = tokenManager.parseJWTPayload(token);
          const expiresIn = tokenPayload?.exp ? (tokenPayload.exp - Math.floor(Date.now() / 1000)) : undefined;

          // 保存认证信息，包括refreshToken
          this.setAuth(token, refreshToken || "", user, expiresIn);

          return { success: true };
        }

        return { success: false };
      } catch (error) {
        this.handleLoginError(error);
        throw error;
      }
    },

    // 发送2FA验证码
    async send2FACode(email: string): Promise<{ success: boolean }> {
      try {
        const response = await emailAPI.send2FACode({ email });

        if (response.code === 1) {
          return { success: true };
        }

        return { success: false };
      } catch (error) {
        console.error("发送2FA验证码失败:", error);
        throw error;
      }
    },

    // 邮箱验证码证验证
    async verify2FA(
      email: string,
      emailCode: string
    ): Promise<{ success: boolean; data?: any }> {
      try {
        const response = await userAPI.loginEmailVerification({
          email,
          emailCode,
        });

        if (response.code === 1 && response.data) {
          const { username, token, refreshToken, twoFactorEnabled, email } = response.data;

          // 解析token获取过期时间
          const tokenPayload = tokenManager.parseJWTPayload(token);
          const expiresIn = tokenPayload?.exp ? (tokenPayload.exp - Math.floor(Date.now() / 1000)) : undefined;

          // 设置认证信息，包括refreshToken
          this.setAuth(token, refreshToken || "", { username, token, twoFactorEnabled, email }, expiresIn);
          this.resetLoginAttempts();

          return {
            success: true,
            data: { username, token, refreshToken, twoFactorEnabled },
          };
        }

        return { success: false };
      } catch (error) {
        console.error("2FA验证失败:", error);
        throw error;
      }
    },

    // 发送注册邮箱验证码
    async sendRegisterEmailCode(email: string): Promise<{ success: boolean; message?: string }> {
      try {
        const response = await emailAPI.send2FACode({ email });

        if (response.code === 1) {
          return { success: true, message: "验证码发送成功" };
        }

        return { 
          success: false, 
          message: response.msg || "验证码发送失败" 
        };
      } catch (error: any) {
        console.error("发送注册验证码失败:", error);
        return { 
          success: false, 
          message: error.response?.data?.msg || "网络错误，请稍后重试" 
        };
      }
    },

    // 用户注册
    async register(
      registerData: RegisterRequest
    ): Promise<{ success: boolean; message?: string; data?: RegisterResponse }> {
      try {
        const response: ApiResponse<RegisterResponse> = await userAPI.register(registerData);

        if (response.code === 1) {
          return {
            success: true,
            message: "注册成功",
            data: response.data
          };
        }

        return {
          success: false,
          message: response.msg || "注册失败"
        };
      } catch (error: any) {
        console.error("用户注册失败:", error);
        
        // 处理不同类型的错误
        const errorMessage = error.response?.data?.msg || "注册失败，请稍后重试";
        
        return {
          success: false,
          message: errorMessage
        };
      }
    },

    // 设置认证信息
    setAuth(token: string, refreshToken: string, user: User, expiresIn?: number): void {
      // 使用token管理器安全存储token
      tokenManager.setTokens(token, refreshToken, expiresIn);
      
      this.token = token;
      this.refreshToken = refreshToken || "";
      this.user = user;
      this.isAuthenticated = true;

      // 存储用户信息
      localStorage.setItem(STORAGE_KEYS.USER_ID, user.username);
      localStorage.setItem(STORAGE_KEYS.USERNAME, user.username);

      console.log("🔐 认证信息已安全保存:", {
        token: token.substring(0, 20) + "...",
        username: user.username,
        expiresIn: expiresIn ? `${expiresIn}秒` : '未知'
      });

      // 启动自动刷新定时器
      tokenManager.startAutoRefreshTimer();
    },

    // 检查认证状态
    async checkAuth(): Promise<boolean> {
      try {
        // 使用token管理器检查token有效性
        if (!tokenManager.hasValidToken()) {
          console.log('🔍 Token无效或不存在')
          this.clearAuth();
          return false;
        }

        // 检查token是否过期
        if (tokenManager.isTokenExpired()) {
          console.log('🔍 Token已过期，尝试刷新')
          try {
            await tokenManager.refreshToken();
            // 刷新成功，更新状态
            this.token = tokenManager.getAccessToken();
            this.refreshToken = tokenManager.getRefreshToken();
          } catch (error) {
            console.error('🔄 Token刷新失败:', error);
            this.clearAuth();
            return false;
          }
        }

        // 如果有token但没有用户信息，尝试获取用户信息
        if (this.token && !this.user) {
          try {
            const response = await userAPI.getCurrentUser();
            if (response.code === 1 && response.data) {
              this.user = {
                username: response.data.user.username,
                email: response.data.user.email,
                token: this.token,
                twoFactorEnabled: false
              };
            }
          } catch (error) {
            console.error('🔍 获取用户信息失败:', error);
            this.clearAuth();
            return false;
          }
        }

        if (this.token && this.user) {
          this.isAuthenticated = true;
          return true;
        }

        return false;
      } catch (error: any) {
        console.error('🔍 认证状态检查失败:', error);
        this.clearAuth();
        return false;
      }
    },

    // 设置tokens
    setTokens(token: string, refreshToken: string): void {
      // this.token = token
      // this.refreshToken = refreshToken
      // localStorage.setItem('token', token)
      // localStorage.setItem('refreshToken', refreshToken)
    },

    // 清除认证信息
    clearAuth(): void {
      // 使用token管理器安全清除所有token
      tokenManager.clearTokens();
      
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.isAuthenticated = false;

      console.log('🧹 认证信息已清除');
    },

    // 处理登录错误
    handleLoginError(error: any): void {
      // const errorData = error.response?.data
      // if (errorData?.code === 'ACCOUNT_LOCKED') {
      //   this.isLocked = true
      //   this.lockoutEndTime = Date.now() + (errorData.lockoutTimeRemaining * 1000)
      //   // 开始倒计时
      //   this.startLockoutTimer()
      // } else if (errorData?.failedAttempts) {
      //   this.loginAttempts = errorData.failedAttempts
      // }
    },

    // 重置登录尝试次数
    resetLoginAttempts(): void {
      // this.loginAttempts = 0
      // this.isLocked = false
      // this.lockoutEndTime = null
    },

    // 开始锁定倒计时
    startLockoutTimer(): void {
      // const timer = setInterval(() => {
      //   if (this.remainingLockoutTime <= 0) {
      //     this.isLocked = false
      //     this.lockoutEndTime = null
      //     this.resetLoginAttempts()
      //     clearInterval(timer)
      //   }
      // }, 1000)
    },

    // 修改密码
    async changePassword(
      currentPassword: string,
      newPassword: string
    ): Promise<any> {
      // try {
      //   const response = await authAPI.changePassword({
      //     currentPassword,
      //     newPassword
      //   })
      //   return response.data
      // } catch (error) {
      //   throw error
      // }
    },
  },
});
