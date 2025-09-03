import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import { ROUTES, STORAGE_KEYS } from '../utils/constants'

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
  console.log('🛡️ 路由守卫自动执行:', {
    from: from.path,
    to: to.path,
    requiresAuth: to.matched.some(record => record.meta?.requiresAuth)
  })
  
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  
  console.log('🔍 认证状态检查:', {
    token: token ? token.substring(0, 20) + '...' : null,
    userId,
    storageKeys: {
      ACCESS_TOKEN: STORAGE_KEYS.ACCESS_TOKEN,
      USER_ID: STORAGE_KEYS.USER_ID
    }
  })
  
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  
  // 设置页面标题
  document.title = (to.meta?.title as string) || '密码笔记'
  
  // 验证token有效性（简单检查）
  const isValidToken = token && userId && token.length > 0
  
  if (requiresAuth && !isValidToken) {
    // 情况1: 需要登录但未登录 → 跳转登录页
    // 需要登录但未登录或token无效，清除本地存储并跳转到登录页
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_ID)
    localStorage.removeItem(STORAGE_KEYS.USERNAME)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    next(ROUTES.LOGIN)
  } else if (!requiresAuth && isValidToken && (to.path === ROUTES.LOGIN || to.path === ROUTES.REGISTER)) {
    // 已登录用户访问登录或注册页，跳转到控制台
    // 情况2: 已登录访问登录页 → 跳转主页
    next(ROUTES.DASHBOARD)
  } else {
    // 情况3: 正常访问
    next()
  }
})

// 路由后置守卫 - 用于处理页面加载完成后的逻辑
router.afterEach((to) => {
  // 可以在这里添加页面访问统计、埋点等逻辑
  console.log(`导航到: ${to.path}`)
})

export default router
