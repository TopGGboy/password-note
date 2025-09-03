<template>
  <div class="register-container">
    <div class="register-card">
      <h2>用户注册</h2>
      <p>注册功能开发中...</p>
      <router-link to="/login" class="back-link">返回登录</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Register'
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  margin-top: 20px;
  display: inline-block;
}
</style>