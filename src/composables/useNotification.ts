import { ref, readonly } from 'vue'

export interface NotificationOptions {
  title: string
  message?: string
  type?: 'success' | 'error'
  duration?: number
}

const notifications = ref<Array<NotificationOptions & { id: number }>>([])
let idCounter = 0

export function useNotification() {
  const show = (options: NotificationOptions) => {
    const id = ++idCounter
    const notification = {
      id,
      ...options
    }
    notifications.value.push(notification)
    return id
  }

  const success = (title: string, message?: string, duration: number = 3000) => {
    return show({ title, message, type: 'success', duration })
  }

  const error = (title: string, message?: string, duration: number = 4000) => {
    return show({ title, message, type: 'error', duration })
  }

  const remove = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications: readonly(notifications),
    show,
    success,
    error,
    remove,
    clear
  }
}
