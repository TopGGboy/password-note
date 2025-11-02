import { ref, computed } from 'vue'
import { categoriesAPI } from '../services/api'
import type { Category as ApiCategory, CreateCategoryRequest } from '../types/api'
import { numberToEmoji, emojiToNumber } from '../utils/categoryUtils'
import { formatRelativeTime } from '../utils/dateUtils'

/**
 * 前端组件使用的分类数据结构
 */
export interface Category {
  id: number
  name: string
  icon: string
  description: string
  passwordCount: number
  lastUpdated: string
}

/**
 * 分类表单数据结构（前端表单使用）
 */
export interface CategoryForm {
  name: string
  icon: string
  description?: string
  color?: string
  sortOrder?: number
  isDefault?: boolean
}

/**
 * 分类管理 Composable
 * 提供分类的CRUD操作和状态管理
 */
export function useCategories() {
  // 响应式状态
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const hasCategories = computed(() => categories.value.length > 0)
  const totalPasswords = computed(() => 
    categories.value.reduce((sum, cat) => sum + cat.passwordCount, 0)
  )

  /**
   * 将API返回的Category转换为组件使用的格式
   */
  const transformApiCategoryToView = (apiCategory: ApiCategory): Category => {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      icon: numberToEmoji(apiCategory.icon),
      description: apiCategory.description || '',
      passwordCount: apiCategory.entryCount || 0,
      lastUpdated: formatRelativeTime(apiCategory.updatedAt)
    }
  }

  /**
   * 加载分类列表
   */
  const loadCategories = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await categoriesAPI.getAll()
      
      if (response.code === 1 && response.data) {
        categories.value = response.data.map(transformApiCategoryToView)
        return true
      } else {
        error.value = response.msg || '获取分类列表失败'
        console.warn('获取分类列表失败:', response)
        return false
      }
    } catch (err: any) {
      error.value = err?.response?.data?.msg || err?.message || '加载分类列表失败，请重试'
      console.error('加载分类列表失败:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 构建创建/更新分类的请求数据
   * @param formData 表单数据
   * @returns 格式化后的请求数据
   */
  const buildCategoryRequestData = (formData: CategoryForm): CreateCategoryRequest => {
    return {
      name: formData.name.trim(),
      // 图标转换：emoji字符串 → 数字索引
      icon: emojiToNumber(formData.icon),
      // 可选字段：只有当有值时才添加到请求中
      ...(formData.description?.trim() && { 
        description: formData.description.trim() 
      }),
      ...(formData.color?.trim() && { 
        color: formData.color.trim() 
      }),
      ...(formData.sortOrder !== undefined && formData.sortOrder !== null && { 
        sortOrder: formData.sortOrder 
      }),
      ...(formData.isDefault !== undefined && { 
        isDefault: formData.isDefault 
      })
      // userId 不需要传递，后端会从 Security Context 中获取
    }
  }

  /**
   * 创建分类
   * @param formData 分类表单数据
   * @returns 创建结果
   */
  const createCategory = async (formData: CategoryForm): Promise<{ success: boolean; message?: string }> => {
    loading.value = true
    error.value = null

    try {
      // 使用辅助函数构建请求数据
      const createData = buildCategoryRequestData(formData)

      const response = await categoriesAPI.create(createData)

      if (response.code === 1 && response.data) {
        // 创建成功后重新加载列表
        await loadCategories()
        return { success: true, message: '分类创建成功' }
      } else {
        const message = response.msg || '创建分类失败'
        error.value = message
        return { success: false, message }
      }
    } catch (err: any) {
      const message = err?.response?.data?.msg || err?.message || '保存分类失败，请重试'
      error.value = message
      console.error('保存分类失败:', err)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除分类（将来实现）
   */
  const deleteCategory = async (id: number): Promise<{ success: boolean; message?: string }> => {
    // TODO: 实现删除功能（等待后端接口）
    console.warn('删除分类功能暂未实现')
    return { success: false, message: '删除分类功能暂未实现' }
  }

  /**
   * 更新分类（将来实现）
   * @param id 分类ID
   * @param formData 分类表单数据
   * @returns 更新结果
   */
  const updateCategory = async (id: number, formData: CategoryForm): Promise<{ success: boolean; message?: string }> => {
    // TODO: 实现更新功能（等待后端接口）
    // 当后端接口可用时，使用类似 createCategory 的逻辑
    // const updateData = buildCategoryRequestData(formData)
    // const response = await categoriesAPI.update(id, updateData)
    console.warn('更新分类功能暂未实现')
    return { success: false, message: '更新分类功能暂未实现' }
  }

  /**
   * 根据ID获取分类
   */
  const getCategoryById = (id: number): Category | undefined => {
    return categories.value.find(cat => cat.id === id)
  }

  return {
    // 状态
    categories,
    loading,
    error,
    
    // 计算属性
    hasCategories,
    totalPasswords,
    
    // 方法
    loadCategories,
    createCategory,
    deleteCategory,
    updateCategory,
    getCategoryById,
    transformApiCategoryToView
  }
}

