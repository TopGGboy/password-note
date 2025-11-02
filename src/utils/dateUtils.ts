/**
 * 日期时间格式化工具函数
 * 统一处理时间显示格式
 */

/**
 * 格式化日期为相对时间
 * @param dateStr 日期字符串（ISO格式）
 * @returns 相对时间字符串，如"刚刚"、"2分钟前"、"3小时前"、"5天前"
 */
export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '刚刚'

  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // 如果时间差为负数（未来时间），返回"刚刚"
    if (diff < 0) return '刚刚'

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    // 超过7天，显示完整日期
    return date.toLocaleDateString('zh-CN')
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '刚刚'
  }
}

/**
 * 格式化日期为完整日期时间
 * @param dateStr 日期字符串
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化失败:', error)
    return ''
  }
}

/**
 * 格式化日期为日期字符串
 * @param dateStr 日期字符串
 * @returns 格式化的日期字符串（如：2024-01-01）
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch (error) {
    console.error('日期格式化失败:', error)
    return ''
  }
}

