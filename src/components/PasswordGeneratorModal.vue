<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>密码生成器</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="generator-container">
        <!-- 生成的密码显示 -->
        <div class="password-display">
          <div class="password-field">
            <input
              ref="passwordInput"
              v-model="generatedPassword"
              type="text"
              readonly
              class="password-input"
              placeholder="点击生成密码按钮"
            />
            <div class="password-actions">
              <button
                @click="copyPassword"
                class="action-btn copy-btn"
                :disabled="!generatedPassword"
                title="复制密码"
              >
                📋
              </button>
              <button
                @click="regeneratePassword"
                class="action-btn refresh-btn"
                title="重新生成"
              >
                🔄
              </button>
            </div>
          </div>
          
          <!-- 密码强度指示器 -->
          <div class="password-strength" v-if="generatedPassword">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.level"
                :style="{ width: passwordStrength.percentage + '%' }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </div>

        <!-- 生成选项 -->
        <div class="generator-options">
          <h4>生成选项</h4>
          
          <!-- 密码长度 -->
          <div class="option-group">
            <label class="option-label">
              <span>密码长度：{{ options.length }}</span>
              <input
                v-model="options.length"
                type="range"
                min="4"
                max="128"
                class="length-slider"
                @input="updatePassword"
              />
              <div class="length-display">
                <span>4</span>
                <span>128</span>
              </div>
            </label>
          </div>

          <!-- 字符类型选择 -->
          <div class="option-group">
            <label class="option-label">字符类型</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input
                  v-model="options.includeUppercase"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">大写字母 (A-Z)</span>
                <span class="checkbox-example">ABCDEFG</span>
              </label>
              
              <label class="checkbox-item">
                <input
                  v-model="options.includeLowercase"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">小写字母 (a-z)</span>
                <span class="checkbox-example">abcdefg</span>
              </label>
              
              <label class="checkbox-item">
                <input
                  v-model="options.includeNumbers"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">数字 (0-9)</span>
                <span class="checkbox-example">1234567</span>
              </label>
              
              <label class="checkbox-item">
                <input
                  v-model="options.includeSymbols"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">特殊字符</span>
                <span class="checkbox-example">!@#$%^&*</span>
              </label>
            </div>
          </div>

          <!-- 高级选项 -->
          <div class="option-group">
            <label class="option-label">高级选项</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input
                  v-model="options.excludeSimilar"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">排除相似字符</span>
                <span class="checkbox-example">0oO1lI</span>
              </label>
              
              <label class="checkbox-item">
                <input
                  v-model="options.excludeAmbiguous"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">排除歧义字符</span>
                <span class="checkbox-example">{}[]()\/~,;.<></span>
              </label>
              
              <label class="checkbox-item">
                <input
                  v-model="options.noSequential"
                  type="checkbox"
                  @change="updatePassword"
                />
                <span class="checkbox-text">避免连续字符</span>
                <span class="checkbox-example">abc, 123</span>
              </label>
            </div>
          </div>

          <!-- 自定义字符 -->
          <div class="option-group">
            <label class="option-label">
              <span>自定义字符集</span>
              <input
                v-model="options.customCharset"
                type="text"
                placeholder="输入自定义字符（可选）"
                class="custom-input"
                @input="updatePassword"
              />
            </label>
          </div>
        </div>

        <!-- 预设模板 -->
        <div class="preset-templates">
          <h4>快速模板</h4>
          <div class="template-buttons">
            <button
              v-for="template in templates"
              :key="template.name"
              @click="applyTemplate(template)"
              class="template-btn"
              :class="{ active: isCurrentTemplate(template) }"
            >
              <span class="template-name">{{ template.name }}</span>
              <span class="template-desc">{{ template.description }}</span>
            </button>
          </div>
        </div>

        <!-- 密码历史 -->
        <div class="password-history" v-if="passwordHistory.length > 0">
          <h4>最近生成</h4>
          <div class="history-list">
            <div
              v-for="(password, index) in passwordHistory"
              :key="index"
              class="history-item"
              @click="selectHistoryPassword(password)"
            >
              <span class="history-password">{{ maskPassword(password) }}</span>
              <div class="history-actions">
                <button
                  @click.stop="copyHistoryPassword(password)"
                  class="history-action-btn"
                  title="复制"
                >
                  📋
                </button>
                <button
                  @click.stop="useHistoryPassword(password)"
                  class="history-action-btn"
                  title="使用"
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="generator-actions">
          <button @click="generatePassword" class="generate-btn">
            🎲 生成新密码
          </button>
          <button
            @click="usePassword"
            :disabled="!generatedPassword"
            class="use-btn"
          >
            ✓ 使用此密码
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface GeneratorOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
  noSequential: boolean
  customCharset: string
}

interface PasswordTemplate {
  name: string
  description: string
  options: Partial<GeneratorOptions>
}

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  percentage: number
  text: string
}

