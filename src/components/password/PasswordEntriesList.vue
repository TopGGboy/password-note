<template>
  <div class="password-entries-list" ref="scrollContainer">
    <!-- 搜索和筛选栏 -->
    <div class="search-filter-bar card">
      <div class="search-box">
        <input v-model="searchKeyword" type="text" placeholder="搜索密码条目..." class="form-input search-input" @input="handleSearch" />
        <button @click="handleSearch" class="btn btn-icon search-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      <div class="filter-controls">
        <select v-model="selectedCategory" @change="handleCategoryFilter" class="form-select category-filter">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <button @click="handleFavoriteFilter" class="btn favorite-filter" :class="{ 'btn-primary': query?.favorite === true, 'btn-secondary': query?.favorite !== true }">
          ⭐ {{ query?.favorite === true ? '显示全部' : '仅收藏' }}
        </button>

        <select v-model="sortOption" @change="handleSort" class="form-select sort-select">
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
    <div v-else-if="error" class="error-state card">
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div class="error-info">
          <h3 class="error-title">加载失败</h3>
          <p class="error-description">{{ error }}</p>
        </div>
      </div>
      <button @click="refresh" class="btn btn-primary retry-btn">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="empty-state card">
      <div class="empty-icon">🔐</div>
      <h3 class="empty-title">暂无密码条目</h3>
      <p class="empty-description">{{ searchKeyword ? '没有找到匹配的密码条目' : '开始添加你的第一个密码吧！' }}</p>
      <button v-if="!searchKeyword" @click="$emit('add-password')" class="btn btn-primary add-first-btn">
        添加密码
      </button>
    </div>

    <!-- 密码条目列表 -->
    <div v-else class="entries-grid">
      <div v-for="entry in entries" :key="entry.id" class="entry-card card" @click="$emit('view-entry', entry)">
        <div class="entry-header">
          <div class="entry-icon">{{ entry.icon || '🔐' }}</div>
          <div class="entry-info">
            <h4 class="entry-title">{{ entry.title }}</h4>
            <p class="entry-username">{{ entry.username }}</p>
          </div>
          <div class="entry-actions">
            <button @click.stop="handleToggleFavorite(entry.id, entry.favorite || false)" class="btn btn-icon favorite-btn"
              :class="{ 'btn-primary': entry.favorite || false, 'btn-secondary': !(entry.favorite || false) }">
              {{ entry.favorite ? '⭐' : '☆' }}
            </button>
            <button @click.stop="handleCopyPassword(entry)" class="btn btn-icon copy-btn" title="复制密码">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button @click.stop="$emit('edit-entry', entry)" class="btn btn-icon edit-btn" title="编辑">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button @click.stop="handleDeleteEntry(entry.id, entry.title)" class="btn btn-icon delete-btn" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="entry-details">
          <div v-if="entry.url" class="entry-url">
            <a :href="entry.url" target="_blank" @click.stop>{{ entry.url }}</a>
          </div>
          <div class="entry-meta">
            <span class="usage-count badge badge-primary">使用 {{ entry.timesUsed }} 次</span>
            <span class="last-used">
              {{ entry.lastUsed ? formatDate(entry.lastUsed) : '从未使用' }}
            </span>
          </div>
          <div v-if="entry.tags && entry.tags.length > 0" class="entry-tags">
            <span v-for="tag in entry.tags" :key="tag" class="tag badge badge-secondary">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more-section">
      <button @click="loadMore" :disabled="loading" class="btn btn-primary load-more-btn">
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
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
      recordUsage,
      query
    } = usePasswordEntries()

    // 本地状态
    const searchKeyword = ref('')
    const selectedCategory = ref<number | ''>('')
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
      // 获取选中的分类名称
      const selectedCategoryName = categoryId ? categories.value.find(c => c.id === categoryId)?.name : '所有分类'
      console.log('选中的分类:', { id: categoryId, name: selectedCategoryName })
      // 打印当前分类列表
      console.log('当前分类列表:', categories.value.map(c => ({ id: c.id, name: c.name })))
      filterByCategory(categoryId)
    }

    // 收藏筛选
  const handleFavoriteFilter = () => {
    // 切换收藏筛选状态
    filterFavorites(query.favorite === true ? undefined : true);
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
        if (response.code === 1 && response.data) {
          categories.value = response.data
          console.log('API返回的分类数据:', response.data)
          // 保存分类映射，便于调试
          const categoryMap = response.data.reduce((map: any, category: any) => {
            map[category.id] = category.name
            return map
          }, {})
          console.log('分类ID映射表:', categoryMap)
          // 将分类映射保存到localStorage，便于在其他组件中查看
          localStorage.setItem('categoryMap', JSON.stringify(categoryMap))
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

    // 从URL获取分类ID参数
    const getCategoryIdFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const categoryIdStr = urlParams.get('categoryId')
      if (categoryIdStr && !isNaN(Number(categoryIdStr))) {
        return Number(categoryIdStr)
      }
      return undefined
    }

    // 处理URL参数中的分类过滤
    const handleUrlCategoryFilter = async () => {
      const categoryId = getCategoryIdFromUrl()
      if (categoryId !== undefined) {
        console.log('从URL参数检测到分类ID:', categoryId)
        // 设置选中的分类
        selectedCategory.value = categoryId
        // 应用分类过滤
        await filterByCategory(categoryId)
        // 刷新数据
        await refresh()
        console.log('自动应用分类过滤:', categoryId)
      }
    }

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
        
        // 处理URL中的分类参数
        await handleUrlCategoryFilter()
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
      sortOption,
      categories,
      scrollContainer,
      query,

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
  padding: var(--spacing-xl);
}

