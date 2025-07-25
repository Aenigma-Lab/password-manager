export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: Category;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  masterPasswordHash: string;
  salt: string;
  isSetup: boolean;
}

export interface EncryptionState {
  isAuthenticated: boolean;
  masterKey: CryptoKey | null;
}

export type Category = 'Work' | 'Personal' | 'Social' | 'Finance' | 'Other';

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}