export default defineComponent({
  name: 'PasswordGeneratorModal',
  emits: ['close', 'generated'],
  data() {
    return {
      generatedPassword: '',
      passwordHistory: [] as string[],
      
      options: {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: false,
        excludeAmbiguous: false,
        noSequential: false,
        customCharset: ''
      } as GeneratorOptions,
      
      templates: [
        {
          name: '强密码',
          description: '16位，包含所有字符类型',
          options: {
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: false,
            excludeAmbiguous: false
          }
        },
        {
          name: '简单密码',
          description: '12位，仅字母和数字',
          options: {
            length: 12,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: false,
            excludeSimilar: true,
            excludeAmbiguous: true
          }
        },
        {
          name: 'PIN码',
          description: '6位纯数字',
          options: {
            length: 6,
            includeUppercase: false,
            includeLowercase: false,
            includeNumbers: true,
            includeSymbols: false,
            excludeSimilar: false,
            excludeAmbiguous: false
          }
        },
        {
          name: '高安全',
          description: '32位超强密码',
          options: {
            length: 32,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: true,
            excludeAmbiguous: true,
            noSequential: true
          }
        }
      ] as PasswordTemplate[]
    }
  },
  computed: {
    passwordStrength(): PasswordStrength {
      const password = this.generatedPassword
      if (!password) {
        return { level: 'weak', percentage: 0, text: '无密码' }
      }
      
      let score = 0
      
      // 长度评分
      if (password.length >= 8) score += 1
      if (password.length >= 12) score += 1
      if (password.length >= 16) score += 1
      
      // 字符类型评分
      if (/[a-z]/.test(password)) score += 1
      if (/[A-Z]/.test(password)) score += 1
      if (/\d/.test(password)) score += 1
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      
      // 复杂度评分
      const uniqueChars = new Set(password).size
      if (uniqueChars / password.length > 0.7) score += 1
      
      if (score <= 3) {
        return { level: 'weak', percentage: 25, text: '弱密码' }
      } else if (score <= 5) {
        return { level: 'medium', percentage: 50, text: '中等强度' }
      } else if (score <= 7) {
        return { level: 'strong', percentage: 75, text: '强密码' }
      } else {
        return { level: 'very-strong', percentage: 100, text: '极强密码' }
      }
    }
  },
  mounted() {
    this.generatePassword()
  },
  methods: {
    handleOverlayClick(event: Event) {
      if (event.target === event.currentTarget) {
        this.$emit('close')
      }
    },

    // 生成密码
    generatePassword() {
      let charset = ''
      
      // 构建字符集
      if (this.options.customCharset) {
        charset = this.options.customCharset
      } else {
        if (this.options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        if (this.options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
        if (this.options.includeNumbers) charset += '0123456789'
        if (this.options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }
      
      // 排除相似字符
      if (this.options.excludeSimilar) {
        charset = charset.replace(/[0oO1lI]/g, '')
      }
      
      // 排除歧义字符
      if (this.options.excludeAmbiguous) {
        charset = charset.replace(/[{}[\]()\/\\~,;.<>]/g, '')
      }
      
      if (!charset) {
        alert('请至少选择一种字符类型')
        return
      }
      
      let password = ''
      
      // 确保包含每种选中的字符类型
      if (!this.options.customCharset) {
        if (this.options.includeUppercase) {
          password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ', this.options.excludeSimilar)
        }
        if (this.options.includeLowercase) {
          password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz', this.options.excludeSimilar)
        }
        if (this.options.includeNumbers) {
          password += this.getRandomChar('0123456789', this.options.excludeSimilar)
        }
        if (this.options.includeSymbols) {
          password += this.getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?', this.options.excludeAmbiguous)
        }
      }
      
      // 填充剩余长度
      for (let i = password.length; i < this.options.length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }
      
      // 打乱字符顺序
      password = password.split('').sort(() => Math.random() - 0.5).join('')
      
      // 检查连续字符
      if (this.options.noSequential) {
        password = this.avoidSequential(password, charset)
      }
      
      this.generatedPassword = password
      this.addToHistory(password)
    },

    // 获取随机字符（排除特定字符）
    getRandomChar(charset: string, excludeSimilar: boolean): string {
      let chars = charset
      if (excludeSimilar) {
        chars = chars.replace(/[0oO1lI]/g, '')
      }
      return chars[Math.floor(Math.random() * chars.length)]
    },

    // 避免连续字符
    avoidSequential(password: string, charset: string): string {
      let result = password
      let attempts = 0
      const maxAttempts = 10
      
      while (attempts < maxAttempts) {
        let hasSequential = false
        
        // 检查连续字符
        for (let i = 0; i < result.length - 2; i++) {
          const char1 = result[i]
          const char2 = result[i + 1]
          const char3 = result[i + 2]
          
          if (this.isSequential(char1, char2, char3)) {
            hasSequential = true
            // 替换中间字符
            result = result.substring(0, i + 1) + 
                    charset[Math.floor(Math.random() * charset.length)] + 
                    result.substring(i + 2)
            break
          }
        }
        
        if (!hasSequential) break
        attempts++
      }
      
      return result
    },

    // 检查是否为连续字符
    isSequential(a: string, b: string, c: string): boolean {
      const code1 = a.charCodeAt(0)
      const code2 = b.charCodeAt(0)
      const code3 = c.charCodeAt(0)
      
      return (code2 === code1 + 1 && code3 === code2 + 1) ||
             (code2 === code1 - 1 && code3 === code2 - 1)
    },

    // 更新密码（当选项改变时）
    updatePassword() {
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    // 重新生成密码
    regeneratePassword() {
      this.generatePassword()
    },

    // 复制密码
    async copyPassword() {
      try {
        await navigator.clipboard.writeText(this.generatedPassword)
        // 这里可以显示成功提示
        console.log('密码已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
      }
    },

    // 使用密码
    usePassword() {
      this.$emit('generated', this.generatedPassword)
      this.$emit('close')
    },

    // 应用模板
    applyTemplate(template: PasswordTemplate) {
      Object.assign(this.options, template.options)
      this.generatePassword()
    },

    // 检查是否为当前模板
    isCurrentTemplate(template: PasswordTemplate): boolean {
      return Object.keys(template.options).every(key => {
        return this.options[key as keyof GeneratorOptions] === template.options[key as keyof GeneratorOptions]
      })
    },

    // 添加到历史记录
    addToHistory(password: string) {
      if (!this.passwordHistory.includes(password)) {
        this.passwordHistory.unshift(password)
        if (this.passwordHistory.length > 5) {
          this.passwordHistory.pop()
        }
      }
    },

    // 掩码显示密码
    maskPassword(password: string): string {
      if (password.length <= 8) {
        return password.substring(0, 2) + '*'.repeat(password.length - 4) + password.substring(password.length - 2)
      }
      return password.substring(0, 4) + '*'.repeat(password.length - 8) + password.substring(password.length - 4)
    },

    // 选择历史密码
    selectHistoryPassword(password: string) {
      this.generatedPassword = password
    },

    // 复制历史密码
    async copyHistoryPassword(password: string) {
      try {
        await navigator.clipboard.writeText(password)
        console.log('历史密码已复制')
      } catch (error) {
        console.error('复制失败:', error)
      }
    },

    // 使用历史密码
    useHistoryPassword(password: string) {
      this.generatedPassword = password
      this.usePassword()
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4a5568;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.generator-container {
  padding: 0 24px 24px;
}

.password-display {
  margin-bottom: 32px;
}

.password-field {
  position: relative;
  margin-bottom: 12px;
}

.password-input {
  width: 100%;
  padding: 16px 80px 16px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  background: #f7fafc;
  color: #2d3748;
  box-sizing: border-box;
}

.password-input:focus {
  outline: none;
  border-color: #3182ce;
}

.password-actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
}

.action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-fill.weak { background: #f56565; }
.strength-fill.medium { background: #ed8936; }
.strength-fill.strong { background: #48bb78; }
.strength-fill.very-strong { background: #38a169; }

.strength-text {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
  white-space: nowrap;
}

.generator-options {
  margin-bottom: 32px;
}

.generator-options h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.option-group {
  margin-bottom: 24px;
}

.option-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 12px;
}

.length-slider {
  width: 100%;
  margin: 8px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
}

.length-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3182ce;
  border-radius: 50%;
  cursor: pointer;
}

.length-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3182ce;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.length-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #718096;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-item:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-text {
  flex: 1;
  font-size: 14px;
  color: #2d3748;
}

.checkbox-example {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #718096;
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
}

.custom-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 8px;
  box-sizing: border-box;
}

.custom-input:focus {
  outline: none;
  border-color: #3182ce;
}

.preset-templates {
  margin-bottom: 32px;
}

.preset-templates h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.template-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.template-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.template-btn:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.template-btn.active {
  border-color: #3182ce;
  background: #ebf8ff;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.template-desc {
  font-size: 12px;
  color: #718096;
}

.password-history {
  margin-bottom: 32px;
}

.password-history h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.history-password {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #4a5568;
}

.history-actions {
  display: flex;
  gap: 4px;
}

.history-action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.history-action-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.generator-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.generate-btn,
.use-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.generate-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.use-btn {
  background: #3182ce;
  color: white;
  border: 2px solid #3182ce;
}

.use-btn:hover:not(:disabled) {
  background: #2c5282;
  border-color: #2c5282;
}

.use-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header,
  .generator-container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .template-buttons {
    grid-template-columns: 1fr;
  }
  
  .generator-actions {
    flex-direction: column;
  }
  
  .generate-btn,
  .use-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>