.search-filter-bar {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  align-items: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.search-filter-bar:hover {
  box-shadow: var(--shadow-lg);
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 300px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.search-input {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  font-size: var(--text-base);
  outline: none;
  transition: all var(--transition-fast);
  background: transparent;
}

.search-input:focus {
  box-shadow: none;
}

.search-btn {
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  background: var(--primary-500);
  color: white;
  border: none;
  padding: 0 var(--spacing-lg);
  transition: all 0.3s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-600);
  transform: scale(1.05);
}

.filter-controls {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.category-filter,
.sort-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: var(--text-sm);
  min-width: 120px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.category-filter:hover,
.sort-select:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-md);
}

.category-filter:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.favorite-filter {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
}

.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-2xl);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  text-align: left;
  justify-content: center;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--error-500);
  stroke-width: 1.5;
  flex-shrink: 0;
}

.error-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-xs);
  color: var(--error-800);
}

.error-description {
  color: var(--error-600);
  margin: 0;
  font-size: var(--text-base);
}

.retry-btn,
.add-first-btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.retry-btn:hover,
.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.7;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  color: var(--secondary-900);
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-description {
  color: var(--secondary-500);
  margin-bottom: var(--spacing-xl);
  font-size: var(--text-lg);
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.entry-card {
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.entry-card:hover::before {
  left: 100%;
}

.entry-card:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.entry-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  position: relative;
  z-index: 1;
}

.entry-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-lg);
  color: white;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.entry-card:hover .entry-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-lg);
}

.entry-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.entry-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--spacing-xs);
  color: var(--secondary-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.entry-card:hover .entry-title {
  color: var(--primary-600);
}

.entry-username {
  font-size: var(--text-sm);
  color: var(--secondary-500);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.entry-card:hover .entry-username {
  color: var(--secondary-700);
}

.entry-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
  opacity: 0.7;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.entry-card:hover .entry-actions {
  opacity: 1;
}

.entry-actions .btn-icon {
  width: 36px;
  height: 36px;
  padding: var(--spacing-sm);
  transition: all 0.3s ease;
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--secondary-600);
}

.entry-actions .btn-icon:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.entry-actions .favorite-btn:hover {
  background: var(--warning-50);
  color: var(--warning-600);
  border-color: var(--warning-200);
}

.entry-actions .copy-btn:hover {
  background: var(--success-50);
  color: var(--success-600);
  border-color: var(--success-200);
}

.entry-actions .edit-btn:hover {
  background: var(--primary-50);
  color: var(--primary-600);
  border-color: var(--primary-200);
}

.entry-actions .delete-btn:hover:not(:disabled) {
  background: var(--error-50);
  color: var(--error-700);
  border-color: var(--error-200);
}

.entry-actions svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.entry-details {
  font-size: var(--text-sm);
  color: var(--secondary-600);
  position: relative;
  z-index: 1;
}

.entry-url {
  margin-bottom: var(--spacing-sm);
  word-break: break-all;
}

.entry-url a {
  color: var(--primary-600);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-weight: var(--font-medium);
}

.entry-url a:hover {
  color: var(--primary-800);
  text-decoration: underline;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-xs);
}

.entry-meta .usage-count {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
}

.entry-meta .last-used {
  color: var(--secondary-500);
}

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  font-size: var(--text-xs);
  padding: var(--spacing-xxs) var(--spacing-sm);
  background: var(--bg-primary);
  color: var(--secondary-600);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  transition: all 0.3s ease;
}

.tag:hover {
  background: var(--primary-50);
  color: var(--primary-600);
  border-color: var(--primary-200);
  transform: scale(1.05);
}

.load-more-section {
  text-align: center;
  margin: var(--spacing-2xl) 0;
}

.load-more-btn {
  padding: var(--spacing-md) var(--spacing-3xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

.pagination-info {
  text-align: center;
  color: var(--secondary-500);
  font-size: var(--text-sm);
  padding: var(--spacing-lg) 0;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
  margin: 0 var(--spacing-xl);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .password-entries-list {
    padding: var(--spacing-lg);
  }

  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: var(--spacing-lg);
  }

  .search-box {
    min-width: auto;
  }

  .filter-controls {
    justify-content: space-between;
  }

  .entries-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .entry-header {
    flex-wrap: wrap;
  }

  .entry-actions {
    order: 3;
    width: 100%;
    justify-content: flex-end;
    margin-top: var(--spacing-sm);
  }
  
  .entry-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
  }
  
  .empty-title {
    font-size: var(--text-2xl);
  }
  
  .empty-icon {
    font-size: 4rem;
  }
}
</style>