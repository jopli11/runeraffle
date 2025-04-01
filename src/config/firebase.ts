import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

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

export { auth, db }; 