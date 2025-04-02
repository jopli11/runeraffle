import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getCompletedCompetitions, Competition } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../ui/Loader';
import { StyledContainer } from '../ui/StyledContainer';
import { PageHeader } from '../ui/PageHeader';
import { keyframes } from '@emotion/react';

// Animation keyframes
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const WinnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WinnerCard = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeUp} 0.5s ease-out forwards;
  opacity: 0;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const WinnerCardHeader = styled.div`
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  padding: 1.5rem;
  position: relative;
`;

const WinnerUsername = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
`;

const WinnerDate = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const PrizeLabel = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(245, 158, 11, 0.2);
  color: rgb(245, 158, 11);
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

const WinnerCardBody = styled.div`
  padding: 1.5rem;
`;

const CompetitionTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: white;
`;

const CompetitionDescription = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
`;

const PrizeDetails = styled.div`
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: rgba(245, 158, 11, 0.05);
  border-radius: 0.5rem;
  border: 1px dashed rgba(245, 158, 11, 0.2);
`;

const PrizeTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const PrizeValue = styled.div`
  font-weight: bold;
  color: rgb(245, 158, 11);
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
`;

const VerificationContainer = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const VerificationHeading = styled.div`
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VerificationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const VerificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

const VerificationLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const VerificationValue = styled.span`
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const VerificationLink = styled.a`
  color: hsl(var(--primary));
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    text-decoration: underline;
    color: hsl(var(--primary) / 0.8);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Icon components
const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM7.1 11.5L3.6 8.1L4.8 6.9L7.1 9.2L11.1 5.4L12.3 6.6L7.1 11.5Z" fill="#10B981"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 3.5V1H1V11H11V3.5H8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 7.5L11 5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const formatDate = (timestamp: any) => {
  if (!timestamp || !timestamp.toDate) return 'Unknown date';
  
  const date = timestamp.toDate();
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  } as Intl.DateTimeFormatOptions;
  
  return new Date(date).toLocaleDateString(undefined, options);
};

export default function WinnersPage() {
  const [winners, setWinners] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true);
        const completedCompetitions = await getCompletedCompetitions();
        setWinners(completedCompetitions);
      } catch (err) {
        console.error('Error fetching winners:', err);
        setError('Failed to load winners. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  const handleViewCompetition = (id: string) => {
    navigate(`/competition/${id}`);
  };
  
  const handleVerifyDraw = (id: string) => {
    navigate(`/verification/${id}`);
  };

  if (loading) {
    return (
      <Container>
        <PageHeader 
          title="Recent Winners" 
          description="Loading winner information..." 
          centered
        />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <Loader size={80} />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <PageHeader 
          title="Recent Winners" 
          centered
        />
        <StyledContainer withGlow>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'hsl(var(--destructive))', marginBottom: '1.5rem' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </StyledContainer>
      </Container>
    );
  }

  if (winners.length === 0) {
    return (
      <Container>
        <PageHeader 
          title="Recent Winners" 
          description="No completed competitions yet. Check back soon!"
          centered
        />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader 
        title="Recent Winners" 
        description="Congratulations to all our past competition winners! Browse through the list of winners and see what prizes they've taken home."
        centered
      />
      
      <StyledContainer withGlow>
        <WinnersGrid>
          {winners.map((competition, index) => (
            <WinnerCard 
              key={competition.id} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <WinnerCardHeader>
                <WinnerUsername>{competition.winner?.username || 'Anonymous Winner'}</WinnerUsername>
                <WinnerDate>{formatDate(competition.completedAt)}</WinnerDate>
                <PrizeLabel>Winner</PrizeLabel>
              </WinnerCardHeader>
              
              <WinnerCardBody>
                <CompetitionTitle>{competition.title}</CompetitionTitle>
                <CompetitionDescription>
                  {competition.description.length > 100 
                    ? competition.description.substring(0, 100) + '...' 
                    : competition.description}
                </CompetitionDescription>
                
                <PrizeDetails>
                  <PrizeTitle>Prize Won:</PrizeTitle>
                  <PrizeValue>{competition.prize}</PrizeValue>
                  <div>Valued at: {competition.prizeValue}</div>
                </PrizeDetails>
                
                <VerificationContainer>
                  <VerificationHeading>
                    <VerifiedIcon /> Verified Fair Draw
                  </VerificationHeading>
                  
                  <VerificationDetails>
                    <VerificationItem>
                      <VerificationLabel>Draw Seed:</VerificationLabel>
                      <VerificationValue>{competition.seed || 'N/A'}</VerificationValue>
                    </VerificationItem>
                    
                    <VerificationItem>
                      <VerificationLabel>Total Tickets:</VerificationLabel>
                      <VerificationValue>{competition.ticketsSold}</VerificationValue>
                    </VerificationItem>
                    
                    <VerificationItem>
                      <VerificationLabel>Winning Ticket:</VerificationLabel>
                      <VerificationValue>{competition.winningTicket || 'N/A'}</VerificationValue>
                    </VerificationItem>
                  </VerificationDetails>
                  
                  <VerificationLink onClick={() => handleVerifyDraw(competition.id!)}>
                    Verify Draw Results <ExternalLinkIcon />
                  </VerificationLink>
                </VerificationContainer>
                
                <SecondaryButton onClick={() => handleViewCompetition(competition.id!)}>
                  View Competition Details
                </SecondaryButton>
              </WinnerCardBody>
            </WinnerCard>
          ))}
        </WinnersGrid>
      </StyledContainer>
    </Container>
  );
} 