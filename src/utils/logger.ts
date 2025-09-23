/**
 * 统一日志管理工具
 * 提供开发环境日志和生产环境静默处理
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    // 生产环境默认只显示错误日志
    if (!this.isDevelopment) {
      this.level = LogLevel.ERROR;
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG && this.isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO && this.isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any): void {
    if (this.level <= LogLevel.ERROR) {
      if (error) {
        console.error(`❌ [ERROR] ${message}`, error);
      } else {
        console.error(`❌ [ERROR] ${message}`);
      }
    }
  }

  // 认证相关日志
  auth = {
    login: (username: string) => this.info(`用户登录: ${username}`),
    logout: (username: string) => this.info(`用户登出: ${username}`),
    tokenRefresh: () => this.debug('Token刷新成功'),
    tokenExpired: () => this.debug('Token已过期'),
    authFailed: (reason: string) => this.warn(`认证失败: ${reason}`)
  };

  // HTTP请求相关日志
  http = {
    request: (method: string, url: string) => this.debug(`${method} ${url}`),
    response: (status: number, url: string) => this.debug(`${status} ${url}`),
    error: (error: any, url: string) => this.error(`请求失败 ${url}`, error)
  };
}

export const logger = new Logger();
export default logger;