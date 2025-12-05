// API服务统一导出
import { userAPI } from './api/user';
import { captchaAPI } from './api/captcha';
import { emailAPI } from './api/email';
import { categoriesAPI } from './api/categories';
import { passwordEntriesAPI } from './api/passwordEntries';

// 统一导出所有API
export {
  userAPI,
  captchaAPI,
  emailAPI,
  categoriesAPI,
  passwordEntriesAPI
};

// 默认导出（保持向后兼容）
export default {
  user: userAPI,
  captcha: captchaAPI,
  email: emailAPI,
  categories: categoriesAPI,
  passwordEntries: passwordEntriesAPI,
};
