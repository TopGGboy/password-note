<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { pinManager } from './utils/auth/pinManager'

const route = useRoute()

onMounted(() => {
  console.log('应用已启动')
})

onUnmounted(() => {
})
</script>

<style>
@import './styles/theme.css';

#app {
  min-height: 100vh;
}
</style>
