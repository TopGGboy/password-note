<template>
  <div class="settings-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>设置</h1>
            <p>个性化您的密码管理体验</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 账户设置 -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="section-text">
            <h2>账户设置</h2>
            <p>管理您的个人信息和账户安全</p>
          </div>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>用户名</h4>
                <p>您的登录用户名</p>
              </div>
            </div>
            <div class="setting-control">
              <input
                v-model="userSettings.username"
                type="text"
                class="setting-input readonly"
                readonly
              />
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>邮箱地址</h4>
                <p>用于接收通知和找回密码</p>
              </div>
            </div>
            <div class="setting-control">
              <input
                v-model="userSettings.email"
                type="email"
                class="setting-input"
                :class="{ readonly: !editingEmail }"
                :readonly="!editingEmail"
              />
              <button
                @click="toggleEmailEdit"
                class="edit-btn"
                :class="{ saving: editingEmail && loading }"
              >
                <svg v-if="!editingEmail" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <svg v-else-if="loading" class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                {{ editingEmail ? (loading ? '保存中...' : '保存') : '编辑' }}
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>修改密码</h4>
                <p>定期更改密码以保护账户安全</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="showChangePassword = true" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 应用设置 -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div class="section-text">
            <h2>应用设置</h2>
            <p>自定义应用的外观和行为</p>
          </div>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>主题</h4>
                <p>选择您喜欢的界面主题</p>
              </div>
            </div>
            <div class="setting-control">
              <select v-model="appSettings.theme" @change="updateAppSettings" class="select-input">
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>语言</h4>
                <p>选择界面显示语言</p>
              </div>
            </div>
            <div class="setting-control">
              <select v-model="appSettings.language" @change="updateAppSettings" class="select-input">
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>自动保存</h4>
                <p>编辑密码时自动保存更改</p>
              </div>
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
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M13 12h1"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>显示密码强度</h4>
                <p>在密码列表中显示强度指示器</p>
              </div>
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
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="section-text">
            <h2>安全设置</h2>
            <p>保护您的账户和数据安全</p>
          </div>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>修改主密码</h4>
                <p>更改用于加密所有密码数据的主密码</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="showChangeMasterPassword = true" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                修改主密码
              </button>
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
                <h4>自动锁定</h4>
                <p>在指定时间后自动锁定应用</p>
              </div>
            </div>
            <div class="setting-control">
              <select v-model="securitySettings.autoLockTime" @change="updateSecuritySettings" class="select-input">
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
                <h4>双因素认证</h4>
                <p>为您的账户添加额外的安全保护</p>
              </div>
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
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>登录通知</h4>
                <p>新设备登录时发送邮件通知</p>
              </div>
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
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>会话管理</h4>
                <p>查看和管理活跃的登录会话</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="showSessions = true" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                管理会话
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div class="section-text">
            <h2>数据管理</h2>
            <p>导入、导出和备份您的数据</p>
          </div>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>数据导出</h4>
                <p>导出您的密码数据</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="exportData" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                导出数据
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>数据导入</h4>
                <p>从其他密码管理器导入数据</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="showImport = true" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                导入数据
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>数据备份</h4>
                <p>创建数据备份以防丢失</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="createBackup" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                创建备份
              </button>
            </div>
          </div>

          <div class="setting-item danger">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>删除账户</h4>
                <p>永久删除您的账户和所有数据</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="showDeleteAccount = true" class="danger-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                </svg>
                删除账户
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9,9h5a3,3,0,0,1,0,6H9"/>
              <line x1="12" y1="9" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="section-text">
            <h2>关于</h2>
            <p>应用信息和帮助支持</p>
          </div>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>版本信息</h4>
                <p>密码笔记 v{{ appVersion }}</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="checkUpdate" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 4v6h6"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                检查更新
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>帮助与支持</h4>
                <p>获取使用帮助和技术支持</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="openHelp" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                帮助中心
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div class="setting-text">
                <h4>隐私政策</h4>
                <p>了解我们如何保护您的隐私</p>
              </div>
            </div>
            <div class="setting-control">
              <button @click="openPrivacyPolicy" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                查看政策
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <svg v-if="toastType === 'success'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- 模态框占位符 - 实际项目中需要实现这些组件 -->
    <!-- 
    <ChangePasswordModal
      v-if="showChangePassword"
      @close="showChangePassword = false"
      @success="handlePasswordChanged"
    />

    <ChangeMasterPasswordModal
      v-if="showChangeMasterPassword"
      @close="showChangeMasterPassword = false"
      @success="handleMasterPasswordChanged"
    />

    <SessionsModal
      v-if="showSessions"
      @close="showSessions = false"
    />

    <ImportDataModal
      v-if="showImport"
      @close="showImport = false"
      @success="handleDataImported"
    />

    <DeleteAccountModal
      v-if="showDeleteAccount"
      @close="showDeleteAccount = false"
      @confirm="handleAccountDeleted"
    />
    -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
  data() {
    return {
      loading: false,
      editingEmail: false,
      showChangePassword: false,
      showChangeMasterPassword: false,
      showSessions: false,
      showImport: false,
      showDeleteAccount: false,
      
      showToast: false,
      toastMessage: '',
      toastType: 'success' as 'success' | 'error',
      
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
        this.loading = true
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('保存邮箱:', this.userSettings.email)
          this.showToastMessage('邮箱地址已更新')
        } catch (error) {
          console.error('保存邮箱失败:', error)
          this.showToastMessage('保存邮箱失败，请重试', 'error')
        } finally {
          this.loading = false
        }
      }
      this.editingEmail = !this.editingEmail
    },

    // 更新应用设置
    async updateAppSettings() {
      try {
        console.log('更新应用设置:', this.appSettings)
        this.showToastMessage('应用设置已更新')
        // 实际项目中调用API保存
      } catch (error) {
        console.error('更新应用设置失败:', error)
        this.showToastMessage('更新设置失败，请重试', 'error')
      }
    },

    // 更新安全设置
    async updateSecuritySettings() {
      try {
        console.log('更新安全设置:', this.securitySettings)
        this.showToastMessage('安全设置已更新')
        // 实际项目中调用API保存
      } catch (error) {
        console.error('更新安全设置失败:', error)
        this.showToastMessage('更新设置失败，请重试', 'error')
      }
    },

    // 处理双因素认证切换
    async handle2FAToggle() {
      if (this.securitySettings.twoFactorAuth) {
        // 启用2FA
        console.log('启用双因素认证')
        this.showToastMessage('双因素认证已启用')
        // 实际项目中显示2FA设置流程
      } else {
        // 禁用2FA
        if (confirm('确定要禁用双因素认证吗？这会降低账户安全性。')) {
          console.log('禁用双因素认证')
          this.showToastMessage('双因素认证已禁用')
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
        this.showToastMessage('数据导出功能开发中...')
        // 实际项目中实现数据导出
      } catch (error) {
        console.error('导出数据失败:', error)
        this.showToastMessage('导出数据失败，请重试', 'error')
      }
    },

    // 创建备份
    async createBackup() {
      try {
        console.log('创建备份')
        this.showToastMessage('备份创建成功！')
        // 实际项目中实现备份功能
      } catch (error) {
        console.error('创建备份失败:', error)
        this.showToastMessage('创建备份失败，请重试', 'error')
      }
    },

    // 检查更新
    async checkUpdate() {
      try {
        console.log('检查更新')
        this.showToastMessage('当前已是最新版本！')
        // 实际项目中检查应用更新
      } catch (error) {
        console.error('检查更新失败:', error)
        this.showToastMessage('检查更新失败，请重试', 'error')
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
      this.showToastMessage('密码修改成功')
    },

    // 处理主密码修改成功
    handleMasterPasswordChanged() {
      console.log('主密码修改成功')
      this.showToastMessage('主密码修改成功！请使用新密码重新登录应用。')
    },

    // 处理数据导入成功
    handleDataImported() {
      console.log('数据导入成功')
      this.showToastMessage('数据导入成功')
    },

    // 处理账户删除
    handleAccountDeleted() {
      console.log('账户已删除')
      this.showToastMessage('账户已删除')
      // 实际项目中跳转到登录页
      this.$router.push('/login')
    },

    // 显示提示消息
    showToastMessage(message: string, type: 'success' | 'error' = 'success') {
      this.toastMessage = message
      this.toastType = type
      this.showToast = true
      
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    }
  }
})
</script>

