<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>搜索密码</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="search-container">
        <!-- 搜索输入框 -->
        <div class="search-input-group">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="输入网站名称、用户名或分类进行搜索..."
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            ✕
          </button>
        </div>

        <!-- 搜索过滤器 -->
        <div class="search-filters">
          <div class="filter-group">
            <label>分类筛选：</label>
            <select v-model="selectedCategory" @change="handleSearch">
              <option value="">全部分类</option>
              <option value="社交媒体">社交媒体</option>
              <option value="邮箱服务">邮箱服务</option>
              <option value="金融服务">金融服务</option>
              <option value="开发工具">开发工具</option>
              <option value="购物网站">购物网站</option>
              <option value="娱乐平台">娱乐平台</option>
              <option value="工作相关">工作相关</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="filter-group">
            <label>排序方式：</label>
            <select v-model="sortBy" @change="handleSearch">
              <option value="lastUsed">最近使用</option>
              <option value="title">名称排序</option>
              <option value="createdAt">创建时间</option>
              <option value="category">分类排序</option>
            </select>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div class="search-results">
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>搜索中...</p>
          </div>

          <div v-else-if="searchResults.length === 0 && searchQuery" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h4>未找到相关密码</h4>
            <p>尝试使用不同的关键词或调整筛选条件</p>
          </div>

          <div v-else-if="searchResults.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h4>开始搜索</h4>
            <p>输入关键词查找您的密码记录</p>
          </div>

          <div v-else class="results-list">
            <div class="results-header">
              <span class="results-count">找到 {{ searchResults.length }} 个结果</span>
            </div>

            <div
              v-for="password in searchResults"
              :key="password.id"
              class="result-item"
              @click="selectPassword(password)"
            >
              <div class="result-main">
                <div class="result-info">
                  <span class="result-icon">{{ password.icon }}</span>
                  <div class="result-details">
                    <h4 class="result-title">
                      <span v-html="highlightText(password.title, searchQuery)"></span>
                    </h4>
                    <p class="result-username">
                      <span v-html="highlightText(password.username, searchQuery)"></span>
                    </p>
                    <div class="result-meta">
                      <span class="result-category">{{ password.category }}</span>
                      <span class="result-date">{{ formatDate(password.lastUsed) }}</span>
                    </div>
                  </div>
                </div>

                <div class="result-actions">
                  <button
                    @click.stop="copyPassword(password)"
                    class="action-btn copy-btn"
                    title="复制密码"
                  >
                    📋
                  </button>
                  <button
                    @click.stop="viewPassword(password)"
                    class="action-btn view-btn"
                    title="查看详情"
                  >
                    👁️
                  </button>
                </div>
              </div>

              <!-- URL 显示（如果有） -->
              <div v-if="password.url" class="result-url">
                <span class="url-icon">🌐</span>
                <span class="url-text">{{ password.url }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions" v-if="searchResults.length > 0">
          <button @click="selectAll" class="quick-action-btn">
            全选 ({{ selectedCount }})
          </button>
          <button @click="exportSelected" class="quick-action-btn" :disabled="selectedCount === 0">
            导出选中
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
  selected?: boolean
}

