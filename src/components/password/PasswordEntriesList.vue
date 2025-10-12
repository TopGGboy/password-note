<template>
  <div class="password-entries-list" ref="scrollContainer">
    <!-- 搜索和筛选栏 -->
    <div class="search-filter-bar">
      <div class="search-box">
        <input v-model="searchKeyword" type="text" placeholder="搜索密码条目..." class="search-input" @input="handleSearch" />
        <button @click="handleSearch" class="search-btn">
          🔍
        </button>
      </div>

      <div class="filter-controls">
        <select v-model="selectedCategory" @change="handleCategoryFilter" class="category-filter">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <button @click="handleFavoriteFilter" class="favorite-filter" :class="{ active: showFavoritesOnly }">
          ⭐ {{ showFavoritesOnly ? '显示全部' : '仅收藏' }}
        </button>

        <select v-model="sortOption" @change="handleSort" class="sort-select">
          <option value="updatedAt-desc">最近更新</option>
          <option value="createdAt-desc">最近创建</option>
          <option value="title-asc">标题 A-Z</option>
          <option value="title-desc">标题 Z-A</option>
          <option value="lastUsed-desc">最近使用</option>
          <option value="timesUsed-desc">使用次数</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && entries.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="refresh" class="retry-btn">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="empty-state">
      <div class="empty-icon">🔐</div>
      <h3>暂无密码条目</h3>
      <p>{{ searchKeyword ? '没有找到匹配的密码条目' : '开始添加你的第一个密码吧！' }}</p>
      <button v-if="!searchKeyword" @click="$emit('add-password')" class="add-first-btn">
        添加密码
      </button>
    </div>

    <!-- 密码条目列表 -->
    <div v-else class="entries-grid">
      <div v-for="entry in entries" :key="entry.id" class="entry-card" @click="$emit('view-entry', entry)">
        <div class="entry-header">
          <div class="entry-icon">{{ entry.icon || '🔐' }}</div>
          <div class="entry-info">
            <h4 class="entry-title">{{ entry.title }}</h4>
            <p class="entry-username">{{ entry.username }}</p>
          </div>
          <div class="entry-actions">
            <button @click.stop="handleToggleFavorite(entry.id, entry.favorite)" class="favorite-btn"
              :class="{ active: entry.favorite }">
              {{ entry.favorite ? '⭐' : '☆' }}
            </button>
            <button @click.stop="handleCopyPassword(entry)" class="copy-btn" title="复制密码">
              📋
            </button>
            <button @click.stop="$emit('edit-entry', entry)" class="edit-btn" title="编辑">
              ✏️
            </button>
            <button @click.stop="handleDeleteEntry(entry.id, entry.title)" class="delete-btn" title="删除">
              🗑️
            </button>
          </div>
        </div>

        <div class="entry-details">
          <div v-if="entry.url" class="entry-url">
            <a :href="entry.url" target="_blank" @click.stop>{{ entry.url }}</a>
          </div>
          <div class="entry-meta">
            <span class="usage-count">使用 {{ entry.timesUsed }} 次</span>
            <span class="last-used">
              {{ entry.lastUsed ? formatDate(entry.lastUsed) : '从未使用' }}
            </span>
          </div>
          <div v-if="entry.tags && entry.tags.length > 0" class="entry-tags">
            <span v-for="tag in entry.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more-section">
      <button @click="loadMore" :disabled="loading" class="load-more-btn">
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- 分页信息 -->
    <div v-if="hasData" class="pagination-info">
      显示 {{ entries.length }} / {{ total }} 条记录
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { usePasswordEntries } from '../../composables/usePasswordEntries'
import { useAuth } from '../../composables/useAuth'
import { categoriesAPI } from '../../services/api'
import type { Category } from '../../types/api'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'

