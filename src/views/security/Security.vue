<template>
  <div class="security-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>安全中心</h1>
          <p>检查和提升您的密码安全性</p>
        </div>
        <div class="header-actions">
          <button @click="runSecurityCheck" class="check-btn" :disabled="isChecking">
            <span class="btn-icon">🛡️</span>
            {{ isChecking ? '检查中...' : '安全检查' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 安全概览 -->
    <div class="security-overview">
      <div class="overview-card">
        <div class="card-header">
          <h3>安全评分</h3>
          <div class="security-score" :class="securityScore.level">
            {{ securityScore.score }}
          </div>
        </div>
        <div class="score-bar">
          <div 
            class="score-fill" 
            :class="securityScore.level"
            :style="{ width: securityScore.score + '%' }"
          ></div>
        </div>
        <p class="score-description">{{ securityScore.description }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🔐</div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.totalPasswords }}</div>
            <div class="stat-label">总密码数</div>
          </div>
        </div>

        <div class="stat-card weak">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.weakPasswords }}</div>
            <div class="stat-label">弱密码</div>
          </div>
        </div>

        <div class="stat-card duplicate">
          <div class="stat-icon">🔄</div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.duplicatePasswords }}</div>
            <div class="stat-label">重复密码</div>
          </div>
        </div>

        <div class="stat-card expiring">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.expiringPasswords }}</div>
            <div class="stat-label">即将过期</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全问题列表 -->
    <div class="security-issues">
      <h2>安全问题</h2>
      
      <div v-if="securityIssues.length === 0" class="no-issues">
        <div class="no-issues-icon">✅</div>
        <h3>太棒了！没有发现安全问题</h3>
        <p>您的密码安全性良好，继续保持！</p>
      </div>

      <div v-else class="issues-list">
        <div
          v-for="issue in securityIssues"
          :key="issue.id"
          class="issue-item"
          :class="issue.severity"
        >
          <div class="issue-header">
            <div class="issue-info">
              <span class="issue-icon">{{ getIssueIcon(issue.type) }}</span>
              <div class="issue-details">
                <h4>{{ issue.title }}</h4>
                <p>{{ issue.description }}</p>
              </div>
            </div>
            <div class="issue-actions">
              <span class="issue-count">{{ issue.count }} 个</span>
              <button @click="fixIssue(issue)" class="fix-btn">
                修复
              </button>
            </div>
          </div>
          
          <!-- 受影响的密码列表 -->
          <div v-if="issue.expanded" class="affected-passwords">
            <div
              v-for="password in issue.affectedPasswords"
              :key="password.id"
              class="affected-password"
            >
              <span class="password-icon">{{ password.icon }}</span>
              <span class="password-title">{{ password.title }}</span>
              <span class="password-username">{{ password.username }}</span>
              <button @click="fixPassword(password)" class="fix-password-btn">
                修复
              </button>
            </div>
          </div>
          
          <button
            v-if="issue.count > 0"
            @click="toggleIssueExpansion(issue)"
            class="toggle-btn"
          >
            {{ issue.expanded ? '收起' : '查看详情' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 安全建议 -->
    <div class="security-recommendations">
      <h2>安全建议</h2>
      <div class="recommendations-grid">
        <div class="recommendation-card">
          <div class="recommendation-icon">🔒</div>
          <h3>使用强密码</h3>
          <p>密码应包含大小写字母、数字和特殊字符，长度至少12位</p>
          <button @click="generateStrongPassword" class="recommendation-btn">
            生成强密码
          </button>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-icon">🔄</div>
          <h3>定期更新密码</h3>
          <p>建议每3-6个月更新一次重要账户的密码</p>
          <button @click="showPasswordsToUpdate" class="recommendation-btn">
            查看需更新
          </button>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-icon">🛡️</div>
          <h3>启用双因素认证</h3>
          <p>为重要账户启用双因素认证，提供额外的安全保护</p>
          <button @click="learn2FA" class="recommendation-btn">
            了解更多
          </button>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-icon">📱</div>
          <h3>使用密码管理器</h3>
          <p>使用专业的密码管理器来生成和存储复杂密码</p>
          <button @click="learnPasswordManager" class="recommendation-btn">
            了解更多
          </button>
        </div>
      </div>
    </div>

    <!-- 安全设置 -->
    <div class="security-settings">
      <h2>安全设置</h2>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <h4>自动锁定</h4>
            <p>在指定时间后自动锁定应用</p>
          </div>
          <div class="setting-control">
            <select v-model="settings.autoLockTime" @change="updateSettings">
              <option value="0">从不</option>
              <option value="5">5分钟</option>
              <option value="15">15分钟</option>
              <option value="30">30分钟</option>
              <option value="60">1小时</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>密码强度检查</h4>
            <p>自动检查新密码的强度</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input
                v-model="settings.passwordStrengthCheck"
                type="checkbox"
                @change="updateSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>重复密码警告</h4>
            <p>检测并警告重复使用的密码</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input
                v-model="settings.duplicatePasswordWarning"
                type="checkbox"
                @change="updateSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>密码过期提醒</h4>
            <p>提醒更新长时间未更改的密码</p>
          </div>
          <div class="setting-control">
            <select v-model="settings.passwordExpiryReminder" @change="updateSettings">
              <option value="0">关闭</option>
              <option value="90">90天</option>
              <option value="180">180天</option>
              <option value="365">1年</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface SecurityIssue {
  id: string
  type: 'weak' | 'duplicate' | 'expiring' | 'breach'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  count: number
  expanded: boolean
  affectedPasswords: any[]
}

interface SecurityStats {
  totalPasswords: number
  weakPasswords: number
  duplicatePasswords: number
  expiringPasswords: number
}

interface SecurityScore {
  score: number
  level: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
}

interface SecuritySettings {
  autoLockTime: number
  passwordStrengthCheck: boolean
  duplicatePasswordWarning: boolean
  passwordExpiryReminder: number
}

export default defineComponent({
  name: 'Security',
  data() {
    return {
      isChecking: false,
      
      securityStats: {
        totalPasswords: 24,
        weakPasswords: 3,
        duplicatePasswords: 2,
        expiringPasswords: 1
      } as SecurityStats,
      
      securityScore: {
        score: 75,
        level: 'good',
        description: '您的密码安全性良好，但仍有改进空间'
      } as SecurityScore,
      
      securityIssues: [] as SecurityIssue[],
      
      settings: {
        autoLockTime: 15,
        passwordStrengthCheck: true,
        duplicatePasswordWarning: true,
        passwordExpiryReminder: 180
      } as SecuritySettings
    }
  },
  async mounted() {
    await this.loadSecurityData()
  },
  methods: {
    // 加载安全数据
    async loadSecurityData() {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.securityIssues = [
          {
            id: '1',
            type: 'weak',
            severity: 'high',
            title: '弱密码',
            description: '这些密码过于简单，容易被破解',
            count: 3,
            expanded: false,
            affectedPasswords: [
              { id: '1', title: '微信', username: 'user123', icon: '💬' },
              { id: '2', title: 'QQ', username: 'myqq', icon: '🐧' },
              { id: '3', title: '微博', username: 'weibo_user', icon: '📱' }
            ]
          },
          {
            id: '2',
            type: 'duplicate',
            severity: 'medium',
            title: '重复密码',
            description: '多个账户使用了相同的密码',
            count: 2,
            expanded: false,
            affectedPasswords: [
              { id: '4', title: '淘宝', username: 'shopper', icon: '🛒' },
              { id: '5', title: '京东', username: 'buyer', icon: '📦' }
            ]
          },
          {
            id: '3',
            type: 'expiring',
            severity: 'low',
            title: '密码过期',
            description: '这些密码很久没有更新了',
            count: 1,
            expanded: false,
            affectedPasswords: [
              { id: '6', title: '银行卡', username: '6222****1234', icon: '🏦' }
            ]
          }
        ]
        
        this.calculateSecurityScore()
      } catch (error) {
        console.error('加载安全数据失败:', error)
      }
    },

    // 计算安全评分
    calculateSecurityScore() {
      const total = this.securityStats.totalPasswords
      const weak = this.securityStats.weakPasswords
      const duplicate = this.securityStats.duplicatePasswords
      const expiring = this.securityStats.expiringPasswords
      
      let score = 100
      
      // 弱密码扣分
      score -= (weak / total) * 40
      
      // 重复密码扣分
      score -= (duplicate / total) * 30
      
      // 过期密码扣分
      score -= (expiring / total) * 20
      
      score = Math.max(0, Math.round(score))
      
      let level: SecurityScore['level']
      let description: string
      
      if (score >= 90) {
        level = 'excellent'
        description = '优秀！您的密码安全性非常好'
      } else if (score >= 75) {
        level = 'good'
        description = '良好，您的密码安全性不错，但仍有改进空间'
      } else if (score >= 60) {
        level = 'fair'
        description = '一般，建议改进密码安全性'
      } else {
        level = 'poor'
        description = '较差，强烈建议立即改进密码安全性'
      }
      
      this.securityScore = { score, level, description }
    },

    // 运行安全检查
    async runSecurityCheck() {
      this.isChecking = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await this.loadSecurityData()
      } finally {
        this.isChecking = false
      }
    },

    // 获取问题图标
    getIssueIcon(type: string): string {
      switch (type) {
        case 'weak': return '⚠️'
        case 'duplicate': return '🔄'
        case 'expiring': return '⏰'
        case 'breach': return '🚨'
        default: return '❓'
      }
    },

    // 修复问题
    fixIssue(issue: SecurityIssue) {
      console.log('修复问题:', issue.title)
      // 实际项目中实现修复逻辑
    },

    // 修复单个密码
    fixPassword(password: any) {
      console.log('修复密码:', password.title)
      // 实际项目中实现修复逻辑
    },

    // 切换问题展开状态
    toggleIssueExpansion(issue: SecurityIssue) {
      issue.expanded = !issue.expanded
    },

    // 生成强密码
    generateStrongPassword() {
      this.$router.push('/passwords?action=generate')
    },

    // 显示需要更新的密码
    showPasswordsToUpdate() {
      this.$router.push('/passwords?filter=expiring')
    },

    // 了解双因素认证
    learn2FA() {
      window.open('https://example.com/2fa-guide', '_blank')
    },

    // 了解密码管理器
    learnPasswordManager() {
      window.open('https://example.com/password-manager-guide', '_blank')
    },

    // 更新设置
    updateSettings() {
      console.log('更新安全设置:', this.settings)
      // 实际项目中保存到后端
    }
  }
})
</script>

