// src/lib/encryption/clientCrypto.ts
import { AppSettings } from './types';

const SETTINGS_KEY = 'password_manager_settings';
const webCrypto = typeof window !== 'undefined' && window.crypto?.subtle ? window.crypto : null;

// Ensure Web Crypto is available
function ensureCrypto() {
  if (!webCrypto || !webCrypto.subtle) {
    throw new Error('Web Crypto API not available');
  }
  return webCrypto;
}

export function generateSalt(): string {
  const crypto = ensureCrypto();
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const crypto = ensureCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateKeyFromPassword(password: string, salt: string): Promise<CryptoKey> {
  const crypto = ensureCrypto();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const crypto = ensureCrypto();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
  const crypto = ensureCrypto();
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

// LocalStorage utility
export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadAppSettings(): AppSettings | null {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export async function verifyMasterPassword(password: string): Promise<boolean> {
  const settings = loadAppSettings();
  if (!settings) return false;

  const hash = await hashPassword(password, settings.salt);
  return hash === settings.masterPasswordHash;
}

export async function setupMasterPassword(password: string): Promise<void> {
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  const settings: AppSettings = {
    masterPasswordHash: hash,
    salt,
    isSetup: true,
  };
  saveAppSettings(settings);
}

export function isAppSetup(): boolean {
  const settings = loadAppSettings();
  return settings?.isSetup || false;
}
