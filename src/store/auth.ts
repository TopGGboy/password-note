import { defineStore } from "pinia";
import { userAPI, emailAPI } from "../services/api";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "src/types/api";
import { tokenManager } from "../utils/auth/tokenManager";
import { STORAGE_KEYS } from "../constants/constants";

interface User {
  id: number;
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
  state: (): AuthState => {
    // 从存储中恢复用户信息
    const token = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

    let user: User | null = null;
    if (token && username) {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      user = {
        id: userId ? parseInt(userId, 10) : 0,
        username,
        email: localStorage.getItem("email") || undefined,
        token,
        twoFactorEnabled: false,
      };
    }

    return {
      user,
      token,
      refreshToken,
      isAuthenticated: !!(token && user && !tokenManager.isTokenExpired()),
      loginAttempts: 0,
      isLocked: false,
      lockoutEndTime: null,
    };
  },

  getters: {
    isLoggedIn: (state): boolean => {
      // 检查是否有有效的访问token和用户信息
      const hasValidToken = tokenManager.hasValidToken();
      const hasUser = !!state.user;
      const tokenNotExpired = !tokenManager.isTokenExpired();

      console.log("🔍 登录状态检查:", {
        hasValidToken,
        hasUser,
        tokenNotExpired,
        result: hasValidToken && hasUser && tokenNotExpired,
      });

      return hasValidToken && hasUser && tokenNotExpired;
    },
    userInfo: (state): User | null => state.user,
    remainingLockoutTime: (state): number => {
      if (!state.lockoutEndTime) return 0;
      const remaining = state.lockoutEndTime - Date.now();
      return Math.max(0, Math.ceil(remaining / 1000));
    },
    tokenExpirationTime: (): number | null => {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
      return expiresAt ? parseInt(expiresAt) : null;
    },
    isTokenExpiringSoon: (): boolean => tokenManager.isTokenExpiringSoon(),
  },

