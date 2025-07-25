'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Category } from '../../lib/types';

interface SidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  categories: Record<Category, number>;
  onAddPassword: () => void;
}

const categoryLabels: Record<Category | 'All', string> = {
  All: 'All Passwords',
  Work: 'Work',
  Personal: 'Personal',
  Social: 'Social Media',
  Finance: 'Financial',
  Other: 'Other'
};

export default function Sidebar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onAddPassword
}: SidebarProps) {
  const totalCount = Object.values(categories).reduce((sum, count) => sum + count, 0);

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-6">
      {/* Add Password Button */}
      <Button
        onClick={onAddPassword}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
      >
        Add New Password
      </Button>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium text-gray-700">
          Search Passwords
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by title, username..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Categories</Label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('All')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'All'
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{categoryLabels.All}</span>
              <span className={`text-xs ${
                selectedCategory === 'All' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {totalCount}
              </span>
            </div>
          </button>

          {(Object.keys(categoryLabels) as Array<Category | 'All'>)
            .filter(cat => cat !== 'All')
            .map((category) => {
              const count = categories[category as Category] || 0;
              return (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category as Category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{categoryLabels[category]}</span>
                    <span className={`text-xs ${
                      selectedCategory === category ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-4 border-t border-gray-200">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Passwords:</span>
            <span className="font-medium">{totalCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Categories:</span>
            <span className="font-medium">
              {Object.values(categories).filter(count => count > 0).length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
