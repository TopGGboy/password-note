import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ROUTES } from '../constants/constants'
import { authManager } from '../utils/auth/authManager'

const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTES.HOME,
    name: 'Home',
    component: () => import('../views/dashboard/Home.vue'),
    meta: {
      requiresAuth: true,
      title: '主页 - 密码笔记',
      description: '密码管理主页面'
    }
  },
  {
    path: ROUTES.LOGIN,
    name: 'Login',
    component: () => import("../views/auth/Login.vue"),
    meta: {
      requiresAuth: false,
      title: '登录 - 密码笔记',
      description: '用户登录页面，支持验证码验证'
    }
  },
  {
    path: ROUTES.REGISTER,
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: {
      requiresAuth: false,
      title: '注册 - 密码笔记',
      description: '用户注册页面'
    }
  },
  {
    path: ROUTES.DASHBOARD,
    name: 'Dashboard',
    component: () => import('../views/dashboard/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '控制台 - 密码笔记',
      description: '用户主控制台，管理密码笔记'
    }
  },
  {
    path: '/passwords',
    name: 'Passwords',
    component: () => import('../views/password/Passwords.vue'),
    meta: {
      requiresAuth: true,
      title: '密码管理 - 密码笔记',
      description: '管理所有密码记录'
    }
  },
  {
    path: '/passwords/:id',
    name: 'PasswordDetail',
    component: () => import('../views/password/PasswordDetail.vue'),
    meta: {
      requiresAuth: true,
      title: '密码详情 - 密码笔记',
      description: '查看密码详细信息'
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/password/Categories.vue'),
    meta: {
      requiresAuth: true,
      title: '分类管理 - 密码笔记',
      description: '管理密码分类'
    }
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('../views/security/Security.vue'),
    meta: {
      requiresAuth: true,
      title: '安全中心 - 密码笔记',
      description: '安全检查和设置'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/dashboard/Settings.vue'),
    meta: {
      requiresAuth: true,
      title: '设置 - 密码笔记',
      description: '应用设置和偏好'
    }
  },
  {
    path: ROUTES.RESET_PASSWORD,
    name: 'ResetPassword',
    component: () => import('../views/auth/ResetPassword.vue'),
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
  
  // 设置页面标题
  document.title = (to.meta?.title as string) || '密码笔记'
  
  // 监听认证状态变化事件
  const handleAuthStateChange = () => {
    // 重新检查认证状态
    authManager['isInitialized'] = false;
  };
  
  window.addEventListener('auth-state-changed', handleAuthStateChange);
  
  // 确保认证管理器已初始化
  if (!authManager['isInitialized']) {
    try {
      await authManager.initialize()
    } catch (error) {
      console.error('❌ 认证管理器初始化失败:', error)
    }
  }
  
  // 检查路由访问权限
  const canAccess = authManager.canAccessRoute(to)
  const isAuthenticated = authManager.isAuthenticated()
  
  console.log('🔍 路由权限检查:', {
    canAccess,
    isAuthenticated,
    targetPath: to.path,
    authSummary: authManager.getAuthSummary()
  })
  
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  
  if (requiresAuth) {
    // 需要认证的路由
    if (!canAccess) {
      console.log('🚫 访问被拒绝，跳转登录页')
      next(ROUTES.LOGIN)
      return
    }
  } else {
    // 不需要认证的路由
    if (isAuthenticated && (to.path === ROUTES.LOGIN || to.path === ROUTES.REGISTER)) {
      console.log('🔄 已登录用户访问登录/注册页，跳转主页')
      next(ROUTES.HOME)
      return
    }
  }
  
  // 允许访问
  next()
})

// 路由后置守卫 - 用于处理页面加载完成后的逻辑
router.afterEach((to) => {
  // 可以在这里添加页面访问统计、埋点等逻辑
  console.log(`导航到: ${to.path}`)
})

export default router