<style scoped>
.security-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.header-left p {
  color: #718096;
  margin: 0;
  font-size: 16px;
}

.check-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.check-btn:hover:not(:disabled) {
  background: #2c5282;
}

.check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.security-overview {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 32px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.security-score {
  font-size: 36px;
  font-weight: 700;
}

.security-score.excellent { color: #38a169; }
.security-score.good { color: #3182ce; }
.security-score.fair { color: #d69e2e; }
.security-score.poor { color: #e53e3e; }

.score-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.score-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.score-fill.excellent { background: #38a169; }
.score-fill.good { background: #3182ce; }
.score-fill.fair { background: #d69e2e; }
.score-fill.poor { background: #e53e3e; }

.score-description {
  color: #718096;
  margin: 0;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card.weak { border-left: 4px solid #e53e3e; }
.stat-card.duplicate { border-left: 4px solid #d69e2e; }
.stat-card.expiring { border-left: 4px solid #dd6b20; }

.stat-icon {
  font-size: 24px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.security-issues {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.security-issues h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.no-issues {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.no-issues-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-issues h3 {
  color: #2d3748;
  margin: 0 0 8px 0;
}

.no-issues p {
  margin: 0;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.issue-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.issue-item.high { border-left: 4px solid #e53e3e; }
.issue-item.medium { border-left: 4px solid #d69e2e; }
.issue-item.low { border-left: 4px solid #dd6b20; }

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.issue-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.issue-icon {
  font-size: 24px;
}

.issue-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.issue-details p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.issue-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.issue-count {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.fix-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.fix-btn:hover {
  background: #2c5282;
}

.affected-passwords {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.affected-password {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.password-icon {
  font-size: 16px;
}

.password-title {
  font-weight: 500;
  color: #2d3748;
}

.password-username {
  color: #718096;
  font-size: 14px;
  flex: 1;
}

.fix-password-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.fix-password-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.toggle-btn {
  background: none;
  border: none;
  color: #3182ce;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.security-recommendations {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.security-recommendations h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.recommendation-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s;
}

.recommendation-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recommendation-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.recommendation-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.recommendation-card p {
  font-size: 14px;
  color: #718096;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.recommendation-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.recommendation-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.security-settings {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.security-settings h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.setting-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.setting-info p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.setting-control select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3182ce;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .security-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .security-overview {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>