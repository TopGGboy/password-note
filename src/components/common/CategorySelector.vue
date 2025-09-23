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
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
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
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  box-sizing: border-box;
}

.category-trigger:hover {
  border-color: #cbd5e0;
}

.category-trigger:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.category-dropdown.is-open .category-trigger {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.selected-category {
  flex: 1;
  display: flex;
  align-items: center;
}

.category-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 18px;
  line-height: 1;
}

.category-name {
  font-size: 16px;
  color: #2d3748;
}

.placeholder {
  color: #a0aec0;
  font-size: 16px;
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  color: #6b7280;
  transition: transform 0.2s;
}

.dropdown-arrow.is-rotated {
  transform: rotate(180deg);
}

.category-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 200px;
  overflow: hidden;
}

.options-container {
  max-height: 200px;
  overflow-y: auto;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f7fafc;
}

.category-option:last-child {
  border-bottom: none;
}

.category-option:hover,
.category-option.is-highlighted {
  background-color: #f7fafc;
}

.category-option.is-selected {
  background-color: #ebf8ff;
  color: #3182ce;
}

.category-option .category-icon {
  font-size: 16px;
}

.category-option .category-name {
  flex: 1;
  font-size: 14px;
}

.selected-indicator {
  color: #3182ce;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  color: #6b7280;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #e53e3e;
}

.help-text {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@media (max-width: 768px) {
  .category-trigger {
    padding: 10px 12px;
    min-height: 44px;
  }
  
  .category-option {
    padding: 10px 12px;
  }
  
  .category-options {
    max-height: 160px;
  }
}
</style>