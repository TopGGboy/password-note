import { ref, reactive, computed } from "vue";
import { passwordEntriesAPI } from "../services/api";
import { DataEncryptionService, KeyManager } from "../utils/encryption/crypto";
import { tokenManager } from "../utils/auth/tokenManager";
import type {
  GetPasswordEntriesRequest,
  GetPasswordEntriesResponse,
  PasswordEntry,
  CreatePasswordEntryRequest,
} from "../types/api";
import {
  createDefaultPasswordEntriesQuery,
  validatePasswordEntriesQuery,
} from "../types/api";

// 查询参数接口（继承API请求参数）
export interface PasswordEntriesQuery extends GetPasswordEntriesRequest {}

// 解密后的密码条目
export interface DecryptedPasswordEntry
  extends Omit<
    PasswordEntry,
    "usernameEncrypted" | "passwordEncrypted" | "notesEncrypted"
  > {
  username: string;
  password: string;
  notes: string;
  icon?: string;
  tags?: string[];
}

export function usePasswordEntries() {
  // 响应式数据
  const loading = ref(false);
  const error = ref<string | null>(null);
  const allEntries = ref<DecryptedPasswordEntry[]>([]);
  const totalPages = ref(0);
  const totalFavorites = ref(0);

  // 查询参数
  const query = reactive<PasswordEntriesQuery>(
    createDefaultPasswordEntriesQuery()
  );

  // 计算属性
  const entries = computed(() => {
    let filtered = [...allEntries.value];

    // 分类筛选调试日志
    console.log('=== 分类筛选调试信息 ===');
    console.log('当前query.categoryId:', query.categoryId);
    console.log('所有条目及其categoryId:', allEntries.value.map(entry => ({ id: entry.id, title: entry.title, categoryId: entry.categoryId })));

    // 分类筛选
    if (query.categoryId !== undefined) {
      filtered = filtered.filter(entry => entry.categoryId === query.categoryId);
      console.log('分类筛选结果:', filtered.length, '条记录');
      console.log('筛选后的条目:', filtered.map(entry => ({ id: entry.id, title: entry.title, categoryId: entry.categoryId })));
    }

    // 收藏筛选
    if (query.favorite !== undefined) {
      filtered = filtered.filter(entry => (entry.favorite || false) === query.favorite);
    }

    // 搜索筛选
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(keyword) ||
        entry.username.toLowerCase().includes(keyword) ||
        (entry.url && entry.url.toLowerCase().includes(keyword)) ||
        entry.notes.toLowerCase().includes(keyword)
      );
    }

    // 排序
    if (query.sortBy) {
      filtered.sort((a, b) => {
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
        let aVal = a[query.sortBy as keyof DecryptedPasswordEntry];
        let bVal = b[query.sortBy as keyof DecryptedPasswordEntry];

        // 处理不同类型的排序
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          // 日期字符串排序
          if (query.sortBy === 'updatedAt' || query.sortBy === 'createdAt' || query.sortBy === 'lastUsed') {
            return new Date(aVal).getTime() - new Date(bVal).getTime() * sortOrder;
          }
          // 字符串排序
          return aVal.localeCompare(bVal) * sortOrder;
        }
        // 数字排序
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * sortOrder;
        }

        return 0;
      });
    }

    return filtered;
  });

  const total = computed(() => entries.value.length);
  const hasData = computed(() => entries.value.length > 0);
  const isEmpty = computed(() => !loading.value && entries.value.length === 0);
  const hasMore = computed(() => query.page < totalPages.value);

  // 解密密码条目数据
  const decryptPasswordEntry = (
    entry: PasswordEntry
  ): DecryptedPasswordEntry => {
    try {
      if (!KeyManager.hasKey()) {
        throw new Error("未找到加密密钥");
      }

      const decryptedData = DataEncryptionService.decryptPasswordEntry({
        usernameEncrypted: entry.usernameEncrypted,
        passwordEncrypted: entry.passwordEncrypted,
        notesEncrypted: entry.notesEncrypted || "",
        customFieldsEncrypted: entry.customFields || [],
      });

      // 从自定义字段中提取图标和标签
      let icon = "🔐";
      let tags: string[] = [];

      if (entry.customFields) {
        if (typeof entry.customFields === "object") {
          icon = entry.customFields.icon || "🔐";
          tags = entry.customFields.tags || [];
        }
      }

      return {
        ...entry,
        username: decryptedData.username,
        password: decryptedData.password,
        notes: decryptedData.notes,
        icon,
        tags,
      };
    } catch (err) {
      console.error("解密密码条目失败:", err);
      // 返回部分数据，密码相关字段为空
      return {
        ...entry,
        username: "解密失败",
        password: "解密失败",
        notes: "解密失败",
        icon: "🔐",
        tags: [],
      };
    }
  };

  // 获取密码条目列表
  const fetchEntries = async (resetPage = false) => {
    // 检查认证状态
    if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
      console.warn("用户未认证或token已过期，无法获取密码条目");
      error.value = "用户未认证，请重新登录";
      return;
    }

    // 检查是否有加密密钥
    if (!KeyManager.hasKey()) {
      console.warn("未找到加密密钥，请先输入主密码");
      error.value = "未找到加密密钥，请先输入主密码";
      // 触发主密码输入事件
      window.dispatchEvent(new CustomEvent("requireMasterPassword"));
      return;
    }

    if (resetPage) {
      query.page = 1;
    }

    loading.value = true;
    error.value = null;

    try {
      // 验证并规范化查询参数
      const validatedQuery = validatePasswordEntriesQuery(query);
      Object.assign(query, validatedQuery);

      console.log('=== API请求调试信息 ===');
      console.log('请求参数:', validatedQuery);
      console.log('当前用户ID:', localStorage.getItem('userId'));
      console.log('当前token:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');
      
      // 调用后端API获取数据
      const response = await passwordEntriesAPI.page(validatedQuery);
      
      console.log('API响应:', response);
      console.log('响应code:', response.code);
      console.log('响应data:', response.data);

      if (response.code === 1 && response.data) {
        // 修复：根据实际API响应结构处理数据
        // API直接返回数组在data字段中，分页信息在response的根级别
        const entriesList = Array.isArray(response.data) ? response.data : [];

        console.log('API返回的条目列表:', entriesList);
        console.log('条目数量:', entriesList.length);

        // 解密所有条目
        const decryptedEntries = entriesList.map(decryptPasswordEntry);

        // 去重处理 - 确保所有条目ID唯一
        const uniqueEntries = Array.from(
          new Map(decryptedEntries.map(entry => [entry.id, entry])).values()
        );

        if (resetPage || query.page === 1) {
          allEntries.value = uniqueEntries;
        } else {
          // 追加数据（用于无限滚动），避免重复条目
          const existingIds = new Set(allEntries.value.map(entry => entry.id));
          const newEntries = uniqueEntries.filter(entry => !existingIds.has(entry.id));
          allEntries.value.push(...newEntries);
        }
        
        // 调试：查看所有条目的分类ID
        console.log('所有条目的分类ID:', allEntries.value.map(entry => ({ id: entry.id, title: entry.title, categoryId: entry.categoryId })));
        // 将分类ID映射保存到localStorage，便于在浏览器中查看
        const categoryMap = JSON.parse(localStorage.getItem('categoryMap') || '{}')
        console.log('分类名称映射:', allEntries.value.map(entry => ({ 
          id: entry.id, 
          title: entry.title, 
          categoryId: entry.categoryId, 
          categoryName: entry.categoryId ? categoryMap[entry.categoryId] || '未知分类' : '未分类' 
        })));

        // 修复：使用API响应根级别的分页信息（使用类型断言）
        const responseWithPagination = response as any;
        totalPages.value = responseWithPagination.totalPages || Math.ceil((responseWithPagination.total || 0) / validatedQuery.pageSize);
        // 提取总收藏数量
        totalFavorites.value = responseWithPagination.totalFavorites || 0;
        
        console.log(`分页信息 - 当前页: ${query.page}, 每页大小: ${validatedQuery.pageSize}, 总记录数: ${total.value}, 总页数: ${totalPages.value}, 总收藏数: ${totalFavorites.value}, 当前页记录数: ${entriesList.length}`);
      } else {
        console.error('API响应错误:', response);
        throw new Error(response.msg || "获取密码条目失败");
      }
    } catch (err: any) {
      error.value = err.message || "获取密码条目失败";
      console.error("获取密码条目失败:", err);
    } finally {
      loading.value = false;
    }
  };

  // 搜索密码条目 - 前端搜索
  const searchEntries = (keyword: string) => {
    // 如果关键词为空，则清除搜索条件
    if (!keyword.trim()) {
      query.keyword = undefined;
    } else {
      query.keyword = keyword.trim();
    }
  };

  // 按分类筛选
  const filterByCategory = (categoryId?: number) => {
    console.log('分类筛选函数被调用，分类ID:', categoryId);
    query.categoryId = categoryId;
    console.log('更新后的query.categoryId:', query.categoryId);
  };

  // 筛选收藏
  const filterFavorites = (favorite?: boolean) => {
    query.favorite = favorite;
  };

  // 排序
  const sortEntries = (
    sortBy: PasswordEntriesQuery["sortBy"],
    sortOrder: PasswordEntriesQuery["sortOrder"] = "desc"
  ) => {
    query.sortBy = sortBy;
    query.sortOrder = sortOrder;
  };

  // 加载更多（分页）
  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      query.page += 1;
      await fetchEntries(false);
    }
  };

  // 无限滚动加载更多
  const loadMoreOnScroll = async () => {
    if (hasMore.value && !loading.value) {
      query.page += 1;
      
      // 如果当前是搜索状态，使用搜索接口加载更多
      if (query.keyword) {
        await loadMoreSearchResults();
      } else {
        await fetchEntries(false);
      }
    }
  };

  // 搜索结果加载更多
  const loadMoreSearchResults = async () => {
    if (loading.value || !hasMore.value || !query.keyword) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log('=== 搜索加载更多调试信息 ===');
      console.log('搜索关键词:', query.keyword);
      console.log('页码:', query.page);

      // 调用搜索接口获取更多结果
      const response = await passwordEntriesAPI.search(
        query.keyword,
        query.page,
        query.pageSize
      );

      if (response.code === 1 && response.data) {
          const entriesList = Array.isArray(response.data) ? response.data : [];
          console.log('搜索加载更多返回的条目列表:', entriesList);

          // 解密新条目
          const decryptedEntries = entriesList.map(decryptPasswordEntry);
          
          // 去重处理 - 确保所有条目ID唯一
          const existingIds = new Set(allEntries.value.map(entry => entry.id));
          const newEntries = decryptedEntries.filter(entry => !existingIds.has(entry.id));
          
          // 追加到现有列表
          allEntries.value = [...allEntries.value, ...newEntries];

          // 更新分页信息
          const responseWithPagination = response as any;
          totalPages.value = responseWithPagination.totalPages || Math.ceil((responseWithPagination.total || 0) / query.pageSize);
          // 提取总收藏数量
          totalFavorites.value = responseWithPagination.totalFavorites || 0;

          console.log(`搜索加载更多完成 - 新增: ${newEntries.length} 条, 总计: ${allEntries.value.length} 条`);
        } else {
          throw new Error(response.msg || "加载更多搜索结果失败");
        }
    } catch (err: any) {
      error.value = err.message || "加载更多搜索结果失败";
      console.error("加载更多搜索结果失败:", err);
      // 加载失败时回退页码
      query.page -= 1;
    } finally {
      loading.value = false;
    }
  };

  // 检查是否需要自动加载更多（用于无限滚动）
  const checkAndLoadMore = async (scrollElement?: HTMLElement) => {
    if (!scrollElement || !hasMore.value || loading.value) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // 当滚动到80%时自动加载更多
    if (scrollPercentage >= 0.8) {
      await loadMoreOnScroll();
    }
  };

  // 刷新数据
  const refresh = async () => {
    await fetchEntries(true);
  };

  // 重置查询条件
  const resetQuery = () => {
    Object.assign(query, createDefaultPasswordEntriesQuery());
  };

  // 创建新密码条目
  const createEntry = async (
    data: CreatePasswordEntryRequest
  ): Promise<PasswordEntry> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await passwordEntriesAPI.create(data);
      console.log("创建密码条目API响应:", response);

      // 修复：检查code为1而不是200
      if (response.code === 1 && response.data) {
        // 刷新列表
        await fetchEntries(true);
        console.log("密码条目创建成功:", response.data);
        return response.data;
      } else {
        throw new Error(response.msg || "创建密码条目失败");
      }
    } catch (err: any) {
      console.error("创建密码条目失败:", err);
      error.value = err.message || "创建密码条目失败";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 更新密码条目
  const updateEntry = async (
    id: number,
    data: Partial<CreatePasswordEntryRequest>
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await passwordEntriesAPI.update(id, data);
      console.log("更新密码条目API响应:", response);

      // 修复：检查code为1而不是200
      if (response.code === 1 && response.data) {
        // 刷新列表
        await fetchEntries(true);
        console.log("密码条目更新成功:", response.data);
      } else {
        throw new Error(response.msg || "更新密码条目失败");
      }
    } catch (err: any) {
      console.error("更新密码条目失败:", err);
      error.value = err.message || "更新密码条目失败";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 删除密码条目
  const deleteEntry = async (id: number): Promise<void> => {
    // 详细的认证状态检查和调试信息
    console.log("=== 删除密码条目调试信息 ===");

    // 获取token详细信息
    const token = tokenManager.getAccessToken();
    const userId = localStorage.getItem("userId");
    const hasValidToken = tokenManager.hasValidToken();
    const isTokenExpired = tokenManager.isTokenExpired();

    console.log(
      "本地存储token:",
      token ? `${token.substring(0, 20)}...` : "null"
    );
    console.log("本地存储userId:", userId);
    console.log("Token有效性:", hasValidToken);
    console.log("Token是否过期:", isTokenExpired);

    if (!hasValidToken || isTokenExpired) {
      const errorMsg = "用户未认证或token已过期，无法删除密码条目";
      console.warn(errorMsg);
      error.value = errorMsg;
      throw new Error(errorMsg);
    }

    loading.value = true;
    error.value = null;

    try {
      console.log("正在删除密码条目，ID:", id);
      console.log("请求URL:", `/api/password-entries/${id}`);

      const response = await passwordEntriesAPI.delete(id);
      console.log("删除密码条目API响应:", response);

      // 修复：检查code为1而不是200
      if (response.code === 1) {
        // 从本地列表中移除所有匹配的条目（避免重复条目问题）
        allEntries.value = allEntries.value.filter((entry) => entry.id !== id);
        console.log("密码条目删除成功，ID:", id);
      } else {
        throw new Error(response.msg || "删除密码条目失败");
      }
    } catch (err: any) {
      console.error("删除密码条目失败:", err);

      // 提供更详细的错误信息
      let errorMessage = "删除密码条目失败";
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "认证已过期，请重新登录";
            break;
          case 403:
            errorMessage = "权限不足，无法删除此密码条目";
            break;
          case 404:
            errorMessage = "密码条目不存在或已被删除";
            break;
          case 500:
            errorMessage = "服务器内部错误，请稍后重试";
            break;
          default:
            errorMessage = err.response.data?.msg || err.message || "删除失败";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  // 切换收藏状态
  const toggleFavorite = async (id: number, favorite: boolean): Promise<void> => {
    // 检查认证状态
    if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
      const errorMsg = "用户未认证或token已过期，无法切换收藏状态";
      console.warn(errorMsg);
      error.value = errorMsg;
      throw new Error(errorMsg);
    }

    try {
      console.log("正在切换收藏状态，ID:", id, "收藏状态:", favorite);
      const response = await passwordEntriesAPI.toggleFavorite(id, favorite);
      console.log("切换收藏状态API响应:", response);

      // 修复：检查code为1而不是200
      if (response.code === 1) {
        // 更新本地数据 - 确保更新所有匹配的条目（避免重复条目问题）
        entries.value.forEach((entry, index) => {
          if (entry.id === id) {
            entries.value[index].favorite = favorite;
          }
        });
        console.log("收藏状态切换成功，ID:", id);
      } else {
        throw new Error(response.msg || "切换收藏状态失败");
      }
    } catch (err: any) {
      console.error("切换收藏状态失败:", err);

      // 提供更详细的错误信息
      let errorMessage = "切换收藏状态失败";
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "认证已过期，请重新登录";
            break;
          case 403:
            errorMessage = "权限不足，无法修改收藏状态";
            break;
          case 404:
            errorMessage = "密码条目不存在";
            break;
          default:
            errorMessage = err.response.data?.msg || err.message || "操作失败";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      error.value = errorMessage;
      throw new Error(errorMessage);
    }
  };

  // 记录使用次数
  const recordUsage = async (id: number): Promise<void> => {
    try {
      await passwordEntriesAPI.recordUsage(id);

      // 更新本地数据 - 更新 allEntries 而不是 entries 计算属性
      allEntries.value.forEach((entry, index) => {
        if (entry.id === id) {
          allEntries.value[index].timesUsed += 1;
          allEntries.value[index].lastUsed = new Date().toISOString();
        }
      });
    } catch (err: any) {
      console.error("记录使用次数失败:", err);
      // 不抛出错误，因为这不是关键功能
    }
  };

  return {
    // 响应式数据
    loading,
    error,
    entries,
    total,
    totalPages,
    totalFavorites,
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
    loadMoreOnScroll,
    loadMoreSearchResults,
    checkAndLoadMore,
    refresh,
    resetQuery,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    recordUsage,
  };
}