export default defineComponent({
  name: 'SearchModal',
  emits: ['close', 'select'],
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'lastUsed',
      isLoading: false,
      searchResults: [] as PasswordItem[],
      allPasswords: [] as PasswordItem[], // 所有密码数据
      searchTimeout: null as number | null
    }
  },
  computed: {
    selectedCount(): number {
      return this.searchResults.filter(p => p.selected).length
    }
  },
  async mounted() {
    // 自动聚焦搜索框
    this.$nextTick(() => {
      (this.$refs.searchInput as HTMLInputElement)?.focus()
    })
    
    // 加载所有密码数据
    await this.loadAllPasswords()
  },
  methods: {
    handleOverlayClick(event: Event) {
      if (event.target === event.currentTarget) {
        this.$emit('close')
      }
    },

    // 加载所有密码数据
    async loadAllPasswords() {
      try {
        // 模拟API调用 - 实际项目中从API获取
        this.allPasswords = [
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
            updatedAt: new Date()
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
            updatedAt: new Date()
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
            updatedAt: new Date()
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
            updatedAt: new Date()
          },
          {
            id: '5',
            title: '淘宝',
            username: 'taobao_user',
            password: 'encrypted_password_5',
            url: 'https://taobao.com',
            category: '购物网站',
            icon: '🛒',
            lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        ]
        
        // 初始显示所有密码
        this.searchResults = [...this.allPasswords]
      } catch (error) {
        console.error('加载密码数据失败:', error)
      }
    },

    // 处理搜索
    handleSearch() {
      // 清除之前的定时器
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      // 设置新的定时器，防抖处理
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },

    // 执行搜索
    performSearch() {
      this.isLoading = true

      setTimeout(() => {
        let results = [...this.allPasswords]

        // 文本搜索
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase()
          results = results.filter(password => 
            password.title.toLowerCase().includes(query) ||
            password.username.toLowerCase().includes(query) ||
            password.category.toLowerCase().includes(query) ||
            (password.url && password.url.toLowerCase().includes(query))
          )
        }

        // 分类筛选
        if (this.selectedCategory) {
          results = results.filter(password => password.category === this.selectedCategory)
        }

        // 排序
        results.sort((a, b) => {
          switch (this.sortBy) {
            case 'title':
              return a.title.localeCompare(b.title)
            case 'createdAt':
              return b.createdAt.getTime() - a.createdAt.getTime()
            case 'category':
              return a.category.localeCompare(b.category)
            case 'lastUsed':
            default:
              return b.lastUsed.getTime() - a.lastUsed.getTime()
          }
        })

        this.searchResults = results
        this.isLoading = false
      }, 500) // 模拟API延迟
    },

    // 清除搜索
    clearSearch() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.handleSearch()
    },

    // 选择密码
    selectPassword(password: PasswordItem) {
      this.$emit('select', password)
      this.$emit('close')
    },

    // 复制密码
    async copyPassword(password: PasswordItem) {
      try {
        // 实际项目中需要先解密密码
        await navigator.clipboard.writeText(password.password)
        // 这里可以显示成功提示
        console.log('密码已复制')
      } catch (error) {
        console.error('复制失败:', error)
      }
    },

    // 查看密码详情
    viewPassword(password: PasswordItem) {
      this.$emit('select', password)
      this.$emit('close')
    },

    // 高亮搜索文本
    highlightText(text: string, query: string): string {
      if (!query.trim()) return text
      
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },

    // 格式化日期
    formatDate(date: Date): string {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (hours < 1) {
        return '刚刚使用'
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

    // 全选/取消全选
    selectAll() {
      const allSelected = this.searchResults.every(p => p.selected)
      this.searchResults.forEach(password => {
        password.selected = !allSelected
      })
    },

    // 导出选中的密码
    exportSelected() {
      const selected = this.searchResults.filter(p => p.selected)
      console.log('导出选中的密码:', selected)
      // 实际项目中实现导出功能
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4a5568;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.search-container {
  padding: 0 24px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-input-group {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 16px 20px;
  padding-right: 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4a5568;
  font-size: 12px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.search-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
  white-space: nowrap;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #3182ce;
}

.search-results {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
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

.empty-state h4 {
  font-size: 18px;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.results-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.results-header {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.results-count {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.result-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.result-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.result-details {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.result-title :deep(mark) {
  background: #fef5e7;
  color: #d69e2e;
  padding: 1px 2px;
  border-radius: 2px;
}

.result-username {
  font-size: 14px;
  color: #718096;
  margin: 0 0 8px 0;
}

.result-username :deep(mark) {
  background: #fef5e7;
  color: #d69e2e;
  padding: 1px 2px;
  border-radius: 2px;
}

.result-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.result-category {
  background: #edf2f7;
  color: #4a5568;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.result-date {
  font-size: 12px;
  color: #a0aec0;
}

.result-actions {
  display: flex;
  gap: 8px;
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

.result-url {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f7fafc;
  font-size: 12px;
  color: #718096;
}

.url-icon {
  font-size: 14px;
}

.url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 20px;
}

.quick-action-btn {
  padding: 8px 16px;
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.quick-action-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header,
  .search-container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .result-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .result-actions {
    align-self: flex-end;
  }
  
  .quick-actions {
    flex-direction: column;
  }
}
</style>