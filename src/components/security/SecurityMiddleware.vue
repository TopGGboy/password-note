<template>
  <div v-if="isLoading" class="security-loading">
    <div class="loading-spinner"></div>
    <p>正在验证身份...</p>
  </div>
  
  <div v-else-if="isAuthenticated">
    <slot />
  </div>
  
  <div v-else class="security-error">
    <div class="error-icon">🔒</div>
    <h3>身份验证失败</h3>
    <p>{{ errorMessage }}</p>
    <button @click="redirectToLogin" class="retry-btn">重新登录</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { tokenManager } from '../../utils/auth/tokenManager'
import { SecurityUtils, SecurityEventListener, SECURITY_EVENTS } from '../../utils/auth/security'
import { ROUTES } from '../../constants/constants'

export default defineComponent({
  name: 'SecurityMiddleware',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLoading = ref(true)
    const isAuthenticated = ref(false)
    const errorMessage = ref('')
    
    let securityCheckInterval: number | null = null

    /**
     * 执行安全检查
     */
    const performSecurityCheck = async (): Promise<boolean> => {
      try {
        // 1. 检查token是否存在且有效
        if (!tokenManager.hasValidToken()) {
          errorMessage.value = 'Token无效或已过期'
          return false
        }

        // 2. 检查token格式
        const token = tokenManager.getAccessToken()
        if (token && !tokenManager.validateTokenFormat(token)) {
          errorMessage.value = 'Token格式无效'
          return false
        }

        // 3. 检查会话是否过期
        if (SecurityUtils.isSessionExpired()) {
          errorMessage.value = '会话已过期'
          SecurityEventListener.dispatchEvent(SECURITY_EVENTS.SESSION_EXPIRED)
          return false
        }

        // 4. 简单验证认证状态（不调用API）
        if (!authStore.isLoggedIn) {
          errorMessage.value = '身份验证失败'
          return false
        }


        return true
      } catch (error) {
        console.error('❌ 安全检查失败:', error)
        errorMessage.value = '安全检查异常'
        return false
      }
    }

    /**
     * 初始化安全检查
     */
    const initializeSecurityCheck = async () => {
      isLoading.value = true
      
      try {
        const result = await performSecurityCheck()
        isAuthenticated.value = result
        
        if (result) {
          // 启动定期安全检查（每5分钟，只检查token状态）
          securityCheckInterval = setInterval(() => {
            // 只检查token状态，不调用API
            if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
              isAuthenticated.value = false
              errorMessage.value = 'Token已过期'
              if (securityCheckInterval) {
                clearInterval(securityCheckInterval)
                securityCheckInterval = null
              }
            }
          }, 5 * 60 * 1000) // 5分钟
        }
      } catch (error) {
        console.error('❌ 安全检查初始化失败:', error)
        isAuthenticated.value = false
        errorMessage.value = '安全检查初始化失败'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 跳转到登录页
     */
    const redirectToLogin = () => {
      // 清除认证信息
      tokenManager.clearTokens()
      authStore.clearAuth()
      
      // 跳转到登录页
      router.push(ROUTES.LOGIN)
    }

    /**
     * 处理安全事件
     */
    const handleSecurityEvents = () => {
      // 监听token过期事件
      SecurityEventListener.addEventListener(SECURITY_EVENTS.TOKEN_EXPIRED, () => {
        isAuthenticated.value = false
        errorMessage.value = 'Token已过期'
      })

      // 监听会话过期事件
      SecurityEventListener.addEventListener(SECURITY_EVENTS.SESSION_EXPIRED, () => {
        isAuthenticated.value = false
        errorMessage.value = '会话已过期'
      })

      // 监听未授权访问事件
      SecurityEventListener.addEventListener(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, () => {
        isAuthenticated.value = false
        errorMessage.value = '未授权访问'
      })
    }

    onMounted(() => {
      handleSecurityEvents()
      initializeSecurityCheck()
    })

    onUnmounted(() => {
      if (securityCheckInterval) {
        clearInterval(securityCheckInterval)
      }
    })

    return {
      isLoading,
      isAuthenticated,
      errorMessage,
      redirectToLogin
    }
  }
})
</script>

<style scoped>
.security-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.security-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.security-error h3 {
  color: #e74c3c;
  margin-bottom: 12px;
  font-size: 24px;
}

.security-error p {
  color: #666;
  margin-bottom: 24px;
  font-size: 16px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #5a6fd8;
}

.retry-btn:active {
  transform: translateY(1px);
}
</style>