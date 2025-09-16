<template>
  <div class="settings-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>设置</h1>
          <p>个性化您的密码管理体验</p>
        </div>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 账户设置 -->
      <div class="settings-section">
        <h2>账户设置</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>用户名</h4>
              <p>您的登录用户名</p>
            </div>
            <div class="setting-control">
              <input
                v-model="userSettings.username"
                type="text"
                class="setting-input"
                readonly
              />
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>邮箱地址</h4>
              <p>用于接收通知和找回密码</p>
            </div>
            <div class="setting-control">
              <input
                v-model="userSettings.email"
                type="email"
                class="setting-input"
                :readonly="!editingEmail"
              />
              <button
                @click="toggleEmailEdit"
                class="edit-btn"
              >
                {{ editingEmail ? '保存' : '编辑' }}
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>修改密码</h4>
              <p>定期更改密码以保护账户安全</p>
            </div>
            <div class="setting-control">
              <button @click="showChangePassword = true" class="action-btn">
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 应用设置 -->
      <div class="settings-section">
        <h2>应用设置</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>主题</h4>
              <p>选择您喜欢的界面主题</p>
            </div>
            <div class="setting-control">
              <select v-model="appSettings.theme" @change="updateAppSettings">
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>语言</h4>
              <p>选择界面显示语言</p>
            </div>
            <div class="setting-control">
              <select v-model="appSettings.language" @change="updateAppSettings">
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>自动保存</h4>
              <p>编辑密码时自动保存更改</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input
                  v-model="appSettings.autoSave"
                  type="checkbox"
                  @change="updateAppSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>显示密码强度</h4>
              <p>在密码列表中显示强度指示器</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input
                  v-model="appSettings.showPasswordStrength"
                  type="checkbox"
                  @change="updateAppSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="settings-section">
        <h2>安全设置</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>修改主密码</h4>
              <p>更改用于加密所有密码数据的主密码</p>
            </div>
            <div class="setting-control">
              <button @click="showChangeMasterPassword = true" class="action-btn">
                修改主密码
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>自动锁定</h4>
              <p>在指定时间后自动锁定应用</p>
            </div>
            <div class="setting-control">
              <select v-model="securitySettings.autoLockTime" @change="updateSecuritySettings">
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
              <h4>双因素认证</h4>
              <p>为您的账户添加额外的安全保护</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input
                  v-model="securitySettings.twoFactorAuth"
                  type="checkbox"
                  @change="handle2FAToggle"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>登录通知</h4>
              <p>新设备登录时发送邮件通知</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input
                  v-model="securitySettings.loginNotification"
                  type="checkbox"
                  @change="updateSecuritySettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>会话管理</h4>
              <p>查看和管理活跃的登录会话</p>
            </div>
            <div class="setting-control">
              <button @click="showSessions = true" class="action-btn">
                管理会话
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <h2>数据管理</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>数据导出</h4>
              <p>导出您的密码数据</p>
            </div>
            <div class="setting-control">
              <button @click="exportData" class="action-btn">
                导出数据
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>数据导入</h4>
              <p>从其他密码管理器导入数据</p>
            </div>
            <div class="setting-control">
              <button @click="showImport = true" class="action-btn">
                导入数据
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>数据备份</h4>
              <p>创建数据备份以防丢失</p>
            </div>
            <div class="setting-control">
              <button @click="createBackup" class="action-btn">
                创建备份
              </button>
            </div>
          </div>

          <div class="setting-item danger">
            <div class="setting-info">
              <h4>删除账户</h4>
              <p>永久删除您的账户和所有数据</p>
            </div>
            <div class="setting-control">
              <button @click="showDeleteAccount = true" class="danger-btn">
                删除账户
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <h2>关于</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>版本信息</h4>
              <p>密码笔记 v{{ appVersion }}</p>
            </div>
            <div class="setting-control">
              <button @click="checkUpdate" class="action-btn">
                检查更新
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>帮助与支持</h4>
              <p>获取使用帮助和技术支持</p>
            </div>
            <div class="setting-control">
              <button @click="openHelp" class="action-btn">
                帮助中心
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>隐私政策</h4>
              <p>了解我们如何保护您的隐私</p>
            </div>
            <div class="setting-control">
              <button @click="openPrivacyPolicy" class="action-btn">
                查看政策
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <ChangePasswordModal
      v-if="showChangePassword"
      @close="showChangePassword = false"
      @success="handlePasswordChanged"
    />

    <!-- 修改主密码模态框 -->
    <ChangeMasterPasswordModal
      v-if="showChangeMasterPassword"
      @close="showChangeMasterPassword = false"
      @success="handleMasterPasswordChanged"
    />

    <!-- 会话管理模态框 -->
    <SessionsModal
      v-if="showSessions"
      @close="showSessions = false"
    />

    <!-- 导入数据模态框 -->
    <ImportDataModal
      v-if="showImport"
      @close="showImport = false"
      @success="handleDataImported"
    />

    <!-- 删除账户确认模态框 -->
    <DeleteAccountModal
      v-if="showDeleteAccount"
      @close="showDeleteAccount = false"
      @confirm="handleAccountDeleted"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChangePasswordModal from '../components/ChangePasswordModal.vue'
import ChangeMasterPasswordModal from '../components/ChangeMasterPasswordModal.vue'
import SessionsModal from '../components/SessionsModal.vue'
import ImportDataModal from '../components/ImportDataModal.vue'
import DeleteAccountModal from '../components/DeleteAccountModal.vue'

