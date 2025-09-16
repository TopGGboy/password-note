<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>欢迎回来！</h1>
        <p>您的密码安全管理中心</p>
      </div>
      <div class="welcome-stats">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalPasswords }}</div>
          <div class="stat-label">总密码数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.strongPasswords }}</div>
          <div class="stat-label">强密码</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.weakPasswords }}</div>
          <div class="stat-label">弱密码</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h2>快捷操作</h2>
      <div class="actions-grid">
        <div class="action-card" @click="$router.push('/passwords')">
          <div class="action-icon">🔐</div>
          <h3>查看密码</h3>
          <p>管理所有保存的密码</p>
        </div>
        
        <div class="action-card" @click="showAddModal = true">
          <div class="action-icon">➕</div>
          <h3>添加密码</h3>
          <p>保存新的登录信息</p>
        </div>
        
        <div class="action-card" @click="showGeneratorModal = true">
          <div class="action-icon">🎲</div>
          <h3>生成密码</h3>
          <p>创建安全的随机密码</p>
        </div>
        
        <div class="action-card" @click="$router.push('/security')">
          <div class="action-icon">🛡️</div>
          <h3>安全检查</h3>
          <p>检查密码安全状态</p>
        </div>
      </div>
    </div>

    <!-- 最近密码 -->
    <div class="recent-passwords">
      <div class="section-header">
        <h2>最近添加</h2>
        <router-link to="/passwords" class="view-all">查看全部</router-link>
      </div>
      
      <div class="passwords-list">
        <div 
          v-for="password in recentPasswords" 
          :key="password.id"
          class="password-item"
          @click="viewPassword(password.id)"
        >
          <div class="password-icon">🔐</div>
          <div class="password-info">
            <h4>{{ password.title }}</h4>
            <p>{{ password.username }}</p>
          </div>
          <div class="password-meta">
            <span class="password-category">{{ password.category }}</span>
            <span class="password-date">{{ formatDate(password.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全提醒 -->
    <div class="security-alerts">
      <h2>安全提醒</h2>
      <div class="alerts-list">
        <div v-for="alert in securityAlerts" :key="alert.id" class="alert-item" :class="alert.type">
          <div class="alert-icon">{{ getAlertIcon(alert.type) }}</div>
          <div class="alert-content">
            <h4>{{ alert.title }}</h4>
            <p>{{ alert.message }}</p>
          </div>
          <button @click="handleAlert(alert)" class="alert-action">
            {{ alert.actionText }}
          </button>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <AddPasswordModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @success="handlePasswordAdded"
      @requireMasterPassword="handleRequireMasterPassword"
    />
    
    <PasswordGeneratorModal
      v-if="showGeneratorModal"
      @close="showGeneratorModal = false"
    />
    
    <!-- 主密码模态框 -->
    <MasterPasswordModal
      v-if="showMasterPasswordModal"
      :is-setup="!hasMasterPassword"
      @success="handleMasterPasswordSuccess"
      @close="handleMasterPasswordClose"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AddPasswordModal from '../components/AddPasswordModal.vue'
import PasswordGeneratorModal from '../components/PasswordGeneratorModal.vue'
import MasterPasswordModal from '../components/MasterPasswordModal.vue'
import { KeyManager } from '../utils/crypto'

interface PasswordItem {
  id: string
  title: string
  username: string
  category: string
  createdAt: Date
}

interface SecurityAlert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
  actionText: string
}

interface Stats {
  totalPasswords: number
  strongPasswords: number
  weakPasswords: number
}

export default defineComponent({
  name: 'Home',
  components: {
    AddPasswordModal,
    PasswordGeneratorModal,
    MasterPasswordModal
  },
  data() {
    return {
      showAddModal: false,
      showGeneratorModal: false,
      showMasterPasswordModal: false,
      hasMasterPassword: false,
      
      stats: {
        totalPasswords: 42,
        strongPasswords: 28,
        weakPasswords: 14
      } as Stats,
      
      recentPasswords: [
        {
          id: '1',
          title: 'GitHub',
          username: 'developer@email.com',
          category: '工作',
          createdAt: new Date('2024-03-10')
        },
        {
          id: '2',
          title: 'Netflix',
          username: 'user123',
          category: '娱乐',
          createdAt: new Date('2024-03-08')
        },
        {
          id: '3',
          title: 'Amazon',
          username: 'shopper@email.com',
          category: '购物',
          createdAt: new Date('2024-03-05')
        }
      ] as PasswordItem[],
      
      securityAlerts: [
        {
          id: '1',
          type: 'warning',
          title: '弱密码检测',
          message: '发现 3 个弱密码需要更新',
          actionText: '立即修复'
        },
        {
          id: '2',
          type: 'info',
          title: '密码重复',
          message: '有 2 个网站使用了相同的密码',
          actionText: '查看详情'
        }
      ] as SecurityAlert[]
    }
  },
  async mounted() {
    // 检查是否已有主密码设置（持久化检查）
    this.hasMasterPassword = KeyManager.hasMasterPassword()
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      try {
        // 模拟API调用加载仪表板数据
        console.log('加载仪表板数据')
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    
    viewPassword(id: string) {
      this.$router.push(`/passwords/${id}`)
    },
    
    formatDate(date: Date): string {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN')
    },
    
    getAlertIcon(type: string): string {
      switch (type) {
        case 'warning': return '⚠️'
        case 'danger': return '🚨'
        case 'info': return 'ℹ️'
        default: return '📢'
      }
    },
    
    handleAlert(alert: SecurityAlert) {
      if (alert.id === '1') {
        this.$router.push('/security')
      } else if (alert.id === '2') {
        this.$router.push('/passwords?filter=duplicate')
      }
    },
    
    handlePasswordAdded(password: PasswordItem) {
      console.log('新密码已添加:', password)
      // 刷新最近密码列表
      this.recentPasswords.unshift(password)
      if (this.recentPasswords.length > 3) {
        this.recentPasswords.pop()
      }
      this.stats.totalPasswords++
    },

    // 处理需要主密码的情况
    handleRequireMasterPassword() {
      this.showMasterPasswordModal = true
    },

    // 处理主密码设置/验证成功
    handleMasterPasswordSuccess() {
      this.showMasterPasswordModal = false
      this.hasMasterPassword = true
      console.log('主密码验证成功，可以继续保存密码')
    },

    // 处理主密码模态框关闭
    handleMasterPasswordClose() {
      this.showMasterPasswordModal = false
      // 如果用户关闭了主密码模态框但没有设置密码，也关闭添加密码模态框
      if (!KeyManager.hasKey()) {
        this.showAddModal = false
      }
    }
  }
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-content p {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}

.welcome-stats {
  display: flex;
  gap: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 100px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.quick-actions {
  margin-bottom: 32px;
}

.quick-actions h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.action-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.action-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.action-card p {
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.recent-passwords {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.view-all {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.passwords-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.password-item:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.password-icon {
  font-size: 24px;
  background: #f7fafc;
  padding: 8px;
  border-radius: 8px;
}

.password-info {
  flex: 1;
}

.password-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.password-info p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.password-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.password-category {
  background: #e6fffa;
  color: #234e52;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.password-date {
  font-size: 12px;
  color: #718096;
}

.security-alerts {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.security-alerts h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
}

.alert-item.warning {
  background: #fffbeb;
  border-color: #f6e05e;
}

.alert-item.danger {
  background: #fff5f5;
  border-color: #feb2b2;
}

.alert-item.info {
  background: #ebf8ff;
  border-color: #90cdf4;
}

.alert-icon {
  font-size: 24px;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.alert-content p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.alert-action {
  background: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.alert-action:hover {
  background: #2c5aa0;
}

@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }
  
  .welcome-section {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .welcome-stats {
    justify-content: center;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .password-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .password-meta {
    align-items: flex-start;
    width: 100%;
  }
  
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>