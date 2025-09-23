<template>
  <div class="passwords-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">密码管理</h1>
        <p class="page-subtitle">安全管理您的所有账号密码</p>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="add-btn">
          <span class="btn-icon">➕</span>
          添加密码
        </button>
        <button @click="refreshEntries" class="refresh-btn" :disabled="loading">
          <span class="btn-icon">🔄</span>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">🔐</div>
        <div class="stat-info">
          <div class="stat-number">{{ total }}</div>
          <div class="stat-label">总密码数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-number">{{ favoriteCount }}</div>
          <div class="stat-label">收藏密码</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📂</div>
        <div class="stat-info">
          <div class="stat-number">{{ categoriesCount }}</div>
          <div class="stat-label">分类数量</div>
        </div>
      </div>
    </div>

    <!-- 密码条目列表 -->
    <div class="content-section">
      <PasswordEntriesList @add-password="showAddModal = true" @view-entry="handleViewEntry"
        @edit-entry="handleEditEntry" />
    </div>

    <!-- 添加密码弹窗 -->
    <AddPasswordModal v-if="showAddModal" @close="showAddModal = false" @success="handleAddSuccess" />

    <!-- 密码详情弹窗 -->
    <PasswordEntryDetail v-if="showDetailModal && selectedEntry" :entry="selectedEntry" @close="showDetailModal = false"
      @edit="handleEditFromDetail" />

    <!-- 编辑密码弹窗 -->
    <EditPasswordModal v-if="showEditModal && selectedEntry" :entry="selectedEntry" @close="showEditModal = false"
      @success="handleEditSuccess" />

    <!-- 加载遮罩 -->
    <div v-if="loading && entries.length === 0" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button @click="clearError" class="error-close">✕</button>
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
            // 可以考虑自动跳转到登录页面
            // router.push('/login')
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
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 25px 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-btn,
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.refresh-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
}

/* 统计信息 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

/* 内容区域 */
.content-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

.error-content {
  background: #fed7d7;
  color: #c53030;
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(197, 48, 48, 0.2);
  border-left: 4px solid #c53030;
}

.error-icon {
  font-size: 18px;
}

.error-text {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  color: #c53030;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background: rgba(197, 48, 48, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .passwords-page {
    padding: 15px;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .add-btn,
  .refresh-btn {
    flex: 1;
    justify-content: center;
  }

  .page-title {
    font-size: 2rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: 20px;
  }
}
</style>