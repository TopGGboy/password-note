<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>活跃会话</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <p class="sessions-description">
          以下是您账户的所有活跃登录会话。如果发现可疑活动，请立即终止相关会话。
        </p>
        
        <div class="sessions-list">
          <div 
            v-for="session in sessions" 
            :key="session.id"
            class="session-item"
            :class="{ current: session.isCurrent }"
          >
            <div class="session-info">
              <div class="session-device">
                <span class="device-icon">{{ getDeviceIcon(session.device) }}</span>
                <div class="device-details">
                  <h4>{{ session.device }}</h4>
                  <p>{{ session.browser }} • {{ session.os }}</p>
                </div>
              </div>
              
              <div class="session-meta">
                <div class="session-location">
                  <span class="location-icon">📍</span>
                  {{ session.location }}
                </div>
                <div class="session-time">
                  <span class="time-icon">🕒</span>
                  {{ formatTime(session.lastActive) }}
                </div>
                <div class="session-ip">
                  <span class="ip-icon">🌐</span>
                  {{ session.ipAddress }}
                </div>
              </div>
            </div>
            
            <div class="session-actions">
              <span v-if="session.isCurrent" class="current-badge">
                当前会话
              </span>
              <button 
                v-else
                @click="terminateSession(session.id)"
                class="terminate-btn"
                :disabled="loading"
              >
                终止会话
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="terminateAllOthers" class="danger-btn" :disabled="loading">
            {{ loading ? '处理中...' : '终止其他所有会话' }}
          </button>
          <button @click="$emit('close')" class="cancel-btn">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Session {
  id: string
  device: string
  browser: string
  os: string
  location: string
  ipAddress: string
  lastActive: Date
  isCurrent: boolean
}

export default defineComponent({
  name: 'SessionsModal',
  emits: ['close'],
  data() {
    return {
      loading: false,
      sessions: [
        {
          id: '1',
          device: 'Windows PC',
          browser: 'Chrome 120.0',
          os: 'Windows 11',
          location: '北京, 中国',
          ipAddress: '192.168.1.100',
          lastActive: new Date(),
          isCurrent: true
        },
        {
          id: '2',
          device: 'iPhone 15',
          browser: 'Safari 17.0',
          os: 'iOS 17.2',
          location: '上海, 中国',
          ipAddress: '10.0.0.50',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isCurrent: false
        },
        {
          id: '3',
          device: 'MacBook Pro',
          browser: 'Firefox 121.0',
          os: 'macOS 14.2',
          location: '深圳, 中国',
          ipAddress: '172.16.0.25',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isCurrent: false
        }
      ] as Session[]
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    
    getDeviceIcon(device: string): string {
      if (device.includes('iPhone') || device.includes('Android')) return '📱'
      if (device.includes('iPad') || device.includes('Tablet')) return '📱'
      if (device.includes('Mac')) return '💻'
      return '🖥️'
    },
    
    formatTime(date: Date): string {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (minutes < 1) return '刚刚活跃'
      if (minutes < 60) return `${minutes}分钟前活跃`
      if (hours < 24) return `${hours}小时前活跃`
      return `${days}天前活跃`
    },
    
    async terminateSession(sessionId: string) {
      if (!confirm('确定要终止这个会话吗？')) return
      
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
        console.log('会话已终止:', sessionId)
      } catch (error) {
        console.error('终止会话失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async terminateAllOthers() {
      if (!confirm('确定要终止所有其他会话吗？这将使其他设备上的登录失效。')) return
      
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        this.sessions = this.sessions.filter(s => s.isCurrent)
        console.log('已终止所有其他会话')
      } catch (error) {
        console.error('终止会话失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
  padding: 4px;
}

.close-btn:hover {
  color: #2d3748;
}

.modal-body {
  padding: 24px;
}

.sessions-description {
  color: #718096;
  margin-bottom: 24px;
  line-height: 1.5;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.session-item:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.session-item.current {
  border-color: #3182ce;
  background: #ebf8ff;
}

.session-info {
  flex: 1;
}

.session-device {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.device-icon {
  font-size: 24px;
}

.device-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.device-details p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

.session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #718096;
}

.session-meta > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.session-actions {
  display: flex;
  align-items: center;
}

.current-badge {
  background: #3182ce;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.terminate-btn {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.terminate-btn:hover:not(:disabled) {
  background: #feb2b2;
  border-color: #fc8181;
}

.terminate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.danger-btn {
  background: #e53e3e;
  color: white;
  border: 1px solid #e53e3e;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover:not(:disabled) {
  background: #c53030;
}

.danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #edf2f7;
}

@media (max-width: 768px) {
  .session-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .session-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .session-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>