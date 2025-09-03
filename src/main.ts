import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import http from './utils/http'

const app = createApp(App)
const pinia = createPinia()

// 全局配置
app.config.globalProperties.$http = http

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')
