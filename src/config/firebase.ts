import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Conditionally import firebase functions to avoid errors
let functionsImported = false;
try {
  // Try to import firebase functions
  require('firebase/compat/functions');
  functionsImported = true;
  console.log('Firebase Functions imported successfully');
} catch (error) {
  console.warn('Failed to import Firebase Functions - will use fallback implementation');
}

// Access environment variables from both runtime and build time
const getEnvVariable = (key: string): string => {
  // Debug environment details
  if (typeof window !== 'undefined' && key === 'VITE_FIREBASE_API_KEY') {
    console.log('Environment details:');
    console.log('- Window ENV available:', !!window.ENV);
    console.log('- import.meta.env keys:', Object.keys(import.meta.env));
  }
  
  // Try window.ENV first (set by server.js)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    console.log(`Using runtime ENV for ${key}`);
    return window.ENV[key];
  }
  
  // Then try import.meta.env
  const envValue = import.meta.env[key] || '';
  if (envValue) {
    console.log(`Using import.meta.env for ${key}`);
  } else {
    console.error(`Missing environment variable: ${key}`);
  }
  return envValue;
};

// Debug: log firebase initialization
console.log("Initializing Firebase...");

// Your web app's Firebase configuration
const apiKey = getEnvVariable('VITE_FIREBASE_API_KEY');
const authDomain = getEnvVariable('VITE_FIREBASE_AUTH_DOMAIN');
const projectId = getEnvVariable('VITE_FIREBASE_PROJECT_ID');
const storageBucket = getEnvVariable('VITE_FIREBASE_STORAGE_BUCKET');
const messagingSenderId = getEnvVariable('VITE_FIREBASE_MESSAGING_SENDER_ID');
const appId = getEnvVariable('VITE_FIREBASE_APP_ID');

// Check if we have the required configuration
const hasMissingConfig = !apiKey || !authDomain || !projectId || !storageBucket 
  || !messagingSenderId || !appId;

if (hasMissingConfig) {
  console.error("Firebase configuration is incomplete. Check environment variables.");
  console.error("Missing:", {
    apiKey: !apiKey,
    authDomain: !authDomain,
    projectId: !projectId,
    storageBucket: !storageBucket,
    messagingSenderId: !messagingSenderId,
    appId: !appId
  });
} else {
  console.log("Firebase configuration loaded successfully.");
}

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

// Initialize Firebase
let auth: firebase.auth.Auth;
let db: firebase.firestore.Firestore;
let googleProvider: firebase.auth.GoogleAuthProvider;

try {
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
  
  // Initialize Firestore and Auth
  db = firebase.firestore();
  auth = firebase.auth();
  
  googleProvider = new firebase.auth.GoogleAuthProvider();
  
  // Configure Firebase Functions to use emulator in development mode
  // Only use emulator if explicitly enabled with an environment variable
  const useEmulator = import.meta.env.MODE === 'development' && getEnvVariable('VITE_USE_FIREBASE_EMULATOR') === 'true';
  
  // Make sure functions were imported and exist before trying to access them
  if (functionsImported && typeof firebase.functions === 'function') {
    if (useEmulator) {
      console.log('Using Firebase emulator for functions');
      firebase.functions().useEmulator('localhost', 5001);
    }
    
    // Set the default region for Firebase Functions to europe-west2 (London)
    if (typeof firebase.app().functions === 'function') {
      firebase.app().functions('europe-west2');
    } else {
      console.warn('firebase.app().functions is not available - region settings will be ignored');
    }
  } else {
    console.warn('Firebase Functions not available in this build - functions will not work');
  }
  
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    
    // If displayName is provided, update the user profile
    if (displayName && result.user) {
      await result.user.updateProfile({
        displayName: displayName
      });
      
      // Send email verification
      await result.user.sendEmailVerification();
    }
    
    return result.user;
  } catch (error) {
    console.error("Error registering with email: ", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    return result.user;
  } catch (error) {
    console.error("Error logging in with email: ", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onUserStateChanged = (callback: (user: firebase.User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
    throw error;
  }
};

export const sendEmailVerification = async (user = auth.currentUser) => {
  if (!user) throw new Error('No user is currently logged in');
  
  try {
    await user.sendEmailVerification();
  } catch (error) {
    console.error("Error sending email verification: ", error);
    throw error;
  }
};

export const updateUserProfile = async (displayName: string, photoURL?: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently logged in');
  
  try {
    await user.updateProfile({
      displayName: displayName,
      photoURL: photoURL || user.photoURL
    });
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
};

export const getUserCreationTime = () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  // Access the metadata with the Firebase compat API
  return user.metadata.creationTime;
};

// Create a safe function for getting Firebase functions
export const getFunctions = (region: string = 'europe-west2') => {
  try {
    if (functionsImported && typeof firebase.functions === 'function') {
      // The firebase.functions() method accepts either a string region or an app instance
      return firebase.functions(region as any);
    } else {
      console.error('Firebase Functions not available in this environment');
      // Return a mock functions object that doesn't throw errors
      return createMockFunctions();
    }
  } catch (error) {
    console.error('Error accessing Firebase Functions:', error);
    // Return a mock functions object that doesn't throw errors
    return createMockFunctions();
  }
};

// Create a mock functions implementation that doesn't throw errors
function createMockFunctions() {
  return {
    httpsCallable: (name: string) => {
      console.error(`Function ${name} was called but Firebase Functions is not available`);
      return (...args: any[]) => {
        console.warn(`Mock function ${name} called with:`, args);
        return Promise.reject(new Error('Firebase Functions not available'));
      };
    }
  };
}

// Export Firebase instances at the end of the file
export { auth, db, firebase }; 