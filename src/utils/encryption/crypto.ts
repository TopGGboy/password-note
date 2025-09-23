import CryptoJS from "crypto-js";

/**
 * 密码加密工具类
 * 使用 AES-256-CBC 算法进行对称加密
 */
export class PasswordCrypto {
  private static readonly ALGORITHM = "AES";
  private static readonly KEY_SIZE = 256; // 256 bits
  private static readonly IV_SIZE = 16; // 128 bits = 16 bytes
  private static readonly ITERATIONS = 100000; // 迭代次数

  /**
   * 生成加密密钥
   * 基于用户主密码和盐值生成
   */
  static generateKey(masterPassword: string, salt: string): CryptoJS.lib.WordArray {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: this.KEY_SIZE / 32, // 256位 / 32 = 8 words
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    });
  }

  /**
   * 生成随机盐值
   */
  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(16).toString(); // 16字节盐值
  }

  /**
   * 生成随机初始化向量
   */
  static generateIV(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(this.IV_SIZE);
  }

  /**
   * 加密数据
   * @param plaintext 明文
   * @param key 加密密钥（WordArray格式）
   * @returns 加密后的数据（包含IV和盐值）
   */
  static encrypt(plaintext: string, key: CryptoJS.lib.WordArray): string {
    if (!plaintext) return "";

    try {
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // 组合格式：IV + 加密数据
      const combined = iv.concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error("加密失败:", error);
      throw new Error("数据加密失败");
    }
  }

  /**
   * 解密数据
   * @param ciphertext 密文（包含IV）
   * @param key 解密密钥（WordArray格式）
   * @returns 解密后的明文
   */
  static decrypt(ciphertext: string, key: CryptoJS.lib.WordArray): string {
    if (!ciphertext) return "";
    if (!key) {
      throw new Error("解密密钥不能为空");
    }

    try {
      // 解析Base64数据
      const combined = CryptoJS.enc.Base64.parse(ciphertext);

      // 验证数据长度（至少需要IV的长度）
      const minBytes = this.IV_SIZE; // 16字节
      if (combined.sigBytes < minBytes) {
        throw new Error(`密文数据长度不足，期望至少${minBytes}字节，实际${combined.sigBytes}字节`);
      }

      // 提取IV（前16字节）
      const iv = CryptoJS.lib.WordArray.create(combined.words, this.IV_SIZE);
      
      // 提取加密数据（剩余字节）
      const encryptedBytes = combined.sigBytes - this.IV_SIZE;
      const encryptedWords = Math.ceil(encryptedBytes / 4);
      const startWordIndex = Math.ceil(this.IV_SIZE / 4);
      
      const encrypted = CryptoJS.lib.WordArray.create(
        combined.words.slice(startWordIndex),
        encryptedBytes
      );

      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      // 转换为UTF-8字符串
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        throw new Error("解密结果为空，可能密钥不正确或数据已损坏");
      }

      return result;
    } catch (error) {
      console.error("解密失败:", error);
      if (error instanceof Error) {
        throw new Error(`数据解密失败: ${error.message}`);
      } else {
        throw new Error("数据解密失败");
      }
    }
  }

  /**
   * 生成密码哈希（用于验证）
   */
  static hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    }).toString();
  }

  /**
   * 验证密码
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = this.hashPassword(password, salt);
    return computedHash === hash;
  }
}

/**
 * 密钥管理器 - 修正版本
 */
export class KeyManager {
  private static readonly STORAGE_KEY = "encryptionKey";
  private static readonly SALT_KEY = "encryptionSalt";
  private static readonly MASTER_PASSWORD_HASH_KEY = "masterPasswordHash";
  private static readonly MASTER_PASSWORD_SALT_KEY = "masterPasswordSalt";
  private static readonly ENCRYPTION_SALT_KEY = "encryptionSaltPersistent"; // 添加缺失的常量

