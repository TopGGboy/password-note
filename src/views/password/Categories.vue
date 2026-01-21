<template>
  <div class="categories-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-breadcrumb">
          <span class="breadcrumb-item">密码管理</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">分类管理</span>
        </div>
        <h1 class="page-title">分类管理</h1>
        <p class="page-description">组织和管理您的密码分类，让密码管理更加有序</p>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="view-controls">
          <button 
            @click="viewMode = 'grid'" 
            class="view-btn" 
            :class="{ active: viewMode === 'grid' }"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            网格视图
          </button>
          <button 
            @click="viewMode = 'list'" 
            class="view-btn" 
            :class="{ active: viewMode === 'list' }"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            列表视图
          </button>
        </div>
        <button @click="showAddModal = true" class="primary-btn add-btn">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加分类
        </button>
      </div>

      <!-- 统计卡片 -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-title">总分类数</h3>
              <p class="stat-value">{{ categoriesList.length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-title">总密码数</h3>
              <p class="stat-value">{{ totalPasswordsCount }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-title">最近更新</h3>
              <p class="stat-value">{{ recentlyUpdated }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类列表 -->
      <section class="categories-section">
        <div class="section-header">
          <h2 class="section-title">所有分类</h2>
          <div class="section-subtitle">{{ categoriesList.length }} 个分类</div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingCategories" class="loading-state">
          <div class="loading-spinner">
            <svg class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
          <p class="loading-text">正在加载分类...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="categories.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3 class="empty-title">暂无分类</h3>
          <p class="empty-description">创建您的第一个分类，开始有序管理密码</p>
          <button @click="showAddModal = true" class="primary-btn empty-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            创建第一个分类
          </button>
        </div>

        <!-- 分类网格 -->
        <div v-else :class="['categories-container', { 'list-view': viewMode === 'list' }]">
          <div 
            v-for="category in categories" 
            :key="category.id" 
            class="category-card"
            @click="viewCategory(category)"
          >
            <div class="category-header">
              <div class="category-icon">{{ category.icon }}</div>
              <div class="category-actions">
                <button @click.stop="editCategory(category)" class="action-btn edit-btn">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button @click.stop="handleDeleteCategory(category)" class="action-btn delete-btn">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="category-content">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description || '暂无描述' }}</p>
            </div>
            
            <div class="category-meta">
              <div class="meta-item">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>{{ category.passwordCount }} 个密码</span>
              </div>
              <div class="meta-item">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>{{ category.lastUpdated }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 添加/编辑分类模态框 -->
    <Transition name="modal">
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ showEditModal ? '编辑分类' : '添加分类' }}</h3>
            <button @click="closeModals" class="modal-close">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- 分类名称 -->
            <div class="form-group">
              <label class="form-label">
                分类名称 <span class="required">*</span>
              </label>
              <input 
                v-model="form.name" 
                type="text" 
                required 
                class="form-input" 
                placeholder="输入分类名称"
                maxlength="20"
              />
            </div>

            <!-- 图标选择 -->
            <div class="form-group">
              <label class="form-label">图标</label>
              <div class="icon-selector">
                <div 
                  v-for="icon in availableIcons" 
                  :key="icon" 
                  class="icon-option"
                  :class="{ selected: form.icon === icon }" 
                  @click="form.icon = icon"
                  :title="icon"
                >
                  {{ icon }}
                </div>
              </div>
            </div>

            <!-- 描述 -->
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea 
                v-model="form.description" 
                class="form-textarea" 
                rows="3" 
                placeholder="添加分类描述（可选）..."
                maxlength="100"
              ></textarea>
              <div class="char-count">{{ (form.description || '').length }}/100</div>
            </div>

            <!-- 排序和默认设置 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  排序顺序
                  <span class="label-hint">（数字越小越靠前）</span>
                </label>
                <input 
                  v-model.number="form.sortOrder" 
                  type="number" 
                  class="form-input" 
                  placeholder="0"
                  min="0"
                  max="999"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">设置</label>
                <div class="toggle-group">
                  <label class="toggle-label">
                    <input 
                      type="checkbox" 
                      v-model="form.isDefault"
                      class="toggle-input"
                    />
                    <span class="toggle-slider"></span>
                    <span class="toggle-text">设为默认分类</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 预览 -->
            <div class="form-group">
              <label class="form-label">预览</label>
              <div class="category-preview">
                <div class="preview-card">
                  <div class="preview-icon">{{ form.icon }}</div>
                  <div class="preview-content">
                    <div class="preview-name">{{ form.name || '分类名称' }}</div>
                    <div class="preview-desc">{{ form.description || '分类描述' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModals" class="secondary-btn">
                取消
              </button>
              <button type="submit" class="primary-btn" :disabled="loading || !form.name.trim()">
                <svg v-if="loading" class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {{ loading ? '保存中...' : (showEditModal ? '更新' : '添加') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- 提示消息 -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <svg v-if="toastType === 'success'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCategories, type Category } from '../../composables/useCategories'
import { CATEGORY_ICONS, getDefaultCategoryIcon } from '../../utils/categoryUtils'

export default defineComponent({
  name: 'Categories',
  setup() {
    // 使用分类管理的 composable
    const categoriesComposable = useCategories()

    return {
      ...categoriesComposable,
      availableIcons: CATEGORY_ICONS
    }
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      editingCategory: null as Category | null,
      viewMode: 'grid' as 'grid' | 'list',
      
      showToast: false,
      toastMessage: '',
      toastType: 'success' as 'success' | 'error',

      form: {
        name: '',
        icon: getDefaultCategoryIcon(),
        description: '',
        sortOrder: undefined,
        isDefault: false
      },
    }
  },
  computed: {
    // 从 composable 获取分类列表
    categoriesList(): Category[] {
      return this.categories
    },
    // 从 composable 获取加载状态
    loadingCategories(): boolean {
      return this.loading
    },
    // 从 composable 获取总数
    totalPasswordsCount(): number {
      return this.totalPasswords
    },
    recentlyUpdated(): number {
      return this.categories.filter(cat => 
        cat.lastUpdated.includes('小时') || cat.lastUpdated.includes('天前')
      ).length
    }
  },
  mounted() {
    this.handleLoadCategories()
  },
  methods: {
    viewCategory(category: Category) {
      // 跳转到该分类的密码列表
      this.$router.push({
        path: '/passwords',
        query: { category: category.name }
      })
    },

    editCategory(category: Category) {
      this.editingCategory = category
      this.form = {
        name: category.name,
        icon: category.icon,
        description: category.description,
        sortOrder: undefined,
        isDefault: false
      }
      this.showEditModal = true
    },

    async handleDeleteCategory(category: Category) {
      if (category.passwordCount > 0) {
        if (!confirm(`分类 "${category.name}" 中还有 ${category.passwordCount} 个密码。删除分类后，这些密码将移动到"未分类"。确定要删除吗？`)) {
          return
        }
      } else {
        if (!confirm(`确定要删除分类 "${category.name}" 吗？`)) {
          return
        }
      }

      try {
        const result = await this.deleteCategory(category.id)
        if (result.success) {
          this.showToastMessage(result.message || '分类已删除')
        } else {
          this.showToastMessage(result.message || '删除分类失败', 'error')
        }
      } catch (error) {
        console.error('删除分类失败:', error)
        this.showToastMessage('删除分类失败，请重试', 'error')
      }
    },

    async handleSubmit() {
      if (!this.form.name.trim()) return

      try {
        if (this.showEditModal && this.editingCategory) {
          // 更新分类功能暂未实现（后端接口暂无）
          this.showToastMessage('编辑分类功能暂未实现', 'error')
          return
        } else {
          // 使用 composable 创建分类
          const result = await this.createCategory(this.form)
          
          if (result.success) {
            this.showToastMessage(result.message || '分类创建成功')
            this.closeModals()
          } else {
            this.showToastMessage(result.message || '创建分类失败', 'error')
          }
        }
      } catch (error: any) {
        console.error('保存分类失败:', error)
        const errorMessage = error?.message || '保存分类失败，请重试'
        this.showToastMessage(errorMessage, 'error')
      }
    },

    closeModals() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingCategory = null
      this.form = {
        name: '',
        icon: getDefaultCategoryIcon(),
        description: '',
        sortOrder: undefined,
        isDefault: false
      }
    },

    // 加载分类列表
    async handleLoadCategories() {
      const success = await this.loadCategories()
      if (!success && this.error) {
        this.showToastMessage(this.error, 'error')
      }
    },

    showToastMessage(message: string, type: 'success' | 'error' = 'success') {
      this.toastMessage = message
      this.toastType = type
      this.showToast = true
      
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    }
  }
})
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 页面布局 */
.categories-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==');
  opacity: 0.1;
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.breadcrumb-item {
  margin: 0 0.5rem;
}

.breadcrumb-item.active {
  font-weight: 600;
}

.breadcrumb-separator {
  opacity: 0.6;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* 主要内容 */
.main-content {
  max-width: 1200px;
  margin: -3rem auto 2rem;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.view-btn:hover {
  color: #374151;
}

.view-btn.active {
  background: white;
  color: #6366f1;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* 按钮样式 */
.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

/* 分类部分 */
.categories-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.loading-spinner .icon {
  width: 100%;
  height: 100%;
  color: #6366f1;
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 300px;
}

/* 分类容器 */
.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.categories-container.list-view {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 分类卡片 */
.category-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #4f46e5);
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.category-icon {
  font-size: 2rem;
  background: white;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: scale(1.1);
}

.edit-btn:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.category-content {
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.category-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-item .icon {
  width: 1rem;
  height: 1rem;
}

/* 模态框 */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.label-hint {
  font-weight: 400;
  color: #6b7280;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  background: white;
  color: #111827;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* 图标选择器 */
.icon-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
}

.icon-option {
  width: 3rem;
  height: 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  background: white;
}

.icon-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.icon-option.selected {
  border-color: #6366f1;
  background: #eff6ff;
}

/* 开关样式 */
.toggle-group {
  padding: 0.5rem 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  width: 3.5rem;
  height: 1.75rem;
  background-color: #e5e7eb;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: white;
  top: 0.25rem;
  left: 0.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background-color: #6366f1;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(1.75rem);
}

.toggle-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

/* 预览卡片 */
.category-preview {
  margin-top: 0.5rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.preview-icon {
  font-size: 1.5rem;
  background: white;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-desc {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 提示消息 */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  min-width: 300px;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.success .icon {
  color: #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.error .icon {
  color: #ef4444;
}

/* 图标样式 */
.icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) translateY(-20px);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 0 1rem;
    margin-top: -2rem;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .view-controls {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .categories-container {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .icon-selector {
    grid-template-columns: repeat(6, 1fr);
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .toast {
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .action-bar {
    padding: 1rem;
  }

  .categories-section {
    padding: 1rem;
  }

  .category-card {
    padding: 1rem;
  }

  .icon-selector {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>