<template>
  <div class="categories-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>分类管理</h1>
            <p>组织和管理您的密码分类</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="showAddModal = true" class="add-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            添加分类
          </button>
        </div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div class="categories-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ categoriesList.length }}</div>
          <div class="stat-label">总分类数</div>
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
          <div class="stat-number">{{ totalPasswordsCount }}</div>
          <div class="stat-label">总密码数</div>
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
          <div class="stat-number">{{ recentlyUpdated }}</div>
          <div class="stat-label">最近更新</div>
        </div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="categories-section">
      <div class="section-header">
        <h2>所有分类</h2>
        <div class="view-options">
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
          </button>
        </div>
      </div>

      <div v-if="loadingCategories" class="loading-state">
        <div class="loading-spinner">
          <svg class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
        <p>正在加载分类...</p>
      </div>

      <div v-else-if="categories.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <p>暂无分类</p>
        <button @click="showAddModal = true" class="add-category-btn">
          添加第一个分类
        </button>
      </div>

      <div v-else class="categories-grid" :class="{ 'list-view': viewMode === 'list' }">
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

          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <p>{{ category.description || '暂无描述' }}</p>
          </div>

          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">{{ category.passwordCount }}</span>
              <span class="stat-label">个密码</span>
            </div>
            <div class="stat-item">
              <span class="stat-time">{{ category.lastUpdated }}</span>
            </div>
          </div>

          <div class="category-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: Math.min((category.passwordCount / 20) * 100, 100) + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ Math.min(category.passwordCount, 20) }}/20</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类模态框 -->
    <Transition name="modal">
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ showEditModal ? '编辑分类' : '添加分类' }}</h3>
            <button @click="closeModals" class="close-btn">
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

            <!-- 图标和颜色（并排显示） -->
            <div class="form-row">
              <div class="form-group flex-1">
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

              <div class="form-group flex-1">
                <label class="form-label">主题颜色</label>
                <div class="color-selector">
                  <div 
                    v-for="color in presetColors" 
                    :key="color.value"
                    class="color-option"
                    :class="{ selected: form.color === color.value }"
                    :style="{ backgroundColor: color.value }"
                    @click="form.color = color.value; customColor = color.value"
                    :title="color.name"
                  >
                    <svg v-if="form.color === color.value" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div class="color-custom">
                    <input 
                      type="color" 
                      v-model="customColor" 
                      @input="form.color = customColor"
                      class="color-picker"
                      title="自定义颜色"
                    />
                    <span class="color-custom-label">自定义</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 排序和默认设置（并排显示） -->
            <div class="form-row">
              <div class="form-group flex-1">
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

              <div class="form-group flex-1">
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

            <!-- 预览 -->
            <div class="form-group">
              <label class="form-label">预览</label>
              <div class="category-preview">
                <div 
                  class="preview-card"
                  :style="{ 
                    borderLeftColor: form.color || '#6366f1',
                    backgroundColor: form.color ? `${form.color}15` : 'transparent'
                  }"
                >
                  <div class="preview-icon">{{ form.icon }}</div>
                  <div class="preview-content">
                    <div class="preview-name">{{ form.name || '分类名称' }}</div>
                    <div class="preview-desc">{{ form.description || '分类描述' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModals" class="cancel-btn">
                取消
              </button>
              <button type="submit" class="submit-btn" :disabled="loading || !form.name.trim()">
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

    <!-- 成功提示 -->
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
import { useCategories, type Category, type CategoryForm } from '../../composables/useCategories'
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
        color: '#6366f1',
        sortOrder: undefined,
        isDefault: false
      } as CategoryForm,

      // 预设颜色
      presetColors: [
        { name: '蓝色', value: '#6366f1' },
        { name: '绿色', value: '#10b981' },
        { name: '红色', value: '#ef4444' },
        { name: '黄色', value: '#f59e0b' },
        { name: '紫色', value: '#8b5cf6' },
        { name: '粉色', value: '#ec4899' },
        { name: '青色', value: '#06b6d4' },
        { name: '橙色', value: '#f97316' },
        { name: '灰色', value: '#6b7280' },
        { name: '靛蓝', value: '#4f46e5' }
      ],

      customColor: '#6366f1'
    }
  },
  watch: {
    'form.color'(newColor) {
      // 如果颜色不在预设列表中，同步到自定义颜色选择器
      const isPresetColor = this.presetColors.some(c => c.value === newColor)
      if (!isPresetColor && newColor) {
        this.customColor = newColor
      }
    }
  },
  mounted() {
    this.handleLoadCategories()
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
        color: '#6366f1', // TODO: 从API获取颜色信息
        sortOrder: undefined, // TODO: 从API获取排序信息
        isDefault: false // TODO: 从API获取默认状态
      }
      this.customColor = this.form.color || '#6366f1'
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
          // 使用 composable 创建分类（会自动刷新列表）
          const result = await this.createCategory(this.form)
          
          if (result.success) {
            this.showToastMessage(result.message || '分类创建成功')
            this.closeModals()
            // createCategory 内部已经调用了 loadCategories，无需再次调用
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
        color: '#6366f1',
        sortOrder: undefined,
        isDefault: false
      }
      this.customColor = '#6366f1'
    },

    // 加载分类列表（使用 composable 的方法）
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
.categories-container {
  padding: var(--spacing-2xl);
  background: transparent;
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* 页面头部 */
.page-header {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.header-text h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.header-text p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--text-base);
}

