<template>
  <div class="categories-page">
    <header class="page-header card">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <div class="title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            分类管理
          </h1>
          <p class="page-subtitle">组织和管理您的密码分类，让密码管理更加有序</p>
        </div>
        <div class="header-actions">
          <button @click="showAddModal = true" class="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            添加分类
          </button>
        </div>
      </div>
    </header>

    <div class="stats-section">
      <div class="stat-card card">
        <div class="stat-icon teal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ categoriesList.length }}</div>
          <div class="stat-label">总分类数</div>
        </div>
        <div class="stat-decoration"></div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ totalPasswordsCount }}</div>
          <div class="stat-label">总密码数</div>
        </div>
        <div class="stat-decoration"></div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon sky">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ recentlyUpdated }}</div>
          <div class="stat-label">最近更新</div>
        </div>
        <div class="stat-decoration"></div>
      </div>
    </div>

    <div class="action-bar card">
      <div class="view-controls">
        <button @click="viewMode = 'grid'" class="view-btn" :class="{ active: viewMode === 'grid' }">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          网格
        </button>
        <button @click="viewMode = 'list'" class="view-btn" :class="{ active: viewMode === 'list' }">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          列表
        </button>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加分类
      </button>
    </div>

    <div class="content-section card">
      <div class="section-header">
        <h2 class="section-title">所有分类</h2>
        <div class="section-subtitle">{{ categoriesList.length }} 个分类</div>
      </div>

      <div v-if="loadingCategories" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">正在加载分类...</p>
      </div>

      <div v-else-if="categories.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <h3 class="empty-title">暂无分类</h3>
        <p class="empty-description">创建您的第一个分类，开始有序管理密码</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          创建第一个分类
        </button>
      </div>

      <div v-else :class="['categories-container', { 'list-view': viewMode === 'list' }]">
        <div v-for="category in categories" :key="category.id" class="category-card" @click="viewCategory(category)">
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
    </div>

    <Transition name="modal">
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>{{ showEditModal ? '编辑分类' : '添加分类' }}</h3>
            <button @click="closeModals" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label class="form-label">
                分类名称 <span class="required">*</span>
              </label>
              <input v-model="form.name" type="text" required class="form-input" placeholder="输入分类名称" maxlength="20" />
            </div>

            <div class="form-group">
              <label class="form-label">图标</label>
              <div class="icon-selector">
                <div v-for="icon in availableIcons" :key="icon" class="icon-option" :class="{ selected: form.icon === icon }" @click="form.icon = icon">
                  {{ icon }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="添加分类描述（可选）..." maxlength="100"></textarea>
              <div class="char-count">{{ (form.description || '').length }}/100</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  排序顺序
                  <span class="label-hint">（数字越小越靠前）</span>
                </label>
                <input v-model.number="form.sortOrder" type="number" class="form-input" placeholder="0" min="0" max="999" />
              </div>
              
              <div class="form-group">
                <label class="form-label">设置</label>
                <div class="toggle-group">
                  <label class="toggle-label">
                    <input type="checkbox" v-model="form.isDefault" class="toggle-input" />
                    <span class="toggle-slider"></span>
                    <span class="toggle-text">设为默认分类</span>
                  </label>
                </div>
              </div>
            </div>

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
              <button type="button" @click="closeModals" class="btn btn-secondary">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="loading || !form.name.trim()">
                <div v-if="loading" class="loading-spinner"></div>
                {{ loading ? '保存中...' : (showEditModal ? '更新' : '添加') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

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
    categoriesList(): Category[] {
      return this.categories
    },
    loadingCategories(): boolean {
      return this.loading
    },
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
      this.$router.push({
        path: '/passwords',
        query: { categoryId: category.id.toString() }
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
          const result = await this.updateCategory(this.editingCategory.id, this.form)
          if (result.success) {
            this.showToastMessage(result.message || '分类更新成功')
            this.closeModals()
          } else {
            this.showToastMessage(result.message || '更新分类失败', 'error')
          }
        } else {
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
.categories-page {
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: rgba(255, 255, 255, 0.9);
}

.view-controls {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--gray-100);
  padding: 6px;
  border-radius: var(--radius-full);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-600);
  transition: all var(--transition-fast);
}

.view-btn:hover {
  color: var(--gray-900);
  background: rgba(255, 255, 255, 0.5);
}

.view-btn.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.view-btn .icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.content-section {
  padding: var(--spacing-2xl);
  border: none;
  background: rgba(255, 255, 255, 0.9);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
}

.section-subtitle {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5xl);
  text-align: center;
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

.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.categories-container.list-view {
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

.category-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-normal);
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
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(20, 184, 166, 0.15);
  border-color: var(--primary-300);
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.category-icon {
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

.category-card:hover .category-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.2);
}

.category-actions {
  display: flex;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.category-card:hover .category-actions {
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

.edit-btn:hover {
  background: var(--primary-50);
  color: var(--primary-600);
}

.delete-btn:hover {
  background: var(--error-50);
  color: var(--error-600);
}

.action-btn .icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.category-content {
  margin-bottom: var(--spacing-lg);
}

.category-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.category-description {
  color: var(--gray-500);
  font-size: var(--text-sm);
  line-height: 1.6;
  font-weight: var(--font-medium);
}

.category-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.meta-item .icon {
  width: 14px;
  height: 14px;
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
  background: var(--gray-100);
  color: var(--gray-700);
  border: 2px solid var(--gray-200);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--gray-200);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: var(--radius-3xl);
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-border);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-bottom: 1px solid var(--gray-200);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.35);
}

.header-icon svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 2;
}

