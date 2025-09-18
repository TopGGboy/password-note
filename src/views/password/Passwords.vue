<template>
  <div class="passwords-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>密码管理</h1>
          <p>管理您的所有密码记录</p>
        </div>
        <div class="header-actions">
          <button @click="showAddModal = true" class="add-btn">
            <span class="btn-icon">➕</span>
            添加密码
          </button>
          <button @click="showImportModal = true" class="import-btn">
            <span class="btn-icon">📥</span>
            导入
          </button>
          <button @click="exportPasswords" class="export-btn">
            <span class="btn-icon">📤</span>
            导出
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索密码..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-search">
          ✕
        </button>
      </div>

      <div class="filter-controls">
        <select v-model="selectedCategory" @change="applyFilters" class="category-filter">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <select v-model="sortBy" @change="applySorting" class="sort-select">
          <option value="lastUsed">最近使用</option>
          <option value="title">名称排序</option>
          <option value="createdAt">创建时间</option>
          <option value="updatedAt">更新时间</option>
        </select>

        <div class="view-toggle">
          <button
            @click="viewMode = 'grid'"
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
          >
            ⊞
          </button>
          <button
            @click="viewMode = 'list'"
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
          >
            ☰
          </button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总计:</span>
        <span class="stat-value">{{ passwordsTotal }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">弱密码:</span>
        <span class="stat-value weak">{{ weakPasswordsCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">重复密码:</span>
        <span class="stat-value duplicate">{{ duplicatePasswordsCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">即将过期:</span>
        <span class="stat-value expiring">{{ expiringPasswordsCount }}</span>
      </div>
    </div>

    <!-- 密码列表 -->
    <div class="passwords-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="passwords.length === 0" class="empty-state">
        <div class="empty-icon">🔐</div>
        <h3>{{ searchQuery ? '未找到匹配的密码' : '还没有密码记录' }}</h3>
        <p>{{ searchQuery ? '尝试使用不同的搜索词' : '点击添加按钮创建您的第一个密码记录' }}</p>
        <button v-if="!searchQuery" @click="showAddModal = true" class="empty-action-btn">
          添加密码
        </button>
      </div>

      <div v-else class="passwords-list" :class="viewMode">
        <div
          v-for="password in paginatedPasswords"
          :key="password.id"
          class="password-item"
          @click="viewPassword(password)"
        >
          <div class="password-header">
            <div class="password-info">
              <span class="password-icon">{{ password.icon }}</span>
              <div class="password-details">
                <h3 class="password-title">{{ password.title }}</h3>
                <p class="password-username">{{ password.username }}</p>
                <div class="password-meta">
                  <span class="password-category">{{ password.category }}</span>
                  <span class="password-date">{{ formatDate(password.lastUsed) }}</span>
                </div>
              </div>
            </div>

            <div class="password-actions">
              <button
                @click.stop="copyPassword(password)"
                class="action-btn copy-btn"
                title="复制密码"
              >
                📋
              </button>
              <button
                @click.stop="copyUsername(password)"
                class="action-btn copy-username-btn"
                title="复制用户名"
              >
                👤
              </button>
              <button
                @click.stop="editPassword(password)"
                class="action-btn edit-btn"
                title="编辑"
              >
                ✏️
              </button>
              <button
                @click.stop="deletePassword(password)"
                class="action-btn delete-btn"
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- 安全状态指示器 -->
          <div class="security-indicators">
            <span
              v-if="password.isWeak"
              class="security-badge weak"
              title="弱密码"
            >
              ⚠️ 弱
            </span>
            <span
              v-if="password.isDuplicate"
              class="security-badge duplicate"
              title="重复密码"
            >
              🔄 重复
            </span>
            <span
              v-if="password.isExpiring"
              class="security-badge expiring"
              title="即将过期"
            >
              ⏰ 过期
            </span>
          </div>

          <!-- URL 链接 -->
          <div v-if="password.url" class="password-url">
            <a :href="password.url" target="_blank" rel="noopener noreferrer">
              🌐 {{ getDomainFromUrl(password.url) }}
            </a>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ⏮️
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ⏪
        </button>
        
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页 (共 {{ passwordsTotal }} 条记录)
        </span>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ⏩
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ⏭️
        </button>
      </div>

      <!-- 加载更多按钮（可选的无限滚动替代方案） -->
      <div v-if="passwordsHasMore && !isLoading" class="load-more">
        <button @click="loadMore" class="load-more-btn">
          加载更多
        </button>
      </div>
    </div>

    <!-- 添加密码模态框 -->
    <AddPasswordModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @success="handlePasswordAdded"
      @requireMasterPassword="handleRequireMasterPassword"
    />

    <!-- 编辑密码模态框 -->
    <EditPasswordModal
      v-if="showEditModal && editingPassword"
      :password="editingPassword"
      @close="showEditModal = false"
      @success="handlePasswordUpdated"
    />

    <!-- 导入模态框 -->
    <ImportPasswordsModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @success="handlePasswordsImported"
    />

    <!-- 主密码模态框 -->
    <MasterPasswordModal
      v-if="showMasterPasswordModal"
      :is-setup="!hasMasterPassword"
      @success="handleMasterPasswordSuccess"
      @close="handleMasterPasswordClose"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AddPasswordModal from '../../components/modals/AddPasswordModal.vue'
import EditPasswordModal from '../../components/modals/EditPasswordModal.vue'
import ImportPasswordsModal from '../../components/modals/ImportPasswordsModal.vue'
import MasterPasswordModal from '../../components/modals/MasterPasswordModal.vue'
import { usePasswordEntries } from '../../composables/usePasswordEntries'
import { categoriesAPI } from '../../services/api'
import { KeyManager } from '../../utils/encryption/crypto'
import { tokenManager } from '../../utils/auth/tokenManager'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import type { Category } from '../../types/api'

// 为了兼容现有代码，创建一个类型别名
type PasswordItem = DecryptedPasswordEntry & {
  id: string  // 保持原有的string类型ID
  category: string  // 添加分类名称字段
  url: string  // 确保url是string类型而不是可选的
  isWeak?: boolean
  isDuplicate?: boolean
  isExpiring?: boolean
}

export default defineComponent({
  name: 'Passwords',
  components: {
    AddPasswordModal,
    EditPasswordModal,
    ImportPasswordsModal,
    MasterPasswordModal
  },
  setup() {
    // 使用密码条目组合式函数
    const {
      loading,
      error,
      entries,
      total,
      totalPages,
      query,
      hasData,
      isEmpty,
      hasMore,
      fetchEntries,
      searchEntries,
      filterByCategory,
      sortEntries,
      refresh,
      deleteEntry,
      toggleFavorite,
      recordUsage
    } = usePasswordEntries()

    return {
      // 从组合式函数返回的状态和方法
      passwordsLoading: loading,
      passwordsError: error,
      passwordEntries: entries,
      passwordsTotal: total,
      passwordsTotalPages: totalPages,
      passwordsQuery: query,
      passwordsHasData: hasData,
      passwordsIsEmpty: isEmpty,
      passwordsHasMore: hasMore,
      fetchPasswordEntries: fetchEntries,
      searchPasswordEntries: searchEntries,
      filterPasswordsByCategory: filterByCategory,
      sortPasswordEntries: sortEntries,
      refreshPasswords: refresh,
      deletePasswordEntry: deleteEntry,
      togglePasswordFavorite: toggleFavorite,
      recordPasswordUsage: recordUsage
    }
  },
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'updatedAt',
      viewMode: 'grid' as 'grid' | 'list',
      
      showAddModal: false,
      showEditModal: false,
      showImportModal: false,
      showMasterPasswordModal: false,
      hasMasterPassword: false,
      editingPassword: null as PasswordItem | null,
      pendingViewPasswordId: null as string | null,
      
      categories: [] as Category[],
      searchTimeout: null as number | null
    }
  },
  computed: {
    // 使用后端分页的数据
    isLoading(): boolean {
      return this.passwordsLoading
    },
    
    passwords(): PasswordItem[] {
      return this.passwordEntries.map(entry => {
        // 获取分类名称
        const category = this.categories.find(cat => cat.id === entry.categoryId)
        
        return {
          ...entry,
          id: entry.id.toString(),  // 转换为string类型
          category: category?.name || '其他',  // 添加分类名称
          url: entry.url || '',  // 确保url不为undefined
          // 添加安全状态检查
          isWeak: this.checkPasswordStrength(entry.password) < 3,
          isDuplicate: this.checkDuplicatePassword(entry.password),
          isExpiring: this.checkPasswordExpiring(entry.updatedAt || entry.createdAt)
        } as PasswordItem
      })
    },
    
    // 显示的密码列表（后端已分页）
    paginatedPasswords(): PasswordItem[] {
      return this.passwords
    },
    
    // 使用后端返回的总页数
    totalPages(): number {
      return this.passwordsTotalPages
    },
    
    // 当前页码
    currentPage(): number {
      return this.passwordsQuery.page || 1
    },
    
    // 统计信息
    weakPasswordsCount(): number {
      return this.passwords.filter(p => p.isWeak).length
    },
    
    duplicatePasswordsCount(): number {
      return this.passwords.filter(p => p.isDuplicate).length
    },
    
    expiringPasswordsCount(): number {
      return this.passwords.filter(p => p.isExpiring).length
    },
    
    // 获取分类名称
    categoryNames(): string[] {
      return this.categories.map(cat => cat.name)
    }
  },
  async mounted() {
    // 检查是否已有主密码设置（持久化检查）
    this.hasMasterPassword = KeyManager.hasMasterPassword()
    await Promise.all([
      this.loadCategories(),
      this.loadPasswords()
    ])
  },
  methods: {
    // 加载分类数据
    async loadCategories() {
      try {
        const response = await categoriesAPI.getAll()
        if (response.code === 200 && response.data) {
          this.categories = response.data.categories
        }
      } catch (error) {
        console.error('加载分类失败:', error)
        // 使用默认分类
        this.categories = [
          { id: 1, name: '其他' },
          { id: 2, name: '社交媒体' },
          { id: 3, name: '邮箱服务' },
          { id: 4, name: '金融服务' },
          { id: 5, name: '开发工具' },
          { id: 6, name: '购物网站' },
          { id: 7, name: '娱乐平台' },
          { id: 8, name: '工作相关' }
        ]
      }
    },

    // 加载密码数据（使用后端分页）
    async loadPasswords() {
      try {
        await this.fetchPasswordEntries()
      } catch (error) {
        console.error('加载密码失败:', error)
      }
    },

    // 密码强度检查
    checkPasswordStrength(password: string): number {
      let score = 0
      if (password.length >= 8) score++
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/\d/.test(password)) score++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
      return score
    },

    // 检查重复密码
    checkDuplicatePassword(password: string): boolean {
      const passwordCount = this.passwordEntries.filter(p => p.password === password).length
      return passwordCount > 1
    },

    // 检查密码是否即将过期（超过90天未更新）
    checkPasswordExpiring(updatedAt: string): boolean {
      const updateDate = new Date(updatedAt)
      const now = new Date()
      const daysDiff = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff > 90
    },

    // 搜索处理（使用后端搜索）
    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(async () => {
        await this.searchPasswordEntries(this.searchQuery)
      }, 300)
    },

    // 清除搜索
    async clearSearch() {
      this.searchQuery = ''
      await this.searchPasswordEntries('')
    },

    // 应用筛选（使用后端筛选）
    async applyFilters() {
      const categoryId = this.selectedCategory ? 
        this.categories.find(cat => cat.name === this.selectedCategory)?.id : 
        undefined
      await this.filterPasswordsByCategory(categoryId)
    },

    // 应用排序（使用后端排序）
    async applySorting() {
      const sortBy = this.sortBy as any
      await this.sortPasswordEntries(sortBy, 'desc')
    },

    // 查看密码详情
    async viewPassword(password: PasswordItem) {
      try {
        // 首先检查用户是否已登录（有有效的API token）
        if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
          console.log('🚫 用户未登录或token已过期，跳转到登录页面')
          this.$router.push('/login')
          return
        }

        // 检查是否已有加密密钥（用户是否已通过主密码验证）
        if (!KeyManager.hasKey()) {
          // 如果没有密钥，显示主密码模态框
          this.showMasterPasswordModal = true
          // 保存要查看的密码ID，验证成功后跳转
          this.pendingViewPasswordId = password.id
          return
        }
        
        // 如果已有密钥，直接跳转到详情页面
        this.$router.push(`/passwords/${password.id}`)
      } catch (error) {
        console.error('查看密码详情失败:', error)
        // 如果出现错误，可能是认证问题，跳转到登录页面
        this.$router.push('/login')
      }
    },

    // 复制密码
    async copyPassword(password: PasswordItem) {
      try {
        await navigator.clipboard.writeText(password.password)
        console.log('密码已复制')
        // 记录使用次数
        await this.recordPasswordUsage(parseInt(password.id))  // 转换为number类型
      } catch (error) {
        console.error('复制失败:', error)
      }
    },

    // 复制用户名
    async copyUsername(password: PasswordItem) {
      try {
        await navigator.clipboard.writeText(password.username)
        console.log('用户名已复制')
      } catch (error) {
        console.error('复制失败:', error)
      }
    },

    // 编辑密码
    editPassword(password: PasswordItem) {
      this.editingPassword = password
      this.showEditModal = true
    },

    // 删除密码（使用后端API）
    async deletePassword(password: PasswordItem) {
      if (confirm(`确定要删除密码 "${password.title}" 吗？此操作不可撤销。`)) {
        try {
          await this.deletePasswordEntry(parseInt(password.id))  // 转换为number类型
          console.log('密码已删除')
        } catch (error) {
          console.error('删除失败:', error)
        }
      }
    },

    // 导出密码
    exportPasswords() {
      // 实际项目中实现导出功能
      console.log('导出密码')
    },

    // 格式化日期
    formatDate(date: Date): string {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (hours < 1) {
        return '刚刚'
      } else if (hours < 24) {
        return `${hours}小时前`
      } else {
        const days = Math.floor(hours / 24)
        if (days < 30) {
          return `${days}天前`
        } else {
          return date.toLocaleDateString('zh-CN')
        }
      }
    },

    // 从URL提取域名
    getDomainFromUrl(url: string): string {
      try {
        const domain = new URL(url).hostname
        return domain.replace('www.', '')
      } catch {
        return url
      }
    },

    // 处理密码添加成功
    async handlePasswordAdded(password: PasswordItem) {
      console.log('密码添加成功')
      // 刷新密码列表
      await this.refreshPasswords()
    },

    // 处理密码更新成功
    async handlePasswordUpdated(updatedPassword: PasswordItem) {
      console.log('密码更新成功')
      // 刷新密码列表
      await this.refreshPasswords()
    },

    // 处理密码导入成功
    async handlePasswordsImported(importedPasswords: PasswordItem[]) {
      console.log('密码导入成功')
      // 刷新密码列表
      await this.refreshPasswords()
    },

    // 分页控制方法
    async goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        try {
          // 更新查询参数并重新获取数据
          this.passwordsQuery.page = page
          await this.fetchPasswordEntries()
        } catch (error) {
          console.error('切换页面失败:', error)
        }
      }
    },

    // 加载更多（无限滚动）
    async loadMore() {
      try {
        const nextPage = this.currentPage + 1
        this.passwordsQuery.page = nextPage
        // 这里需要修改组合式函数以支持追加模式
        await this.fetchPasswordEntries()
      } catch (error) {
        console.error('加载更多失败:', error)
      }
    },

    // 处理需要主密码的情况
    handleRequireMasterPassword() {
      this.showMasterPasswordModal = true
    },

    // 处理主密码设置/验证成功
    handleMasterPasswordSuccess() {
      this.showMasterPasswordModal = false
      this.hasMasterPassword = true
      console.log('主密码验证成功')
      
      // 如果有待查看的密码ID，验证成功后跳转到详情页面
      if (this.pendingViewPasswordId) {
        this.$router.push(`/passwords/${this.pendingViewPasswordId}`)
        this.pendingViewPasswordId = null
      }
    },

    // 处理主密码模态框关闭
    handleMasterPasswordClose() {
      this.showMasterPasswordModal = false
      // 清除待查看的密码ID
      this.pendingViewPasswordId = null
      // 如果用户关闭了主密码模态框但没有设置密码，也关闭添加密码模态框
      if (!KeyManager.hasKey()) {
        this.showAddModal = false
      }
    }
  }
})
</script>

