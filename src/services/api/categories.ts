import http from "../../utils/http";
import { API_ENDPOINTS } from "../../constants/constants";
import type {
  ApiResponse,
  CategoriesResponse,
  CreateCategoryRequest
} from "../../types/api";

// 分类相关API
export const categoriesAPI = {
  // 获取用户的所有分类
  getAll: (): Promise<ApiResponse<CategoriesResponse>> => {
    return http.get(API_ENDPOINTS.CATEGORIES.BASE);
  },
  // 创建分类
  create: (data: CreateCategoryRequest): Promise<ApiResponse<CategoriesResponse>> => {
    return http.post(API_ENDPOINTS.CATEGORIES.BASE, data);
  },
  // 删除分类
  delete: (id: number): Promise<ApiResponse<CategoriesResponse>> => {
    return http.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
  },
};
