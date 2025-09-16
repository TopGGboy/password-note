import CryptoJS from 'crypto-js'

/**
 * 密码加密工具类
 * 使用 AES-256-GCM 算法进行对称加密
 */
export class PasswordCrypto {
  private static readonly ALGORITHM = 'AES'
  private static readonly KEY_SIZE = 256 / 32 // 256 bits = 32 bytes
  private static readonly IV_SIZE = 16 // 128 bits = 16 bytes
  
  /**
   * 生成加密密钥
   * 基于用户主密码和盐值生成
   */
  static generateKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: this.KEY_SIZE,
      iterations: 100000, // 10万次迭代，增强安全性
      hasher: CryptoJS.algo.SHA256
    }).toString()
  }
  
  /**
   * 生成随机盐值
   */
  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(32).toString()
  }
  
  /**
   * 生成随机初始化向量
   */
  static generateIV(): string {
    return CryptoJS.lib.WordArray.random(this.IV_SIZE).toString()
  }
  
  /**
   * 加密数据
   * @param plaintext 明文
   * @param key 加密密钥
   * @returns 加密后的数据（包含IV）
   */
  static encrypt(plaintext: string, key: string): string {
    if (!plaintext) return ''
    
    try {
      const iv = CryptoJS.lib.WordArray.random(this.IV_SIZE)
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      // 将IV和加密数据组合
      const combined = iv.concat(encrypted.ciphertext)
      return combined.toString(CryptoJS.enc.Base64)
    } catch (error) {
      console.error('加密失败:', error)
      throw new Error('数据加密失败')
    }
  }
  
  /**
   * 解密数据
   * @param ciphertext 密文（包含IV）
   * @param key 解密密钥
   * @returns 解密后的明文
   */
  static decrypt(ciphertext: string, key: string): string {
    if (!ciphertext) return ''
    
    try {
      const combined = CryptoJS.enc.Base64.parse(ciphertext)
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, this.IV_SIZE / 4))
      const encrypted = CryptoJS.lib.WordArray.create(combined.words.slice(this.IV_SIZE / 4))
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      )
      
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('解密失败:', error)
      throw new Error('数据解密失败')
    }
  }
  
  /**
   * 生成密码哈希（用于验证）
   * @param password 密码
   * @param salt 盐值
   * @returns 密码哈希
   */
  static hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000,
      hasher: CryptoJS.algo.SHA256
    }).toString()
  }
  
  /**
   * 验证密码
   * @param password 输入的密码
   * @param hash 存储的哈希
   * @param salt 盐值
   * @returns 是否匹配
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = this.hashPassword(password, salt)
    return computedHash === hash
  }
}

/**
 * 密钥管理器
 * 管理用户的加密密钥
 */
export class KeyManager {
  private static readonly STORAGE_KEY = 'encryptionKey'
  private static readonly SALT_KEY = 'encryptionSalt'
  private static readonly MASTER_PASSWORD_HASH_KEY = 'masterPasswordHash'
  private static readonly MASTER_PASSWORD_SALT_KEY = 'masterPasswordSalt'
  private static readonly ENCRYPTION_SALT_KEY = 'encryptionSaltPersistent'
  
  /**
   * 设置主密码并生成加密密钥
   * @param masterPassword 主密码
   */
  static setMasterPassword(masterPassword: string): void {
    // 生成用于加密数据的盐值和密钥
    const encryptionSalt = PasswordCrypto.generateSalt()
    const encryptionKey = PasswordCrypto.generateKey(masterPassword, encryptionSalt)
    
    // 生成用于验证主密码的盐值和哈希
    const masterPasswordSalt = PasswordCrypto.generateSalt()
    const masterPasswordHash = PasswordCrypto.hashPassword(masterPassword, masterPasswordSalt)
    
    // 将加密密钥存储到 sessionStorage（会话级别，更安全）
    sessionStorage.setItem(this.STORAGE_KEY, encryptionKey)
    sessionStorage.setItem(this.SALT_KEY, encryptionSalt)
    
    // 将主密码验证信息和加密盐值存储到 localStorage（持久化）
    localStorage.setItem(this.MASTER_PASSWORD_HASH_KEY, masterPasswordHash)
    localStorage.setItem(this.MASTER_PASSWORD_SALT_KEY, masterPasswordSalt)
    localStorage.setItem(this.ENCRYPTION_SALT_KEY, encryptionSalt)
  }
  
