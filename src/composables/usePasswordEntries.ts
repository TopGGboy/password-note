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
  const entries = ref<DecryptedPasswordEntry[]>([]);
  const total = ref(0);
  const totalPages = ref(0);

  // 查询参数
  const query = reactive<PasswordEntriesQuery>(
    createDefaultPasswordEntriesQuery()
  );

  // 计算属性
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

        if (resetPage || query.page === 1) {
          entries.value = decryptedEntries;
        } else {
          // 追加数据（用于无限滚动）
          entries.value.push(...decryptedEntries);
        }

        // 修复：使用API响应根级别的分页信息（使用类型断言）
        const responseWithPagination = response as any;
        total.value = responseWithPagination.total || 0;
        totalPages.value = responseWithPagination.totalPages || Math.ceil((responseWithPagination.total || 0) / validatedQuery.pageSize);
        
        console.log(`分页信息 - 当前页: ${query.page}, 每页大小: ${validatedQuery.pageSize}, 总记录数: ${total.value}, 总页数: ${totalPages.value}, 当前页记录数: ${entriesList.length}`);
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

  // 搜索密码条目 - 使用专门的搜索接口
  const searchEntries = async (keyword: string) => {
    // 检查认证状态
    if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
      console.warn("用户未认证或token已过期，无法搜索密码条目");
      error.value = "用户未认证，请重新登录";
      return;
    }

    // 检查是否有加密密钥
    if (!KeyManager.hasKey()) {
      console.warn("未找到加密密钥，请先输入主密码");
      error.value = "未找到加密密钥，请先输入主密码";
      window.dispatchEvent(new CustomEvent("requireMasterPassword"));
      return;
    }

    // 如果关键词为空，则恢复正常列表
    if (!keyword.trim()) {
      query.keyword = undefined;
      await fetchEntries(true);
      return;
    }

    // 重置分页状态
    query.page = 1;
    query.keyword = keyword.trim();
    
    loading.value = true;
    error.value = null;

    try {
      console.log('=== 搜索API请求调试信息 ===');
      console.log('搜索关键词:', keyword);
      console.log('页码:', query.page);
      console.log('每页大小:', query.pageSize);

      // 调用专门的搜索接口
      const response = await passwordEntriesAPI.search(
        keyword.trim(),
        query.page,
        query.pageSize
      );

      console.log('搜索API响应:', response);

      if (response.code === 1 && response.data) {
        // 处理搜索结果
        const entriesList = Array.isArray(response.data) ? response.data : [];
        console.log('搜索返回的条目列表:', entriesList);

        // 解密所有条目
        const decryptedEntries = entriesList.map(decryptPasswordEntry);
        entries.value = decryptedEntries;

        // 更新分页信息
        const responseWithPagination = response as any;
        total.value = responseWithPagination.total || 0;
        totalPages.value = responseWithPagination.totalPages || Math.ceil((responseWithPagination.total || 0) / query.pageSize);

        console.log(`搜索结果 - 关键词: "${keyword}", 找到: ${total.value} 条记录, 当前页: ${entriesList.length} 条`);
      } else {
        throw new Error(response.msg || "搜索密码条目失败");
      }
    } catch (err: any) {
      error.value = err.message || "搜索密码条目失败";
      console.error("搜索密码条目失败:", err);
    } finally {
      loading.value = false;
    }
  };

  // 按分类筛选
  const filterByCategory = async (categoryId?: number) => {
    query.categoryId = categoryId;
    await fetchEntries(true);
  };

  // 筛选收藏
  const filterFavorites = async (favorite?: boolean) => {
    query.favorite = favorite;
    await fetchEntries(true);
  };

  // 排序
  const sortEntries = async (
    sortBy: PasswordEntriesQuery["sortBy"],
    sortOrder: PasswordEntriesQuery["sortOrder"] = "desc"
  ) => {
    query.sortBy = sortBy;
    query.sortOrder = sortOrder;
    await fetchEntries(true);
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

        // 解密新条目并追加到现有列表
        const decryptedEntries = entriesList.map(decryptPasswordEntry);
        entries.value = [...entries.value, ...decryptedEntries];

        // 更新分页信息
        const responseWithPagination = response as any;
        total.value = responseWithPagination.total || 0;
        totalPages.value = responseWithPagination.totalPages || Math.ceil((responseWithPagination.total || 0) / query.pageSize);

        console.log(`搜索加载更多完成 - 新增: ${entriesList.length} 条, 总计: ${entries.value.length} 条`);
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
        // 从本地列表中移除
        entries.value = entries.value.filter((entry) => entry.id !== id);
        total.value -= 1;
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
        // 更新本地数据
        const index = entries.value.findIndex((entry) => entry.id === id);
        if (index !== -1) {
          entries.value[index].favorite = favorite;
        }
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

      // 更新本地数据
      const index = entries.value.findIndex((entry) => entry.id === id);
      if (index !== -1) {
        entries.value[index].timesUsed += 1;
        entries.value[index].lastUsed = new Date().toISOString();
      }
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