  /**
   * 设置主密码并生成加密密钥
   */
  static setMasterPassword(masterPassword: string): void {
    // 生成盐值
    const masterPasswordSalt = PasswordCrypto.generateSalt();
    const encryptionSalt = PasswordCrypto.generateSalt();

    // 生成密钥（WordArray格式）
    const encryptionKey = PasswordCrypto.generateKey(masterPassword, encryptionSalt);
    
    // 生成主密码哈希
    const masterPasswordHash = PasswordCrypto.hashPassword(masterPassword, masterPasswordSalt);

    // 存储到sessionStorage（密钥和盐值）- 明确使用Hex格式
    sessionStorage.setItem(this.STORAGE_KEY, encryptionKey.toString(CryptoJS.enc.Hex));
    sessionStorage.setItem(this.SALT_KEY, encryptionSalt);

    // 存储到localStorage（验证信息）
    localStorage.setItem(this.MASTER_PASSWORD_HASH_KEY, masterPasswordHash);
    localStorage.setItem(this.MASTER_PASSWORD_SALT_KEY, masterPasswordSalt);
    localStorage.setItem(this.ENCRYPTION_SALT_KEY, encryptionSalt); // 使用常量
  }

  /**
   * 获取当前的加密密钥（WordArray格式）
   */
  static getEncryptionKey(): CryptoJS.lib.WordArray | null {
    const keyStr = sessionStorage.getItem(this.STORAGE_KEY);
    if (!keyStr) return null;
    
    try {
      return CryptoJS.enc.Hex.parse(keyStr);
    } catch (error) {
      console.error("密钥解析失败:", error);
      return null;
    }
  }

  /**
   * 获取加密盐值（会话中）
   */
  static getEncryptionSalt(): string | null {
    return sessionStorage.getItem(this.SALT_KEY);
  }

  /**
   * 获取持久化的加密盐值
   */
  static getPersistentEncryptionSalt(): string | null {
    return localStorage.getItem(this.ENCRYPTION_SALT_KEY); // 使用常量
  }

  /**
   * 获取主密码验证哈希
   */
  static getMasterPasswordHash(): string | null {
    return localStorage.getItem(this.MASTER_PASSWORD_HASH_KEY);
  }

  /**
   * 获取主密码验证盐值
   */
  static getMasterPasswordSalt(): string | null {
    return localStorage.getItem(this.MASTER_PASSWORD_SALT_KEY);
  }

  /**
   * 清除会话密钥（登出时调用）
   */
  static clearSessionKeys(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.SALT_KEY);
  }

  /**
   * 清除所有密钥和主密码信息（重置应用时调用）
   */
  static clearAllKeys(): void {
    this.clearSessionKeys();
    localStorage.removeItem(this.MASTER_PASSWORD_HASH_KEY);
    localStorage.removeItem(this.MASTER_PASSWORD_SALT_KEY);
    localStorage.removeItem(this.ENCRYPTION_SALT_KEY); // 使用常量
  }

  /**
   * 检查是否已设置密钥（会话中）
   */
  static hasKey(): boolean {
    return !!this.getEncryptionKey();
  }

  /**
   * 检查是否已设置主密码（持久化）
   */
  static hasMasterPassword(): boolean {
    return !!(this.getMasterPasswordHash() && this.getMasterPasswordSalt());
  }

  /**
   * 验证主密码并恢复加密密钥
   * @param masterPassword 输入的主密码
   */
  static verifyMasterPassword(masterPassword: string): boolean {
    const masterPasswordHash = this.getMasterPasswordHash();
    const masterPasswordSalt = this.getMasterPasswordSalt();
    const encryptionSalt = this.getPersistentEncryptionSalt();

    if (!masterPasswordHash || !masterPasswordSalt || !encryptionSalt) {
      return false;
    }

    // 验证主密码
    const isValid = PasswordCrypto.verifyPassword(
      masterPassword,
      masterPasswordHash,
      masterPasswordSalt
    );

    if (isValid) {
      // 主密码正确，使用持久化的加密盐值恢复加密密钥到会话存储
      const encryptionKey = PasswordCrypto.generateKey(
        masterPassword,
        encryptionSalt
      );

      sessionStorage.setItem(this.SALT_KEY, encryptionSalt);
      sessionStorage.setItem(this.STORAGE_KEY, encryptionKey.toString(CryptoJS.enc.Hex));
    }

    return isValid;
  }

  /**
   * 使用主密码解锁（恢复会话密钥）
   * @param masterPassword 主密码
   */
  static unlockWithMasterPassword(masterPassword: string): boolean {
    if (!this.hasMasterPassword()) {
      return false;
    }

    return this.verifyMasterPassword(masterPassword);
  }
}

