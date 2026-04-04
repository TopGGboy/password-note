import CryptoJS from 'crypto-js'

const SESSION_DURATION = 30 * 60 * 1000

export class PinManager {
  private static instance: PinManager
  private currentUserId: number | null = null
  
  private constructor() {}
  
  static getInstance(): PinManager {
    if (!PinManager.instance) {
      PinManager.instance = new PinManager()
    }
    return PinManager.instance
  }
  
  setCurrentUser(userId: number | null): void {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId
      this.clearVerification()
    }
  }
  
  private getPinHashKey(): string {
    return this.currentUserId ? `pin_hash_${this.currentUserId}` : 'pin_hash'
  }
  
  private getPinSaltKey(): string {
    return this.currentUserId ? `pin_salt_${this.currentUserId}` : 'pin_salt'
  }
  
  private getSessionVerifiedKey(): string {
    return this.currentUserId ? `pin_verified_${this.currentUserId}` : 'pin_verified'
  }
  
  private getSessionExpiryKey(): string {
    return this.currentUserId ? `pin_expiry_${this.currentUserId}` : 'pin_expiry'
  }
  
  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(16).toString()
  }
  
  private hashPin(pin: string, salt: string): string {
    return CryptoJS.PBKDF2(pin, salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    }).toString()
  }
  
  hasPin(): boolean {
    if (!this.currentUserId) return false
    const hash = localStorage.getItem(this.getPinHashKey())
    const salt = localStorage.getItem(this.getPinSaltKey())
    return !!(hash && salt)
  }
  
  setPin(pin: string): void {
    if (!this.currentUserId) {
      console.error('无法设置 PIN 码：用户未登录')
      return
    }
    
    const salt = this.generateSalt()
    const hash = this.hashPin(pin, salt)
    
    localStorage.setItem(this.getPinHashKey(), hash)
    localStorage.setItem(this.getPinSaltKey(), salt)
    
    this.clearVerification()
  }
  
  verifyPin(pin: string): boolean {
    if (!this.currentUserId) return false
    
    const storedHash = localStorage.getItem(this.getPinHashKey())
    const salt = localStorage.getItem(this.getPinSaltKey())
    
    if (!storedHash || !salt) {
      return false
    }
    
    const computedHash = this.hashPin(pin, salt)
    
    if (computedHash === storedHash) {
      this.setVerified()
      return true
    }
    
    return false
  }
  
  changePin(oldPin: string, newPin: string): { success: boolean; message: string } {
    if (!this.currentUserId) {
      return { success: false, message: '用户未登录' }
    }
    
    if (!this.verifyPin(oldPin)) {
      return { success: false, message: '原 PIN 码错误' }
    }
    
    const salt = this.generateSalt()
    const hash = this.hashPin(newPin, salt)
    
    localStorage.setItem(this.getPinHashKey(), hash)
    localStorage.setItem(this.getPinSaltKey(), salt)
    
    return { success: true, message: 'PIN 码修改成功' }
  }
  
  removePin(): void {
    if (!this.currentUserId) return
    
    localStorage.removeItem(this.getPinHashKey())
    localStorage.removeItem(this.getPinSaltKey())
    this.clearVerification()
  }
  
  private setVerified(): void {
    if (!this.currentUserId) return
    
    sessionStorage.setItem(this.getSessionVerifiedKey(), 'true')
    const expiry = Date.now() + SESSION_DURATION
    sessionStorage.setItem(this.getSessionExpiryKey(), expiry.toString())
  }
  
  isVerified(): boolean {
    if (!this.currentUserId) return false
    
    const verified = sessionStorage.getItem(this.getSessionVerifiedKey())
    const expiry = sessionStorage.getItem(this.getSessionExpiryKey())
    
    if (!verified || !expiry) {
      return false
    }
    
    if (Date.now() > parseInt(expiry)) {
      this.clearVerification()
      return false
    }
    
    return true
  }
  
  clearVerification(): void {
    if (!this.currentUserId) return
    
    sessionStorage.removeItem(this.getSessionVerifiedKey())
    sessionStorage.removeItem(this.getSessionExpiryKey())
  }
  
  clearAllUserData(userId: number): void {
    localStorage.removeItem(`pin_hash_${userId}`)
    localStorage.removeItem(`pin_salt_${userId}`)
    sessionStorage.removeItem(`pin_verified_${userId}`)
    sessionStorage.removeItem(`pin_expiry_${userId}`)
  }
  
  extendSession(): void {
    if (this.isVerified()) {
      const expiry = Date.now() + SESSION_DURATION
      sessionStorage.setItem(this.getSessionExpiryKey(), expiry.toString())
    }
  }
  
  getRemainingTime(): number {
    if (!this.currentUserId) return 0
    
    const expiry = sessionStorage.getItem(this.getSessionExpiryKey())
    if (!expiry) return 0
    
    const remaining = parseInt(expiry) - Date.now()
    return Math.max(0, Math.floor(remaining / 1000 / 60))
  }
}

export const pinManager = PinManager.getInstance()