interface UserSettings {
  username: string
  email: string
}

interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoSave: boolean
  showPasswordStrength: boolean
}

interface SecuritySettings {
  autoLockTime: number
  twoFactorAuth: boolean
  loginNotification: boolean
}

export default defineComponent({
  name: 'Settings',
  components: {
    ChangePasswordModal,
    ChangeMasterPasswordModal,
    SessionsModal,
    ImportDataModal,
    DeleteAccountModal
  },
  data() {
    return {
      editingEmail: false,
      showChangePassword: false,
      showChangeMasterPassword: false,
      showSessions: false,
      showImport: false,
      showDeleteAccount: false,
      
      appVersion: '1.0.0',
      
      userSettings: {
        username: 'user123',
        email: 'user@example.com'
      } as UserSettings,
      
      appSettings: {
        theme: 'light',
        language: 'zh-CN',
        autoSave: true,
        showPasswordStrength: true
      } as AppSettings,
      
      securitySettings: {
        autoLockTime: 15,
        twoFactorAuth: false,
        loginNotification: true
      } as SecuritySettings
    }
  },
  async mounted() {
    await this.loadSettings()
  },
  methods: {
    // 加载设置
    async loadSettings() {
      try {
        // 模拟API调用
        console.log('加载用户设置')
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },

    // 切换邮箱编辑状态
    async toggleEmailEdit() {
      if (this.editingEmail) {
        // 保存邮箱
        try {
          console.log('保存邮箱:', this.userSettings.email)
          // 实际项目中调用API保存
        } catch (error) {
          console.error('保存邮箱失败:', error)
        }
      }
      this.editingEmail = !this.editingEmail
    },

    // 更新应用设置
    async updateAppSettings() {
      try {
        console.log('更新应用设置:', this.appSettings)
        // 实际项目中调用API保存
      } catch (error) {
        console.error('更新应用设置失败:', error)
      }
    },

    // 更新安全设置
    async updateSecuritySettings() {
      try {
        console.log('更新安全设置:', this.securitySettings)
        // 实际项目中调用API保存
      } catch (error) {
        console.error('更新安全设置失败:', error)
      }
    },

    // 处理双因素认证切换
    async handle2FAToggle() {
      if (this.securitySettings.twoFactorAuth) {
        // 启用2FA
        console.log('启用双因素认证')
        // 实际项目中显示2FA设置流程
      } else {
        // 禁用2FA
        if (confirm('确定要禁用双因素认证吗？这会降低账户安全性。')) {
          console.log('禁用双因素认证')
          // 实际项目中调用API禁用
        } else {
          this.securitySettings.twoFactorAuth = true
        }
      }
    },

    // 导出数据
    async exportData() {
      try {
        console.log('导出数据')
        // 实际项目中实现数据导出
        alert('数据导出功能开发中...')
      } catch (error) {
        console.error('导出数据失败:', error)
      }
    },

    // 创建备份
    async createBackup() {
      try {
        console.log('创建备份')
        // 实际项目中实现备份功能
        alert('备份创建成功！')
      } catch (error) {
        console.error('创建备份失败:', error)
      }
    },

    // 检查更新
    async checkUpdate() {
      try {
        console.log('检查更新')
        // 实际项目中检查应用更新
        alert('当前已是最新版本！')
      } catch (error) {
        console.error('检查更新失败:', error)
      }
    },

    // 打开帮助中心
    openHelp() {
      window.open('/help', '_blank')
    },

    // 打开隐私政策
    openPrivacyPolicy() {
      window.open('/privacy', '_blank')
    },

    // 处理密码修改成功
    handlePasswordChanged() {
      console.log('密码修改成功')
    },

    // 处理主密码修改成功
    handleMasterPasswordChanged() {
      console.log('主密码修改成功')
      // 可以在这里添加一些后续处理，比如提示用户重新登录等
      alert('主密码修改成功！请使用新密码重新登录应用。')
    },

    // 处理数据导入成功
    handleDataImported() {
      console.log('数据导入成功')
    },

    // 处理账户删除
    handleAccountDeleted() {
      console.log('账户已删除')
      // 实际项目中跳转到登录页
      this.$router.push('/login')
    }
  }
})
</script>

<style scoped>
.settings-container {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.settings-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.settings-group {
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
  border-radius: 12px;
  transition: all 0.2s;
}

.setting-item:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.setting-item.danger {
  border-color: #fed7d7;
  background: #fff5f5;
}

.setting-item.danger:hover {
  border-color: #feb2b2;
}

.setting-info {
  flex: 1;
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
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.setting-input:focus {
  outline: none;
  border-color: #3182ce;
}

.setting-input:read-only {
  background: #f7fafc;
  color: #718096;
}

.setting-control select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  min-width: 120px;
}

.setting-control select:focus {
  outline: none;
  border-color: #3182ce;
}

.edit-btn,
.action-btn {
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

.edit-btn:hover,
.action-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.danger-btn {
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

.danger-btn:hover {
  background: #feb2b2;
  border-color: #fc8181;
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
  .settings-container {
    padding: 16px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .setting-control {
    width: 100%;
    justify-content: flex-end;
  }
  
  .setting-input {
    min-width: auto;
    width: 100%;
  }
}
</style>