export default defineComponent({
  name: 'PasswordEntriesList',
  emits: ['add-password', 'view-entry', 'edit-entry'],
  setup(props, { emit }) {
    // 使用认证组合式函数
    const { userId, isAuthenticated, initialize } = useAuth()

    // 使用密码条目组合式函数
    const {
      loading,
      error,
      entries,
      total,
      hasData,
      isEmpty,
      hasMore,
      fetchEntries,
      searchEntries,
      filterByCategory,
      filterFavorites,
      sortEntries,
      loadMore,
      checkAndLoadMore,
      refresh,
      deleteEntry,
      toggleFavorite,
      recordUsage
    } = usePasswordEntries()

    // 本地状态
    const searchKeyword = ref('')
    const selectedCategory = ref<number | ''>('')
    const showFavoritesOnly = ref(false)
    const sortOption = ref('updatedAt-desc')
    const categories = ref<Category[]>([])
    const scrollContainer = ref<HTMLElement>()

    // 搜索防抖
    let searchTimeout: number | null = null
    const handleSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      searchTimeout = setTimeout(() => {
        searchEntries(searchKeyword.value)
      }, 300)
    }

    // 分类筛选
    const handleCategoryFilter = () => {
      const categoryId = selectedCategory.value === '' ? undefined : Number(selectedCategory.value)
      filterByCategory(categoryId)
    }

    // 收藏筛选
    const handleFavoriteFilter = () => {
      showFavoritesOnly.value = !showFavoritesOnly.value
      filterFavorites(showFavoritesOnly.value ? true : undefined)
    }

    // 排序
    const handleSort = () => {
      const [sortBy, sortOrder] = sortOption.value.split('-') as [any, 'asc' | 'desc']
      sortEntries(sortBy, sortOrder)
    }

    // 切换收藏状态
    const handleToggleFavorite = async (id: number, currentFavorite: boolean) => {
      try {
        await toggleFavorite(id, !currentFavorite)
      } catch (err) {
        console.error('切换收藏状态失败:', err)
      }
    }

    // 复制密码
    const handleCopyPassword = async (entry: DecryptedPasswordEntry) => {
      try {
        await navigator.clipboard.writeText(entry.password)
        // 记录使用次数
        await recordUsage(entry.id)
        // 显示成功提示
        showToast('密码已复制到剪贴板')
      } catch (err) {
        console.error('复制密码失败:', err)
        showToast('复制失败，请手动复制', 'error')
      }
    }

    // 删除条目
    const handleDeleteEntry = async (id: number, title: string) => {
      if (confirm(`确定要删除密码条目"${title}"吗？此操作不可撤销。`)) {
        try {
          await deleteEntry(id)
          // 触发删除事件通知
          window.dispatchEvent(new CustomEvent('passwordEntryDeleted'))
          showToast('密码条目已删除')
        } catch (err) {
          console.error('删除失败:', err)
          showToast('删除失败，请重试', 'error')
        }
      }
    }

    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    }

    // 显示提示消息
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      // 这里可以集成一个 toast 组件
      console.log(`[${type.toUpperCase()}] ${message}`)
      // 临时使用 alert，实际项目中应该使用更好的提示组件
      if (type === 'error') {
        alert(message)
      }
    }

    // 加载分类列表
    const loadCategories = async () => {
      if (!userId.value || isNaN(Number(userId.value))) {
        console.warn('用户ID无效，无法加载分类')
        return
      }

      const userIdNum = Number(userId.value)

      try {
        const response = await categoriesAPI.getAll()
        if (response.code === 200 && response.data) {
          categories.value = response.data
        }
      } catch (err) {
        console.error('加载分类失败:', err)
        // 使用默认分类
        categories.value = [
          { id: 1, userId: userIdNum, name: '其他' },
          { id: 2, userId: userIdNum, name: '社交媒体' },
          { id: 3, userId: userIdNum, name: '邮箱服务' },
          { id: 4, userId: userIdNum, name: '金融服务' },
          { id: 5, userId: userIdNum, name: '开发工具' },
          { id: 6, userId: userIdNum, name: '购物网站' },
          { id: 7, userId: Number(userId.value), name: '娱乐平台' },
          { id: 8, userId: Number(userId.value), name: '工作相关' }
        ]
      }
    }



    // 处理密码条目添加事件
    const handlePasswordEntryAdded = async () => {
      console.log('检测到密码条目添加事件，正在刷新列表...')
      await refresh()
    }

    // 处理密码条目更新事件
    const handlePasswordEntryUpdated = async () => {
      console.log('检测到密码条目更新事件，正在刷新列表...')
      await refresh()
    }

    // 处理密码条目删除事件
    const handlePasswordEntryDeleted = async () => {
      console.log('检测到密码条目删除事件，正在刷新列表...')
      await refresh()
    }

    // 无限滚动处理 - 监听window滚动
    const handleScroll = async () => {
      // 检查是否需要加载更多
      if (!hasMore.value || loading.value) {
        return;
      }

      // 获取页面滚动信息
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 计算滚动百分比
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;
      
      console.log('滚动调试信息:', {
        scrollTop,
        windowHeight,
        documentHeight,
        scrollPercentage: (scrollPercentage * 100).toFixed(2) + '%',
        hasMore: hasMore.value,
        loading: loading.value
      });
      
      // 当滚动到85%时自动加载更多
      if (scrollPercentage >= 0.85) {
        console.log('触发自动加载更多...');
        await loadMore();
      }
    }

    // 节流函数
    const throttle = (func: Function, delay: number) => {
      let timeoutId: number | null = null
      let lastExecTime = 0
      return function (this: any, ...args: any[]) {
        const currentTime = Date.now()
        
        if (currentTime - lastExecTime > delay) {
          func.apply(this, args)
          lastExecTime = currentTime
        } else {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          timeoutId = setTimeout(() => {
            func.apply(this, args)
            lastExecTime = Date.now()
          }, delay - (currentTime - lastExecTime))
        }
      }
    }

    // 节流后的滚动处理函数
    const throttledHandleScroll = throttle(handleScroll, 200)

    // 组件挂载时初始化
    onMounted(async () => {
      console.log('=== PasswordEntriesList 组件挂载调试信息 ===')
      console.log('认证状态:', isAuthenticated.value)
      console.log('用户ID:', userId.value)
      console.log('当前entries数量:', entries.value.length)
      console.log('loading状态:', loading.value)
      console.log('error状态:', error.value)
      console.log('isEmpty状态:', isEmpty.value)
      console.log('hasData状态:', hasData.value)
      
      // 先检查认证状态
      if (!isAuthenticated.value) {
        console.log('用户未认证，尝试初始化认证状态...')
        // 尝试初始化认证状态
        await initialize()
        // 再次检查认证状态
        if (!isAuthenticated.value) {
          console.warn('用户未认证，跳过数据加载')
          return
        }
        console.log('认证状态初始化成功')
      }

      // 等待用户ID可用
      if (!userId.value) {
        console.warn('用户ID不可用，跳过数据加载')
        return
      }

      console.log('开始加载数据...')
      try {
        await Promise.all([
          loadCategories(),
          fetchEntries()
        ])
        console.log('数据加载完成，entries数量:', entries.value.length)
        console.log('total数量:', total.value)
      } catch (error) {
        console.error('初始化数据加载失败:', error)
        showToast('数据加载失败，请刷新页面重试', 'error')
      }

      // 监听自定义事件，当有密码相关操作时，刷新列表
      window.addEventListener('passwordEntryAdded', handlePasswordEntryAdded)
      window.addEventListener('passwordEntryUpdated', handlePasswordEntryUpdated)
      window.addEventListener('passwordEntryDeleted', handlePasswordEntryDeleted)

      // 添加滚动监听 - 监听window滚动
      await nextTick()
      window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    })

    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('passwordEntryAdded', handlePasswordEntryAdded)
      window.removeEventListener('passwordEntryUpdated', handlePasswordEntryUpdated)
      window.removeEventListener('passwordEntryDeleted', handlePasswordEntryDeleted)
      
      // 移除滚动监听
      window.removeEventListener('scroll', throttledHandleScroll)
    })


    return {
      // 响应式数据
      loading,
      error,
      entries,
      total,
      hasData,
      isEmpty,
      hasMore,
      searchKeyword,
      selectedCategory,
      showFavoritesOnly,
      sortOption,
      categories,
      scrollContainer,

      // 方法
      handleSearch,
      handleCategoryFilter,
      handleFavoriteFilter,
      handleSort,
      handleToggleFavorite,
      handleCopyPassword,
      handleDeleteEntry,
      loadMore,
      refresh,
      formatDate
    }
  }
})
</script>

