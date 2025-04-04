import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './components/Router'
import './index.css'
import './styles.css'

// Error handler for the entire application
const handleError = (error: Error) => {
  console.error('Application error:', error);
  
  // Create error UI
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.backgroundColor = '#f8d7da';
  errorDiv.style.color = '#721c24';
  errorDiv.style.border = '1px solid #f5c6cb';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.margin = '20px';
  
  errorDiv.innerHTML = `
    <h2>Application Error</h2>
    <p>The application failed to initialize. This could be due to configuration issues.</p>
    <p>Error: ${error.message}</p>
    <p>Please check the console for more details.</p>
    <h3>Debugging Information</h3>
    <p>Firebase initialization may have failed. Check that all environment variables are set correctly.</p>
    <button id="retry-button" style="background: #721c24; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
  `;
  
  // Clear root and append error
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement.appendChild(errorDiv);
    
    // Add retry button handler
    document.getElementById('retry-button')?.addEventListener('click', () => {
      window.location.reload();
    });
  }
};

try {
  console.log('Starting application...');
  
  // Debug: check window.ENV status
  console.log('window.ENV available:', typeof window !== 'undefined' && !!window.ENV);
  if (window.ENV) {
    console.log('window.ENV keys:', Object.keys(window.ENV));
  } else {
    console.warn('window.ENV not available - using fallback from import.meta.env');
    // Create a fallback ENV object from import.meta.env
    window.ENV = {} as any;
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        if (window.ENV) {
          window.ENV[key] = (import.meta.env as any)[key];
        }
      }
    });
  }
  
  // Check for Firebase environment variables
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const windowEnvValue = window.ENV && window.ENV[varName];
    const viteEnvValue = (import.meta.env as any)[varName];
    
    if (windowEnvValue || viteEnvValue) {
      return false;
    }
    return true;
  });
  
  if (missingVars.length > 0) {
    console.error('Missing required Firebase environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  } else {
    console.log('All required environment variables are available');
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Router />
    </React.StrictMode>,
  );
  
  console.log('Application initialized successfully');
} catch (error) {
  console.error('Error initializing application:', error);
  handleError(error as Error);
} 