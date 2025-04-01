import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onUserStateChanged, getCurrentUser } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  userCredits: number;
  setUserCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  userCredits: 0,
  setUserCredits: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(100); // Default credits for demo

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // Set up auth state listener
    const unsubscribe = onUserStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoading,
    userCredits,
    setUserCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 