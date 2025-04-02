import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { getUserTickets, getCompetition } from '../../services/firestore';
import { NewTicketForm } from '../support/NewTicketForm';
import { UserTickets } from '../support/UserTickets';
import { Dashboard } from './Dashboard';
import { useNavigate } from 'react-router-dom';

// Styled components
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  color: hsl(var(--foreground));
`;

const ProfileHeader = styled.div`
  margin-bottom: 2rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const Sidebar = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  
  @media (min-width: 1024px) {
    width: 16rem;
  }
`;

const SidebarNav = styled.nav`
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
`;

const NavItem = styled.a<{ active?: boolean | string }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-left: 2px solid ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  background-color: ${props => props.active ? 'hsla(var(--primary), 0.05)' : 'transparent'};
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => !props.active && 'hsla(var(--muted), 0.05)'};
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
  color: hsl(var(--muted-foreground));
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  border: 1px dashed hsl(var(--border));
  border-radius: 0.5rem;
  color: hsl(var(--muted-foreground));
`;

const SupportSection = styled.div`
  margin-bottom: 2rem;
`;

const SupportContainer = styled.div`
  padding: 0;
`;

const SupportIntro = styled.div`
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  padding: 1.5rem;
  border-radius: 0.75rem;
  color: white;
`;

const SupportCard = styled.div`
  margin-bottom: 2rem;
`;

const SupportCardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const SupportDivider = styled.div`
  height: 1px;
  background-color: hsl(var(--border));
  margin-bottom: 2rem;
  margin-top: 2rem;
`;

const AdminSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: hsl(var(--accent));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
`;

const AdminButton = styled.button`
  padding: 0.75rem 1rem;
  background: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

export function ProfilePage() {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'support'>('profile');
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  // Load user tickets
  useEffect(() => {
    if (currentUser) {
      loadUserTickets();
    }
  }, [currentUser]);
  
  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [isLoading, currentUser, navigate]);
  
  // Function to load user tickets
  const loadUserTickets = async () => {
    if (!currentUser) return;
    
    setIsLoadingTickets(true);
    try {
      const userTickets = await getUserTickets(currentUser.uid);
      
      // For each ticket, get the competition details
      const ticketsWithDetails = await Promise.all(
        userTickets.map(async (ticket) => {
          const competition = await getCompetition(ticket.competitionId);
          return {
            ...ticket,
            competition
          };
        })
      );
      
      setTicketHistory(ticketsWithDetails);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };
  
  // If still loading, show a loading message
  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading profile...</LoadingMessage>
      </Container>
    );
  }
  
  // If no user is logged in, show loading instead of immediate redirect
  if (!currentUser) {
    return (
      <Container>
        <LoadingMessage>Redirecting to login...</LoadingMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <ProfileHeader>
        <h1>My Account</h1>
      </ProfileHeader>
      
      <ContentWrapper>
        <Sidebar>
          <SidebarNav>
            <NavItem 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </NavItem>
            <NavItem 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')}
            >
              My Tickets
            </NavItem>
            <NavItem 
              active={activeTab === 'support'} 
              onClick={() => setActiveTab('support')}
            >
              Support
            </NavItem>
          </SidebarNav>
        </Sidebar>
        
        <MainContent>
          {activeTab === 'profile' && (
            <Section>
              <SectionTitle>Profile</SectionTitle>
              <Dashboard />
            </Section>
          )}
          
          {activeTab === 'orders' && (
            <Section>
              <SectionTitle>My Tickets</SectionTitle>
              
              {isLoadingTickets ? (
                <LoadingMessage>Loading your tickets...</LoadingMessage>
              ) : ticketHistory.length > 0 ? (
                <div>
                  {/* Ticket history would go here */}
                  <p>You have {ticketHistory.length} tickets.</p>
                </div>
              ) : (
                <EmptyState>
                  <p>You haven't entered any competitions yet.</p>
                  <button 
                    onClick={() => navigate('/competitions')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '1rem'
                    }}
                  >
                    Browse Competitions
                  </button>
                </EmptyState>
              )}
            </Section>
          )}
          
          {activeTab === 'support' && (
            <SupportSection>
              <SectionTitle>Support</SectionTitle>
              
              <SupportContainer>
                <SupportIntro>
                  If you need assistance with your purchases, prizes, or have questions about our service, please submit a ticket below. Our team will respond as soon as possible.
                </SupportIntro>
                
                <SupportCard>
                  <NewTicketForm />
                </SupportCard>
                
                <SupportDivider />
                
                <SupportCardTitle>Your Tickets</SupportCardTitle>
                <UserTickets />
              </SupportContainer>
            </SupportSection>
          )}
        </MainContent>
      </ContentWrapper>
      
      {isAdmin && (
        <AdminSection>
          <SectionTitle>Admin Tools</SectionTitle>
          <AdminButton onClick={() => navigate('/admin')}>
            Go to Admin Dashboard
          </AdminButton>
        </AdminSection>
      )}
    </Container>
  );
} 