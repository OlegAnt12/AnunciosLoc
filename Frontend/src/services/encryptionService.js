import CryptoJS from 'crypto-js';

// Simple encryption service for messages
class EncryptionService {
  constructor() {
    // In production, this should be securely managed
    this.secretKey = 'AnunciosLocSecretKey2024';
  }

  encrypt(text) {
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Generate a simple key pair for demonstration
  generateKeyPair() {
    // In production, use proper key generation
    const privateKey = CryptoJS.lib.WordArray.random(256/8).toString();
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    return { privateKey, publicKey };
  }
}

export const encryptionService = new EncryptionService();