<template>
  <div class="password-entry-detail">
    <div class="detail-header">
      <div class="entry-icon">{{ entry.icon || '🔐' }}</div>
      <div class="entry-info">
        <h2 class="entry-title">{{ entry.title }}</h2>
        <p v-if="entry.url" class="entry-url">
          <a :href="entry.url" target="_blank">{{ entry.url }}</a>
        </p>
      </div>
      <div class="header-actions">
        <button 
          @click="handleToggleFavorite"
          class="favorite-btn"
          :class="{ active: entry.favorite }"
        >
          {{ entry.favorite ? '⭐' : '☆' }}
        </button>
        <button @click="$emit('edit')" class="edit-btn">
          ✏️ 编辑
        </button>
        <button @click="$emit('close')" class="close-btn">
          ✕
        </button>
      </div>
    </div>

    <div class="detail-content">
      <!-- 登录信息 -->
      <div class="info-section">
        <h3>登录信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>用户名/邮箱</label>
            <div class="value-with-copy">
              <span class="value">{{ entry.username }}</span>
              <button @click="copyToClipboard(entry.username)" class="copy-btn">
                📋
              </button>
            </div>
          </div>
          
          <div class="info-item">
            <label>密码</label>
            <div class="value-with-copy">
              <span class="value password-value" :class="{ hidden: !showPassword }">
                {{ showPassword ? entry.password : '••••••••' }}
              </span>
              <button @click="showPassword = !showPassword" class="toggle-btn">
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
              <button @click="copyPassword" class="copy-btn">
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 附加信息 -->
      <div v-if="entry.notes" class="info-section">
        <h3>备注</h3>
        <div class="notes-content">
          {{ entry.notes }}
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="entry.tags && entry.tags.length > 0" class="info-section">
        <h3>标签</h3>
        <div class="tags-list">
          <span v-for="tag in entry.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 使用统计 -->
      <div class="info-section">
        <h3>使用统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">使用次数</span>
            <span class="stat-value">{{ entry.timesUsed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最后使用</span>
            <span class="stat-value">
              {{ entry.lastUsed ? formatDate(entry.lastUsed) : '从未使用' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">创建时间</span>
            <span class="stat-value">{{ formatDate(entry.createdAt) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">更新时间</span>
            <span class="stat-value">{{ formatDate(entry.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 密码强度 -->
      <div v-if="entry.strengthScore" class="info-section">
        <h3>密码强度</h3>
        <div class="strength-indicator">
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="strengthLevel"
              :style="{ width: entry.strengthScore + '%' }"
            ></div>
          </div>
          <span class="strength-text">{{ strengthText }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="detail-actions">
      <button @click="copyPassword" class="action-btn primary">
        📋 复制密码
      </button>
      <button v-if="entry.url" @click="openUrl" class="action-btn">
        🌐 打开网站
      </button>
      <button @click="$emit('edit')" class="action-btn">
        ✏️ 编辑
      </button>
      <button @click="handleDelete" class="action-btn danger">
        🗑️ 删除
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'

export default defineComponent({
  name: 'PasswordEntryDetail',
  props: {
    entry: {
      type: Object as PropType<DecryptedPasswordEntry>,
      required: true
    }
  },
  emits: ['close', 'edit', 'delete', 'toggle-favorite', 'record-usage'],
  setup(props, { emit }) {
    const showPassword = ref(false)

    // 密码强度计算
    const strengthLevel = computed(() => {
      const score = props.entry.strengthScore || 0
      if (score < 30) return 'weak'
      if (score < 60) return 'medium'
      if (score < 80) return 'strong'
      return 'very-strong'
    })

    const strengthText = computed(() => {
      const score = props.entry.strengthScore || 0
      if (score < 30) return '弱'
      if (score < 60) return '中等'
      if (score < 80) return '强'
      return '非常强'
    })

    // 复制到剪贴板
    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        showToast('已复制到剪贴板')
      } catch (err) {
        console.error('复制失败:', err)
        showToast('复制失败', 'error')
      }
    }

    // 复制密码
    const copyPassword = async () => {
      await copyToClipboard(props.entry.password)
      // 触发使用记录
      emit('record-usage')
    }

    // 打开网址
    const openUrl = () => {
      if (props.entry.url) {
        window.open(props.entry.url, '_blank')
        // 触发使用记录
        emit('record-usage')
      }
    }

    // 切换收藏状态
    const handleToggleFavorite = () => {
      emit('toggle-favorite')
    }

    // 删除条目
    const handleDelete = () => {
      if (confirm(`确定要删除密码条目"${props.entry.title}"吗？此操作不可撤销。`)) {
        emit('delete')
      }
    }

    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 显示提示消息
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      // 这里可以集成一个 toast 组件
      console.log(`[${type.toUpperCase()}] ${message}`)
    }

    return {
      showPassword,
      strengthLevel,
      strengthText,
      copyToClipboard,
      copyPassword,
      openUrl,
      handleToggleFavorite,
      handleDelete,
      formatDate
    }
  }
})
</script>

<style scoped>
.password-entry-detail {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.entry-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.entry-info {
  flex: 1;
  min-width: 0;
}

.entry-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-url {
  margin: 0;
  opacity: 0.9;
}

.entry-url a {
  color: white;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.entry-url a:hover {
  text-decoration: underline;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.header-actions button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-actions button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.favorite-btn.active {
  background: #ffd700;
  color: #333;
}

.detail-content {
  padding: 24px;
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.info-grid {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.value-with-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.value {
  flex: 1;
  font-size: 16px;
  color: #1a202c;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-value.hidden {
  font-family: monospace;
  letter-spacing: 2px;
}

.copy-btn,
.toggle-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.copy-btn:hover,
.toggle-btn:hover {
  background: #edf2f7;
}

.notes-content {
  padding: 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #4a5568;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #ebf8ff;
  color: #3182ce;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  color: #1a202c;
  font-weight: 600;
}

.strength-indicator {
  display: flex;
  align-items: center;
  gap: 16px;
}

.strength-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-fill.weak {
  background: #f56565;
}

.strength-fill.medium {
  background: #ed8936;
}

.strength-fill.strong {
  background: #48bb78;
}

.strength-fill.very-strong {
  background: #38a169;
}

.strength-text {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  white-space: nowrap;
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn:hover {
  border-color: #cbd5e0;
  background: #edf2f7;
}

.action-btn.primary {
  background: #3182ce;
  color: white;
  border-color: #3182ce;
}

.action-btn.primary:hover {
  background: #2c5282;
  border-color: #2c5282;
}

.action-btn.danger {
  color: #e53e3e;
  border-color: #fed7d7;
}

.action-btn.danger:hover {
  background: #fed7d7;
  border-color: #feb2b2;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .entry-icon {
    font-size: 40px;
    align-self: center;
  }

  .entry-title {
    font-size: 20px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-actions {
    flex-direction: column;
  }

  .action-btn {
    min-width: auto;
  }

  .strength-indicator {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .strength-text {
    text-align: center;
  }
}
</style>