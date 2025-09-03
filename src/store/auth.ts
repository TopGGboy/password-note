import { defineStore } from 'pinia'
import { authAPI, emailAPI } from '../services/api'
import { LoginResponse } from 'src/types/api'
import { ApiResponse } from 'src/types/api'

interface User {
  username: string
  email?: string
  token: string
  twoFactorEnabled?: boolean
}

interface LoginCredentials {
  username: string
  password: string
  captcha: string
  sessionId: string
}


interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loginAttempts: number
  isLocked: boolean
  lockoutEndTime: number | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    loginAttempts: 0,
    isLocked: false,
    lockoutEndTime: null
  }),
  
  getters: {
    isLoggedIn: (state): boolean => !!state.token && !!state.user,
    userInfo: (state): User | null => state.user,
    remainingLockoutTime: (state): number => {
      if (!state.lockoutEndTime) return 0
      const remaining = state.lockoutEndTime - Date.now()
      return Math.max(0, Math.ceil(remaining / 1000))
    }
  },
  
  actions: {
    // 登出
    async logout(): Promise<void> {
      try {
        // 调用后端登出接口
        await authAPI.logout()
      } catch (error) {
        console.error('登出请求失败:', error)
      } finally {
        this.clearAuth()
      }
    },
    // 登录
    async login(credentials: LoginCredentials): Promise<{ success: boolean; twoFactorEnabled?: boolean; data?: any }> {
      try {
        const response: ApiResponse<LoginResponse> = await authAPI.login(credentials);     
        console.log('响应数据:', response)
        console.log('登录码:', response.code)
        // 输出：登录码: undefined

        // 检查响应是否成功
        if (response.code === 1) {
          const { username, email, token, twoFactorEnabled } = response.data
          
          // 如果需要2FA验证，不保存认证信息，返回需要验证的状态
          if (twoFactorEnabled) {
            return { 
              success: true, 
              twoFactorEnabled: true, 
              data: { username, email } 
            }
          }
          
          // 如果不需要2FA验证，直接保存认证信息
          const user: User = {
            username,
            email,
            token,
            twoFactorEnabled: false
          }
          console.log('用户信息:', user)
          
          // 保存认证信息
          this.setAuth(token, '', user)
          
          return { success: true }
        }
        
        return { success: false }
      } catch (error) {
        this.handleLoginError(error)
        throw error
      }
    },

    // 发送2FA验证码
    async send2FACode(email: string): Promise<{ success: boolean }> {
      try {
        const response = await emailAPI.send2FACode({ email })
      
        if (response.code === 1) {
          return { success: true }
        }
        
        return { success: false }
      } catch (error) {
        console.error('发送2FA验证码失败:', error)
        throw error
      }
    },
    
    // 双因素认证验证
    async verify2FA(email: string, emailCode: string): Promise<{ success: boolean; data?: any }> {
      try {
        const response = await emailAPI.validate2FACode({
          email,
          emailCode
        })
        
        if (response.code === 1 && response.data) {
          const { username, token, twoFactorEnabled, email } = response.data
          
          // 设置认证信息
          this.setAuth(token, '', { username, token, twoFactorEnabled, email })
          this.resetLoginAttempts()
          
          return { 
            success: true, 
            data: { username, token, twoFactorEnabled }
          }
        }
        
        return { success: false }
      } catch (error) {
        console.error('2FA验证失败:', error)
        throw error
      }
    },


    // 设置认证信息
    setAuth(token: string, refreshToken: string, user: User): void {
      this.token = token
      this.refreshToken = refreshToken || ''
      this.user = user
      this.isAuthenticated = true  // 登录成功
      
      // 使用正确的存储键，与路由守卫保持一致
      localStorage.setItem('accessToken', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      localStorage.setItem('userId', user.username) // 使用username作为USER_ID
      localStorage.setItem('username', user.username)
      
      console.log('认证信息已保存:', {
        token: token.substring(0, 20) + '...',
        username: user.username
      })
    },
    

    

    
    // 检查认证状态
    async checkAuth(): Promise<boolean> {
      if (!this.token) {
        return false
      }
      
      // 由于API文档中没有获取当前用户信息的接口
      // 这里简单检查token是否存在，实际项目中需要根据后端接口调整
      try {
        if (this.token && this.user) {
          this.isAuthenticated = true
          return true
        }
        return false
      } catch (error: any) {
        this.clearAuth()
        return false
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
      this.token = null
      this.refreshToken = null
      this.user = null
      this.isAuthenticated = false
      
      // 清除所有相关的存储项
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
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
    async changePassword(currentPassword: string, newPassword: string): Promise<any> {
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
    
  }
})