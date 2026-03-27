<template>
  <div class="password-list-container">
    <div class="list-header">
      <div class="search-filter-section">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索密码条目..."
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="filter-controls">
          <select v-model="selectedCategory" @change="handleFilter" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <select v-model="sortBy" @change="handleSort" class="filter-select">
            <option value="updatedAt">最近更新</option>
            <option value="title">名称</option>
            <option value="createdAt">创建时间</option>
          </select>
        </div>
      </div>

      <div class="view-controls">
        <button @click="viewMode = 'grid'" class="view-btn" :class="{ active: viewMode === 'grid' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button @click="viewMode = 'list'" class="view-btn" :class="{ active: viewMode === 'list' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">加载中...</p>
    </div>

    <div v-else-if="filteredEntries.length === 0" class="empty-state">
      <div class="empty-icon">🔐</div>
      <h3 class="empty-title">暂无密码条目</h3>
      <p class="empty-description">点击上方按钮添加您的第一个密码</p>
      <button @click="$emit('add-password')" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加密码
      </button>
    </div>

    <div v-else :class="['entries-grid', { 'list-view': viewMode === 'list' }]">
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="entry-card"
        @click="$emit('view-entry', entry)"
      >
        <div class="entry-header">
          <div class="entry-icon">{{ entry.icon || '🔐' }}</div>
          <div class="entry-actions">
            <button @click.stop="copyPassword(entry)" class="action-btn copy" title="复制密码">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button @click.stop="$emit('edit-entry', entry)" class="action-btn edit" title="编辑">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button @click.stop="deleteEntry(entry)" class="action-btn delete" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="entry-content">
          <h3 class="entry-title">{{ entry.title }}</h3>
          <p class="entry-username">{{ entry.username }}</p>
          <div v-if="entry.url" class="entry-url">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{{ formatUrl(entry.url) }}</span>
          </div>
        </div>

        <div class="entry-footer">
          <div class="entry-category" v-if="entry.categoryName">
            <span class="category-badge">{{ entry.categoryName }}</span>
          </div>
          <div class="entry-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{{ formatDate(entry.updatedAt) }}</span>
          </div>
        </div>

        <div v-if="entry.favorite" class="favorite-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { DecryptedPasswordEntry } from '../../composables/usePasswordEntries'
import type { Category } from '../../types/api'

export default defineComponent({
  name: 'PasswordEntriesList',
  props: {
    entries: {
      type: Array as PropType<DecryptedPasswordEntry[]>,
      required: true
    },
    categories: {
      type: Array as PropType<Category[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-password', 'view-entry', 'edit-entry', 'delete-entry', 'refresh'],
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'updatedAt',
      viewMode: 'grid' as 'grid' | 'list'
    }
  },
  computed: {
    filteredEntries(): DecryptedPasswordEntry[] {
      if (!Array.isArray(this.entries)) {
        return []
      }
      let result = [...this.entries]

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(entry =>
          entry.title.toLowerCase().includes(query) ||
          entry.username.toLowerCase().includes(query) ||
          (entry.url && entry.url.toLowerCase().includes(query))
        )
      }

      if (this.selectedCategory) {
        result = result.filter(entry => entry.categoryId === Number(this.selectedCategory))
      }

      result.sort((a, b) => {
        if (this.sortBy === 'title') {
          return a.title.localeCompare(b.title)
        } else if (this.sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        } else {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
      })

      return result
    }
  },
  methods: {
    handleSearch() {
    },
    clearSearch() {
      this.searchQuery = ''
    },
    handleFilter() {
    },
    handleSort() {
    },
    copyPassword(entry: DecryptedPasswordEntry) {
      navigator.clipboard.writeText(entry.password).then(() => {
        alert('密码已复制到剪贴板')
      }).catch(() => {
        alert('复制失败，请手动复制')
      })
    },
    deleteEntry(entry: DecryptedPasswordEntry) {
      if (confirm(`确定要删除 "${entry.title}" 吗？`)) {
        this.$emit('delete-entry', entry)
      }
    },
    formatDate(date: Date | string): string {
      if (!date) return ''
      const d = new Date(date)
      const now = new Date()
      const diff = now.getTime() - d.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      if (days < 30) return `${Math.floor(days / 7)}周前`
      return d.toLocaleDateString('zh-CN')
    },
    formatUrl(url: string): string {
      try {
        const urlObj = new URL(url)
        return urlObj.hostname
      } catch {
        return url
      }
    }
  }
})
</script>

<style scoped>
.password-list-container {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.search-filter-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--gray-400);
  stroke-width: 2;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
}

.search-input::placeholder {
  color: var(--gray-400);
  font-weight: var(--font-normal);
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--gray-100);
  border: none;
  border-radius: var(--radius-lg);
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: var(--gray-200);
}

.clear-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
  color: var(--gray-500);
}

.filter-controls {
  display: flex;
  gap: var(--spacing-md);
}

.filter-select {
  padding: 10px 36px 10px 14px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  background: white;
  cursor: pointer;
  transition: all var(--transition-normal);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
}

.view-controls {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--gray-100);
  padding: 6px;
  border-radius: var(--radius-full);
}

.view-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all var(--transition-fast);
  color: var(--gray-500);
}

.view-btn:hover {
  color: var(--gray-700);
  background: rgba(255, 255, 255, 0.5);
}

.view-btn.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.view-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5xl);
}

.loading-spinner {
  margin-bottom: var(--spacing-lg);
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

.loading-text {
  color: var(--gray-600);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5xl);
  text-align: center;
  background: var(--gradient-primary-soft);
  border: 2px dashed var(--primary-300);
  border-radius: var(--radius-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.empty-description {
  color: var(--gray-600);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.entries-grid.list-view {
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

.entry-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.entry-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(20, 184, 166, 0.15);
  border-color: var(--primary-300);
}

.entry-card:hover::before {
  transform: scaleX(1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.entry-icon {
  font-size: 2rem;
  background: white;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all var(--transition-normal);
}

.entry-card:hover .entry-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.2);
}

.entry-actions {
  display: flex;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.entry-card:hover .entry-actions {
  opacity: 1;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.copy:hover {
  background: var(--primary-50);
  color: var(--primary-600);
}

.action-btn.edit:hover {
  background: var(--secondary-50);
  color: var(--secondary-600);
}

.action-btn.delete:hover {
  background: var(--error-50);
  color: var(--error-600);
}

.action-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.entry-content {
  margin-bottom: var(--spacing-lg);
}

.entry-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-username {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-medium);
}

.entry-url {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.entry-url svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.entry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  background: var(--primary-100);
  color: var(--primary-700);
}

.entry-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.entry-date svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.favorite-badge {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 24px;
  height: 24px;
  color: var(--secondary-500);
}

.favorite-badge svg {
  width: 100%;
  height: 100%;
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
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
}

.btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .search-filter-section {
    flex-direction: column;
    width: 100%;
    min-width: auto;
  }

  .search-box {
    max-width: none;
    width: 100%;
  }

  .filter-controls {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .view-controls {
    align-self: flex-end;
  }

  .entries-grid {
    grid-template-columns: 1fr;
  }
}
</style>
