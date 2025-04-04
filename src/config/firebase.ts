import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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
  if (useEmulator) {
    console.log('Using Firebase emulator for functions');
    firebase.functions().useEmulator('localhost', 5001);
  }
  
  // Set the default region for Firebase Functions to europe-west2 (London)
  firebase.app().functions('europe-west2');
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

// Export Firebase instances at the end of the file
export { auth, db, firebase }; 