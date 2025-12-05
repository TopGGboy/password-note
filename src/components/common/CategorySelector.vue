<template>
  <div class="category-selector">
    <label v-if="label" :for="inputId" class="category-label">{{ label }}</label>
    
    <!-- 自定义下拉选择器 -->
    <div class="category-dropdown" :class="{ 'is-open': isOpen, 'is-focused': isFocused }">
      <div 
        class="category-trigger" 
        @click="toggleDropdown"
        @keydown.enter.prevent="toggleDropdown"
        @keydown.space.prevent="toggleDropdown"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="navigateDown"
        @keydown.arrow-up.prevent="navigateUp"
        tabindex="0"
        :id="inputId"
        @focus="isFocused = true"
        @blur="handleBlur"
      >
        <div class="selected-category">
          <span v-if="selectedCategory" class="category-display">
            <span class="category-icon">{{ getCategoryIcon(selectedCategory.id) }}</span>
            <span class="category-name">{{ selectedCategory.name }}</span>
          </span>
          <span v-else class="placeholder">{{ placeholder }}</span>
        </div>
        <div class="dropdown-arrow" :class="{ 'is-rotated': isOpen }">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 6.427a.75.75 0 011.06 0L8 8.94l2.513-2.513a.75.75 0 111.06 1.06l-3.043 3.044a.75.75 0 01-1.06 0L4.427 7.487a.75.75 0 010-1.06z"/>
          </svg>
        </div>
      </div>
      
      <!-- 下拉选项列表 -->
      <transition name="dropdown">
        <div v-if="isOpen" class="category-options">
          <div class="options-container">
            <div 
              v-for="(category, index) in categories" 
              :key="category.id"
              class="category-option"
              :class="{ 
                'is-selected': modelValue === category.id,
                'is-highlighted': highlightedIndex === index
              }"
              @click="selectCategory(category)"
              @mouseenter="highlightedIndex = index"
            >
              <span class="category-icon">{{ getCategoryIcon(category.id) }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span v-if="modelValue === category.id" class="selected-indicator">✓</span>
            </div>
            
            <!-- 空状态 -->
            <div v-if="categories.length === 0" class="empty-state">
              <div class="empty-icon">📂</div>
              <div class="empty-text">{{ isLoading ? '正在加载分类...' : '暂无分类' }}</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <!-- 帮助文本 -->
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Category } from '../../types/api'

export default defineComponent({
  name: 'CategorySelector',
  props: {
    modelValue: { type: [Number, String], default: '' },
    categories: { type: Array as () => Category[], default: () => [] },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '请选择分类' },
    helpText: { type: String, default: '' },
    error: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const isFocused = ref(false)
    const highlightedIndex = ref(-1)
    const inputId = ref(`category-selector-${Math.random().toString(36).substr(2, 9)}`)

    const categoryIconMap: Record<number, string> = {
      1: '📁', 2: '💬', 3: '📧', 4: '💰', 5: '💻', 6: '🛒', 7: '🎵', 8: '🔧'
    }

    const selectedCategory = computed(() => {
      if (!props.modelValue) return null
      return props.categories.find(cat => cat.id === props.modelValue) || null
    })

    const getCategoryIcon = (categoryId: number): string => {
      const icons = ['📁', '💬', '📧', '💰', '💻', '🛒', '🎵', '🔧']
      if (categoryIconMap[categoryId]) return categoryIconMap[categoryId]
      const index = categoryId - 1
      if (index >= 0 && index < icons.length) return icons[index]
      return '📁'
    }

    const toggleDropdown = () => {
      if (props.disabled) return
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        highlightedIndex.value = props.categories.findIndex(cat => cat.id === props.modelValue)
      }
    }

    const closeDropdown = () => {
      isOpen.value = false
      highlightedIndex.value = -1
    }

    const selectCategory = (category: Category) => {
      emit('update:modelValue', category.id)
      emit('change', category)
      closeDropdown()
    }

    const navigateDown = () => {
      if (!isOpen.value) { toggleDropdown(); return }
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, props.categories.length - 1)
    }

    const navigateUp = () => {
      if (!isOpen.value) return
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
    }

    const handleBlur = () => {
      isFocused.value = false
      setTimeout(() => closeDropdown(), 150)
    }

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element
      if (!target.closest('.category-selector')) closeDropdown()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (!isOpen.value) return
      if (event.key === 'Enter' && highlightedIndex.value >= 0) {
        event.preventDefault()
        const category = props.categories[highlightedIndex.value]
        if (category) selectCategory(category)
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    })

    watch(() => props.categories, () => { highlightedIndex.value = -1 })

    return {
      isOpen, isFocused, highlightedIndex, inputId, selectedCategory,
      getCategoryIcon, toggleDropdown, closeDropdown, selectCategory,
      navigateDown, navigateUp, handleBlur
    }
  }
})
</script>

<style scoped>
.category-selector {
  position: relative;
  width: 100%;
}

.category-label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.category-dropdown {
  position: relative;
  width: 100%;
}

.category-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 52px;
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
}

.category-trigger:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.category-trigger:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.category-dropdown.is-open .category-trigger {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
}

.category-dropdown.is-focused .category-trigger {
  border-color: var(--primary-300);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-category {
  flex: 1;
  display: flex;
  align-items: center;
}

.category-display {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.category-icon {
  font-size: 20px;
  line-height: 1;
  transition: all 0.3s ease;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.placeholder {
  color: var(--text-secondary);
  font-size: 16px;
  transition: all 0.3s ease;
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  font-size: 18px;
}

.dropdown-arrow.is-rotated {
  transform: rotate(180deg) scale(1.1);
  color: var(--primary-500);
}

.category-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 8px;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-height: 240px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.options-container {
  max-height: 240px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.category-option:last-child {
  border-bottom: none;
}

.category-option::before {
  content: '';
  position: absolute;
  left: -100%;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.category-option:hover::before,
.category-option.is-highlighted::before {
  left: 100%;
}

.category-option:hover,
.category-option.is-highlighted {
  background: linear-gradient(90deg, var(--primary-50), transparent);
  border-color: var(--primary-200);
  transform: translateX(5px);
}

.category-option.is-selected {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border-color: var(--primary-500);
}

.category-option.is-selected::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.category-option.is-selected:hover {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  border-color: var(--primary-600);
  transform: translateX(5px);
}

.category-option .category-icon {
  font-size: 18px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-option.is-selected .category-icon {
  transform: scale(1.1);
}

.category-option .category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.selected-indicator {
  color: white;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.7;
  animation: bounce 2s infinite;
  transition: all 0.3s ease;
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

.empty-text {
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.error-message {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--error-600);
  transition: all 0.3s ease;
}

.help-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.options-container::-webkit-scrollbar {
  width: 8px;
}

.options-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  margin: 8px;
}

.options-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-full);
  transition: all 0.3s ease;
  border: 2px solid var(--bg-secondary);
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--primary-600), var(--primary-700));
  transform: scale(1.1);
}

.options-container::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, var(--primary-700), var(--primary-800));
}

@media (max-width: 768px) {
  .category-trigger {
    padding: 12px 14px;
    min-height: 48px;
  }
  
  .category-option {
    padding: 12px 14px;
  }
  
  .category-options {
    max-height: 200px;
  }
  
  .category-icon {
    font-size: 18px;
  }
  
  .category-name {
    font-size: 14px;
  }
  
  .empty-icon {
    font-size: 36px;
  }
  
  .empty-text {
    font-size: 14px;
  }
}
</style>