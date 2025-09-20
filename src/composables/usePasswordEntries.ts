import { ref, reactive, computed } from 'vue'
import { passwordEntriesAPI } from '../services/api'
import { DataEncryptionService, KeyManager } from '../utils/encryption/crypto'
import { authManager } from '../utils/auth/authManager'
import type { 
  GetPasswordEntriesRequest, 
  GetPasswordEntriesResponse, 
  PasswordEntry,
  CreatePasswordEntryRequest 
} from '../types/api'
import { createDefaultPasswordEntriesQuery, validatePasswordEntriesQuery } from '../types/api'

// 查询参数接口（继承API请求参数）
export interface PasswordEntriesQuery extends GetPasswordEntriesRequest {}

// 解密后的密码条目
export interface DecryptedPasswordEntry extends Omit<PasswordEntry, 'usernameEncrypted' | 'passwordEncrypted' | 'notesEncrypted'> {
  username: string
  password: string
  notes: string
  icon?: string
  tags?: string[]
}

export function usePasswordEntries() {
  // 响应式数据
  const loading = ref(false)
  const error = ref<string | null>(null)
  const entries = ref<DecryptedPasswordEntry[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  
  // 查询参数
  const query = reactive<PasswordEntriesQuery>(createDefaultPasswordEntriesQuery())

  // 计算属性
  const hasData = computed(() => entries.value.length > 0)
  const isEmpty = computed(() => !loading.value && entries.value.length === 0)
  const hasMore = computed(() => query.page < totalPages.value)

  // 解密密码条目数据
  const decryptPasswordEntry = (entry: PasswordEntry): DecryptedPasswordEntry => {
    try {
      if (!KeyManager.hasKey()) {
        throw new Error('未找到加密密钥')
      }

      const decryptedData = DataEncryptionService.decryptPasswordEntry({
        usernameEncrypted: entry.usernameEncrypted,
        passwordEncrypted: entry.passwordEncrypted,
        notesEncrypted: entry.notesEncrypted || '',
        customFieldsEncrypted: []
      })

      // 从自定义字段中提取图标和标签
      let icon = '🔐'
      let tags: string[] = []
      
      if (entry.customFields) {
        if (typeof entry.customFields === 'object') {
          icon = entry.customFields.icon || '🔐'
          tags = entry.customFields.tags || []
        }
      }

      return {
        ...entry,
        username: decryptedData.username,
        password: decryptedData.password,
        notes: decryptedData.notes,
        icon,
        tags
      }
    } catch (err) {
      console.error('解密密码条目失败:', err)
      // 返回部分数据，密码相关字段为空
      return {
        ...entry,
        username: '解密失败',
        password: '解密失败',
        notes: '解密失败',
        icon: '🔐',
        tags: []
      }
    }
  }

  // 获取密码条目列表
  const fetchEntries = async (resetPage = false) => {
    // 检查认证状态
    if (!authManager.isAuthenticated()) {
      console.warn('用户未认证，无法获取密码条目')
      error.value = '用户未认证，请重新登录'
      return
    }

    if (resetPage) {
      query.page = 1
    }

    loading.value = true
    error.value = null

    try {
      // 验证并规范化查询参数
      const validatedQuery = validatePasswordEntriesQuery(query)
      Object.assign(query, validatedQuery)
      
      const response = await passwordEntriesAPI.page(validatedQuery)
      
      if (response.code === 1 && response.data) {
        const entriesList = Array.isArray(response.data) ? response.data : []
        
        // 解密所有条目
        const decryptedEntries = entriesList.map(decryptPasswordEntry)
        
        if (resetPage || query.page === 1) {
          entries.value = decryptedEntries
        } else {
          // 追加数据（用于无限滚动）
          entries.value.push(...decryptedEntries)
        }
        
        total.value = entriesList.length
        totalPages.value = Math.ceil(total.value / validatedQuery.pageSize)
      } else {
        throw new Error(response.msg || '获取密码条目失败')
      }
    } catch (err: any) {
      error.value = err.message || '获取密码条目失败'
      console.error('获取密码条目失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 搜索密码条目
  const searchEntries = async (keyword: string) => {
    query.keyword = keyword
    await fetchEntries(true)
  }

  // 按分类筛选
  const filterByCategory = async (categoryId?: number) => {
    query.categoryId = categoryId
    await fetchEntries(true)
  }

  // 筛选收藏
  const filterFavorites = async (favorite?: boolean) => {
    query.favorite = favorite
    await fetchEntries(true)
  }

  // 排序
  const sortEntries = async (sortBy: PasswordEntriesQuery['sortBy'], sortOrder: PasswordEntriesQuery['sortOrder'] = 'desc') => {
    query.sortBy = sortBy
    query.sortOrder = sortOrder
    await fetchEntries(true)
  }

  // 加载更多（分页）
  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      query.page += 1
      await fetchEntries(false)
    }
  }

  // 刷新数据
  const refresh = async () => {
    await fetchEntries(true)
  }

  // 重置查询条件
  const resetQuery = () => {
    Object.assign(query, createDefaultPasswordEntriesQuery())
  }

  // 创建新密码条目
  const createEntry = async (data: CreatePasswordEntryRequest): Promise<PasswordEntry> => {
    loading.value = true
    error.value = null

    try {
      const response = await passwordEntriesAPI.create(data)
      
      if (response.code === 200 && response.data) {
        // 刷新列表
        await fetchEntries(true)
        return response.data
      } else {
        throw new Error(response.msg || '创建密码条目失败')
      }
    } catch (err: any) {
      error.value = err.message || '创建密码条目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新密码条目
  const updateEntry = async (id: number, data: Partial<CreatePasswordEntryRequest>): Promise<PasswordEntry> => {
    loading.value = true
    error.value = null

    try {
      const response = await passwordEntriesAPI.update(id, data)
      
      if (response.code === 200 && response.data) {
        // 刷新列表
        await fetchEntries(true)
        return response.data
      } else {
        throw new Error(response.msg || '更新密码条目失败')
      }
    } catch (err: any) {
      error.value = err.message || '更新密码条目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除密码条目
  const deleteEntry = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await passwordEntriesAPI.delete(id)
      
      if (response.code === 200) {
        // 从本地列表中移除
        entries.value = entries.value.filter(entry => entry.id !== id)
        total.value -= 1
      } else {
        throw new Error(response.msg || '删除密码条目失败')
      }
    } catch (err: any) {
      error.value = err.message || '删除密码条目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 切换收藏状态
  const toggleFavorite = async (id: number): Promise<void> => {
    try {
      const response = await passwordEntriesAPI.toggleFavorite(id)
      
      if (response.code === 200 && response.data) {
        // 更新本地数据
        const index = entries.value.findIndex(entry => entry.id === id)
        if (index !== -1) {
          entries.value[index].favorite = response.data.favorite
        }
      } else {
        throw new Error(response.msg || '切换收藏状态失败')
      }
    } catch (err: any) {
      error.value = err.message || '切换收藏状态失败'
      throw err
    }
  }

  // 记录使用次数
  const recordUsage = async (id: number): Promise<void> => {
    try {
      await passwordEntriesAPI.recordUsage(id)
      
      // 更新本地数据
      const index = entries.value.findIndex(entry => entry.id === id)
      if (index !== -1) {
        entries.value[index].timesUsed += 1
        entries.value[index].lastUsed = new Date().toISOString()
      }
    } catch (err: any) {
      console.error('记录使用次数失败:', err)
      // 不抛出错误，因为这不是关键功能
    }
  }

  return {
    // 响应式数据
    loading,
    error,
    entries,
    total,
    totalPages,
    query,
    
    // 计算属性
    hasData,
    isEmpty,
    hasMore,
    
    // 方法
    fetchEntries,
    searchEntries,
    filterByCategory,
    filterFavorites,
    sortEntries,
    loadMore,
    refresh,
    resetQuery,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    recordUsage
  }
}