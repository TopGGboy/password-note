<template>
  <div class="password-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>密码管理</h1>
        <p>安全管理您的所有密码</p>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="add-btn">
          ➕ 添加密码
        </button>
      </div>
    </div>

    <!-- 密码条目列表 -->
    <PasswordEntriesList
      @add-password="showAddModal = true"
      @view-entry="handleViewEntry"
      @edit-entry="handleEditEntry"
    />

    <!-- 添加密码模态框 -->
    <AddPasswordModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @success="handlePasswordAdded"
      @require-master-password="handleRequireMasterPassword"
    />

    <!-- 编辑密码模态框 -->
    <EditPasswordModal
      v-if="showEditModal && editingEntry"
      :entry="editingEntry"
      @close="showEditModal = false"
      @success="handlePasswordUpdated"
      @require-master-password="handleRequireMasterPassword"
    />

    <!-- 密码详情模态框 -->
    <div v-if="showDetailModal && viewingEntry" class="modal-overlay" @click="handleCloseDetail">
      <div class="modal-content" @click.stop>
        <PasswordEntryDetail
          :entry="viewingEntry"
          @close="handleCloseDetail"
          @edit="handleEditFromDetail"
          @delete="handleDeleteEntry"
          @toggle-favorite="handleToggleFavorite"
          @record-usage="handleRecordUsage"
        />
      </div>
    </div>

    <!-- 主密码输入模态框 -->
    <MasterPasswordModal
      v-if="showMasterPasswordModal"
      @close="showMasterPasswordModal = false"
      @success="handleMasterPasswordSet"
    />

    <!-- 全局提示 -->
    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="hideToast"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import PasswordEntriesList from '../../components/password/PasswordEntriesList.vue'
import PasswordEntryDetail from '../../components/password/PasswordEntryDetail.vue'
import AddPasswordModal from '../../components/modals/AddPasswordModal.vue'
// import EditPasswordModal from '../../components/modals/EditPasswordModal.vue'
// import MasterPasswordModal from '../../components/modals/MasterPasswordModal.vue'
// import Toast from '../../components/common/Toast.vue'
import { usePasswordEntries } from '../../composables/usePasswordEntries'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'

export default defineComponent({
  name: 'PasswordManagement',
  components: {
    PasswordEntriesList,
    PasswordEntryDetail,
    AddPasswordModal,
    // EditPasswordModal,
    // MasterPasswordModal,
    // Toast
  },
  setup() {
    // 使用密码条目组合式函数
    const {
      toggleFavorite,
      recordUsage,
      deleteEntry,
      refresh
    } = usePasswordEntries()

    // 模态框状态
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showDetailModal = ref(false)
    const showMasterPasswordModal = ref(false)

    // 当前操作的条目
    const viewingEntry = ref<DecryptedPasswordEntry | null>(null)
    const editingEntry = ref<DecryptedPasswordEntry | null>(null)

    // 提示消息
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error' | 'warning' | 'info'
    })

    // 查看密码条目详情
    const handleViewEntry = (entry: DecryptedPasswordEntry) => {
      viewingEntry.value = entry
      showDetailModal.value = true
    }

    // 编辑密码条目
    const handleEditEntry = (entry: DecryptedPasswordEntry) => {
      editingEntry.value = entry
      showEditModal.value = true
    }

    // 从详情页面编辑
    const handleEditFromDetail = () => {
      if (viewingEntry.value) {
        editingEntry.value = viewingEntry.value
        showDetailModal.value = false
        showEditModal.value = true
      }
    }

    // 关闭详情模态框
    const handleCloseDetail = () => {
      showDetailModal.value = false
      viewingEntry.value = null
    }

    // 密码添加成功
    const handlePasswordAdded = (entry: any) => {
      showToast('密码添加成功', 'success')
      refresh() // 刷新列表
    }

    // 密码更新成功
    const handlePasswordUpdated = (entry: any) => {
      showToast('密码更新成功', 'success')
      refresh() // 刷新列表
      
      // 如果正在查看详情，更新详情数据
      if (viewingEntry.value && viewingEntry.value.id === entry.id) {
        viewingEntry.value = { ...viewingEntry.value, ...entry }
      }
    }

    // 删除密码条目
    const handleDeleteEntry = async () => {
      if (!viewingEntry.value) return

      try {
        await deleteEntry(viewingEntry.value.id)
        showToast('密码条目已删除', 'success')
        handleCloseDetail()
      } catch (error: any) {
        showToast(error.message || '删除失败', 'error')
      }
    }

    // 切换收藏状态
    const handleToggleFavorite = async () => {
      if (!viewingEntry.value) return

      try {
        await toggleFavorite(viewingEntry.value.id)
        viewingEntry.value.favorite = !viewingEntry.value.favorite
        showToast(
          viewingEntry.value.favorite ? '已添加到收藏' : '已取消收藏',
          'success'
        )
      } catch (error: any) {
        showToast(error.message || '操作失败', 'error')
      }
    }

    // 记录使用次数
    const handleRecordUsage = async () => {
      if (!viewingEntry.value) return

      try {
        await recordUsage(viewingEntry.value.id)
        viewingEntry.value.timesUsed += 1
        viewingEntry.value.lastUsed = new Date().toISOString()
      } catch (error) {
        console.error('记录使用次数失败:', error)
      }
    }

    // 需要主密码
    const handleRequireMasterPassword = () => {
      showMasterPasswordModal.value = true
    }

    // 主密码设置成功
    const handleMasterPasswordSet = () => {
      showToast('主密码设置成功', 'success')
      // 可以重新尝试之前的操作
    }

    // 显示提示消息
    const showToast = (message: string, type: typeof toast.value.type = 'success') => {
      toast.value = {
        show: true,
        message,
        type
      }
      
      // 3秒后自动隐藏
      setTimeout(() => {
        hideToast()
      }, 3000)
    }

    // 隐藏提示消息
    const hideToast = () => {
      toast.value.show = false
    }

    return {
      // 模态框状态
      showAddModal,
      showEditModal,
      showDetailModal,
      showMasterPasswordModal,
      
      // 当前操作的条目
      viewingEntry,
      editingEntry,
      
      // 提示消息
      toast,
      
      // 事件处理
      handleViewEntry,
      handleEditEntry,
      handleEditFromDetail,
      handleCloseDetail,
      handlePasswordAdded,
      handlePasswordUpdated,
      handleDeleteEntry,
      handleToggleFavorite,
      handleRecordUsage,
      handleRequireMasterPassword,
      handleMasterPasswordSet,
      showToast,
      hideToast
    }
  }
})
</script>

<style scoped>
.password-management {
  min-height: 100vh;
  background: #f7fafc;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 24px 0;
  margin-bottom: 24px;
}

.page-header .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.header-content p {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-btn {
  padding: 12px 24px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  background: #2c5282;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.modal-overlay {
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
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header .container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .add-btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-overlay {
    padding: 10px;
  }
}

/* 全局样式覆盖 */
:deep(.password-entries-list) {
  background: transparent;
  padding: 0 20px;
}

/* 动画效果 */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>