import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import { ROUTES, STORAGE_KEYS } from '../utils/constants'
import { tokenManager } from '../utils/tokenManager'

const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTES.HOME,
    redirect: ROUTES.LOGIN
  },
  {
    path: ROUTES.LOGIN,
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: '登录 - 密码笔记',
      description: '用户登录页面，支持验证码验证'
    }
  },
  {
    path: ROUTES.REGISTER,
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      requiresAuth: false,
      title: '注册 - 密码笔记',
      description: '用户注册页面'
    }
  },
  {
    path: ROUTES.DASHBOARD,
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '控制台 - 密码笔记',
      description: '用户主控制台，管理密码笔记'
    }
  },
  {
    path: ROUTES.RESET_PASSWORD,
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue'),
    meta: {
      requiresAuth: false,
      title: '重置密码 - 密码笔记',
      description: '密码重置页面'
    }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: ROUTES.LOGIN,
    meta: {
      requiresAuth: false,
      title: '页面未找到 - 密码笔记'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('🛡️ 路由守卫执行:', {
    from: from.path,
    to: to.path,
    requiresAuth: to.matched.some(record => record.meta?.requiresAuth)
  })
  
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  
  // 设置页面标题
  document.title = (to.meta?.title as string) || '密码笔记'
  
  // 使用token管理器进行安全的认证检查
  const hasValidToken = tokenManager.hasValidToken()
  const isTokenExpired = tokenManager.isTokenExpired()
  
  console.log('🔍 安全认证检查:', {
    hasValidToken,
    isTokenExpired,
    requiresAuth,
    targetPath: to.path
  })
  
  if (requiresAuth) {
    // 需要认证的路由
    if (!hasValidToken) {
      console.log('🚫 无有效token，跳转登录页')
      tokenManager.clearTokens()
      next(ROUTES.LOGIN)
      return
    }
    
    if (isTokenExpired) {
      console.log('⏰ Token已过期，尝试刷新')
      try {
        await tokenManager.refreshToken()
        console.log('✅ Token刷新成功，继续访问')
        next()
      } catch (error) {
        console.error('❌ Token刷新失败，跳转登录页:', error)
        tokenManager.clearTokens()
        next(ROUTES.LOGIN)
      }
      return
    }
    
    // Token有效，允许访问
    next()
  } else {
    // 不需要认证的路由
    if (hasValidToken && !isTokenExpired && (to.path === ROUTES.LOGIN || to.path === ROUTES.REGISTER)) {
      console.log('🔄 已登录用户访问登录/注册页，跳转控制台')
      next(ROUTES.DASHBOARD)
      return
    }
    
    // 正常访问
    next()
  }
})

// 路由后置守卫 - 用于处理页面加载完成后的逻辑
router.afterEach((to) => {
  // 可以在这里添加页面访问统计、埋点等逻辑
  console.log(`导航到: ${to.path}`)
})

export default router
