'use client';

import React, { useState } from 'react';
import { PasswordEntry } from '../../lib/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';

interface PasswordViewerProps {
  isOpen: boolean;
  onClose: () => void;
  password: PasswordEntry | null;
}

export default function PasswordViewer({ isOpen, onClose, password }: PasswordViewerProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!password) return null;

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openUrl = () => {
    if (password.url) {
      const url = password.url.startsWith('http') ? password.url : `https://${password.url}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{password.title}</span>
            {password.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {password.category}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Username/Email</Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm font-mono">{password.username}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(password.username, 'username')}
                className="whitespace-nowrap"
              >
                {copiedField === 'username' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Password</Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm font-mono">
                  {showPassword ? password.password : '••••••••••••'}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
                className="whitespace-nowrap"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(password.password, 'password')}
                className="whitespace-nowrap"
              >
                {copiedField === 'password' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* URL */}
          {password.url && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Website URL</Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                  <span className="text-sm text-blue-600 break-all">{password.url}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openUrl}
                  className="whitespace-nowrap"
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(password.url!, 'url')}
                  className="whitespace-nowrap"
                >
                  {copiedField === 'url' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          {password.notes && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{password.notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created
                </Label>
                <p className="mt-1">{formatDate(password.createdAt)}</p>
              </div>
              {password.updatedAt !== password.createdAt && (
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Last Updated
                  </Label>
                  <p className="mt-1">{formatDate(password.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Security Notice:</strong> Password copied to clipboard will be cleared automatically after 30 seconds.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
