import { ref, reactive, computed } from "vue";
import { passwordEntriesAPI } from "../services/api";
import { tokenManager } from "../utils/auth/tokenManager";
import type {
  GetPasswordEntriesRequest,
  PasswordEntry,
  CreatePasswordEntryRequest,
} from "../types/api";
import {
  createDefaultPasswordEntriesQuery,
  validatePasswordEntriesQuery,
} from "../types/api";

export interface PasswordEntriesQuery extends GetPasswordEntriesRequest {}

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
  const loading = ref(false);
  const error = ref<string | null>(null);
  const allEntries = ref<DecryptedPasswordEntry[]>([]);
  const totalRecords = ref(0);
  const totalPages = ref(0);
  const totalFavorites = ref(0);

  const query = reactive<PasswordEntriesQuery>(
    createDefaultPasswordEntriesQuery()
  );

  const entries = computed(() => {
    let filtered = [...allEntries.value];

    console.log('=== 分类筛选调试信息 ===');
    console.log('当前query.categoryId:', query.categoryId);
    console.log('所有条目及其categoryId:', allEntries.value.map(entry => ({ id: entry.id, title: entry.title, categoryId: entry.categoryId })));

    if (query.categoryId !== undefined) {
      filtered = filtered.filter(entry => entry.categoryId === query.categoryId);
      console.log('分类筛选结果:', filtered.length, '条记录');
      console.log('筛选后的条目:', filtered.map(entry => ({ id: entry.id, title: entry.title, categoryId: entry.categoryId })));
    }

    if (query.favorite !== undefined) {
      filtered = filtered.filter(entry => (entry.favorite || false) === query.favorite);
    }

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(keyword) ||
        entry.username.toLowerCase().includes(keyword) ||
        (entry.url && entry.url.toLowerCase().includes(keyword)) ||
        entry.notes.toLowerCase().includes(keyword)
      );
    }

    if (query.sortBy) {
      filtered.sort((a, b) => {
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
        let aVal = a[query.sortBy as keyof DecryptedPasswordEntry];
        let bVal = b[query.sortBy as keyof DecryptedPasswordEntry];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          if (query.sortBy === 'updatedAt' || query.sortBy === 'createdAt' || query.sortBy === 'lastUsed') {
            return new Date(aVal).getTime() - new Date(bVal).getTime() * sortOrder;
          }
          return aVal.localeCompare(bVal) * sortOrder;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * sortOrder;
        }

        return 0;
      });
    }

    return filtered;
  });

  const total = computed(() => totalRecords.value || entries.value.length);
  const hasData = computed(() => entries.value.length > 0);
  const isEmpty = computed(() => !loading.value && entries.value.length === 0);
  const hasMore = computed(() => query.page < totalPages.value);

  const mapEntryToDecrypted = (entry: any): DecryptedPasswordEntry => {
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
      username: entry.username || entry.usernameEncrypted || "",
      password: entry.password || entry.passwordEncrypted || "",
      notes: entry.notes || entry.notesEncrypted || "",
      icon,
      tags,
    };
  };

  const fetchEntries = async (resetPage = false) => {
    if (!tokenManager.hasValidToken() || tokenManager.isTokenExpired()) {
      console.warn("用户未认证或token已过期，无法获取密码条目");
      error.value = "用户未认证，请重新登录";
      return;
    }

    if (resetPage) {
      query.page = 1;
    }

    loading.value = true;
    error.value = null;

    try {
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
        let entriesList: any[] = [];
        let paginationInfo: any = {};
        
        if (Array.isArray(response.data)) {
          entriesList = response.data;
          paginationInfo = response;
        } else if (response.data.list && Array.isArray(response.data.list)) {
          entriesList = response.data.list;
          paginationInfo = response.data;
        } else {
          entriesList = [];
          paginationInfo = {};
        }

        console.log('API返回的条目列表:', entriesList);
        console.log('条目数量:', entriesList.length);
        console.log('分页信息:', paginationInfo);

        const mappedEntries = entriesList.map(mapEntryToDecrypted);

        const uniqueEntries = Array.from(
          new Map(mappedEntries.map(entry => [entry.id, entry])).values()
        );

        if (resetPage || query.page === 1) {
          allEntries.value = uniqueEntries;
        } else {
          const existingIds = new Set(allEntries.value.map(entry => entry.id));
          const newEntries = uniqueEntries.filter(entry => !existingIds.has(entry.id));
          allEntries.value.push(...newEntries);
        }
        
        console.log('所有条目的分类ID:', allEntries.value.map(entry => ({ id: entry.id, title: entry.title, categoryId: entry.categoryId })));
        const categoryMap = JSON.parse(localStorage.getItem('categoryMap') || '{}')
        console.log('分类名称映射:', allEntries.value.map(entry => ({ 
          id: entry.id, 
          title: entry.title, 
          categoryId: entry.categoryId, 
          categoryName: entry.categoryId ? categoryMap[entry.categoryId] || '未知分类' : '未分类' 
        })));

        totalPages.value = paginationInfo.totalPages || Math.ceil((paginationInfo.total || 0) / validatedQuery.pageSize);
        totalRecords.value = paginationInfo.total || entriesList.length;
        totalFavorites.value = paginationInfo.totalFavorites || 0;
        
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

  const searchEntries = (keyword: string) => {
    if (!keyword.trim()) {
      query.keyword = undefined;
    } else {
      query.keyword = keyword.trim();
    }
  };

  const filterByCategory = (categoryId?: number) => {
    console.log('分类筛选函数被调用，分类ID:', categoryId);
    query.categoryId = categoryId;
    console.log('更新后的query.categoryId:', query.categoryId);
  };

  const filterFavorites = (favorite?: boolean) => {
    query.favorite = favorite;
  };

  const sortEntries = (
    sortBy: PasswordEntriesQuery["sortBy"],
    sortOrder: PasswordEntriesQuery["sortOrder"] = "desc"
  ) => {
    query.sortBy = sortBy;
    query.sortOrder = sortOrder;
  };

  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      query.page += 1;
      await fetchEntries(false);
    }
  };

  const loadMoreOnScroll = async () => {
    if (hasMore.value && !loading.value) {
      query.page += 1;
      
      if (query.keyword) {
        await loadMoreSearchResults();
      } else {
        await fetchEntries(false);
      }
    }
  };

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

      const response = await passwordEntriesAPI.search(
        query.keyword,
        query.page,
        query.pageSize
      );

      if (response.code === 1 && response.data) {
          let entriesList: any[] = [];
          let paginationInfo: any = {};
          
          if (Array.isArray(response.data)) {
            entriesList = response.data;
            paginationInfo = response;
          } else if (response.data.list && Array.isArray(response.data.list)) {
            entriesList = response.data.list;
            paginationInfo = response.data;
          } else {
            entriesList = [];
            paginationInfo = {};
          }
          
          console.log('搜索加载更多返回的条目列表:', entriesList);
          console.log('搜索分页信息:', paginationInfo);

          const mappedEntries = entriesList.map(mapEntryToDecrypted);
          
          const existingIds = new Set(allEntries.value.map(entry => entry.id));
          const newEntries = mappedEntries.filter(entry => !existingIds.has(entry.id));
          
          allEntries.value = [...allEntries.value, ...newEntries];

          totalPages.value = paginationInfo.totalPages || Math.ceil((paginationInfo.total || 0) / query.pageSize);
          totalRecords.value = paginationInfo.total || allEntries.value.length;
          totalFavorites.value = paginationInfo.totalFavorites || 0;

          console.log(`搜索加载更多完成 - 新增: ${newEntries.length} 条, 总计: ${allEntries.value.length} 条, 总记录数: ${totalRecords.value}`);
        } else {
          throw new Error(response.msg || "加载更多搜索结果失败");
        }
    } catch (err: any) {
      error.value = err.message || "加载更多搜索结果失败";
      console.error("加载更多搜索结果失败:", err);
      query.page -= 1;
    } finally {
      loading.value = false;
    }
  };

  const checkAndLoadMore = async (scrollElement?: HTMLElement) => {
    if (!scrollElement || !hasMore.value || loading.value) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= 0.8) {
      await loadMoreOnScroll();
    }
  };

  const refresh = async () => {
    await fetchEntries(true);
  };

  const resetQuery = () => {
    Object.assign(query, createDefaultPasswordEntriesQuery());
  };

  const createEntry = async (
    data: CreatePasswordEntryRequest
  ): Promise<PasswordEntry> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await passwordEntriesAPI.create(data);
      console.log("创建密码条目API响应:", response);

      if (response.code === 1 && response.data) {
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

  const updateEntry = async (
    id: number,
    data: Partial<CreatePasswordEntryRequest>
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await passwordEntriesAPI.update(id, data);
      console.log("更新密码条目API响应:", response);

      if (response.code === 1 && response.data) {
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

  const deleteEntry = async (id: number): Promise<void> => {
    console.log("=== 删除密码条目调试信息 ===");

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

      if (response.code === 1) {
        allEntries.value = allEntries.value.filter((entry) => entry.id !== id);
        console.log("密码条目删除成功，ID:", id);
      } else {
        throw new Error(response.msg || "删除密码条目失败");
      }
    } catch (err: any) {
      console.error("删除密码条目失败:", err);

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

  const toggleFavorite = async (id: number, favorite: boolean): Promise<void> => {
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

      if (response.code === 1) {
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

  const recordUsage = async (id: number): Promise<void> => {
    try {
      await passwordEntriesAPI.recordUsage(id);

      allEntries.value.forEach((entry, index) => {
        if (entry.id === id) {
          allEntries.value[index].timesUsed += 1;
          allEntries.value[index].lastUsed = new Date().toISOString();
        }
      });
    } catch (err: any) {
      console.error("记录使用次数失败:", err);
    }
  };

  return {
    loading,
    error,
    entries,
    total,
    totalPages,
    totalFavorites,
    query,
    hasData,
    isEmpty,
    hasMore,
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
