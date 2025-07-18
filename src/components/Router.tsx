import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { ProfilePage } from './profile/ProfilePage';
import { ReferralPage } from './profile/ReferralPage';
import CompetitionsPage from './competitions/CompetitionsPage';
import CompetitionPage from './competitions/CompetitionPage';
import WinnersPage from './winners/WinnersPage';
import { HowItWorksPage } from './howItWorks/HowItWorksPage';
import AuthPage from './auth/AuthPage';
import AdminDashboard from './admin/AdminDashboard';
import VerificationPage from './verification/VerificationPage';
import { AuthProvider } from '../context/AuthContext';
import styled from '@emotion/styled';
import { SupportPage } from './support/SupportPage';
import TermsOfService from './legal/TermsOfService';
import PrivacyPolicy from './legal/PrivacyPolicy';
import ToastProvider from './ui/ToastProvider';

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
        <ToastProvider>
          <PageWrapper>
            <Header />
            <Main>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/referrals" element={<ReferralPage />} />
                <Route path="/competitions" element={<CompetitionsPage />} />
                <Route path="/competition/:id" element={<CompetitionPage />} />
                <Route path="/winners" element={<WinnersPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/verification/:id" element={<VerificationPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/support" element={<Navigate to="/admin?tab=support" replace />} />
                <Route path="/admin/edit-competition/:id" element={<AdminDashboard />} />
                <Route path="/admin/competitions" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard />} />
                <Route path="/admin/winners" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminDashboard />} />
                
                <Route path="/support" element={<SupportPage />} />
                
                {/* Legal pages */}
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
              </Routes>
            </Main>
            <Footer />
          </PageWrapper>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
} 