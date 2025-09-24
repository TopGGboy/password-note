<template>
  <div class="security-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>安全中心</h1>
            <p>全面检查和提升您的密码安全性</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="runSecurityCheck" class="check-btn" :disabled="isChecking">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
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
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.totalPasswords }}</div>
            <div class="stat-label">总密码数</div>
          </div>
        </div>

        <div class="stat-card weak">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.weakPasswords }}</div>
            <div class="stat-label">弱密码</div>
          </div>
        </div>

        <div class="stat-card duplicate">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.duplicatePasswords }}</div>
            <div class="stat-label">重复密码</div>
          </div>
        </div>

        <div class="stat-card expiring">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ securityStats.expiringPasswords }}</div>
            <div class="stat-label">即将过期</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全问题列表 -->
    <div class="security-issues">
      <div class="section-header">
        <h2>安全问题</h2>
        <span v-if="securityIssues.length > 0" class="issue-count">{{ securityIssues.length }} 个问题</span>
      </div>
      
      <div v-if="securityIssues.length === 0" class="no-issues">
        <div class="no-issues-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
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
              <div class="issue-icon">
                <svg v-if="issue.type === 'weak'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <svg v-else-if="issue.type === 'duplicate'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <svg v-else-if="issue.type === 'expiring'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div class="issue-details">
                <h4>{{ issue.title }}</h4>
                <p>{{ issue.description }}</p>
              </div>
            </div>
            <div class="issue-actions">
              <span class="issue-count">{{ issue.count }} 个</span>
              <button @click="fixIssue(issue)" class="fix-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
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
              <div class="password-info">
                <span class="password-icon">{{ password.icon }}</span>
                <div class="password-details">
                  <span class="password-title">{{ password.title }}</span>
                  <span class="password-username">{{ password.username }}</span>
                </div>
              </div>
              <button @click="fixPassword(password)" class="fix-password-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                修复
              </button>
            </div>
          </div>
          
          <button
            v-if="issue.count > 0"
            @click="toggleIssueExpansion(issue)"
            class="toggle-btn"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline :points="issue.expanded ? '18,15 12,9 6,15' : '6,9 12,15 18,9'"/>
            </svg>
            {{ issue.expanded ? '收起' : '查看详情' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 安全建议 -->
    <div class="security-recommendations">
      <div class="section-header">
        <h2>安全建议</h2>
        <p>提升密码安全性的最佳实践</p>
      </div>
      <div class="recommendations-grid">
        <div class="recommendation-card">
          <div class="recommendation-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>使用强密码</h3>
          <p>密码应包含大小写字母、数字和特殊字符，长度至少12位</p>
          <button @click="generateStrongPassword" class="recommendation-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            生成强密码
          </button>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7h6v7z"/>
            </svg>
          </div>
          <h3>定期更新密码</h3>
          <p>建议每3-6个月更新一次重要账户的密码</p>
          <button @click="showPasswordsToUpdate" class="recommendation-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            查看需更新
          </button>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>启用双因素认证</h3>
          <p>为重要账户启用双因素认证，提供额外的安全保护</p>
          <button @click="learn2FA" class="recommendation-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            了解更多
          </button>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <h3>使用密码管理器</h3>
          <p>使用专业的密码管理器来生成和存储复杂密码</p>
          <button @click="learnPasswordManager" class="recommendation-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            了解更多
          </button>
        </div>
      </div>
    </div>

    <!-- 安全设置 -->
    <div class="security-settings">
      <div class="section-header">
        <h2>安全设置</h2>
        <p>配置应用的安全选项</p>
      </div>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
            </div>
            <div class="setting-text">
              <h4>自动锁定</h4>
              <p>在指定时间后自动锁定应用</p>
            </div>
          </div>
          <div class="setting-control">
            <select v-model="settings.autoLockTime" @change="updateSettings" class="select-input">
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
            <div class="setting-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M13 12h1"/>
              </svg>
            </div>
            <div class="setting-text">
              <h4>密码强度检查</h4>
              <p>自动检查新密码的强度</p>
            </div>
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
            <div class="setting-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="setting-text">
              <h4>重复密码警告</h4>
              <p>检测并警告重复使用的密码</p>
            </div>
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
            <div class="setting-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="setting-text">
              <h4>密码过期提醒</h4>
              <p>提醒更新长时间未更改的密码</p>
            </div>
          </div>
          <div class="setting-control">
            <select v-model="settings.passwordExpiryReminder" @change="updateSettings" class="select-input">
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
  background: var(--bg-secondary);
  padding: var(--spacing-6);
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* 页面头部 */
.page-header {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.header-text h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.header-text p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--text-base);
}

.check-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.check-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 安全概览 */
.security-overview {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.overview-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
}

.card-header h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.security-score {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
}

.security-score.excellent { color: var(--success-500); }
.security-score.good { color: var(--primary-500); }
.security-score.fair { color: var(--warning-500); }
.security-score.poor { color: var(--danger-500); }

.score-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-4);
}

