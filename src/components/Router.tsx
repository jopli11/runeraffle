import React, { useState, useEffect } from 'react';
import App from '../App';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { ProfilePage } from './profile/ProfilePage';
import CompetitionsPage from './competitions/CompetitionsPage';
import CompetitionPage from './competitions/CompetitionPage';
import WinnersPage from './winners/WinnersPage';
import HowItWorksPage from './howItWorks/HowItWorksPage';
import AuthPage from './auth/AuthPage';
import AdminDashboard from './admin/AdminDashboard';
import { AuthProvider } from '../context/AuthContext';
import styled from '@emotion/styled';

// Define main layout components
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
`;

// Extend Window interface to include navigate function
declare global {
  interface Window {
    navigate: (path: string) => void;
  }
}

export default function Router() {
  const [currentPath, setCurrentPath] = useState('/');
  
  useEffect(() => {
    // Initialize with current path
    setCurrentPath(window.location.pathname);
    
    // Define the navigate function on the window object
    window.navigate = (path: string) => {
      // Update URL without page reload
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      
      // Scroll to top on navigation
      window.scrollTo(0, 0);
    };

    // Handle browser back/forward buttons
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Determine which component to render based on the path
  const renderContent = () => {
    // Check if path is a competition detail page
    if (currentPath.startsWith('/competition/')) {
      return <CompetitionPage />;
    }
    
    // Check other routes
    switch (currentPath) {
      case '/profile':
        return <ProfilePage />;
      case '/competitions':
        return <CompetitionsPage />;
      case '/winners':
        return <WinnersPage />;
      case '/how-it-works':
        return <HowItWorksPage />;
      case '/login':
      case '/register':
        return <AuthPage />;
      case '/admin':
        return <AdminDashboard />;
      default:
        return <App />;
    }
  };

  return (
    <AuthProvider>
      <PageWrapper>
        <Header />
        <Main>
          {renderContent()}
        </Main>
        <Footer />
      </PageWrapper>
    </AuthProvider>
  );
} 