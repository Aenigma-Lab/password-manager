import { PasswordEntry } from './types';
import { encryptData, decryptData } from './encryption';

const PASSWORDS_KEY = 'password_manager_entries';

/**
 * Save encrypted password entries to localStorage.
 * Encrypts the whole JSON string of entries using the masterKey.
 */
export async function savePasswordEntries(
  entries: PasswordEntry[],
  masterKey: CryptoKey
): Promise<void> {
  try {
    const jsonString = JSON.stringify(entries);
    const encryptedData = await encryptData(jsonString, masterKey);
    localStorage.setItem(PASSWORDS_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to save password entries:', error);
    throw new Error('Failed to save password entries');
  }
}

/**
 * Load and decrypt password entries from localStorage.
 * Returns an empty array if none found.
 */
export async function loadPasswordEntries(
  masterKey: CryptoKey
): Promise<PasswordEntry[]> {
  try {
    const encryptedData = localStorage.getItem(PASSWORDS_KEY);
    if (!encryptedData) return [];

    const decryptedData = await decryptData(encryptedData, masterKey);
    const entries: PasswordEntry[] = JSON.parse(decryptedData);
    return entries;
  } catch (error) {
    console.error('Failed to load password entries:', error);
    throw new Error('Failed to load password entries');
  }
}

/**
 * Add a new password entry.
 */
export async function addPasswordEntry(
  entry: PasswordEntry,
  masterKey: CryptoKey
): Promise<void> {
  try {
    const entries = await loadPasswordEntries(masterKey);
    entries.push(entry);
    await savePasswordEntries(entries, masterKey);
  } catch (error) {
    console.error('Failed to add password entry:', error);
    throw new Error('Failed to add password entry');
  }
}

/**
 * Update an existing password entry by id.
 * Throws if entry with given id is not found.
 */
export async function updatePasswordEntry(
  updatedEntry: PasswordEntry,
  masterKey: CryptoKey
): Promise<void> {
  try {
    const entries = await loadPasswordEntries(masterKey);
    const index = entries.findIndex(entry => entry.id === updatedEntry.id);

    if (index === -1) {
      throw new Error('Password entry not found');
    }

    entries[index] = { ...updatedEntry, updatedAt: Date.now() };
    await savePasswordEntries(entries, masterKey);
  } catch (error) {
    console.error('Failed to update password entry:', error);
    throw new Error('Failed to update password entry');
  }
}

/**
 * Delete a password entry by id.
 */
export async function deletePasswordEntry(
  entryId: string,
  masterKey: CryptoKey
): Promise<void> {
  try {
    const entries = await loadPasswordEntries(masterKey);
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    await savePasswordEntries(filteredEntries, masterKey);
  } catch (error) {
    console.error('Failed to delete password entry:', error);
    throw new Error('Failed to delete password entry');
  }
}

/**
 * Export decrypted data as a pretty JSON string.
 * WARNING: Contains sensitive info, handle with care.
 */
export async function exportData(masterKey: CryptoKey): Promise<string> {
  try {
    const entries = await loadPasswordEntries(masterKey);
    return JSON.stringify(
      {
        version: '1.0',
        timestamp: Date.now(),
        entries,
      },
      null,
      2
    );
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data');
  }
}

/**
 * Import data from a JSON string (expects decrypted entries).
 * Validates basic format before saving.
 */
export async function importData(
  jsonData: string,
  masterKey: CryptoKey
): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid import data format');
    }

    await savePasswordEntries(data.entries, masterKey);
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data');
  }
}
