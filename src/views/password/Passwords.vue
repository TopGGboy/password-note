<template>
  <div class="passwords-page">
    <header class="page-header card">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <div class="title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            密码管理
          </h1>
          <p class="page-subtitle">安全管理您的所有账号密码</p>
        </div>
        <div class="header-actions">
          <button @click="showAddModal = true" class="btn btn-primary" :disabled="isLocked">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            添加密码
          </button>
          <button @click="refreshEntries" class="btn btn-secondary" :disabled="loading || isLocked">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            刷新
          </button>
        </div>
      </div>
    </header>

    <div class="stats-section">
      <div class="stat-card card">
        <div class="stat-icon teal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ isLocked ? '--' : total }}</div>
          <div class="stat-label">总密码数</div>
        </div>
        <div class="stat-decoration"></div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ isLocked ? '--' : favoriteCount }}</div>
          <div class="stat-label">收藏密码</div>
        </div>
        <div class="stat-decoration"></div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon sky">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ isLocked ? '--' : categoriesCount }}</div>
          <div class="stat-label">分类数量</div>
        </div>
        <div class="stat-decoration"></div>
      </div>
    </div>

    <div class="content-section card">
      <LockedOverlay v-if="isLocked" @unlock="showPinModal = true" />
      <PasswordEntriesList 
        v-else
        :entries="entries"
        :categories="categories"
        :loading="loading"
        @add-password="showAddModal = true" 
        @view-entry="handleViewEntry"
        @edit-entry="handleEditEntry" 
        @delete-entry="handleDeleteEntry"
        @refresh="refreshEntries"
      />
    </div>

    <PinModal
      v-if="showPinModal"
      :is-setup="false"
      @success="handlePinSuccess"
      @close="showPinModal = false"
    />

    <Transition name="modal">
      <AddPasswordModal 
        v-if="showAddModal" 
        @close="showAddModal = false" 
        @success="handleAddSuccess" 
      />
    </Transition>

    <Transition name="modal">
      <PasswordEntryDetail 
        v-if="showDetailModal && selectedEntry" 
        :entry="selectedEntry" 
        @close="showDetailModal = false"
        @edit="handleEditFromDetail"
        @delete="handleDeleteSuccess"
      />
    </Transition>

    <Transition name="modal">
        <EditPasswordModal 
          v-if="showEditModal && selectedEntry" 
          :entry="selectedEntry" 
          @close="showEditModal = false"
          @success="handleEditSuccess" 
       />
    </Transition>

    <div v-if="loading && entries.length === 0 && !isLocked" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <div class="error-content card">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span class="error-text">{{ error }}</span>
        <button @click="clearError" class="error-close btn btn-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { usePasswordEntries } from '../../composables/usePasswordEntries'
import { useAuth } from '../../composables/useAuth'
import { useNotification } from '../../composables/useNotification'
import { categoriesAPI } from '../../services/api'
import { pinManager } from '../../utils/auth/pinManager'
import PasswordEntriesList from '../../components/password/PasswordEntriesList.vue'
import PasswordEntryDetail from '../../components/password/PasswordEntryDetail.vue'
import AddPasswordModal from '../../components/modals/AddPasswordModal.vue'
import EditPasswordModal from '../../components/modals/EditPasswordModal.vue'
import LockedOverlay from '../../components/common/LockedOverlay.vue'
import PinModal from '../../components/modals/PinModal.vue'
import Notification from '../../components/common/Notification.vue'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import type { Category } from '../../types/api'

