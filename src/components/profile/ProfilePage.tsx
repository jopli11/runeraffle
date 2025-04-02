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

const TicketHistoryTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: hsl(var(--card));
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  
  &:first-of-type {
    border-top-left-radius: 0.5rem;
  }
  
  &:last-of-type {
    border-top-right-radius: 0.5rem;
  }
`;

const TableRow = styled.tr<{ isWinner?: boolean }>`
  background-color: ${props => props.isWinner ? 'rgba(22, 163, 74, 0.05)' : 'transparent'};
  
  &:hover {
    background-color: hsla(var(--muted), 0.05);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  font-size: 0.875rem;
`;

const CompetitionLink = styled.a`
  color: hsl(var(--primary));
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'ending' | 'ended' | 'winner' }>`
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => 
    props.status === 'active' ? 'rgba(59, 130, 246, 0.2)' : 
    props.status === 'ending' ? 'rgba(245, 158, 11, 0.2)' : 
    props.status === 'winner' ? 'rgba(22, 163, 74, 0.2)' : 
    'rgba(255, 255, 255, 0.1)'};
  color: ${props => 
    props.status === 'active' ? 'rgb(59, 130, 246)' : 
    props.status === 'ending' ? 'rgb(245, 158, 11)' : 
    props.status === 'winner' ? 'rgb(22, 163, 74)' : 
    'white'};
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
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
                <TicketHistoryTable>
                  <thead>
                    <tr>
                      <TableHeader>Ticket #</TableHeader>
                      <TableHeader>Competition</TableHeader>
                      <TableHeader>Purchase Date</TableHeader>
                      <TableHeader>Price</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketHistory.map(ticket => (
                      <TableRow key={ticket.id} isWinner={ticket.isWinner}>
                        <TableCell>{ticket.ticketNumber}</TableCell>
                        <TableCell>
                          <CompetitionLink onClick={() => navigate(`/competition/${ticket.competitionId}`)}>
                            {ticket.competition?.title || 'Unknown Competition'}
                          </CompetitionLink>
                        </TableCell>
                        <TableCell>{formatDate(ticket.purchasedAt)}</TableCell>
                        <TableCell>{ticket.competition?.ticketPrice || 0} credits</TableCell>
                        <TableCell>
                          <StatusBadge status={ticket.isWinner ? 'winner' : ticket.competition?.status === 'complete' ? 'ended' : 'active'}>
                            {ticket.isWinner ? '🏆 Winner' : 
                             ticket.competition?.status === 'complete' ? 'Ended' : 
                             ticket.competition?.status === 'ending' ? 'Ending Soon' : 'Active'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <ActionButton onClick={() => navigate(`/competition/${ticket.competitionId}`)}>
                            View
                          </ActionButton>
                          {ticket.isWinner && (
                            <ActionButton 
                              style={{ marginLeft: '0.5rem', backgroundColor: 'rgba(22, 163, 74, 0.2)', color: 'rgb(22, 163, 74)' }}
                              onClick={() => navigate(`/verification/${ticket.competitionId}`)}
                            >
                              Verify
                            </ActionButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </TicketHistoryTable>
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

// Helper function to format timestamp
const formatDate = (timestamp: any) => {
  if (!timestamp || !timestamp.toDate) return 'Unknown date';
  
  const date = timestamp.toDate();
  return new Date(date).toLocaleDateString();
}; 