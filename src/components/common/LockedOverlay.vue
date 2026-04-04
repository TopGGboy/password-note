<template>
  <div class="locked-overlay">
    <div class="locked-content">
      <div class="locked-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h2>密码库已锁定</h2>
      <p>请输入 PIN 码以解锁查看密码条目</p>
      <button class="unlock-btn" @click="$emit('unlock')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>
        解锁密码库
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'unlock'): void
}>()
</script>

<style scoped>
.locked-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.locked-content {
  text-align: center;
  max-width: 400px;
}

.locked-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  border-radius: 30px;
  display: grid;
  place-items: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 30px rgba(20, 184, 166, 0.2);
  border: 2px solid var(--primary-200);
}

.locked-icon svg {
  width: 48px;
  height: 48px;
  color: var(--primary-600);
  stroke-width: 1.5;
}

.locked-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 12px;
}

.locked-content p {
  font-size: 1rem;
  color: var(--gray-500);
  margin: 0 0 32px;
  line-height: 1.6;
}

.unlock-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.4);
}

.unlock-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(20, 184, 166, 0.5);
}

.unlock-btn svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}
</style>
