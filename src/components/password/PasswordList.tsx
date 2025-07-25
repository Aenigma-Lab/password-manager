'use client';

import React, { useState } from 'react';
import { PasswordEntry } from '../../lib/types';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface PasswordListProps {
  passwords: PasswordEntry[];
  onEdit: (password: PasswordEntry) => void;
  onDelete: (passwordId: string) => void;
  onView: (password: PasswordEntry) => void;
}

export default function PasswordList({ passwords, onEdit, onDelete, onView }: PasswordListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (passwordId: string) => {
    if (window.confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
      setDeletingId(passwordId);
      try {
        await onDelete(passwordId);
      } catch (error) {
        console.error('Failed to delete password:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (passwords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No passwords found</h3>
        <p className="text-gray-500 mb-4">
          Get started by adding your first password to the vault.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {passwords.map((password) => (
        <Card key={password.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {password.title}
                  </h3>
                  {password.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {password.category}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Username:</span>
                    <span className="truncate">{password.username}</span>
                    <button
                      onClick={() => copyToClipboard(password.username, 'Username')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  
                  {password.url && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">URL:</span>
                      <a
                        href={password.url.startsWith('http') ? password.url : `https://${password.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        {password.url}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {formatDate(password.createdAt)}</span>
                    {password.updatedAt !== password.createdAt && (
                      <span>Updated: {formatDate(password.updatedAt)}</span>
                    )}
                  </div>
                </div>
                
                {password.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Notes:</span>
                    <p className="mt-1 text-gray-500 line-clamp-2">{password.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(password)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View Password
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(password)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(password.id)}
                  disabled={deletingId === password.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === password.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
