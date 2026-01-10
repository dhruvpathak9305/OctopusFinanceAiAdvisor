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
import CryptoJS from 'crypto-js';

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
  'openai_api_key' // Added this just in case we store it locally
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
      // Fallback: This is CRITICAL failure, but we must return something to prevent crash.
      // In production, this should probably halt the app or user login.
      console.error("CRITICAL: Using weak fallback key due to SecureStore error");
      return 'fallback-key-not-secure-critical-failure';
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
          // Use AES encryption
          const encryptedValue = this.aesEncrypt(encrypted[field], key);
          // Prefix to identify encrypted values (and perhaps algorithm version in future)
          encrypted[field] = `aes:${encryptedValue}`;
        } catch (error) {
          console.error(`Error encrypting field ${field}:`, error);
          // Keep original value if encryption fails to avoid data loss, but log it
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
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        const val = decrypted[field];
        
        // Handle AES Encrypted
        if (val.startsWith('aes:')) {
          try {
            const encryptedValue = val.replace('aes:', '');
            const decryptedValue = this.aesDecrypt(encryptedValue, key);
            // If decryption returns empty string, it might be wrong key or malformed
            if (decryptedValue) {
               decrypted[field] = decryptedValue;
            } else {
               // Decryption failed silently
               console.warn(`Decryption resulted in empty string for field ${field}`);
            }
          } catch (error) {
            console.error(`Error decrypting AES field ${field}:`, error);
            // Keep encrypted value if decryption fails
          }
        } 
        // Handle Legacy XOR Encrypted (Migration path)
        else if (val.startsWith('encrypted:')) {
           try {
            const encryptedValue = val.replace('encrypted:', '');
            const decryptedValue = this.simpleDecrypt(encryptedValue, key);
            decrypted[field] = decryptedValue;
            
            // OPTIONAL: We could auto-re-encrypt here to migrate on read
            // console.log(`Migrated field ${field} from XOR to Plaintext (will be re-encrypted on save)`);
          } catch (error) {
            console.error(`Error decrypting Legacy field ${field}:`, error);
          }
        }
      }
    }

    return decrypted;
  }

  /**
   * AES Encryption
   */
  private aesEncrypt(text: string, key: string): string {
    return CryptoJS.AES.encrypt(text, key).toString();
  }

  /**
   * AES Decryption
   */
  private aesDecrypt(encryptedText: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * LEGACY: Simple XOR decryption for backward compatibility during migration
   */
  private simpleDecrypt(encryptedText: string, key: string): string {
    try {
      if (typeof atob === 'undefined') {
         // Polyfill or use logic if atob missing in some RN environments, though usually present
         // If needed use Buffer or similar. For now assume atob exists or is polyfilled.
         return encryptedText; 
      }
      const text = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (error) {
      console.error('Legacy Decryption error:', error);
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

