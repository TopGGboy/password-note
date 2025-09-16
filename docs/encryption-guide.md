# 密码加密功能使用指南

## 概述

本应用实现了端到端的密码加密功能，确保用户的敏感信息在存储和传输过程中都得到充分保护。

## 加密方案

### 技术选择
- **算法**: AES-256-CBC
- **密钥派生**: PBKDF2 (100,000 次迭代)
- **哈希算法**: SHA-256
- **库**: crypto-js

### 安全特性
- 客户端加密：所有敏感数据在发送到服务器前进行加密
- 主密码保护：使用用户设置的主密码生成加密密钥
- 随机盐值：每次生成唯一的盐值增强安全性
- 会话级密钥：加密密钥仅存储在 sessionStorage 中

## 功能组件

### 1. 加密工具类 (`src/utils/crypto.ts`)

#### PasswordCrypto
- `generateKey()`: 基于主密码和盐值生成加密密钥
- `encrypt()`: 加密明文数据
- `decrypt()`: 解密密文数据
- `generateSalt()`: 生成随机盐值

#### KeyManager
- `setMasterPassword()`: 设置主密码并生成密钥
- `getEncryptionKey()`: 获取当前加密密钥
- `hasKey()`: 检查是否已设置密钥
- `clearKeys()`: 清除密钥（登出时）

#### DataEncryptionService
- `encryptPasswordEntry()`: 加密密码条目的敏感数据
- `decryptPasswordEntry()`: 解密密码条目的敏感数据

### 2. 主密码模态框 (`src/components/MasterPasswordModal.vue`)

功能特性：
- 主密码设置和验证
- 密码强度检测
- 安全提示和最佳实践
- 响应式设计

### 3. 应用集成 (`src/App.vue`)

- 路由保护：访问敏感页面时自动检查主密码
- 自动弹出主密码输入框
- 会话管理

## 使用流程

### 首次使用
1. 用户访问密码管理功能
2. 系统检测到未设置主密码
3. 弹出主密码设置模态框
4. 用户设置强主密码
5. 系统生成加密密钥并存储在会话中

### 日常使用
1. 用户访问密码管理功能
2. 系统检查是否有有效的加密密钥
3. 如无密钥，要求用户输入主密码
4. 验证成功后，用户可正常使用功能

### 数据加密流程
1. 用户在表单中输入密码信息
2. 提交时，系统自动加密敏感字段：
   - 用户名 → `usernameEncrypted`
   - 密码 → `passwordEncrypted`
   - 备注 → `notesEncrypted`
   - 自定义字段值 → `customFieldsEncrypted`
3. 加密后的数据发送到服务器
4. 服务器存储加密数据

## 安全考虑

### 已实现的安全措施
- ✅ 客户端加密，服务器无法看到明文
- ✅ 强密码要求（至少12位，包含多种字符类型）
- ✅ 密钥仅存储在会话中，关闭浏览器后自动清除
- ✅ 使用行业标准的加密算法和参数
- ✅ 随机盐值防止彩虹表攻击

### 安全建议
- 🔒 使用强主密码并妥善保管
- 🔒 定期更换主密码
- 🔒 不要在不安全的设备上使用
- 🔒 及时关闭浏览器标签页

### 注意事项
- ⚠️ 忘记主密码将无法恢复数据
- ⚠️ 主密码不会发送到服务器，无法通过服务器重置
- ⚠️ 建议用户备份重要密码信息

## API 接口变更

### 创建密码条目请求格式
```typescript
interface CreatePasswordEntryRequest {
  categoryId: number,
  title: string,                    // 不加密，便于搜索
  usernameEncrypted: string,        // 加密的用户名
  passwordEncrypted: string,        // 加密的密码
  url: string,                      // 不加密，便于访问
  notesEncrypted: string,           // 加密的备注
  customFieldsEncrypted: Array<{    // 加密的自定义字段
    name: string,                   // 字段名不加密
    valueEncrypted: string          // 字段值加密
  }>,
  favorite: boolean
}
```

## 开发指南

### 添加新的加密字段
1. 在 `DataEncryptionService` 中添加加密/解密逻辑
2. 更新 API 接口类型定义
3. 修改相关组件的数据处理逻辑

### 测试加密功能
```javascript
// 测试加密解密
import { PasswordCrypto, KeyManager } from '@/utils/crypto'

// 设置测试主密码
KeyManager.setMasterPassword('test-master-password-123')

// 获取密钥
const key = KeyManager.getEncryptionKey()

// 加密测试
const plaintext = 'sensitive-data'
const encrypted = PasswordCrypto.encrypt(plaintext, key)
const decrypted = PasswordCrypto.decrypt(encrypted, key)

console.log('原文:', plaintext)
console.log('密文:', encrypted)
console.log('解密:', decrypted)
console.log('匹配:', plaintext === decrypted)
```

## 故障排除

### 常见问题
1. **"未找到加密密钥"错误**
   - 原因：用户未设置主密码或会话过期
   - 解决：重新输入主密码

2. **"数据解密失败"错误**
   - 原因：主密码错误或数据损坏
   - 解决：确认主密码正确性

3. **编译错误**
   - 确保已安装 `crypto-js` 和 `@types/crypto-js`
   - 检查 TypeScript 配置

### 调试技巧
- 使用浏览器开发者工具查看 sessionStorage
- 检查网络请求中的加密数据格式
- 启用控制台日志查看加密/解密过程

## 更新日志

### v1.0.0 (2025-09-13)
- ✨ 实现 AES-256-CBC 加密
- ✨ 添加主密码管理功能
- ✨ 集成密码条目加密
- ✨ 添加路由保护机制
- 📝 完善文档和使用指南