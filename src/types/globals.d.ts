// Global types for the application

// Extend the window interface to include our environment variables
interface Window {
  ENV?: {
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
    VITE_USE_FIREBASE_EMULATOR?: string;
    [key: string]: string | undefined;
  };
} 