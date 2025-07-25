'use client';

import { useState, useEffect, useCallback } from 'react';
import { PasswordEntry, Category } from '../lib/types';
import { 
  loadPasswordEntries, 
  addPasswordEntry, 
  updatePasswordEntry, 
  deletePasswordEntry,
  exportData,
  importData
} from '../lib/storage';

export function usePasswords(masterKey: CryptoKey | null) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  // Load passwords when master key is available
  const loadPasswords = useCallback(async () => {
    if (!masterKey) return;
    
    try {
      setLoading(true);
      setError(null);
      const entries = await loadPasswordEntries(masterKey);
      setPasswords(entries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load passwords';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [masterKey]);

  // Load passwords on mount and when master key changes
  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  // Add new password
  const addPassword = useCallback(async (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!masterKey) throw new Error('Not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      
      const newEntry: PasswordEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await addPasswordEntry(newEntry, masterKey);
      await loadPasswords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [masterKey, loadPasswords]);

  // Update existing password
  const updatePassword = useCallback(async (entry: PasswordEntry): Promise<void> => {
    if (!masterKey) throw new Error('Not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedEntry = {
        ...entry,
        updatedAt: Date.now()
      };
      
      await updatePasswordEntry(updatedEntry, masterKey);
      await loadPasswords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [masterKey, loadPasswords]);

  // Delete password
  const deletePassword = useCallback(async (entryId: string): Promise<void> => {
    if (!masterKey) throw new Error('Not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      
      await deletePasswordEntry(entryId, masterKey);
      await loadPasswords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [masterKey, loadPasswords]);

  // Export passwords
  const exportPasswords = useCallback(async (): Promise<string> => {
    if (!masterKey) throw new Error('Not authenticated');
    
    try {
      return await exportData(masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export passwords';
      setError(errorMessage);
      throw err;
    }
  }, [masterKey]);

  // Import passwords
  const importPasswords = useCallback(async (jsonData: string): Promise<void> => {
    if (!masterKey) throw new Error('Not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      
      await importData(jsonData, masterKey);
      await loadPasswords();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import passwords';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [masterKey, loadPasswords]);

  // Filter passwords based on search term and category
  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = searchTerm === '' || 
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      password.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get categories with counts
  const categories = passwords.reduce((acc, password) => {
    const category = (password.category as Category) || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<Category, number>);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    passwords: filteredPasswords,
    allPasswords: passwords,
    loading,
    error,
    searchTerm,
    selectedCategory,
    categories,
    setSearchTerm,
    setSelectedCategory,
    addPassword,
    updatePassword,
    deletePassword,
    exportPasswords,
    importPasswords,
    refreshPasswords: loadPasswords,
    clearError
  };
}
