import CryptoJS from "crypto-js";

/**
 * 密码加密工具类
 * 使用 AES-256-CBC 算法进行对称加密
 */
export class PasswordCrypto {
  private static readonly ALGORITHM = "AES";
  private static readonly KEY_SIZE = 256;
  private static readonly IV_SIZE = 16;
  private static readonly ITERATIONS = 100000;

  static generateKey(password: string, salt: string): CryptoJS.lib.WordArray {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    });
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  static generateIV(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(this.IV_SIZE);
  }

  static encrypt(plaintext: string, key: CryptoJS.lib.WordArray): string {
    if (!plaintext) return "";

    try {
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const combined = iv.concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error("加密失败:", error);
      throw new Error("数据加密失败");
    }
  }

  static decrypt(ciphertext: string, key: CryptoJS.lib.WordArray): string {
    if (!ciphertext) return "";
    if (!key) {
      throw new Error("解密密钥不能为空");
    }

    try {
      const combined = CryptoJS.enc.Base64.parse(ciphertext);

      const minBytes = this.IV_SIZE;
      if (combined.sigBytes < minBytes) {
        throw new Error(`密文数据长度不足，期望至少${minBytes}字节，实际${combined.sigBytes}字节`);
      }

      const iv = CryptoJS.lib.WordArray.create(combined.words, this.IV_SIZE);
      
      const encryptedBytes = combined.sigBytes - this.IV_SIZE;
      const startWordIndex = Math.ceil(this.IV_SIZE / 4);
      
      const encrypted = CryptoJS.lib.WordArray.create(
        combined.words.slice(startWordIndex),
        encryptedBytes
      );

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

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

  static hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    }).toString();
  }

  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = this.hashPassword(password, salt);
    return computedHash === hash;
  }
}

/**
 * 数据加密服务
 * 用于密码条目的加密和解密
 */
export class DataEncryptionService {
  private static decryptLegacy(ciphertext: string, key: CryptoJS.lib.WordArray): string {
    if (!ciphertext) return "";
    if (!key) {
      throw new Error("解密密钥不能为空");
    }

    try {
      const combined = CryptoJS.enc.Base64.parse(ciphertext);
      const ivWords = 16 / 4;
      
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

  static encryptPasswordEntry(data: {
    username: string;
    password: string;
    notes: string;
    customFields: Array<{ name: string; value: string }>;
  }, key: CryptoJS.lib.WordArray) {
    if (!key) {
      throw new Error("未找到加密密钥");
    }

    try {
      return {
        usernameEncrypted: PasswordCrypto.encrypt(data.username, key),
        passwordEncrypted: PasswordCrypto.encrypt(data.password, key),
        notesEncrypted: PasswordCrypto.encrypt(data.notes, key),
        customFieldsEncrypted: data.customFields.map((field) => ({
          name: field.name,
          valueEncrypted: PasswordCrypto.encrypt(field.value, key),
        })),
      };
    } catch (error) {
      console.error("加密密码条目失败:", error);
      throw new Error("数据加密失败，请重试");
    }
  }

  static decryptPasswordEntry(encryptedData: {
    usernameEncrypted: string;
    passwordEncrypted: string;
    notesEncrypted: string;
    customFieldsEncrypted: Array<{ name: string; valueEncrypted: string }>;
  }, key: CryptoJS.lib.WordArray) {
    if (!key) {
      throw new Error("未找到加密密钥");
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

export default {
  PasswordCrypto,
  DataEncryptionService,
};