<style scoped>
.password-entries-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  scroll-behavior: smooth;
}

.search-filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3182ce;
}

.search-btn {
  padding: 12px 16px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #2c5282;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-filter,
.sort-select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.favorite-filter {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.favorite-filter.active {
  background: #ffd700;
  border-color: #ffd700;
  color: #333;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #e53e3e;
  margin-bottom: 16px;
}

.retry-btn,
.add-first-btn {
  padding: 12px 24px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.retry-btn:hover,
.add-first-btn:hover {
  background: #2c5282;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.entry-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.entry-card:hover {
  border-color: #3182ce;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.1);
}

.entry-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.entry-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.entry-info {
  flex: 1;
  min-width: 0;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a202c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-username {
  font-size: 14px;
  color: #718096;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.entry-actions button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-actions button:hover {
  background: #edf2f7;
}

.favorite-btn.active {
  background: #ffd700;
}

.delete-btn:hover {
  background: #fed7d7;
  color: #e53e3e;
}

.entry-details {
  font-size: 14px;
  color: #718096;
}

.entry-url {
  margin-bottom: 8px;
}

.entry-url a {
  color: #3182ce;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.entry-url a:hover {
  text-decoration: underline;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  background: #ebf8ff;
  color: #3182ce;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.load-more-section {
  text-align: center;
  margin: 24px 0;
}

.load-more-btn {
  padding: 12px 32px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #2c5282;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination-info {
  text-align: center;
  color: #718096;
  font-size: 14px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .password-entries-list {
    padding: 16px;
  }

  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-controls {
    justify-content: space-between;
  }

  .entries-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .entry-header {
    flex-wrap: wrap;
  }

  .entry-actions {
    order: 3;
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>