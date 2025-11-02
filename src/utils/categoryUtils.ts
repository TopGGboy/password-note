/**
 * 分类相关工具函数
 * 处理图标转换等功能
 */

// 分类图标列表（固定顺序，与后端数字索引对应）
export const CATEGORY_ICONS = [
  '📁', '🔐', '💼', '🏦', '🛒', '📧', '🎮', '📱',
  '💻', '🌐', '🎵', '📺', '🏠', '🚗', '✈️', '🏥',
  '🎓', '💳', '🔧', '📚', '🎨', '🏃', '🍔', '☕'
] as const

/**
 * 将emoji图标转换为数字索引（从1开始）
 * @param emoji emoji字符串
 * @returns 数字索引，如果未找到则返回1（默认图标）
 */
export function emojiToNumber(emoji: string): number {
  const index = CATEGORY_ICONS.indexOf(emoji as any)
  return index >= 0 ? index + 1 : 1 // 索引从1开始
}

/**
 * 将数字索引转换为emoji图标
 * @param num 数字索引（从1开始）
 * @returns emoji字符串，如果无效则返回默认图标📁
 */
export function numberToEmoji(num?: number): string {
  if (!num || num < 1 || num > CATEGORY_ICONS.length) {
    return CATEGORY_ICONS[0] // 默认返回第一个图标
  }
  return CATEGORY_ICONS[num - 1]
}

/**
 * 获取默认分类图标
 */
export function getDefaultCategoryIcon(): string {
  return CATEGORY_ICONS[0]
}

