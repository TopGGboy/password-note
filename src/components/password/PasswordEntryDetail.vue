<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="password-entry-detail" @click.stop>
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

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      v-model:visible="showDeleteConfirm"
      title="确认删除"
      :message="`确定要删除密码条目「${entry.title}」吗？`"
      details="此操作不可撤销，删除后将无法恢复该密码条目。"
      confirm-text="确认删除"
      cancel-text="取消"
      type="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import { usePasswordEntries } from '../../composables/usePasswordEntries'
import ConfirmDialog from '../common/ConfirmDialog.vue'

export default defineComponent({
  name: 'PasswordEntryDetail',
  components: {
    ConfirmDialog
  },
  props: {
    entry: {
      type: Object as PropType<DecryptedPasswordEntry>,
      required: true
    }
  },
  emits: ['close', 'edit', 'delete', 'toggle-favorite', 'record-usage'],
  setup(props, { emit }) {
    const showPassword = ref(false)
    const showDeleteConfirm = ref(false)
    const deleteLoading = ref(false)
    const { deleteEntry } = usePasswordEntries()

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
      showDeleteConfirm.value = true
    }

    // 确认删除
    const confirmDelete = async () => {
      try {
        deleteLoading.value = true
        await deleteEntry(props.entry.id)
        showToast('密码条目已删除', 'success')
        emit('delete')
        emit('close')
      } catch (error: any) {
        console.error('删除失败:', error)
        showToast(error.message || '删除失败', 'error')
      } finally {
        deleteLoading.value = false
        showDeleteConfirm.value = false
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
      showDeleteConfirm,
      deleteLoading,
      strengthLevel,
      strengthText,
      copyToClipboard,
      copyPassword,
      openUrl,
      handleToggleFavorite,
      handleDelete,
      confirmDelete,
      formatDate
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding: 80px 20px 20px;
  animation: fadeIn 0.3s ease-out;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.password-entry-detail {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}

.password-entry-detail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-border);
  animation: gradientShift 3s ease infinite;
  background-size: 200% 100%;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  position: relative;
  overflow: hidden;
}

.detail-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.detail-header:hover::before {
  left: 100%;
}

.entry-icon {
  font-size: 52px;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.entry-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-lg);
  background: rgba(255, 255, 255, 0.3);
}

.entry-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.entry-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.entry-url {
  margin: 0;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.entry-url a {
  color: white;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  transition: all 0.3s ease;
  font-weight: 500;
}

.entry-url a:hover {
  text-decoration: underline;
  transform: translateX(5px);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.header-actions button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(4px);
}

.header-actions button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.favorite-btn.active {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  box-shadow: var(--shadow-md);
}

.info-section {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.info-section:hover {
  box-shadow: var(--shadow-md);
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 14px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-section h3::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, var(--primary-500), var(--secondary-700));
  border-radius: 2px;
}

.info-grid {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value-with-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  min-height: 48px;
}

.value-with-copy:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-md);
}

.value {
  flex: 1;
  font-size: 16px;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  line-height: 1.4;
  display: flex;
  align-items: center;
}

.password-value.hidden {
  font-family: monospace;
  letter-spacing: 2px;
}

.copy-btn,
.toggle-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  align-self: center;
}

.copy-btn:hover,
.toggle-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.notes-content {
  padding: 18px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-primary);
  font-size: 15px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.notes-content:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-md);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.tag:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.stat-item:hover {
  border-color: var(--primary-300);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.stat-value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.strength-indicator {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.strength-bar {
  flex: 1;
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: var(--shadow-inset);
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.strength-fill.weak {
  background: linear-gradient(90deg, var(--error-500), var(--error-700));
}

.strength-fill.medium {
  background: linear-gradient(90deg, var(--warning-500), var(--warning-700));
}

.strength-fill.strong {
  background: linear-gradient(90deg, var(--success-500), var(--success-700));
}

.strength-fill.very-strong {
  background: linear-gradient(90deg, var(--primary-500), var(--primary-700));
}

.strength-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.action-btn {
  flex: 1;
  min-width: 120px;
  padding: 14px 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  border-color: var(--primary-300);
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border-color: var(--primary-500);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border-color: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-btn.danger {
  color: var(--error-700);
  border-color: var(--error-200);
  background: var(--error-50);
}

.action-btn.danger:hover {
  background: linear-gradient(135deg, var(--error-500), var(--error-600));
  border-color: var(--error-400);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
    align-items: flex-start;
  }

  .password-entry-detail {
    max-height: calc(100vh - 24px);
    margin: 12px auto;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .entry-icon {
    font-size: 44px;
    width: 56px;
    height: 56px;
    align-self: center;
  }

  .entry-title {
    font-size: 22px;
    text-align: center;
  }

  .entry-url {
    text-align: center;
  }

  .detail-content {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-item {
    padding: 12px;
  }

  .detail-actions {
    flex-direction: column;
    padding: 16px;
    gap: 10px;
  }

  .action-btn {
    min-width: auto;
    width: 100%;
    padding: 12px 16px;
  }

  .strength-indicator {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .strength-text {
    text-align: center;
  }

  .info-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .info-section h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .value-with-copy {
    padding: 10px 12px;
  }

  .value {
    font-size: 14px;
  }

  .copy-btn,
  .toggle-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .entry-icon {
    font-size: 40px;
    width: 52px;
    height: 52px;
  }

  .entry-title {
    font-size: 20px;
  }

  .header-actions {
    gap: 6px;
  }

  .header-actions button {
    width: 38px;
    height: 38px;
  }
}
</style>