import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import AdminCompetitions from './AdminCompetitions';
import AdminUsers from './AdminUsers';
import AdminWinners from './AdminWinners';
import AdminCompetitionForm from './AdminCompetitionForm';
import DatabaseSeeder from './DatabaseSeeder';

// Styled components
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: hsl(var(--foreground));
`;

const PageDescription = styled.p`
  color: hsl(var(--muted-foreground));
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: ${props => !props.active && 'hsl(var(--foreground))'};
  }
`;

const NoAccessMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: hsl(var(--muted-foreground));

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: hsl(var(--foreground));
  }

  p {
    max-width: 500px;
    margin: 0 auto;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: white;

  &:hover {
    background-color: hsl(var(--primary) / 0.9);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));

  &:hover {
    background-color: hsl(var(--secondary) / 0.9);
  }
`;

const DangerButton = styled(Button)`
  background-color: hsl(var(--destructive));
  color: white;

  &:hover {
    background-color: hsl(var(--destructive) / 0.9);
  }
`;

export default function AdminDashboard() {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'competitions' | 'users' | 'winners' | 'create' | 'seeder'>('competitions');

  // If loading or not logged in, show appropriate message
  if (isLoading) {
    return (
      <Container>
        <NoAccessMessage>
          <h2>Loading...</h2>
        </NoAccessMessage>
      </Container>
    );
  }

  if (!currentUser) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.navigate('/login');
    }
    return null;
  }

  // If not an admin, show no access message
  if (!isAdmin) {
    return (
      <Container>
        <NoAccessMessage>
          <h2>Admin Access Required</h2>
          <p>You don't have permission to access the admin dashboard. Please contact your administrator if you believe this is a mistake.</p>
        </NoAccessMessage>
      </Container>
    );
  }

  // Render admin dashboard
  return (
    <Container>
      <PageHeader>
        <PageTitle>Admin Dashboard</PageTitle>
        <PageDescription>Manage competitions, users, and system settings</PageDescription>
      </PageHeader>

      <ActionButtonsContainer>
        <PrimaryButton 
          onClick={() => setActiveTab('create')}
          disabled={activeTab === 'create'}
        >
          + New Competition
        </PrimaryButton>
        <SecondaryButton
          onClick={() => setActiveTab('seeder')}
          disabled={activeTab === 'seeder'}
        >
          Database Seeder
        </SecondaryButton>
      </ActionButtonsContainer>

      <TabsContainer>
        <Tab 
          active={activeTab === 'competitions'} 
          onClick={() => setActiveTab('competitions')}
        >
          Competitions
        </Tab>
        <Tab 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </Tab>
        <Tab 
          active={activeTab === 'winners'} 
          onClick={() => setActiveTab('winners')}
        >
          Past Winners
        </Tab>
        <Tab 
          active={activeTab === 'seeder'} 
          onClick={() => setActiveTab('seeder')}
        >
          Seeder
        </Tab>
      </TabsContainer>

      {activeTab === 'competitions' && <AdminCompetitions />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'winners' && <AdminWinners />}
      {activeTab === 'create' && <AdminCompetitionForm onCancel={() => setActiveTab('competitions')} />}
      {activeTab === 'seeder' && <DatabaseSeeder />}
    </Container>
  );
} 