/**
 * 数据加密服务 - 修正版本
 */
export class DataEncryptionService {
  /**
   * 旧版本的解密逻辑（有问题的版本）
   */
  private static decryptLegacy(ciphertext: string, key: CryptoJS.lib.WordArray): string {
    if (!ciphertext) return "";
    if (!key) {
      throw new Error("解密密钥不能为空");
    }

    try {
      const combined = CryptoJS.enc.Base64.parse(ciphertext);
      const ivWords = 16 / 4; // 旧版本的错误逻辑
      
      if (combined.words.length < ivWords) {
        throw new Error("密文数据长度不足");
      }

      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, ivWords));
      const encrypted = CryptoJS.lib.WordArray.create(combined.words.slice(ivWords));

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 智能解密（先用新逻辑，失败后用旧逻辑）
   */
  private static smartDecrypt(ciphertext: string, key: CryptoJS.lib.WordArray): string {
    if (!ciphertext) return "";
    
    try {
      return PasswordCrypto.decrypt(ciphertext, key);
    } catch (newError: any) {
      console.warn("新解密逻辑失败，尝试旧逻辑:", newError.message);
      
      try {
        const result = this.decryptLegacy(ciphertext, key);
        console.log("旧逻辑解密成功，建议重新加密数据");
        return result;
      } catch (legacyError: any) {
        console.error("新旧解密逻辑都失败:", {
          newError: newError.message,
          legacyError: legacyError.message
        });
        throw new Error(`解密失败: ${newError.message}`);
      }
    }
  }

  /**
   * 加密密码条目的敏感数据
   * @param data 密码条目数据
   * @returns 加密后的数据
   */
  static encryptPasswordEntry(data: {
    username: string;
    password: string;
    notes: string;
    customFields: Array<{ name: string; value: string }>;
  }) {
    const key = KeyManager.getEncryptionKey();
    if (!key) {
      throw new Error("未找到加密密钥，请先设置主密码");
    }

    try {
      return {
        usernameEncrypted: PasswordCrypto.encrypt(data.username, key),
        passwordEncrypted: PasswordCrypto.encrypt(data.password, key),
        notesEncrypted: PasswordCrypto.encrypt(data.notes, key),
        customFieldsEncrypted: data.customFields.map((field) => ({
          name: field.name, // 字段名不加密，便于搜索
          valueEncrypted: PasswordCrypto.encrypt(field.value, key),
        })),
      };
    } catch (error) {
      console.error("加密密码条目失败:", error);
      throw new Error("数据加密失败，请重试");
    }
  }

  /**
   * 解密密码条目的敏感数据
   * @param encryptedData 加密的数据
   * @returns 解密后的数据
   */
  static decryptPasswordEntry(encryptedData: {
    usernameEncrypted: string;
    passwordEncrypted: string;
    notesEncrypted: string;
    customFieldsEncrypted: Array<{ name: string; valueEncrypted: string }>;
  }) {
    const key = KeyManager.getEncryptionKey();
    if (!key) {
      throw new Error("未找到加密密钥，请先输入主密码");
    }

    try {
      return {
        username: this.smartDecrypt(encryptedData.usernameEncrypted, key),
        password: this.smartDecrypt(encryptedData.passwordEncrypted, key),
        notes: this.smartDecrypt(encryptedData.notesEncrypted, key),
        customFields: encryptedData.customFieldsEncrypted.map((field) => ({
          name: field.name,
          value: this.smartDecrypt(field.valueEncrypted, key),
        })),
      };
    } catch (error) {
      console.error("解密密码条目失败:", error);
      throw new Error("数据解密失败，可能密钥不正确");
    }
  }
}