export default defineComponent({
  name: 'Passwords',
  components: {
    PasswordEntriesList,
    PasswordEntryDetail,
    AddPasswordModal,
    EditPasswordModal,
    LockedOverlay,
    PinModal,
    Notification,
  },
  setup() {
    const { userId, isAuthenticated, initialize } = useAuth()
    const { notifications, success, error: notifyError, remove: removeNotification } = useNotification()

    const {
      loading,
      error,
      entries,
      total,
      totalFavorites,
      fetchEntries,
      refresh,
      deleteEntry
    } = usePasswordEntries()

    const showAddModal = ref(false)
    const showDetailModal = ref(false)
    const showEditModal = ref(false)
    const showPinModal = ref(false)
    const selectedEntry = ref<DecryptedPasswordEntry | null>(null)
    const categories = ref<Category[]>([])

    const hasPin = ref(pinManager.hasPin())
    const isVerified = ref(pinManager.isVerified())

    const isLocked = computed(() => hasPin.value && !isVerified.value)

    const favoriteCount = computed(() => {
      if (totalFavorites.value > 0) {
        return totalFavorites.value
      }
      return entries.value.filter(entry => entry.favorite).length
    })

    const categoriesCount = computed(() => categories.value.length)

    const handlePinSuccess = () => {
      isVerified.value = true
      showPinModal.value = false
      fetchEntries()
    }

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
      success('添加成功', '密码条目已添加')
      refreshEntries()
    }

    const handleEditSuccess = () => {
      showEditModal.value = false
      selectedEntry.value = null
      success('更新成功', '密码条目已更新')
      refreshEntries()
    }

    const handleDeleteSuccess = () => {
      showDetailModal.value = false
      selectedEntry.value = null
      refreshEntries()
    }

    const handleDeleteEntry = async (entry: DecryptedPasswordEntry) => {
      try {
        await deleteEntry(entry.id)
      } catch (err) {
        console.error('删除密码条目失败:', err)
      }
    }

    const clearError = () => {
      error.value = null
    }

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

    watch(isAuthenticated, (newValue) => {
      if (newValue && !isLocked.value) {
        fetchEntries()
        loadCategories()
      }
    })

    const showToast = (message: string, type: string) => {
      if (type === 'error') {
        error.value = message
        setTimeout(() => {
          error.value = null
        }, 3000)
      }
    }

    onMounted(async () => {
      hasPin.value = pinManager.hasPin()
      isVerified.value = pinManager.isVerified()

      if (isLocked.value) {
        return
      }

      if (!isAuthenticated.value) {
        await initialize()
        if (!isAuthenticated.value) {
          console.warn('用户未认证，跳过数据加载')
          return
        }
      }

      if (!userId.value) {
        console.warn('用户ID不可用，跳过数据加载')
        return
      }

      pinManager.setCurrentUser(userId.value)
      hasPin.value = pinManager.hasPin()
      isVerified.value = pinManager.isVerified()

      try {
        await Promise.all([
          loadCategories(),
          fetchEntries()
        ])
      } catch (error) {
        console.error('初始化数据加载失败:', error)
        
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
      loading,
      error,
      entries,
      total,
      showAddModal,
      showDetailModal,
      showEditModal,
      showPinModal,
      selectedEntry,
      favoriteCount,
      categoriesCount,
      categories,
      isLocked,
      hasPin,
      isVerified,
      notifications,
      refreshEntries,
      handleViewEntry,
      handleEditEntry,
      handleEditFromDetail,
      handleAddSuccess,
      handleEditSuccess,
      handleDeleteSuccess,
      handleDeleteEntry,
      clearError,
      handlePinSuccess,
      removeNotification
    }
  }
})
</script>

<style scoped>
.passwords-page {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  border: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.title-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.35);
  transition: all var(--transition-normal);
}

.title-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.45);
}

.title-icon svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 2;
}

.page-subtitle {
  color: var(--gray-600);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  transition: all var(--transition-normal);
  border: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--gradient-primary);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(20, 184, 166, 0.15);
}

.stat-card:hover::before {
  transform: scaleY(1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-2xl);
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: all var(--transition-normal);
}

.stat-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-2xl);
  z-index: -1;
}

.stat-icon.teal {
  background: linear-gradient(135deg, rgba(240, 253, 250, 0.9), rgba(204, 251, 241, 0.9));
  color: var(--primary-700);
}

.stat-icon.teal::before {
  background: var(--gradient-primary);
}

.stat-icon.amber {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9));
  color: var(--secondary-700);
}

.stat-icon.amber::before {
  background: var(--gradient-secondary);
}

.stat-icon.sky {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.9));
  color: var(--info-700);
}

.stat-icon.sky::before {
  background: var(--gradient-info);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-icon svg {
  width: 28px;
  height: 28px;
  stroke-width: 2;
}

.stat-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-number {
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-xs);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--gray-600);
  font-weight: var(--font-medium);
}

.stat-decoration {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  background: var(--gradient-primary);
  transition: all var(--transition-normal);
}

.stat-card:hover .stat-decoration {
  transform: scale(1.5);
  opacity: 0.15;
}

.content-section {
  padding: var(--spacing-2xl);
  border: none;
  background: rgba(255, 255, 255, 0.9);
  min-height: 400px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.loading-spinner {
  background: white;
  padding: var(--spacing-3xl);
  border-radius: var(--radius-2xl);
  text-align: center;
  box-shadow: var(--shadow-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(20, 184, 166, 0.2);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  margin: 0;
  color: var(--gray-600);
  font-weight: var(--font-medium);
}

.error-message {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: var(--z-toast);
  animation: slideIn 0.3s ease;
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, var(--error-50), var(--error-100));
  color: var(--error-700);
  border: 1px solid var(--error-200);
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
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
}

.error-close {
  background: none;
  border: none;
  color: var(--error-700);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.error-close:hover {
  background: rgba(239, 68, 68, 0.1);
}

.error-close svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.btn:hover::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
}

.btn-secondary {
  background: var(--secondary-100);
  color: var(--secondary-800);
  border: 2px solid var(--secondary-200);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--secondary-200);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  padding: var(--spacing-sm);
  width: 36px;
  height: 36px;
}

.btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
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

  .btn {
    flex: 1;
    justify-content: center;
  }

  .page-title {
    font-size: var(--text-2xl);
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: var(--spacing-lg);
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
