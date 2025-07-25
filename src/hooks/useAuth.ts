'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isAppSetup,
  setupMasterPassword,
  verifyMasterPassword,
  generateKeyFromPassword,
  loadAppSettings,
} from '../lib/encryption';

export function useAuth() {
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if app is set up on mount
  useEffect(() => {
    async function checkSetup() {
      try {
        const setupStatus = await Promise.resolve(isAppSetup());
        setIsSetup(setupStatus);
      } catch {
        setError('Failed to check app setup status');
      } finally {
        setLoading(false);
      }
    }

    checkSetup();
  }, []);

  // Login function wrapped with useCallback to keep stable reference
  const login = useCallback(async (password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const isValid = await verifyMasterPassword(password);
      if (!isValid) {
        throw new Error('Invalid master password');
      }

      const settings = await Promise.resolve(loadAppSettings());
      if (!settings) {
        throw new Error('App settings not found');
      }

      const key = await generateKeyFromPassword(password, settings.salt);
      setMasterKey(key);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup master password for first time, depends on login
  const setup = useCallback(
    async (password: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        if (password.length < 8) {
          throw new Error('Master password must be at least 8 characters long');
        }

        await setupMasterPassword(password);
        setIsSetup(true);

        // Auto-login after setup
        await login(password);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to setup master password';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login],
  );

  // Logout resets authentication states
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setMasterKey(null);
    setError(null);
  }, []);

  // Clear error manually
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-logout after 30 minutes inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true);
    });

    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [isAuthenticated, logout]);

  return {
    isSetup,
    isAuthenticated,
    masterKey,
    loading,
    error,
    setup,
    login,
    logout,
    clearError,
  };
}
