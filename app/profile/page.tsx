'use client';

import React from 'react';
import { useState } from 'react';

export default function ProfilePage() {
  // Mock data for frontend development
  const [loading] = useState(false);
  const [runescapeUsername] = useState<string | null>('RuneUser123'); 
  
  // Mock user for frontend development
  const mockUser = {
    email: 'user@example.com',
    displayName: 'Guest User'
  };

  // Display loading state within the main content area
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full">
        <p className="text-dark-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    // Use dark theme card styles
    <div className="w-full max-w-lg p-8 space-y-6 bg-dark-card rounded-lg shadow-lg border border-dark-border">
      <h1 className="text-2xl font-bold text-center text-dark-text-primary mb-6">Profile</h1>
      <div className="space-y-3 text-sm">
        <p><span className="font-semibold text-dark-text-secondary">Email:</span> <span className="text-dark-text-primary">{mockUser.email}</span></p>
        <p><span className="font-semibold text-dark-text-secondary">RuneScape Username:</span> <span className="text-dark-text-primary">{runescapeUsername || 'Not Set'}</span></p>
        {/* Input field for updating RuneScape username */}
        <div className="mt-4">
          <label htmlFor="rsn" className="block text-sm font-medium text-dark-text-secondary mb-1">Update RuneScape Username</label>
          <input 
            type="text" 
            id="rsn"
            placeholder="Enter your RSN" 
            className="mt-1 block w-full px-3 py-2 bg-[#232b3b] border border-dark-border rounded-md shadow-sm text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-sm">
            Update Username
          </button>
        </div>
      </div>
      <button
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-red-500 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
} 