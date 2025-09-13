<template>
  <div class="categories-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>分类管理</h1>
          <p>管理您的密码分类</p>
        </div>
        <div class="header-actions">
          <button @click="showAddModal = true" class="add-btn">
            <span class="btn-icon">➕</span>
            添加分类
          </button>
        </div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="categories-grid">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="category-card"
        @click="viewCategory(category)"
      >
        <div class="category-header">
          <div class="category-icon">{{ category.icon }}</div>
          <div class="category-actions">
            <button @click.stop="editCategory(category)" class="edit-btn">
              ✏️
            </button>
            <button @click.stop="deleteCategory(category)" class="delete-btn">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="category-info">
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
        </div>
        
        <div class="category-stats">
          <div class="stat-item">
            <span class="stat-number">{{ category.passwordCount }}</span>
            <span class="stat-label">个密码</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ category.lastUpdated }}</span>
            <span class="stat-label">最后更新</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑分类' : '添加分类' }}</h3>
          <button @click="closeModals" class="close-btn">✕</button>
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
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="cancel-btn">
              取消
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="loading"
            >
              {{ loading ? '保存中...' : (showEditModal ? '更新' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
      
      form: {
        name: '',
        icon: '📁',
        description: ''
      } as CategoryForm,
      
      availableIcons: [
        '📁', '🔐', '💼', '🏦', '🛒', '📧', '🎮', '📱', 
        '💻', '🌐', '🎵', '📺', '🏠', '🚗', '✈️', '🏥'
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
        console.log('分类已删除:', category.name)
      } catch (error) {
        console.error('删除分类失败:', error)
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
          console.log('分类已更新:', this.form)
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
          console.log('分类已添加:', newCategory)
        }
        
        this.closeModals()
      } catch (error) {
        console.error('保存分类失败:', error)
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
    }
  }
})
</script>

<style scoped>
.categories-container {
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

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-icon {
  font-size: 32px;
  background: #f7fafc;
  padding: 12px;
  border-radius: 12px;
}

.category-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #ebf8ff;
}

.delete-btn:hover {
  background: #fed7d7;
}

.category-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.category-info p {
  margin: 0;
  color: #718096;
  line-height: 1.5;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
  padding: 4px;
}

.close-btn:hover {
  color: #2d3748;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3182ce;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.icon-option.selected {
  border-color: #3182ce;
  background: #ebf8ff;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
}

.submit-btn {
  background: #3182ce;
  color: white;
  border: 1px solid #3182ce;
}

.submit-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .categories-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    text-align: left;
  }
}
</style>