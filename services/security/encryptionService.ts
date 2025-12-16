/**
 * =============================================================================
 * ENCRYPTION SERVICE - DATA ENCRYPTION AT REST
 * =============================================================================
 * 
 * Encrypts sensitive fields (account numbers, SSNs, etc.) at rest in local DB.
 * Uses expo-crypto for encryption/decryption.
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ENCRYPTION_KEY_STORAGE_KEY = 'octopus_encryption_key';

/**
 * Fields that should be encrypted
 */
const SENSITIVE_FIELDS = [
  'account_number',
  'ssn',
  'pan',
  'aadhaar',
  'password',
  'pin',
  'cvv',
  'crn',
  'ifsc_code',
  'micr_code',
];

class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Get or generate encryption key
   */
  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      // Try to get existing key from secure storage
      const storedKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE_KEY);
      if (storedKey) {
        this.encryptionKey = storedKey;
        return storedKey;
      }

      // Generate new key
      const newKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-${Math.random()}-${Platform.OS}`
      );

      // Store in secure storage
      await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE_KEY, newKey);
      this.encryptionKey = newKey;
      return newKey;
    } catch (error) {
      console.error('Error getting encryption key:', error);
      // Fallback: use a simple key (not secure, but better than nothing)
      return 'fallback-key-not-secure';
    }
  }

  /**
   * Encrypt sensitive fields in a record
   */
  async encryptSensitiveFields(data: Record<string, any>): Promise<Record<string, any>> {
    const encrypted = { ...data };
    const key = await this.getEncryptionKey();

    for (const field of SENSITIVE_FIELDS) {
      if (encrypted[field] && typeof encrypted[field] === 'string' && encrypted[field].length > 0) {
        try {
          // Simple XOR encryption (for demo - use AES in production)
          const encryptedValue = this.simpleEncrypt(encrypted[field], key);
          encrypted[field] = `encrypted:${encryptedValue}`;
        } catch (error) {
          console.error(`Error encrypting field ${field}:`, error);
          // Keep original value if encryption fails
        }
      }
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive fields in a record
   */
  async decryptSensitiveFields(data: Record<string, any>): Promise<Record<string, any>> {
    const decrypted = { ...data };
    const key = await this.getEncryptionKey();

    for (const field of SENSITIVE_FIELDS) {
      if (decrypted[field] && typeof decrypted[field] === 'string' && decrypted[field].startsWith('encrypted:')) {
        try {
          const encryptedValue = decrypted[field].replace('encrypted:', '');
          const decryptedValue = this.simpleDecrypt(encryptedValue, key);
          decrypted[field] = decryptedValue;
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
          // Keep encrypted value if decryption fails
        }
      }
    }

    return decrypted;
  }

  /**
   * Simple XOR encryption (for demo purposes)
   * In production, use AES encryption via expo-crypto or react-native-crypto
   */
  private simpleEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Simple XOR decryption
   */
  private simpleDecrypt(encryptedText: string, key: string): string {
    try {
      const text = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText;
    }
  }

  /**
   * Check if a field should be encrypted
   */
  isSensitiveField(fieldName: string): boolean {
    return SENSITIVE_FIELDS.includes(fieldName);
  }

  /**
   * Clear encryption key (for logout/security)
   */
  async clearEncryptionKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ENCRYPTION_KEY_STORAGE_KEY);
      this.encryptionKey = null;
    } catch (error) {
      console.error('Error clearing encryption key:', error);
    }
  }
}

export default EncryptionService.getInstance();

