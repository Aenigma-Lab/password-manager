'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PasswordEntry, Category } from '../../lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { generateSecurePassword, getPasswordStrength } from '../../lib/passwordGenerator';

const allowedCategories = ['Work', 'Personal', 'Social', 'Finance', 'Other'] as const;

const passwordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  url: z.string().optional(),
  notes: z.string().optional(),
  category: z.enum(allowedCategories).optional(),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: PasswordEntry;
  loading?: boolean;
}

// Helper to sanitize category string into valid enum or undefined
function sanitizeCategory(category?: string): Category | undefined {
  if (category && allowedCategories.includes(category as Category)) {
    return category as Category;
  }
  return undefined;
}

export default function PasswordForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: PasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          username: initialData.username,
          password: initialData.password,
          url: initialData.url || '',
          notes: initialData.notes || '',
          category: sanitizeCategory(initialData.category),
        }
      : {
          title: '',
          username: '',
          password: '',
          url: '',
          notes: '',
          category: undefined,
        },
  });

  const watchedPassword = watch('password');
  const watchedCategory = watch('category');
  const passwordStrength = watchedPassword ? getPasswordStrength(watchedPassword) : null;

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          username: initialData.username,
          password: initialData.password,
          url: initialData.url || '',
          notes: initialData.notes || '',
          category: sanitizeCategory(initialData.category),
        });
      } else {
        reset({
          title: '',
          username: '',
          password: '',
          url: '',
          notes: '',
          category: undefined,
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, initialData, reset]);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setValue('password', newPassword, { shouldValidate: true });
    setShowPassword(true); // show generated password for convenience
  };

  const handleFormSubmit = async (data: PasswordFormData) => {
    try {
      await onSubmit({
        title: data.title,
        username: data.username,
        password: data.password,
        url: data.url || undefined,
        notes: data.notes || undefined,
        category: data.category || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save password:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Password' : 'Add New Password'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} placeholder="e.g., Gmail, Facebook" />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username/Email *</Label>
            <Input id="username" {...register('username')} placeholder="your@email.com" />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="pr-16"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                disabled={loading}
              >
                Generate
              </Button>
            </div>
            {passwordStrength && (
              <div className="text-sm mt-1">
                <span className="mr-2">Strength:</span>
                <span className={passwordStrength.color}>{passwordStrength.label}</span>
                <div className="w-full h-2 bg-gray-200 rounded mt-1">
                  <div
                    className={`h-2 rounded ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input id="url" {...register('url')} placeholder="https://example.com" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watchedCategory || ''}
              onValueChange={(value) => setValue('category', value as Category)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Password' : 'Save Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
