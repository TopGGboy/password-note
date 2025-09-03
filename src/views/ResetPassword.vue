<template>
  <div class="reset-container">
    <div class="reset-card">
      <h2>重置密码</h2>
      <p>密码重置功能开发中...</p>
      <router-link to="/login" class="back-link">返回登录</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ResetPassword'
})
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reset-card {
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