import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import http from './utils/http'
import { initializeApp } from './utils/appInit'

const app = createApp(App)
const pinia = createPinia()

// 全局配置
app.config.globalProperties.$http = http

// 使用插件
app.use(pinia)
app.use(router)

// 应用安全初始化和挂载
async function startApp() {
  try {
    console.log('🚀 启动应用...')
    
    // 初始化安全机制
    await initializeApp()
    
    // 挂载应用
    app.mount('#app')
    
    console.log('✅ 应用启动成功')
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    
    // 即使初始化失败，也要挂载应用（但会处于未认证状态）
    app.mount('#app')
  }
}

// 启动应用
startApp()
