'use client';

import React from 'react';
import { Button } from '../ui/button';

interface HeaderProps {
  onLogout: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
  passwordCount: number;
}

export default function Header({ onLogout, onExport, onImport, passwordCount }: HeaderProps) {
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            onImport(content);
          } catch {
            alert('Failed to read file');
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Password Manager</h1>
          <p className="text-sm text-gray-600">
            {passwordCount} {passwordCount === 1 ? 'password' : 'passwords'} stored securely
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="text-gray-700 hover:text-gray-900"
          >
            Export Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="text-gray-700 hover:text-gray-900"
          >
            Import Data
          </Button>

          <div className="h-4 w-px bg-gray-300" />

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Lock Vault
          </Button>
        </div>
      </div>
    </header>
  );
}
