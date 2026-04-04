<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log('应用已启动')
})
</script>

<style>
@import './styles/theme.css';

#app {
  min-height: 100vh;
}
</style>
