'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePasswords } from '@/hooks/usePasswords';
import { PasswordEntry } from '@/lib/types';
import SetupForm from '@/components/auth/SetupForm';
import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PasswordList from '@/components/password/PasswordList';
import PasswordForm from '@/components/password/PasswordForm';
import PasswordViewer from '@/components/password/PasswordViewer';
import PasswordGenerator from '@/components/password/PasswordGenerator';

export default function HomePage() {
  const {
    isSetup,
    isAuthenticated,
    masterKey,
    loading: authLoading,
    error: authError,
    setup,
    login,
    logout,
  } = useAuth();

  const {
    passwords,
    allPasswords,
    loading: passwordsLoading,
    error: passwordsError,
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
    refreshPasswords,
  } = usePasswords(masterKey);

  const [showForm, setShowForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [viewingPassword, setViewingPassword] = useState<PasswordEntry | null>(null);

  const handleAddPassword = () => {
    setEditingPassword(null);
    setShowForm(true);
  };

  const handleEditPassword = (password: PasswordEntry) => {
    setEditingPassword(password);
    setShowForm(true);
  };

  const handleViewPassword = (password: PasswordEntry) => {
    setViewingPassword(password);
  };

  const handleFormSubmit = async (data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPassword) {
      await updatePassword({ ...editingPassword, ...data });
    } else {
      await addPassword(data);
    }
    setShowForm(false);
  };

  const handleExport = async () => {
    try {
      const data = await exportPasswords();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passwords-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export passwords:', error);
    }
  };

  const handleImport = async (jsonData: string) => {
    try {
      await importPasswords(jsonData);
      await refreshPasswords();
    } catch (error) {
      console.error('Failed to import passwords:', error);
    }
  };

  if (!isSetup) {
    return <SetupForm onSetup={setup} loading={authLoading} error={authError} />;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} loading={authLoading} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLogout={logout}
        onExport={handleExport}
        onImport={handleImport}
        passwordCount={allPasswords.length}
      />

      <div className="flex">
        <Sidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onAddPassword={handleAddPassword}
        />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === 'All' ? 'All Passwords' : selectedCategory}
              </h1>
              <p className="text-gray-600">
                {passwords.length} {passwords.length === 1 ? 'password' : 'passwords'} found
              </p>
            </div>

            {passwordsError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {passwordsError}
              </div>
            )}

            {passwordsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading passwords...</p>
                </div>
              </div>
            ) : (
              <>
                <PasswordList
                  passwords={passwords}
                  onEdit={handleEditPassword}
                  onDelete={deletePassword}
                  onView={handleViewPassword}
                />

                <div className="mt-8">
                  <PasswordGenerator />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <PasswordForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPassword ?? undefined} // also safer if PasswordForm expects undefined
        loading={passwordsLoading}
      />

      <PasswordViewer
        isOpen={!!viewingPassword}
        onClose={() => setViewingPassword(null)}
        password={viewingPassword} // pass PasswordEntry | null, no undefined
      />
    </div>
  );
}
