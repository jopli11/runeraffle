import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { getUserSupportTickets } from '../../services/firestore';
import { NewTicketForm } from './NewTicketForm';
import UserTickets from './UserTickets';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader } from '../ui/Loader';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PageDescription = styled.p`
  font-size: 1.1rem;
  color: hsl(var(--muted-foreground));
  max-width: 700px;
  margin: 0 auto;
`;

const SupportContent = styled.div`
  background: hsl(var(--card));
  border-radius: 1rem;
  border: 1px solid hsl(var(--border));
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SupportTabs = styled.div`
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1.5rem 2rem;
  background: ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  color: ${props => props.active ? 'white' : 'hsl(var(--foreground))'};
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background: ${props => props.active ? 'hsl(var(--primary))' : 'hsla(var(--muted), 0.1)'};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.active ? 'white' : 'transparent'};
    transition: all 0.2s;
  }
`;

const SupportBody = styled.div`
  padding: 2rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: hsl(var(--muted-foreground));
  font-size: 1.1rem;
  
  p {
    margin-top: 1rem;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  border-radius: 1rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  margin: 2rem auto;
  max-width: 600px;
`;

const LoginButton = styled.button`
  background: hsl(var(--primary));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

export function SupportPage() {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'view'>('new');
  
  // Get ticketId from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const ticketIdFromUrl = searchParams.get('ticketId');

  useEffect(() => {
    if (currentUser) {
      loadUserTickets();
    }
    
    // If we have a ticketId in the URL, switch to the view tickets tab
    if (ticketIdFromUrl) {
      setActiveTab('view');
    }
  }, [currentUser, ticketIdFromUrl]);

  const loadUserTickets = async () => {
    if (!currentUser) return;
    
    setIsLoadingTickets(true);
    try {
      const userTickets = await getUserSupportTickets(currentUser.uid);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // After creating a new ticket, refresh the tickets list and switch to viewing tab
  const handleTicketCreated = (ticketId: string) => {
    loadUserTickets();
    // Optionally switch to viewing tickets tab
    setActiveTab('view');
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>
          <Loader size={50} />
          <p>Loading...</p>
        </LoadingMessage>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container>
        <PageHeader>
          <PageTitle>Support Center</PageTitle>
          <PageDescription>
            Get help with your RuneRaffle account, competitions, or prize collections.
          </PageDescription>
        </PageHeader>
        
        <LoginPrompt>
          <h2>Please sign in to access support</h2>
          <p>You need to be logged in to create or view support tickets.</p>
          <LoginButton onClick={() => navigate('/login')}>Sign In</LoginButton>
        </LoginPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Support Center</PageTitle>
        <PageDescription>
          Get help with your RuneRaffle account, competitions, or prize collections.
        </PageDescription>
      </PageHeader>

      <SupportContent>
        <SupportTabs>
          <Tab 
            active={activeTab === 'new'} 
            onClick={() => setActiveTab('new')}
          >
            Create New Ticket
          </Tab>
          <Tab 
            active={activeTab === 'view'} 
            onClick={() => setActiveTab('view')}
          >
            Your Tickets
          </Tab>
        </SupportTabs>
        
        <SupportBody>
          {activeTab === 'new' && (
            <NewTicketForm onSuccess={handleTicketCreated} />
          )}
          
          {activeTab === 'view' && (
            <UserTickets 
              onTicketUpdate={loadUserTickets}
              initialTicketId={ticketIdFromUrl || undefined}
            />
          )}
        </SupportBody>
      </SupportContent>
    </Container>
  );
} 