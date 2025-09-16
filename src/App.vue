<template>
  <div id="app">
    <router-view />
    
    <!-- 开发环境安全状态监控 -->
    <SecurityStatus />
    
    <!-- 主密码模态框 -->
    <MasterPasswordModal
      v-if="showMasterPasswordModal"
      :is-setup="!hasMasterPassword"
      @success="handleMasterPasswordSuccess"
      @close="handleMasterPasswordClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SecurityStatus from './components/SecurityStatus.vue'
import MasterPasswordModal from './components/MasterPasswordModal.vue'
import { KeyManager } from './utils/crypto'

const route = useRoute()
const showMasterPasswordModal = ref(false)
const hasMasterPassword = ref(false)

// 需要主密码的路由
const protectedRoutes = ['/passwords', '/password-detail']

// 检查是否需要主密码
const checkMasterPasswordRequired = () => {
  const currentPath = route.path
  const isProtectedRoute = protectedRoutes.some(path => 
    currentPath.startsWith(path)
  )
  
  if (isProtectedRoute && !KeyManager.hasKey()) {
    showMasterPasswordModal.value = true
  }
}

// 处理主密码设置/验证成功
const handleMasterPasswordSuccess = () => {
  showMasterPasswordModal.value = false
  hasMasterPassword.value = true
  console.log('主密码验证成功')
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
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>