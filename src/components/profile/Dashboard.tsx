import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { getUserTickets } from '../../services/firestore';
import { getCompetition } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';

// Styled components
const DashboardContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DashboardCard = styled.div`
  background: hsl(var(--card));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const CardLink = styled.a`
  font-size: 0.875rem;
  color: hsl(var(--primary));
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const Stat = styled.div`
  text-align: center;
  padding: 1rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: hsl(var(--primary));
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TicketItem = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
  
  &:hover {
    background-color: hsla(var(--muted), 0.05);
  }
`;

const CompetitionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem;
`;

const TicketMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const CreditData = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const CreditBalance = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: hsl(var(--primary));
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 1.5rem 1rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
`;

const AddCreditsButton = styled.button`
  background-color: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

export function Dashboard() {
  const { currentUser, userCredits, setUserCredits } = useAuth();
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    winCount: 0,
    ticketsBought: 0,
    spentCredits: 0
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);
  
  const loadUserData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Get user tickets
      const userTickets = await getUserTickets(currentUser.uid);
      
      // Calculate stats
      const winCount = userTickets.filter(ticket => ticket.isWinner).length;
      const ticketsBought = userTickets.length;
      
      // For each ticket, get the competition details
      const ticketsWithCompetitions = await Promise.all(
        userTickets.map(async (ticket) => {
          const competition = await getCompetition(ticket.competitionId);
          return {
            ...ticket,
            competition
          };
        })
      );
      
      // Calculate spent credits based on ticket price
      const spentCredits = ticketsWithCompetitions.reduce((total, ticket) => {
        return total + (ticket.competition?.ticketPrice || 0);
      }, 0);
      
      // Sort by purchase date, most recent first
      const sortedTickets = ticketsWithCompetitions.sort((a, b) => {
        const dateA = a.purchasedAt?.toDate ? a.purchasedAt.toDate() : new Date(0);
        const dateB = b.purchasedAt?.toDate ? b.purchasedAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Take only the most recent 3 tickets
      const recent = sortedTickets.slice(0, 3);
      
      setRecentTickets(recent);
      setStats({
        totalCompetitions: userTickets.length,
        winCount,
        ticketsBought,
        spentCredits
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'Unknown date';
    
    const date = timestamp.toDate();
    return new Date(date).toLocaleDateString();
  };
  
  // Handle adding credits (simulated)
  const handleAddCredits = () => {
    if (!currentUser?.email) return;
    
    // In a real app, this would open a payment modal
    // For demo purposes, we'll just add 100 credits
    const newCredits = userCredits + 100;
    
    // This would be handled by a cloud function in a real app
    // to prevent client-side manipulation
    import('../../services/firestore').then(({ updateUser }) => {
      updateUser(currentUser.email, {
        credits: newCredits
      }).then(() => {
        setUserCredits(newCredits);
      }).catch(error => {
        console.error('Error adding credits:', error);
      });
    });
  };
  
  if (isLoading) {
    return <LoadingMessage>Loading your dashboard...</LoadingMessage>;
  }
  
  return (
    <DashboardContainer>
      <DashboardCard>
        <CardHeader>
          <CardTitle>Recent Competitions</CardTitle>
          <CardLink href="#" onClick={(e) => { e.preventDefault(); navigate('/competitions'); }}>View all</CardLink>
        </CardHeader>
        <CardContent>
          {recentTickets.length > 0 ? (
            <TicketList>
              {recentTickets.map((ticket) => (
                <TicketItem key={ticket.id}>
                  <CompetitionTitle>
                    {ticket.competition?.title || 'Unknown Competition'}
                  </CompetitionTitle>
                  <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                    Ticket #{ticket.ticketNumber}
                  </div>
                  <TicketMeta>
                    <div>{formatDate(ticket.purchasedAt)}</div>
                    <div style={{ 
                      color: ticket.isWinner ? 'rgb(22, 163, 74)' : 'inherit',
                      fontWeight: ticket.isWinner ? 500 : 400
                    }}>
                      {ticket.isWinner ? '🏆 Winner' : 'Entered'}
                    </div>
                  </TicketMeta>
                </TicketItem>
              ))}
            </TicketList>
          ) : (
            <EmptyState>
              You haven't entered any competitions yet.
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => navigate('/competitions')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Browse Competitions
                </button>
              </div>
            </EmptyState>
          )}
        </CardContent>
      </DashboardCard>
      
      <DashboardCard>
        <CardHeader>
          <CardTitle>Available Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <CreditData>
            <CreditBalance>{userCredits}</CreditBalance>
            <AddCreditsButton onClick={handleAddCredits}>
              Add Credits
            </AddCreditsButton>
          </CreditData>
          
          <div style={{ 
            fontSize: '0.875rem', 
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '1.5rem'
          }}>
            Credits are used to enter competitions. Each competition has a different credit cost.
          </div>
          
          <StatGrid>
            <Stat>
              <StatValue>{stats.totalCompetitions}</StatValue>
              <StatLabel>Total Competitions</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{stats.winCount}</StatValue>
              <StatLabel>Competitions Won</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{stats.ticketsBought}</StatValue>
              <StatLabel>Tickets Purchased</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{stats.spentCredits}</StatValue>
              <StatLabel>Credits Spent</StatLabel>
            </Stat>
          </StatGrid>
        </CardContent>
      </DashboardCard>
    </DashboardContainer>
  );
} 