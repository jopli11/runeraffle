import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getCompletedCompetitions, Competition } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Heading1 = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const WinnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const WinnerCard = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const WinnerCardHeader = styled.div`
  background-color: rgba(245, 158, 11, 0.1);
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
  opacity: 0.9;
  line-height: 1.6;
`;

const PrizeDetails = styled.div`
  margin-bottom: 1.5rem;
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
`;

const VerificationLink = styled.a`
  color: hsl(var(--primary));
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  
  &:hover {
    text-decoration: underline;
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
  }
`;

const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
`;

// Icon components
const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="rgb(22, 163, 74)"/>
    <path d="M6.7 9.6L5.3 8.2L4.6 8.9L6.7 11L11.4 6.3L10.7 5.6L6.7 9.6Z" fill="rgb(22, 163, 74)"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 6.5V9.5C9.5 9.76522 9.39464 10.0196 9.20711 10.2071C9.01957 10.3946 8.76522 10.5 8.5 10.5H2.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5V3.5C1.5 3.23478 1.60536 2.98043 1.79289 2.79289C1.98043 2.60536 2.23478 2.5 2.5 2.5H5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 1.5H10.5V4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 7L10.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Helper function to format timestamp
const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date', error);
    return 'N/A';
  }
};

export default function WinnersPage() {
  const [winners, setWinners] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWinners = async () => {
      try {
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

  if (loading) {
    return (
      <Container>
        <PageHeader>
          <Heading1>Recent Winners</Heading1>
          <Description>
            Loading winner information...
          </Description>
        </PageHeader>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <PageHeader>
          <Heading1>Recent Winners</Heading1>
          <Description style={{ color: 'red' }}>
            {error}
          </Description>
        </PageHeader>
      </Container>
    );
  }

  if (winners.length === 0) {
    return (
      <Container>
        <PageHeader>
          <Heading1>Recent Winners</Heading1>
          <Description>
            No completed competitions yet. Check back soon!
          </Description>
        </PageHeader>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <Heading1>Recent Winners</Heading1>
        <Description>
          Check out the most recent winners from our provably fair raffles. All drawings are transparent and verifiable through our blockchain-based verification system.
        </Description>
      </PageHeader>

      <WinnersGrid>
        {winners.map(competition => (
          <WinnerCard key={competition.id}>
            <WinnerCardHeader>
              <WinnerUsername>
                {competition.winner?.username || competition.winner?.email || 'Anonymous'}
              </WinnerUsername>
              <WinnerDate>Won on {formatDate(competition.completedAt)}</WinnerDate>
              <PrizeLabel>{competition.prizeValue}</PrizeLabel>
            </WinnerCardHeader>

            <WinnerCardBody>
              <CompetitionTitle>{competition.title}</CompetitionTitle>
              <CompetitionDescription>{competition.description}</CompetitionDescription>

              <PrizeDetails>
                <PrizeTitle>Prize Won:</PrizeTitle>
                <PrizeValue>{competition.prize}</PrizeValue>
              </PrizeDetails>

              <VerificationContainer>
                <VerificationHeading>
                  <VerifiedIcon /> Verified Fair Draw
                </VerificationHeading>
                <VerificationDetails>
                  {competition.seed && (
                    <VerificationItem>
                      <VerificationLabel>Seed:</VerificationLabel>
                      <VerificationValue>{competition.seed.substring(0, 10)}...</VerificationValue>
                    </VerificationItem>
                  )}
                  {competition.blockHash && (
                    <VerificationItem>
                      <VerificationLabel>Block Hash:</VerificationLabel>
                      <VerificationValue>{competition.blockHash.substring(0, 10)}...</VerificationValue>
                    </VerificationItem>
                  )}
                  {competition.winningTicket && (
                    <VerificationItem>
                      <VerificationLabel>Winning Ticket:</VerificationLabel>
                      <VerificationValue>#{competition.winningTicket} of {competition.totalTickets}</VerificationValue>
                    </VerificationItem>
                  )}
                </VerificationDetails>
                <VerificationLink href="#" onClick={(e) => {
                  e.preventDefault();
                  alert('Verification details: ' + JSON.stringify({
                    seed: competition.seed,
                    blockHash: competition.blockHash,
                    winningTicket: competition.winningTicket
                  }, null, 2));
                }}>
                  View full verification details <ExternalLinkIcon />
                </VerificationLink>
              </VerificationContainer>

              <SecondaryButton onClick={() => competition.id && handleViewCompetition(competition.id)}>
                View Competition Details
              </SecondaryButton>
            </WinnerCardBody>
          </WinnerCard>
        ))}
      </WinnersGrid>
    </Container>
  );
} 