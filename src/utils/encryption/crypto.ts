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

      // IV大小为16字节
      const ivWords = this.IV_SIZE / 4; // 16 / 4 = 4 words
      
      // 验证数据长度
      if (combined.words.length < ivWords) {
        throw new Error("密文数据长度不足，可能已损坏");
      }

      // 提取IV和加密数据
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, ivWords));
      const encrypted = CryptoJS.lib.WordArray.create(combined.words.slice(ivWords));

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
      
      if (result === null || result === undefined) {
        throw new Error("解密结果为空或无效");
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

    // 存储到sessionStorage（密钥和盐值）
    sessionStorage.setItem(this.STORAGE_KEY, encryptionKey.toString());
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
      sessionStorage.setItem(this.STORAGE_KEY, encryptionKey.toString());
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
        username: PasswordCrypto.decrypt(encryptedData.usernameEncrypted, key),
        password: PasswordCrypto.decrypt(encryptedData.passwordEncrypted, key),
        notes: PasswordCrypto.decrypt(encryptedData.notesEncrypted, key),
        customFields: encryptedData.customFieldsEncrypted.map((field) => ({
          name: field.name,
          value: PasswordCrypto.decrypt(field.valueEncrypted, key),
        })),
      };
    } catch (error) {
      console.error("解密密码条目失败:", error);
      throw new Error("数据解密失败，可能密钥不正确");
    }
  }
}

export default {
  PasswordCrypto,
  KeyManager,
  DataEncryptionService,
};