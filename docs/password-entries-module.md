# 密码条目查询模块

## 概述

密码条目查询模块提供了完整的密码管理功能，包括分页查询、搜索筛选、CRUD操作等。该模块采用组合式API设计，具有良好的可复用性和可维护性。

## 核心功能

### 1. 分页查询
- 支持分页加载密码条目
- 可配置每页显示数量
- 支持无限滚动加载更多

### 2. 搜索与筛选
- 关键词搜索（标题、用户名等）
- 按分类筛选
- 收藏状态筛选
- 多维度排序（创建时间、更新时间、使用次数等）

### 3. 数据加密
- 敏感数据（用户名、密码、备注）采用AES加密存储
- 前端解密显示
- 支持主密码保护

### 4. 用户交互
- 密码复制功能
- 收藏/取消收藏
- 使用次数统计
- 密码强度显示

## 技术架构

### 类型定义 (`src/types/api.ts`)

```typescript
// 分页查询请求参数
export interface GetPasswordEntriesRequest {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number
  favorite?: boolean
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'timesUsed'
  sortOrder?: 'asc' | 'desc'
}

// 分页响应数据
export interface PagedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 密码条目信息
export interface PasswordEntry {
  id: number
  userId: number
  categoryId?: number
  title: string
  usernameEncrypted: string
  passwordEncrypted: string
  url?: string
  notesEncrypted?: string
  customFields?: any
  strengthScore?: number
  favorite: boolean
  timesUsed: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
}
```

### API服务 (`src/services/api.ts`)

