<template>
  <div class="passwords-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            密码管理
          </h1>
          <p class="page-subtitle">安全管理您的所有账号密码</p>
        </div>
        <div class="header-actions">
          <button @click="showAddModal = true" class="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            添加密码
          </button>
          <button @click="refreshEntries" class="btn-secondary" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            刷新
          </button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ total }}</div>
          <div class="stat-label">总密码数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ favoriteCount }}</div>
          <div class="stat-label">收藏密码</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ categoriesCount }}</div>
          <div class="stat-label">分类数量</div>
        </div>
      </div>
    </div>

    <!-- 密码条目列表 -->
    <div class="content-section">
      <PasswordEntriesList 
        @add-password="showAddModal = true" 
        @view-entry="handleViewEntry"
        @edit-entry="handleEditEntry" 
      />
    </div>

    <!-- 添加密码弹窗 -->
    <AddPasswordModal 
      v-if="showAddModal" 
      @close="showAddModal = false" 
      @success="handleAddSuccess" 
    />

    <!-- 密码详情弹窗 -->
    <PasswordEntryDetail 
      v-if="showDetailModal && selectedEntry" 
      :entry="selectedEntry" 
      @close="showDetailModal = false"
      @edit="handleEditFromDetail" 
    />

    <!-- 编辑密码弹窗 -->
    <EditPasswordModal 
      v-if="showEditModal && selectedEntry" 
      :entry="selectedEntry" 
      @close="showEditModal = false"
      @success="handleEditSuccess" 
    />

    <!-- 加载遮罩 -->
    <div v-if="loading && entries.length === 0" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
        <p>加载中...</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span class="error-text">{{ error }}</span>
        <button @click="clearError" class="error-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { usePasswordEntries } from '../../composables/usePasswordEntries'
import { useAuth } from '../../composables/useAuth'
import { categoriesAPI } from '../../services/api'
import PasswordEntriesList from '../../components/password/PasswordEntriesList.vue'
import PasswordEntryDetail from '../../components/password/PasswordEntryDetail.vue'
import AddPasswordModal from '../../components/modals/AddPasswordModal.vue'
import EditPasswordModal from '../../components/modals/EditPasswordModal.vue'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import type { Category } from '../../types/api'

export default defineComponent({
  name: 'Passwords',
  components: {
    PasswordEntriesList,
    PasswordEntryDetail,
    AddPasswordModal,
    EditPasswordModal,
  },
  setup() {
    // 认证状态
    const { userId, isAuthenticated, initialize } = useAuth()

    // 密码条目管理
    const {
      loading,
      error,
      entries,
      total,
      fetchEntries,
      refresh
    } = usePasswordEntries()

    // 本地状态
    const showAddModal = ref(false)
    const showDetailModal = ref(false)
    const showEditModal = ref(false)
    const selectedEntry = ref<DecryptedPasswordEntry | null>(null)
    const categories = ref<Category[]>([])

    // 计算属性
    const favoriteCount = computed(() =>
      entries.value.filter(entry => entry.favorite).length
    )

    const categoriesCount = computed(() => categories.value.length)

    // 方法
    const refreshEntries = async () => {
      try {
        await refresh()
      } catch (err) {
        console.error('刷新密码列表失败:', err)
      }
    }

    const handleViewEntry = (entry: DecryptedPasswordEntry) => {
      selectedEntry.value = entry
      showDetailModal.value = true
    }

    const handleEditEntry = (entry: DecryptedPasswordEntry) => {
      selectedEntry.value = entry
      showEditModal.value = true
    }

    const handleEditFromDetail = () => {
      showDetailModal.value = false
      showEditModal.value = true
    }

    const handleAddSuccess = () => {
      showAddModal.value = false
      refreshEntries()
    }

    const handleEditSuccess = () => {
      showEditModal.value = false
      selectedEntry.value = null
      refreshEntries()
    }

    const clearError = () => {
      error.value = null
    }

    // 加载分类数据
    const loadCategories = async () => {
      if (!userId.value || isNaN(Number(userId.value))) {
        console.warn('用户ID无效，跳过加载分类')
        return
      }

      try {
        const response = await categoriesAPI.getAll()
        if (response.code === 1 && response.data) {
          categories.value = response.data
        }
      } catch (err) {
        console.error('加载分类失败:', err)
      }
    }

    // 监听登录状态变化
    watch(isAuthenticated, (newValue) => {
      if (newValue) {
        fetchEntries()
        loadCategories()
      }
    })

    // 添加简单的 toast 函数
    const showToast = (message: string, type: string) => {
      // 使用现有的 error 状态显示错误信息
      if (type === 'error') {
        error.value = message
        // 3秒后自动清除错误信息
        setTimeout(() => {
          error.value = null
        }, 3000)
      }
    }

    // 组件挂载时初始化
    onMounted(async () => {
      // 先检查认证状态
      if (!isAuthenticated.value) {
        // 尝试初始化认证状态
        await initialize()
        // 再次检查认证状态
        if (!isAuthenticated.value) {
          console.warn('用户未认证，跳过数据加载')
          return
        }
      }

      // 等待用户ID可用
      if (!userId.value) {
        console.warn('用户ID不可用，跳过数据加载')
        return
      }

      try {
        await Promise.all([
          loadCategories(),
          fetchEntries()
        ])
      } catch (error) {
        console.error('初始化数据加载失败:', error)
        
        // 根据错误类型提供不同的处理
        let errorMessage = '数据加载失败，请刷新页面重试'
        if (error instanceof Error) {
          if (error.message.includes('解密失败') || error.message.includes('密钥')) {
            errorMessage = '数据解密失败，请重新登录以刷新密钥'
          } else if (error.message.includes('网络') || error.message.includes('请求')) {
            errorMessage = '网络连接失败，请检查网络后重试'
          }
        }
        
        showToast(errorMessage, 'error')
      }
    })

    return {
      // 数据
      loading,
      error,
      entries,
      total,
      showAddModal,
      showDetailModal,
      showEditModal,
      selectedEntry,

      // 计算属性
      favoriteCount,
      categoriesCount,

      // 方法
      refreshEntries,
      handleViewEntry,
      handleEditEntry,
      handleEditFromDetail,
      handleAddSuccess,
      handleEditSuccess,
      clearError
    }
  }
})
</script>

<style scoped>
.passwords-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  margin-bottom: var(--spacing-2xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.title-icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  stroke-width: 2;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* 统计信息 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius-xl);
  color: white;
}

.stat-icon svg {
  width: 30px;
  height: 30px;
  stroke-width: 2;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* 内容区域 */
.content-section {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  min-height: 400px;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-xl);
  text-align: center;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.spinner {
  width: 40px;
  height: 40px;
}

.spinner svg {
  width: 100%;
  height: 100%;
  color: var(--primary-color);
}

.loading-spinner p {
  margin: 0;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* 错误提示 */
.error-message {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.error-content {
  background: var(--error-bg);
  color: var(--error-color);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--error-border);
  max-width: 400px;
}

.error-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.error-close {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.error-close:hover {
  background: rgba(239, 68, 68, 0.1);
}

.error-close svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 按钮样式 */
.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary svg, .btn-secondary svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .passwords-page {
    padding: var(--spacing-lg);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .btn-primary, .btn-secondary {
    flex: 1;
    justify-content: center;
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: var(--spacing-xl);
  }

  .error-message {
    left: var(--spacing-md);
    right: var(--spacing-md);
    top: var(--spacing-md);
  }

  .error-content {
    max-width: none;
  }
}
</style>