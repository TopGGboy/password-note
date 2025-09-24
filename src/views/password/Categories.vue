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
          <div class="stat-number">{{ categories.length }}</div>
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
          <div class="stat-number">{{ totalPasswords }}</div>
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

      <div class="categories-grid" :class="{ 'list-view': viewMode === 'list' }">
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
              <button @click.stop="deleteCategory(category)" class="action-btn delete-btn">
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
            <div class="form-group">
              <label>分类名称 *</label>
              <input 
                v-model="form.name" 
                type="text" 
                required 
                class="form-input" 
                placeholder="输入分类名称"
                maxlength="20"
              />
            </div>

            <div class="form-group">
              <label>图标</label>
              <div class="icon-selector">
                <div 
                  v-for="icon in availableIcons" 
                  :key="icon" 
                  class="icon-option"
                  :class="{ selected: form.icon === icon }" 
                  @click="form.icon = icon"
                >
                  {{ icon }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>描述</label>
              <textarea 
                v-model="form.description" 
                class="form-textarea" 
                rows="3" 
                placeholder="添加分类描述..."
                maxlength="100"
              ></textarea>
              <div class="char-count">{{ form.description.length }}/100</div>
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

interface Category {
  id: string
  name: string
  icon: string
  description: string
  passwordCount: number
  lastUpdated: string
}

interface CategoryForm {
  name: string
  icon: string
  description: string
}

export default defineComponent({
  name: 'Categories',
  data() {
    return {
      loading: false,
      showAddModal: false,
      showEditModal: false,
      editingCategory: null as Category | null,
      viewMode: 'grid' as 'grid' | 'list',
      
      showToast: false,
      toastMessage: '',
      toastType: 'success' as 'success' | 'error',

      form: {
        name: '',
        icon: '📁',
        description: ''
      } as CategoryForm,

      availableIcons: [
        '📁', '🔐', '💼', '🏦', '🛒', '📧', '🎮', '📱',
        '💻', '🌐', '🎵', '📺', '🏠', '🚗', '✈️', '🏥',
        '🎓', '💳', '🔧', '📚', '🎨', '🏃', '🍔', '☕'
      ],

      categories: [
        {
          id: '1',
          name: '社交媒体',
          icon: '📱',
          description: '各种社交平台账户',
          passwordCount: 8,
          lastUpdated: '2天前'
        },
        {
          id: '2',
          name: '邮箱',
          icon: '📧',
          description: '邮箱服务账户',
          passwordCount: 5,
          lastUpdated: '1周前'
        },
        {
          id: '3',
          name: '购物',
          icon: '🛒',
          description: '电商和购物网站',
          passwordCount: 12,
          lastUpdated: '3天前'
        },
        {
          id: '4',
          name: '银行',
          icon: '🏦',
          description: '银行和金融服务',
          passwordCount: 3,
          lastUpdated: '1天前'
        },
        {
          id: '5',
          name: '工作',
          icon: '💼',
          description: '工作相关账户',
          passwordCount: 15,
          lastUpdated: '5小时前'
        },
        {
          id: '6',
          name: '娱乐',
          icon: '🎮',
          description: '游戏和娱乐平台',
          passwordCount: 7,
          lastUpdated: '1周前'
        }
      ] as Category[]
    }
  },
  computed: {
    totalPasswords(): number {
      return this.categories.reduce((sum, cat) => sum + cat.passwordCount, 0)
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
        description: category.description
      }
      this.showEditModal = true
    },

    async deleteCategory(category: Category) {
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
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))

        this.categories = this.categories.filter(c => c.id !== category.id)
        this.showToastMessage('分类已删除')
      } catch (error) {
        console.error('删除分类失败:', error)
        this.showToastMessage('删除分类失败，请重试', 'error')
      }
    },

    async handleSubmit() {
      if (!this.form.name.trim()) return

      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (this.showEditModal && this.editingCategory) {
          // 更新分类
          const index = this.categories.findIndex(c => c.id === this.editingCategory!.id)
          if (index !== -1) {
            this.categories[index] = {
              ...this.categories[index],
              name: this.form.name,
              icon: this.form.icon,
              description: this.form.description
            }
          }
          this.showToastMessage('分类已更新')
        } else {
          // 添加新分类
          const newCategory: Category = {
            id: Date.now().toString(),
            name: this.form.name,
            icon: this.form.icon,
            description: this.form.description,
            passwordCount: 0,
            lastUpdated: '刚刚'
          }
          this.categories.push(newCategory)
          this.showToastMessage('分类已添加')
        }

        this.closeModals()
      } catch (error) {
        console.error('保存分类失败:', error)
        this.showToastMessage('保存分类失败，请重试', 'error')
      } finally {
        this.loading = false
      }
    },

    closeModals() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingCategory = null
      this.form = {
        name: '',
        icon: '📁',
        description: ''
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
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: var(--spacing-6);
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
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
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
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.category-icon {
  font-size: var(--text-2xl);
  background: var(--bg-secondary);
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
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

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--text-sm);
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