```typescript
export const passwordEntriesAPI = {
  // 分页查询密码条目
  page: (params: GetPasswordEntriesRequest): Promise<ApiResponse<GetPasswordEntriesResponse>> => {
    return http.post(API_ENDPOINTS.PASSWORDENTRIES.PAGE, params)
  },
  
  // 创建密码条目
  create: (data: CreatePasswordEntryRequest): Promise<ApiResponse<PasswordEntry>> => {
    return http.post(API_ENDPOINTS.PASSWORDENTRIES.BASE, data)
  },
  
  // 更新密码条目
  update: (id: number, data: Partial<CreatePasswordEntryRequest>): Promise<ApiResponse<PasswordEntry>> => {
    return http.put(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}`, data)
  },
  
  // 删除密码条目
  delete: (id: number): Promise<ApiResponse<null>> => {
    return http.delete(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}`)
  },
  
  // 切换收藏状态
  toggleFavorite: (id: number): Promise<ApiResponse<PasswordEntry>> => {
    return http.patch(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}/favorite`)
  },
  
  // 记录使用次数
  recordUsage: (id: number): Promise<ApiResponse<null>> => {
    return http.patch(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}/usage`)
  }
}
```

### 组合式函数 (`src/composables/usePasswordEntries.ts`)

提供了完整的密码条目管理逻辑：

```typescript
export function usePasswordEntries() {
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
    fetchEntries,      // 获取密码条目列表
    searchEntries,     // 搜索密码条目
    filterByCategory,  // 按分类筛选
    filterFavorites,   // 筛选收藏
    sortEntries,       // 排序
    loadMore,          // 加载更多
    refresh,           // 刷新数据
    resetQuery,        // 重置查询条件
    createEntry,       // 创建新条目
    updateEntry,       // 更新条目
    deleteEntry,       // 删除条目
    toggleFavorite,    // 切换收藏状态
    recordUsage        // 记录使用次数
  }
}
```

## 组件结构

### 1. 密码条目列表 (`PasswordEntriesList.vue`)

**功能特性：**
- 响应式网格布局
- 搜索和筛选控件
- 分页加载
- 卡片式条目展示
- 快捷操作按钮

**主要Props：**
无

**主要Events：**
- `add-password`: 添加密码
- `view-entry`: 查看条目详情
- `edit-entry`: 编辑条目

### 2. 密码条目详情 (`PasswordEntryDetail.vue`)

**功能特性：**
- 详细信息展示
- 密码显示/隐藏切换
- 一键复制功能
- 使用统计显示
- 密码强度指示器

**主要Props：**
- `entry`: 密码条目数据

**主要Events：**
- `close`: 关闭详情
- `edit`: 编辑条目
- `delete`: 删除条目
- `toggle-favorite`: 切换收藏
- `record-usage`: 记录使用

### 3. 密码管理页面 (`PasswordManagement.vue`)

**功能特性：**
- 整合所有密码管理功能
- 模态框管理
- 全局状态管理
- 用户交互反馈

## 使用示例

### 基本使用

```vue
<template>
  <div>
    <!-- 密码条目列表 -->
    <PasswordEntriesList
      @add-password="handleAddPassword"
      @view-entry="handleViewEntry"
      @edit-entry="handleEditEntry"
    />
  </div>
</template>

<script>
import { usePasswordEntries } from '@/composables/usePasswordEntries'
import PasswordEntriesList from '@/components/password/PasswordEntriesList.vue'

export default {
  components: {
    PasswordEntriesList
  },
  setup() {
    const { entries, loading, fetchEntries } = usePasswordEntries()
    
    // 初始化加载
    onMounted(() => {
      fetchEntries()
    })
    
    return {
      entries,
      loading
    }
  }
}
</script>
```

### 高级查询

```javascript
const { searchEntries, filterByCategory, sortEntries } = usePasswordEntries()

// 搜索
await searchEntries('github')

// 按分类筛选
await filterByCategory(2) // 社交媒体分类

// 排序
await sortEntries('lastUsed', 'desc') // 按最后使用时间降序
```

## 数据库对应关系

### 前端字段映射

| 前端字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| `id` | `id` | 主键ID |
| `title` | `title` | 条目标题 |
| `username` | `username_encrypted` | 加密的用户名 |
| `password` | `password_encrypted` | 加密的密码 |
| `notes` | `notes_encrypted` | 加密的备注 |
| `url` | `url` | 网站地址 |
| `categoryId` | `category_id` | 分类ID |
| `favorite` | `favorite` | 是否收藏 |
| `timesUsed` | `times_used` | 使用次数 |
| `lastUsed` | `last_used` | 最后使用时间 |
| `strengthScore` | `strength_score` | 密码强度评分 |
| `customFields` | `custom_fields` | 自定义字段（JSON） |
| `icon` | `custom_fields.icon` | 图标（存储在自定义字段中） |
| `tags` | `custom_fields.tags` | 标签（存储在自定义字段中） |

### 分类映射

```javascript
const categoryIconMap = {
  1: '🔐', // 其他
  2: '💬', // 社交媒体
  3: '📧', // 邮箱服务
  4: '💰', // 金融服务
  5: '💻', // 开发工具
  6: '🛒', // 购物网站
  7: '🎵', // 娱乐平台
  8: '🔧'  // 工作相关
}
```

## 安全考虑

### 1. 数据加密
- 使用AES-256-GCM加密算法
- 敏感数据在前端加密后传输
- 主密码本地派生加密密钥

### 2. 权限控制
- 用户只能访问自己的密码条目
- API层面进行用户身份验证
- 前端加密密钥与用户会话绑定

### 3. 数据传输
- HTTPS加密传输
- 敏感数据不在URL中传递
- 使用POST请求传递查询参数

## 性能优化

### 1. 分页加载
- 默认每页10条记录
- 支持无限滚动
- 避免一次性加载大量数据

### 2. 搜索防抖
- 300ms防抖延迟
- 避免频繁API调用
- 提升用户体验

### 3. 数据缓存
- 组件级别数据缓存
- 避免重复解密操作
- 智能刷新策略

## 扩展功能

### 1. 导入导出
- 支持CSV格式导入
- 加密导出功能
- 批量操作支持

### 2. 密码生成
- 可配置密码策略
- 强度实时检测
- 历史密码记录

### 3. 安全审计
- 弱密码检测
- 重复密码提醒
- 密码过期提醒

## 故障排除

### 常见问题

1. **解密失败**
   - 检查主密码是否正确
   - 确认加密密钥是否存在
   - 验证数据完整性

2. **搜索无结果**
   - 确认搜索关键词
   - 检查筛选条件
   - 验证数据权限

3. **分页加载失败**
   - 检查网络连接
   - 验证API响应
   - 确认参数格式

### 调试方法

```javascript
// 启用调试模式
const { query, loading, error } = usePasswordEntries()

// 查看当前查询参数
console.log('Current query:', query)

// 监听加载状态
watch(loading, (newVal) => {
  console.log('Loading state:', newVal)
})

// 监听错误信息
watch(error, (newVal) => {
  if (newVal) {
    console.error('Query error:', newVal)
  }
})
```

## 总结

密码条目查询模块提供了完整的密码管理解决方案，具有以下优势：

1. **功能完整**：涵盖CRUD、搜索、筛选、排序等所有基础功能
2. **安全可靠**：采用端到端加密，保护用户隐私
3. **性能优化**：分页加载、防抖搜索、智能缓存
4. **用户友好**：响应式设计、直观交互、丰富反馈
5. **可扩展性**：模块化设计，易于扩展新功能

该模块可以作为密码管理应用的核心组件，为用户提供安全、便捷的密码管理体验。