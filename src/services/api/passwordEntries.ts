import http from "../../utils/http";
import { API_ENDPOINTS } from "../../constants/constants";
import type {
  ApiResponse,
  CreatePasswordEntryRequest,
  GetPasswordEntriesRequest,
  GetPasswordEntriesResponse,
  PasswordEntry
} from "../../types/api";

// 密码条目相关API
export const passwordEntriesAPI = {
  // 创建密码条目
  create: (
    data: CreatePasswordEntryRequest
  ): Promise<ApiResponse<PasswordEntry>> => {
    return http.post(API_ENDPOINTS.PASSWORDENTRIES.BASE, data);
  },

  // 分页查询密码条目
  page: (
    params: GetPasswordEntriesRequest
  ): Promise<ApiResponse<GetPasswordEntriesResponse>> => {
    return http.get(API_ENDPOINTS.PASSWORDENTRIES.PAGE, { params });
  },

  // 搜索密码条目
  search: (
    keyword: string,
    page: number = 1,
    pagesize: number = 10
  ): Promise<ApiResponse<GetPasswordEntriesResponse>> => {
    return http.get(API_ENDPOINTS.PASSWORDENTRIES.SEARCH, {
      params: { keyword, page, pagesize }
    });
  },

  // 删除密码条目
  delete: (id: number): Promise<ApiResponse<string>> => {
    return http.delete(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}`);
  },

  // 更新密码条目
  update: (
    id: number,
    data: Partial<CreatePasswordEntryRequest>
  ): Promise<ApiResponse<PasswordEntry>> => {
    return http.put(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}`, data);
  },

  // 切换收藏状态
  toggleFavorite: (id: number, favorite: boolean): Promise<ApiResponse<null>> => {
    return http.put(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}/favorite`, null, {
      params: {favorite}
    });
  },

  // 获取单个密码条目
  getById: (id: number): Promise<ApiResponse<PasswordEntry>> => {
    return http.get(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}`);
  },

  // 记录使用次数
  recordUsage: (id: number): Promise<ApiResponse<null>> => {
    return http.patch(`${API_ENDPOINTS.PASSWORDENTRIES.BASE}/${id}/usage`);
  },
};