.score-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: var(--radius-full);
}

.score-fill.excellent { background: var(--success-500); }
.score-fill.good { background: var(--primary-500); }
.score-fill.fair { background: var(--warning-500); }
.score-fill.poor { background: var(--danger-500); }

.score-description {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.stat-card.weak { border-left: 4px solid var(--danger-500); }
.stat-card.duplicate { border-left: 4px solid var(--warning-500); }
.stat-card.expiring { border-left: 4px solid var(--warning-600); }

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: block;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 通用部分样式 */
.section-header {
  margin-bottom: var(--spacing-6);
}

.section-header h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.section-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--text-base);
}

.issue-count {
  background: var(--danger-100);
  color: var(--danger-700);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

/* 安全问题 */
.security-issues {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.security-issues .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-issues {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--text-secondary);
}

.no-issues-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-6);
  color: var(--success-500);
}

.no-issues-icon svg {
  width: 100%;
  height: 100%;
}

.no-issues h3 {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--text-xl);
}

.no-issues p {
  margin: 0;
  line-height: 1.6;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.issue-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  transition: all 0.2s;
}

.issue-item:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.issue-item.high { border-left: 4px solid var(--danger-500); }
.issue-item.medium { border-left: 4px solid var(--warning-500); }
.issue-item.low { border-left: 4px solid var(--warning-600); }

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.issue-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
}

.issue-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.issue-icon svg {
  width: 20px;
  height: 20px;
}

.issue-details h4 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.issue-details p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.issue-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.issue-actions .issue-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  background: var(--bg-secondary);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
}

.fix-btn {
  background: var(--primary-500);
  color: white;
  border: none;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.fix-btn:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
}

.affected-passwords {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.affected-password {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.password-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.password-icon {
  font-size: var(--text-base);
}

.password-details {
  display: flex;
  flex-direction: column;
}

.password-title {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.password-username {
  color: var(--text-secondary);
  font-size: var(--text-xs);
}

.fix-password-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-xs);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.fix-password-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary-500);
  cursor: pointer;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--primary-50);
}

/* 安全建议 */
.security-recommendations {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-5);
}

.recommendation-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  text-align: center;
  transition: all 0.2s;
}

.recommendation-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.recommendation-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-4);
  color: var(--primary-500);
}

.recommendation-icon svg {
  width: 24px;
  height: 24px;
}

.recommendation-card h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3) 0;
}

.recommendation-card p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-5) 0;
  line-height: 1.5;
}

.recommendation-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.recommendation-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

/* 安全设置 */
.security-settings {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-5);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
}

.setting-item:hover {
  border-color: var(--border-hover);
  background: var(--bg-secondary);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
}

.setting-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.setting-icon svg {
  width: 20px;
  height: 20px;
}

.setting-text h4 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.setting-text p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.select-input {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  min-width: 120px;
  font-size: var(--text-sm);
}

.select-input:focus {
  outline: none;
  border-color: var(--primary-500);
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
  background-color: var(--bg-tertiary);
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
  background-color: var(--primary-500);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .security-container {
    padding: var(--spacing-4);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--spacing-4);
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
    gap: var(--spacing-3);
  }
  
  .setting-control {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>