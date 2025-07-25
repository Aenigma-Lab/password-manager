'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getPasswordStrength } from '../../lib/passwordGenerator';

interface SetupFormProps {
  onSetup: (password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function SetupForm({ onSetup, loading, error }: SetupFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      setValidationError('Master password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 4) {
      setValidationError('Please choose a stronger password');
      return;
    }

    try {
      await onSetup(password);
    } catch {
      // Error is handled by parent
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Setup Password Manager</CardTitle>
          <CardDescription>
            Create a master password to secure your vault. This password encrypts all your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Master Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Master Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password Strength:</span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 4 ? 'bg-orange-500' :
                        passwordStrength.score <= 6 ? 'bg-yellow-500' :
                        passwordStrength.score <= 7 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      {passwordStrength.feedback.map((feedback, index) => (
                        <li key={index}>• {feedback}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your master password"
                required
              />
            </div>

            {/* Validation Error */}
            {(validationError || error) && (
              <div className="text-red-600 text-sm">
                {validationError || error}
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Your master password cannot be recovered. Losing it means losing all data.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password || password !== confirmPassword}
            >
              {loading ? 'Setting up...' : 'Create Master Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