  actions: {
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
    ): Promise<{ success: boolean; twoFactorEnabled?: boolean; data?: any }> {
      try {
        const response: ApiResponse<LoginResponse> = await userAPI.login(
          credentials
        );
        console.log("响应数据:", response);
        console.log("登录码:", response.code);
        // 输出：登录码: undefined

        // 检查响应是否成功
        if (response.code === 1) {
          const { id, username, email, token, refreshToken, twoFactorEnabled } =
            response.data;

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
            id,
            username,
            email,
            token,
            twoFactorEnabled: false,
          };
          console.log("用户信息:", user);

          // 解析token获取过期时间
          const tokenPayload = tokenManager.parseJWTPayload(token);
          const expiresIn = tokenPayload?.exp
            ? tokenPayload.exp - Math.floor(Date.now() / 1000)
            : undefined;

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
          const { username, token, refreshToken, twoFactorEnabled, email } =
            response.data;

          // 解析token获取过期时间
          const tokenPayload = tokenManager.parseJWTPayload(token);
          const expiresIn = tokenPayload?.exp
            ? tokenPayload.exp - Math.floor(Date.now() / 1000)
            : undefined;

          // 设置认证信息，包括refreshToken
          this.setAuth(
            token,
            refreshToken || "",
            { id: 0, username, email, token, twoFactorEnabled },
            expiresIn
          );
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
    async sendRegisterEmailCode(
      email: string
    ): Promise<{ success: boolean; message?: string }> {
      try {
        const response = await emailAPI.send2FACode({ email });

        if (response.code === 1) {
          return { success: true, message: "验证码发送成功" };
        }

        return {
          success: false,
          message: response.msg || "验证码发送失败",
        };
      } catch (error: any) {
        console.error("发送注册验证码失败:", error);
        return {
          success: false,
          message: error.response?.data?.msg || "网络错误，请稍后重试",
        };
      }
    },

    // 用户注册
    async register(
      registerData: RegisterRequest
    ): Promise<{
      success: boolean;
      message?: string;
      data?: RegisterResponse;
    }> {
      try {
        const response: ApiResponse<RegisterResponse> = await userAPI.register(
          registerData
        );

        if (response.code === 1) {
          return {
            success: true,
            message: "注册成功",
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.msg || "注册失败",
        };
      } catch (error: any) {
        console.error("用户注册失败:", error);

        // 处理不同类型的错误
        const errorMessage =
          error.response?.data?.msg || "注册失败，请稍后重试";

        return {
          success: false,
          message: errorMessage,
        };
      }
    },

    // 设置认证信息
    setAuth(
      token: string,
      refreshToken: string,
      user: User,
      expiresIn?: number
    ): void {
      // 使用token管理器安全存储token
      tokenManager.setTokens(token, refreshToken, expiresIn);

      this.token = token;
      this.refreshToken = refreshToken || "";
      this.user = user;
      this.isAuthenticated = true;

      // 存储用户信息
      localStorage.setItem(STORAGE_KEYS.USER_ID, user.id.toString());
      localStorage.setItem(STORAGE_KEYS.USERNAME, user.username);
      if (user.email) {
        localStorage.setItem("email", user.email);
      }

      // 触发自定义事件，通知其他组件认证状态已更新
      window.dispatchEvent(
        new CustomEvent("auth-state-changed", {
          detail: {
            isAuthenticated: true,
            user,
          },
        })
      );
    },

    // 检查认证状态
    async checkAuth(): Promise<boolean> {
      try {
        // 使用token管理器检查token有效性
        if (!tokenManager.hasValidToken()) {
          console.log("🔍 Token无效或不存在");
          this.clearAuth();
          return false;
        }

        // 检查token是否过期
        if (tokenManager.isTokenExpired()) {
          console.log("🔍 Token已过期，尝试刷新...");

          // 尝试使用刷新token获取新的访问token
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken) {
            try {
              await tokenManager.refreshToken();
              console.log("🔄 Token刷新成功");
              // 更新store中的token
              this.token = tokenManager.getAccessToken();
            } catch (error) {
              console.log("🔄 Token刷新失败，清除认证状态");
              this.clearAuth();
              return false;
            }
          } else {
            console.log("🔍 没有刷新token，清除认证状态");
            this.clearAuth();
            return false;
          }
        }

        // 如果有token但没有用户信息，尝试从本地存储恢复或获取用户信息
        if (this.token && !this.user) {
          const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
          const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
          if (userId && username) {
            // 从本地存储恢复用户信息
            this.user = {
              id: parseInt(userId),
              username,
              email: localStorage.getItem("email") || undefined,
              token: this.token,
              twoFactorEnabled: false,
            };
            console.log("🔍 从本地存储恢复用户信息:", username);
          } else {
            // 尝试从API获取用户信息
            try {
              const response = await userAPI.getCurrentUser();
              if (response.code === 1 && response.data && response.data.user) {
                const userData = response.data.user;
                this.user = {
                  id: userData.id || 0,
                  username: userData.username,
                  email: userData.email,
                  token: this.token,
                  twoFactorEnabled: false,
                };
                // 保存到本地存储
                localStorage.setItem(
                  STORAGE_KEYS.USER_ID,
                  this.user.id.toString()
                );
                localStorage.setItem(STORAGE_KEYS.USERNAME, this.user.username);
                if (this.user.email) {
                  localStorage.setItem("email", this.user.email);
                }
                console.log("🔍 从API获取用户信息成功:", this.user.username);
              }
            } catch (error) {
              console.error("🔍 获取用户信息失败:", error);
              this.clearAuth();
              return false;
            }
          }
        }

        if (this.token && this.user) {
          this.isAuthenticated = true;
          return true;
        }

        return false;
      } catch (error: any) {
        console.error("🔍 认证状态检查失败:", error);
        this.clearAuth();
        return false;
      }
    },



    // 清除认证信息
    clearAuth(): void {
      // 使用token管理器安全清除所有token
      tokenManager.clearTokens();

      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.isAuthenticated = false;

      console.log("🧹 认证信息已清除");
    },

    // 处理登录错误
    handleLoginError(error: any): void {
      console.error("登录错误:", error);
    },

    // 重置登录尝试次数
    resetLoginAttempts(): void {
      this.loginAttempts = 0;
      this.isLocked = false;
      this.lockoutEndTime = null;
    },
  },
});
