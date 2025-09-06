<template>
  <div id="app">
    <router-view />
    
    <!-- 开发环境安全状态监控 -->
    <SecurityStatus />
  </div>
</template>

<script>
import SecurityStatus from './components/SecurityStatus.vue'

export default {
  name: 'App',
  components: {
    SecurityStatus
  }
}
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