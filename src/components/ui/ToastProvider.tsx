import React from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        gutter={8}
        containerStyle={{
          bottom: 40,
        }}
        toastOptions={{
          // Default toast options
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
            maxWidth: '350px',
            fontWeight: '500',
          },
          // Custom toast type options
          success: {
            iconTheme: {
              primary: 'rgb(22, 163, 74)',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(22, 163, 74, 0.3)',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
            }
          },
          error: {
            iconTheme: {
              primary: 'rgb(239, 68, 68)',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }
          },
          loading: {
            iconTheme: {
              primary: 'rgb(59, 130, 246)',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(59, 130, 246, 0.3)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }
          },
        }}
      />
    </>
  );
} 