/**
 * 加密解密测试工具
 */
export class CryptoTestUtils {
  /**
   * 测试加密解密流程
   */
  static testEncryptionFlow(testData: string = "测试数据123"): boolean {
    try {
      console.log("开始加密解密测试...");
      
      // 1. 生成测试密钥
      const testPassword = "testPassword123";
      const salt = PasswordCrypto.generateSalt();
      const key = PasswordCrypto.generateKey(testPassword, salt);
      
      console.log("生成的密钥:", key.toString(CryptoJS.enc.Hex));
      console.log("盐值:", salt);
      
      // 2. 加密测试
      const encrypted = PasswordCrypto.encrypt(testData, key);
      console.log("加密结果:", encrypted);
      console.log("加密数据长度:", encrypted.length);
      
      // 3. 解密测试
      const decrypted = PasswordCrypto.decrypt(encrypted, key);
      console.log("解密结果:", decrypted);
      
      // 4. 验证结果
      const success = decrypted === testData;
      console.log("测试结果:", success ? "成功" : "失败");
      
      if (!success) {
        console.error("期望:", testData);
        console.error("实际:", decrypted);
      }
      
      return success;
    } catch (error) {
      console.error("测试失败:", error);
      return false;
    }
  }

  /**
   * 测试密钥管理器
   */
  static testKeyManager(): boolean {
    try {
      console.log("开始密钥管理器测试...");
      
      const testPassword = "testMasterPassword123";
      
      // 清除现有数据
      KeyManager.clearAllKeys();
      
      // 设置主密码
      KeyManager.setMasterPassword(testPassword);
      console.log("主密码设置完成");
      
      // 验证密钥存在
      const hasKey = KeyManager.hasKey();
      console.log("密钥存在:", hasKey);
      
      // 获取密钥
      const key = KeyManager.getEncryptionKey();
      console.log("获取到密钥:", !!key);
      
      if (key) {
        // 测试加密解密
        const testData = "密钥管理器测试数据";
        const encrypted = PasswordCrypto.encrypt(testData, key);
        const decrypted = PasswordCrypto.decrypt(encrypted, key);
        
        const success = decrypted === testData;
        console.log("密钥管理器测试结果:", success ? "成功" : "失败");
        return success;
      }
      
      return false;
    } catch (error) {
      console.error("密钥管理器测试失败:", error);
      return false;
    }
  }

  /**
   * 诊断现有数据
   */
  static diagnoseExistingData(): void {
    console.log("=== 诊断现有数据 ===");
    
    // 检查存储的数据
    const keyStr = sessionStorage.getItem(KeyManager['STORAGE_KEY']);
    const salt = sessionStorage.getItem(KeyManager['SALT_KEY']);
    const masterHash = localStorage.getItem(KeyManager['MASTER_PASSWORD_HASH_KEY']);
    const masterSalt = localStorage.getItem(KeyManager['MASTER_PASSWORD_SALT_KEY']);
    const encSalt = localStorage.getItem(KeyManager['ENCRYPTION_SALT_KEY']);
    
    console.log("会话存储:");
    console.log("- 密钥:", keyStr ? "存在" : "不存在", keyStr?.substring(0, 20) + "...");
    console.log("- 盐值:", salt ? "存在" : "不存在", salt);
    
    console.log("本地存储:");
    console.log("- 主密码哈希:", masterHash ? "存在" : "不存在");
    console.log("- 主密码盐值:", masterSalt ? "存在" : "不存在");
    console.log("- 加密盐值:", encSalt ? "存在" : "不存在");
    
    // 尝试解析密钥
    if (keyStr) {
      try {
        const key = CryptoJS.enc.Hex.parse(keyStr);
        console.log("密钥解析:", "成功", key.sigBytes, "字节");
      } catch (error) {
        console.error("密钥解析失败:", error);
      }
    }
  }
}

export default {
  PasswordCrypto,
  KeyManager,
  DataEncryptionService,
  CryptoTestUtils,
};