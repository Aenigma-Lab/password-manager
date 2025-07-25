'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface LoginFormProps {
  onLogin: (password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      try {
        await onLogin(password);
      } catch {
        // Error is handled by parent component
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Password Manager</CardTitle>
          <CardDescription>
            Enter your master password to access your secure vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Master Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  className="pr-10"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password.trim()}
            >
              {loading ? 'Unlocking...' : 'Unlock Vault'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Security Notice:</strong> Your session will automatically lock after 30 minutes of inactivity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