<style scoped>
.settings-container {
  padding: var(--spacing-2xl);
  background: transparent;
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

/* 设置内容 */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
}

.section-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-500);
}

.section-icon svg {
  width: 20px;
  height: 20px;
}

.section-text h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.section-text p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--text-sm);
}

.settings-group {
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

.setting-item.danger {
  border-color: var(--danger-200);
  background: var(--danger-50);
}

.setting-item.danger:hover {
  border-color: var(--danger-300);
  background: var(--danger-100);
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

.setting-input {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  min-width: 200px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.setting-input.readonly {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.select-input {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  min-width: 120px;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.select-input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.edit-btn,
.action-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
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

.edit-btn:hover,
.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.edit-btn.saving {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.danger-btn {
  background: var(--danger-100);
  color: var(--danger-700);
  border: 1px solid var(--danger-300);
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

.danger-btn:hover {
  background: var(--danger-200);
  border-color: var(--danger-400);
  color: var(--danger-800);
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

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 提示消息 */
.toast {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4) var(--spacing-5);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  z-index: 1000;
  min-width: 300px;
}

.toast.success {
  border-color: var(--success-500);
  color: var(--success-700);
}

.toast.success .icon {
  color: var(--success-500);
}

.toast.error {
  border-color: var(--danger-500);
  color: var(--danger-700);
}

.toast.error .icon {
  color: var(--danger-500);
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: var(--spacing-4);
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .setting-control {
    width: 100%;
    justify-content: flex-end;
  }
  
  .setting-input {
    min-width: auto;
    width: 100%;
  }

  .toast {
    right: var(--spacing-4);
    left: var(--spacing-4);
    min-width: auto;
  }
}
</style>