<style scoped>
.passwords-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.header-left p {
  color: #718096;
  margin: 0;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-btn,
.import-btn,
.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.add-btn {
  background: #3182ce;
  color: white;
}

.add-btn:hover {
  background: #2c5282;
}

.import-btn,
.export-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.import-btn:hover,
.export-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 16px;
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.category-filter,
.sort-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 12px;
  background: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background: #3182ce;
  color: white;
}

.stats-bar {
  display: flex;
  gap: 24px;
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  color: #2d3748;
}

.stat-value.weak {
  color: #e53e3e;
}

.stat-value.duplicate {
  color: #d69e2e;
}

.stat-value.expiring {
  color: #dd6b20;
}

.passwords-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #718096;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0 0 20px 0;
}

.empty-action-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.passwords-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.passwords-list.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.password-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.password-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.password-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.password-details {
  flex: 1;
  min-width: 0;
}

.password-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-username {
  font-size: 14px;
  color: #718096;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.password-category {
  background: #edf2f7;
  color: #4a5568;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.password-date {
  font-size: 12px;
  color: #a0aec0;
}

.password-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.delete-btn:hover {
  background: #fed7d7;
  border-color: #feb2b2;
  color: #c53030;
}

.security-indicators {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.security-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
}

.security-badge.weak {
  background: #fed7d7;
  color: #c53030;
}

.security-badge.duplicate {
  background: #fef5e7;
  color: #d69e2e;
}

.security-badge.expiring {
  background: #feebc8;
  color: #dd6b20;
}

.password-url {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f7fafc;
}

.password-url a {
  color: #3182ce;
  text-decoration: none;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.password-url a:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #718096;
  font-size: 14px;
}

/* 加载更多按钮样式 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 12px 24px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.load-more-btn:active {
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .passwords-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-bar {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .passwords-list.grid {
    grid-template-columns: 1fr;
  }
  
  .password-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .password-actions {
    align-self: flex-end;
  }
}
</style>