.modal-header h3 {
  flex: 1;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0;
}

.close-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--gray-500);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--error-500);
  border-color: var(--error-500);
  color: white;
  transform: scale(1.05);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.modal-body {
  padding: var(--spacing-2xl);
}

.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  font-size: var(--text-sm);
}

.required {
  color: var(--error-500);
}

.label-hint {
  font-weight: var(--font-normal);
  color: var(--gray-500);
  font-size: var(--text-xs);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: white;
  color: var(--gray-800);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--gray-400);
  font-weight: var(--font-normal);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.6;
}

.char-count {
  font-size: var(--text-xs);
  color: var(--gray-500);
  text-align: right;
  margin-top: var(--spacing-xs);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
}

.icon-option {
  width: 40px;
  height: 40px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: var(--text-lg);
  transition: all var(--transition-fast);
  background: white;
}

.icon-option:hover {
  border-color: var(--primary-500);
  background: var(--primary-50);
  transform: scale(1.1);
}

.icon-option.selected {
  border-color: var(--primary-500);
  background: var(--gradient-primary);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.toggle-group {
  padding: var(--spacing-sm) 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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
  width: 48px;
  height: 26px;
  background-color: var(--gray-300);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 3px;
  left: 3px;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-500);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.toggle-text {
  font-size: var(--text-sm);
  color: var(--gray-700);
  font-weight: var(--font-medium);
}

.category-preview {
  margin-top: var(--spacing-sm);
}

.preview-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.preview-icon {
  font-size: 1.5rem;
  background: white;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview-content {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-xs);
}

.preview-desc {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: var(--font-medium);
}

.modal-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-top: 1px solid var(--gray-200);
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.modal-footer .btn {
  flex: 1;
  justify-content: center;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-sm);
}

.toast {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg) var(--spacing-xl);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  z-index: 10000;
  min-width: 280px;
}

.toast.success {
  border-left: 4px solid var(--success-500);
}

.toast.success .icon {
  color: var(--success-500);
}

.toast.error {
  border-left: 4px solid var(--error-500);
}

.toast.error .icon {
  color: var(--error-500);
}

.toast .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .header-actions {
    width: 100%;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .view-controls {
    width: 100%;
    justify-content: center;
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
    margin: var(--spacing-md);
  }

  .modal-footer {
    flex-direction: column;
  }

  .toast {
    left: var(--spacing-md);
    right: var(--spacing-md);
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--text-2xl);
  }

  .icon-selector {
    grid-template-columns: repeat(5, 1fr);
  }

  .category-card {
    padding: var(--spacing-lg);
  }

  .category-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
}
</style>