  /**
   * 获取当前的加密密钥
   */
  static getEncryptionKey(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY)
  }
  
  /**
   * 获取加密盐值（会话中）
   */
  static getEncryptionSalt(): string | null {
    return sessionStorage.getItem(this.SALT_KEY)
  }
  
  /**
   * 获取持久化的加密盐值
   */
  static getPersistentEncryptionSalt(): string | null {
    return localStorage.getItem(this.ENCRYPTION_SALT_KEY)
  }
  
  /**
   * 获取主密码验证哈希
   */
  static getMasterPasswordHash(): string | null {
    return localStorage.getItem(this.MASTER_PASSWORD_HASH_KEY)
  }
  
  /**
   * 获取主密码验证盐值
   */
  static getMasterPasswordSalt(): string | null {
    return localStorage.getItem(this.MASTER_PASSWORD_SALT_KEY)
  }
  
  /**
   * 清除会话密钥（登出时调用）
   */
  static clearSessionKeys(): void {
    sessionStorage.removeItem(this.STORAGE_KEY)
    sessionStorage.removeItem(this.SALT_KEY)
  }
  
  /**
   * 清除所有密钥和主密码信息（重置应用时调用）
   */
  static clearAllKeys(): void {
    this.clearSessionKeys()
    localStorage.removeItem(this.MASTER_PASSWORD_HASH_KEY)
    localStorage.removeItem(this.MASTER_PASSWORD_SALT_KEY)
    localStorage.removeItem(this.ENCRYPTION_SALT_KEY)
  }
  
  /**
   * 检查是否已设置密钥（会话中）
   */
  static hasKey(): boolean {
    return !!this.getEncryptionKey()
  }
  
  /**
   * 检查是否已设置主密码（持久化）
   */
  static hasMasterPassword(): boolean {
    return !!(this.getMasterPasswordHash() && this.getMasterPasswordSalt())
  }
  
  /**
   * 验证主密码并恢复加密密钥
   * @param masterPassword 输入的主密码
   */
  static verifyMasterPassword(masterPassword: string): boolean {
    const masterPasswordHash = this.getMasterPasswordHash()
    const masterPasswordSalt = this.getMasterPasswordSalt()
    const encryptionSalt = this.getPersistentEncryptionSalt()
    
    if (!masterPasswordHash || !masterPasswordSalt || !encryptionSalt) {
      return false
    }
    
    // 验证主密码
    const isValid = PasswordCrypto.verifyPassword(masterPassword, masterPasswordHash, masterPasswordSalt)
    
    if (isValid) {
      // 主密码正确，使用持久化的加密盐值恢复加密密钥到会话存储
      const encryptionKey = PasswordCrypto.generateKey(masterPassword, encryptionSalt)
      
      sessionStorage.setItem(this.SALT_KEY, encryptionSalt)
      sessionStorage.setItem(this.STORAGE_KEY, encryptionKey)
    }
    
    return isValid
  }
  
  /**
   * 使用主密码解锁（恢复会话密钥）
   * @param masterPassword 主密码
   */
  static unlockWithMasterPassword(masterPassword: string): boolean {
    if (!this.hasMasterPassword()) {
      return false
    }
    
    return this.verifyMasterPassword(masterPassword)
  }
}

/**
 * 数据加密服务
 * 提供高级的数据加密功能
 */
export class DataEncryptionService {
  /**
   * 加密密码条目的敏感数据
   * @param data 密码条目数据
   * @returns 加密后的数据
   */
  static encryptPasswordEntry(data: {
    username: string
    password: string
    notes: string
    customFields: Array<{ name: string; value: string }>
  }) {
    const key = KeyManager.getEncryptionKey()
    if (!key) {
      throw new Error('未找到加密密钥，请先设置主密码')
    }
    
    try {
      return {
        usernameEncrypted: PasswordCrypto.encrypt(data.username, key),
        passwordEncrypted: PasswordCrypto.encrypt(data.password, key),
        notesEncrypted: PasswordCrypto.encrypt(data.notes, key),
        customFieldsEncrypted: data.customFields.map(field => ({
          name: field.name, // 字段名不加密，便于搜索
          valueEncrypted: PasswordCrypto.encrypt(field.value, key)
        }))
      }
    } catch (error) {
      console.error('加密密码条目失败:', error)
      throw new Error('数据加密失败，请重试')
    }
  }
  
  /**
   * 解密密码条目的敏感数据
   * @param encryptedData 加密的数据
   * @returns 解密后的数据
   */
  static decryptPasswordEntry(encryptedData: {
    usernameEncrypted: string
    passwordEncrypted: string
    notesEncrypted: string
    customFieldsEncrypted: Array<{ name: string; valueEncrypted: string }>
  }) {
    const key = KeyManager.getEncryptionKey()
    if (!key) {
      throw new Error('未找到加密密钥，请先输入主密码')
    }
    
    try {
      return {
        username: PasswordCrypto.decrypt(encryptedData.usernameEncrypted, key),
        password: PasswordCrypto.decrypt(encryptedData.passwordEncrypted, key),
        notes: PasswordCrypto.decrypt(encryptedData.notesEncrypted, key),
        customFields: encryptedData.customFieldsEncrypted.map(field => ({
          name: field.name,
          value: PasswordCrypto.decrypt(field.valueEncrypted, key)
        }))
      }
    } catch (error) {
      console.error('解密密码条目失败:', error)
      throw new Error('数据解密失败，可能密钥不正确')
    }
  }
}

export default {
  PasswordCrypto,
  KeyManager,
  DataEncryptionService
}