import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onUserStateChanged, getCurrentUser } from '../config/firebase';
import { getUser, createUser } from '../services/firestore';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  userCredits: number;
  isAdmin: boolean;
  setUserCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  userCredits: 0,
  isAdmin: false,
  setUserCredits: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(100); // Default credits for demo
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // Set up auth state listener
    const unsubscribe = onUserStateChanged(async (user) => {
      setCurrentUser(user);
      
      // If user is logged in, try to get their Firestore profile
      if (user && user.email) {
        try {
          let userProfile = await getUser(user.email);
          
          // If no user document exists, create one
          if (!userProfile) {
            console.log(`Creating Firestore document for user: ${user.email}`);
            await createUser({
              email: user.email,
              displayName: user.displayName || user.email,
              credits: 100, // Default credits
              isAdmin: false
            });
            
            // Fetch the newly created user
            userProfile = await getUser(user.email);
          }
          
          if (userProfile) {
            setUserCredits(userProfile.credits);
            setIsAdmin(userProfile.isAdmin);
          }
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
        }
      } else {
        // Reset state if not logged in
        setUserCredits(100);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoading,
    userCredits,
    isAdmin,
    setUserCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 