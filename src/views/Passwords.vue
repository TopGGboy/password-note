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
        <span class="stat-value">{{ filteredPasswords.length }}</span>
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

      <div v-else-if="filteredPasswords.length === 0" class="empty-state">
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
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ⏮️
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ⏪
        </button>
        
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ⏩
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ⏭️
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
import AddPasswordModal from '../components/AddPasswordModal.vue'
import EditPasswordModal from '../components/EditPasswordModal.vue'
import ImportPasswordsModal from '../components/ImportPasswordsModal.vue'
import MasterPasswordModal from '../components/MasterPasswordModal.vue'
import { KeyManager } from '../utils/crypto'

interface PasswordItem {
  id: string
  title: string
  username: string
  password: string
  url?: string
  category: string
  icon: string
  lastUsed: Date
  createdAt: Date
  updatedAt: Date
  isWeak?: boolean
  isDuplicate?: boolean
  isExpiring?: boolean
  notes?: string
  tags?: string[]
}

export default defineComponent({
  name: 'Passwords',
  components: {
    AddPasswordModal,
    EditPasswordModal,
    ImportPasswordsModal,
    MasterPasswordModal
  },
  data() {
    return {
      isLoading: false,
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'lastUsed',
      viewMode: 'grid' as 'grid' | 'list',
      currentPage: 1,
      pageSize: 20,
      
      showAddModal: false,
      showEditModal: false,
      showImportModal: false,
      showMasterPasswordModal: false,
      hasMasterPassword: false,
      editingPassword: null as PasswordItem | null,
      
      passwords: [] as PasswordItem[],
      categories: [] as string[],
      
      searchTimeout: null as number | null
    }
  },
  computed: {
    filteredPasswords(): PasswordItem[] {
      let result = [...this.passwords]
      
      // 搜索过滤
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(password =>
          password.title.toLowerCase().includes(query) ||
          password.username.toLowerCase().includes(query) ||
          password.category.toLowerCase().includes(query) ||
          (password.url && password.url.toLowerCase().includes(query)) ||
          (password.notes && password.notes.toLowerCase().includes(query))
        )
      }
      
      // 分类过滤
      if (this.selectedCategory) {
        result = result.filter(password => password.category === this.selectedCategory)
      }
      
      // 排序
      result.sort((a, b) => {
        switch (this.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'createdAt':
            return b.createdAt.getTime() - a.createdAt.getTime()
          case 'updatedAt':
            return b.updatedAt.getTime() - a.updatedAt.getTime()
          case 'lastUsed':
          default:
            return b.lastUsed.getTime() - a.lastUsed.getTime()
        }
      })
      
      return result
    },
    
    paginatedPasswords(): PasswordItem[] {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredPasswords.slice(start, end)
    },
    
    totalPages(): number {
      return Math.ceil(this.filteredPasswords.length / this.pageSize)
    },
    
    weakPasswordsCount(): number {
      return this.passwords.filter(p => p.isWeak).length
    },
    
    duplicatePasswordsCount(): number {
      return this.passwords.filter(p => p.isDuplicate).length
    },
    
    expiringPasswordsCount(): number {
      return this.passwords.filter(p => p.isExpiring).length
    }
  },
  async mounted() {
    // 检查是否已有主密码设置（持久化检查）
    this.hasMasterPassword = KeyManager.hasMasterPassword()
    await this.loadPasswords()
  },
  methods: {
    // 加载密码数据
    async loadPasswords() {
      this.isLoading = true
      try {
        // 模拟API调用 - 实际项目中从API获取
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.passwords = [
          {
            id: '1',
            title: 'GitHub',
            username: 'user@example.com',
            password: 'encrypted_password_1',
            url: 'https://github.com',
            category: '开发工具',
            icon: '🐙',
            lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            isWeak: false,
            isDuplicate: false,
            isExpiring: false,
            notes: 'GitHub开发账户',
            tags: ['开发', '代码']
          },
          {
            id: '2',
            title: '微信',
            username: 'wechat_user',
            password: 'encrypted_password_2',
            category: '社交媒体',
            icon: '💬',
            lastUsed: new Date(Date.now() - 5 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            isWeak: true,
            isDuplicate: false,
            isExpiring: false
          },
          {
            id: '3',
            title: '支付宝',
            username: '138****8888',
            password: 'encrypted_password_3',
            category: '金融服务',
            icon: '💰',
            lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            isWeak: false,
            isDuplicate: true,
            isExpiring: false
          },
          {
            id: '4',
            title: 'Gmail',
            username: 'myemail@gmail.com',
            password: 'encrypted_password_4',
            url: 'https://gmail.com',
            category: '邮箱服务',
            icon: '📧',
            lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            isWeak: false,
            isDuplicate: false,
            isExpiring: true
          }
        ]
        
        // 提取分类
        this.categories = [...new Set(this.passwords.map(p => p.category))]
        
      } catch (error) {
        console.error('加载密码失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 搜索处理
    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1 // 重置到第一页
      }, 300)
    },

    // 清除搜索
    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 1
    },

    // 应用筛选
    applyFilters() {
      this.currentPage = 1
    },

    // 应用排序
    applySorting() {
      this.currentPage = 1
    },

    // 查看密码详情
    viewPassword(password: PasswordItem) {
      this.$router.push(`/passwords/${password.id}`)
    },

    // 复制密码
    async copyPassword(password: PasswordItem) {
      try {
        // 实际项目中需要先解密密码
        await navigator.clipboard.writeText(password.password)
        console.log('密码已复制')
        // 更新最后使用时间
        password.lastUsed = new Date()
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

    // 删除密码
    async deletePassword(password: PasswordItem) {
      if (confirm(`确定要删除密码 "${password.title}" 吗？此操作不可撤销。`)) {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const index = this.passwords.findIndex(p => p.id === password.id)
          if (index > -1) {
            this.passwords.splice(index, 1)
          }
          
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
    handlePasswordAdded(password: PasswordItem) {
      this.passwords.unshift(password)
      this.categories = [...new Set(this.passwords.map(p => p.category))]
    },

    // 处理密码更新成功
    handlePasswordUpdated(updatedPassword: PasswordItem) {
      const index = this.passwords.findIndex(p => p.id === updatedPassword.id)
      if (index > -1) {
        this.passwords[index] = updatedPassword
      }
      this.categories = [...new Set(this.passwords.map(p => p.category))]
    },

    // 处理密码导入成功
    handlePasswordsImported(importedPasswords: PasswordItem[]) {
      this.passwords.push(...importedPasswords)
      this.categories = [...new Set(this.passwords.map(p => p.category))]
    },

    // 处理需要主密码的情况
    handleRequireMasterPassword() {
      this.showMasterPasswordModal = true
    },

    // 处理主密码设置/验证成功
    handleMasterPasswordSuccess() {
      this.showMasterPasswordModal = false
      this.hasMasterPassword = true
      console.log('主密码验证成功，可以继续保存密码')
    },

    // 处理主密码模态框关闭
    handleMasterPasswordClose() {
      this.showMasterPasswordModal = false
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