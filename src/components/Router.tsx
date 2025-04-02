import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { ProfilePage } from './profile/ProfilePage';
import CompetitionsPage from './competitions/CompetitionsPage';
import CompetitionPage from './competitions/CompetitionPage';
import WinnersPage from './winners/WinnersPage';
import { HowItWorksPage } from './howItWorks/HowItWorksPage';
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

export default function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageWrapper>
          <Header />
          <Main>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competition/:id" element={<CompetitionPage />} />
              <Route path="/winners" element={<WinnersPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Main>
          <Footer />
        </PageWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
} 