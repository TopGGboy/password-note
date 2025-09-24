<template>
  <div id="app">
    <!-- 根据路由决定是否使用布局 -->
    <AppLayout v-if="shouldUseLayout">
      <router-view />
    </AppLayout>
    <router-view v-else />

    <!-- 开发环境安全状态监控 -->
    <SecurityStatus />

    <!-- 主密码模态框 -->
    <MasterPasswordModal v-if="showMasterPasswordModal" :is-setup="!hasMasterPassword"
      @success="handleMasterPasswordSuccess" @close="handleMasterPasswordClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/common/AppLayout.vue'
import SecurityStatus from './components/security/SecurityStatus.vue'
import MasterPasswordModal from './components/modals/MasterPasswordModal.vue'
import { KeyManager } from './utils/encryption/crypto'

const route = useRoute()
const showMasterPasswordModal = ref(false)
const hasMasterPassword = ref(false)

// 需要主密码的路由
const protectedRoutes = ['/passwords', '/password-detail']

// 不需要布局的路由（登录、注册等）
const noLayoutRoutes = ['/login', '/register', '/reset-password']

// 计算是否应该使用布局
const shouldUseLayout = computed(() => {
  return !noLayoutRoutes.includes(route.path)
})

// 检查是否需要主密码
const checkMasterPasswordRequired = () => {
  const currentPath = route.path    // 获取当前路径
  const isProtectedRoute = protectedRoutes.some(path =>
    currentPath.startsWith(path)      // 检查是否是受保护路由
  )

  console.log('=== 主密码检查 ===')
  console.log('当前路径:', currentPath)
  console.log('是否受保护路由:', isProtectedRoute)
  console.log('是否有会话密钥:', KeyManager.hasKey())
  console.log('是否有主密码设置:', KeyManager.hasMasterPassword())

  if (isProtectedRoute && !KeyManager.hasKey()) {
    console.log('需要显示主密码模态框')
    showMasterPasswordModal.value = true     // 显示主密码模态框
  }
}

// 处理主密码设置/验证成功
const handleMasterPasswordSuccess = () => {
  showMasterPasswordModal.value = false
  hasMasterPassword.value = true
  console.log('主密码验证成功')
  
  // 验证密钥是否正确设置
  console.log('验证后是否有密钥:', KeyManager.hasKey())
  
  // 触发页面刷新以重新加载数据
  window.location.reload()
}

// 处理主密码模态框关闭
const handleMasterPasswordClose = () => {
  // 如果用户关闭了主密码模态框但没有设置密码，跳转到首页
  if (!KeyManager.hasKey()) {
    window.location.href = '/'
  }
  showMasterPasswordModal.value = false
}

// 监听路由变化
watch(() => route.path, () => {
  checkMasterPasswordRequired()
})

onMounted(() => {
  // 检查是否已有主密码设置（持久化检查）
  hasMasterPassword.value = KeyManager.hasMasterPassword()

  // 检查当前路由是否需要主密码
  checkMasterPasswordRequired()

  // 监听需要主密码的自定义事件
  window.addEventListener('requireMasterPassword', (event: any) => {
    console.log('收到需要主密码的事件:', event.detail)
    showMasterPasswordModal.value = true
  })
})
</script>

<style>
@import './styles/theme.css';

#app {
  min-height: 100vh;
}
</style>