.add-btn {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm), 0 2px 10px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.add-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.add-btn:hover::before {
  width: 300px;
  height: 300px;
}

.add-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-lg), 0 4px 20px rgba(99, 102, 241, 0.4);
}

.add-btn svg {
  transition: transform 0.3s ease;
}

.add-btn:hover svg {
  transform: rotate(90deg) scale(1.2);
}

/* 分类统计 */
.categories-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-500);
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: block;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 分类部分 */
.categories-section {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.section-header h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.view-options {
  display: flex;
  gap: var(--spacing-1);
  background: var(--bg-secondary);
  padding: var(--spacing-1);
  border-radius: var(--radius-md);
}

.view-btn {
  background: none;
  border: none;
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.view-btn:hover {
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--bg-primary);
  color: var(--primary-500);
  box-shadow: var(--shadow-sm);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-5);
}

.categories-grid.list-view {
  grid-template-columns: 1fr;
}

.categories-grid.list-view .category-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
}

.categories-grid.list-view .category-header {
  margin-bottom: 0;
}

.categories-grid.list-view .category-info {
  flex: 1;
  margin-bottom: 0;
}

.categories-grid.list-view .category-stats {
  margin-top: 0;
  border-top: none;
  padding-top: 0;
}

.categories-grid.list-view .category-progress {
  margin-top: 0;
}

.category-card {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm), 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
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
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600), var(--primary-500));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shadow-lg), 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-300);
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.category-icon {
  font-size: var(--text-2xl);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card:hover .category-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-400);
}

.category-actions {
  display: flex;
  gap: var(--spacing-2);
  opacity: 0;
  transition: opacity 0.2s;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  color: var(--text-secondary);
}

.edit-btn:hover {
  background: var(--primary-50);
  color: var(--primary-500);
}

.delete-btn:hover {
  background: var(--danger-50);
  color: var(--danger-500);
}

.category-info h3 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.category-info p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: var(--text-sm);
}

.category-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-5);
  padding-top: var(--spacing-5);
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.category-stats .stat-number {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.category-stats .stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.stat-time {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.category-progress {
  margin-top: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
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
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: var(--spacing-1);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.modal-body {
  padding: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-5);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.form-label .required {
  color: var(--danger-500);
  margin-left: 2px;
}

.form-label .label-hint {
  font-weight: var(--font-normal);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  margin-left: var(--spacing-1);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: border-color 0.2s;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.char-count {
  text-align: right;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-lg);
  transition: all 0.2s;
  background: var(--bg-primary);
}

.icon-option:hover {
  border-color: var(--border-hover);
  background: var(--bg-secondary);
}

.icon-option.selected {
  border-color: var(--primary-500);
  background: var(--primary-50);
  transform: scale(1.05);
}

/* 表单行布局 */
.form-row {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.form-row .form-group {
  margin-bottom: 0;
}

.flex-1 {
  flex: 1;
}

/* 颜色选择器 */
.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-option.selected {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-primary), 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.color-option .check-icon {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.color-custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.color-picker {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  padding: 0;
  background: none;
  overflow: hidden;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: var(--radius-sm);
}

.color-custom-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
}

/* 开关样式 */
.toggle-group {
  padding: var(--spacing-2) 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
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
  width: 44px;
  height: 24px;
  background-color: var(--bg-tertiary);
  border-radius: 24px;
  transition: all 0.3s;
  border: 2px solid var(--border-color);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  top: 1px;
  left: 1px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-500);
  border-color: var(--primary-500);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

/* 分类预览 */
.category-preview {
  margin-top: var(--spacing-2);
}

.preview-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  border-left: 4px solid;
  transition: all 0.2s;
}

.preview-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  margin-top: var(--spacing-6);
}

.cancel-btn,
.submit-btn {
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.submit-btn {
  background: var(--primary-500);
  color: white;
  border: 1px solid var(--primary-500);
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-600);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 提示消息 */
.toast {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4) var(--spacing-5);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  z-index: 1000;
  min-width: 300px;
}

.toast.success {
  border-color: var(--success-500);
  color: var(--success-700);
}

.toast.success .icon {
  color: var(--success-500);
}

.toast.error {
  border-color: var(--danger-500);
  color: var(--danger-700);
}

.toast.error .icon {
  color: var(--danger-500);
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
  transform: scale(0.9) translateY(-20px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  min-height: 300px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-4);
}

.loading-spinner .icon {
  width: 100%;
  height: 100%;
  color: var(--primary-500);
}

.loading-state p {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  min-height: 300px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-4);
}

.empty-state p {
  color: var(--text-secondary);
  font-size: var(--text-lg);
  margin-bottom: var(--spacing-6);
}

.add-category-btn {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: var(--font-semibold);
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.add-category-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .categories-container {
    padding: var(--spacing-4);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }

  .categories-stats {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-stats {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: flex-start;
  }

  .icon-selector {
    grid-template-columns: repeat(6, 1fr);
  }

  .form-row {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .color-selector {
    justify-content: flex-start;
  }

  .preview-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-content {
    margin: var(--spacing-4);
    width: auto;
  }

  .toast {
    right: var(--spacing-4);
    left: var(--spacing-4);
    min-width: auto;
  }
}
</style>