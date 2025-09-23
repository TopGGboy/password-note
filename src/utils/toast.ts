/**
 * 统一的用户提示工具
 * 替代alert()和console.log()用于用户交互
 */

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  showClose?: boolean;
}

class ToastManager {
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    if (typeof window === 'undefined') return;
    
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(message: string, type: ToastType = ToastType.INFO, options: ToastOptions = {}): void {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      pointer-events: auto;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;

    toast.textContent = message;
    this.container.appendChild(toast);

    // 触发动画
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);

    // 自动移除
    const duration = options.duration || 3000;
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (this.container && this.container.contains(toast)) {
          this.container.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  private getBackgroundColor(type: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS:
        return '#52c41a';
      case ToastType.ERROR:
        return '#ff4d4f';
      case ToastType.WARNING:
        return '#faad14';
      case ToastType.INFO:
      default:
        return '#1890ff';
    }
  }

  success(message: string, options?: ToastOptions): void {
    this.show(message, ToastType.SUCCESS, options);
  }

  error(message: string, options?: ToastOptions): void {
    this.show(message, ToastType.ERROR, options);
  }

  warning(message: string, options?: ToastOptions): void {
    this.show(message, ToastType.WARNING, options);
  }

  info(message: string, options?: ToastOptions): void {
    this.show(message, ToastType.INFO, options);
  }
}

export const toast = new ToastManager();
export default toast;