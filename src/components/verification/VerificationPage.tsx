import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { verifyDraw, determineWinningTicket } from '../../utils/drawingSystem';
import { getCompetition } from '../../services/firestore';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: hsl(var(--muted-foreground));
  font-size: 1.125rem;
`;

const Card = styled.div`
  background: hsl(var(--card));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  color: hsl(var(--muted-foreground));
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
`;

const InfoLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  flex: 0 0 200px;
  
  @media (min-width: 640px) {
    margin-bottom: 0;
  }
`;

const InfoValue = styled.div`
  flex: 1;
  word-break: break-all;
  font-family: monospace;
  background: hsl(var(--muted) / 0.1);
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const VerificationStatus = styled.div<{ status: 'success' | 'error' | 'loading' }>`
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-top: 1.5rem;
  background-color: ${props => 
    props.status === 'success' ? 'rgba(22, 163, 74, 0.1)' : 
    props.status === 'error' ? 'rgba(220, 38, 38, 0.1)' : 
    'rgba(37, 99, 235, 0.1)'
  };
  color: ${props => 
    props.status === 'success' ? 'rgb(22, 163, 74)' : 
    props.status === 'error' ? 'rgb(220, 38, 38)' : 
    'rgb(37, 99, 235)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66666 10 1.66666C5.39765 1.66666 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 10L9.16667 11.6667L12.5 8.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66666 10 1.66666C5.39765 1.66666 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 7.5L7.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 7.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoadingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
    <path d="M10 1.66666V4.99999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 15V18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.10834 4.10834L6.46667 6.46667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5333 13.5333L15.8917 15.8917" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.66669 10H5.00002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 10H18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.10834 15.8917L6.46667 13.5333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5333 6.46667L15.8917 4.10834" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: hsl(var(--primary));
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StatCard = styled.div`
  background: hsla(var(--muted), 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: hsl(var(--primary));
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const VerificationStep = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: hsla(var(--muted), 0.05);
  border-radius: 0.5rem;
  border-left: 4px solid hsl(var(--primary));
`;

const StepTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const CodeBlock = styled.pre`
  background: hsla(var(--muted), 0.1);
  padding: 1rem;
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  margin-top: 1rem;
`;

type VerificationStatus = 'loading' | 'success' | 'error' | 'pending';

export default function VerificationPage() {
  const { id } = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [verificationDetails, setVerificationDetails] = useState<{
    expected: number;
    calculated: number;
  } | null>(null);
  
  useEffect(() => {
    const loadCompetition = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const competitionData = await getCompetition(id);
        setCompetition(competitionData);
        
        // Only verify if the competition is complete and has verification data
        if (competitionData && 
            competitionData.status === 'complete' &&
            competitionData.seed && 
            competitionData.blockHash && 
            competitionData.winningTicket !== undefined) {
          setVerificationStatus('loading');
          
          // Calculate the winning ticket
          const calculatedWinningTicket = await determineWinningTicket(
            competitionData.seed,
            competitionData.blockHash,
            competitionData.totalTickets
          );
          
          setVerificationDetails({
            expected: competitionData.winningTicket,
            calculated: calculatedWinningTicket
          });
          
          // Check if the calculation matches the claimed winning ticket
          const isVerified = calculatedWinningTicket === competitionData.winningTicket;
          setVerificationStatus(isVerified ? 'success' : 'error');
        }
      } catch (error) {
        console.error('Error loading competition:', error);
        setVerificationStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCompetition();
  }, [id]);
  
  if (loading) {
    return (
      <Container>
        <BackLink to="/winners">
          <BackIcon /> Back to Winners
        </BackLink>
        <Header>
          <Title>Verifying Competition...</Title>
          <Subtitle>Loading competition details</Subtitle>
        </Header>
      </Container>
    );
  }
  
  if (!competition) {
    return (
      <Container>
        <BackLink to="/winners">
          <BackIcon /> Back to Winners
        </BackLink>
        <Header>
          <Title>Competition Not Found</Title>
          <Subtitle>The competition you're looking for doesn't exist or has been removed.</Subtitle>
        </Header>
      </Container>
    );
  }
  
  const participationRate = competition.ticketsSold / competition.totalTickets * 100;
  const odds = competition.ticketsSold > 0 ? 1 / competition.ticketsSold * 100 : 0;
  
  return (
    <Container>
      <BackLink to="/winners">
        <BackIcon /> Back to Winners
      </BackLink>
      
      <Header>
        <Title>Draw Verification</Title>
        <Subtitle>Verify the fairness of our competition draw</Subtitle>
      </Header>
      
      <Card>
        <CardHeader>
          <CardTitle>{competition.title}</CardTitle>
          <CardDescription>
            {competition.status === 'complete' 
              ? 'This competition has ended and a winner has been selected.'
              : 'This competition is still active. Verification will be available after the draw.'}
          </CardDescription>
        </CardHeader>
        
        <InfoRow>
          <InfoLabel>Competition ID:</InfoLabel>
          <InfoValue>{competition.id}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Prize:</InfoLabel>
          <InfoValue>{competition.prize}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Status:</InfoLabel>
          <InfoValue>{competition.status}</InfoValue>
        </InfoRow>
        
        {competition.status === 'complete' && (
          <>
            <InfoRow>
              <InfoLabel>Winner:</InfoLabel>
              <InfoValue>
                {competition.winner?.username || 'Anonymous'} (Ticket #{competition.winningTicket})
              </InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Seed:</InfoLabel>
              <InfoValue>{competition.seed}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Block Hash:</InfoLabel>
              <InfoValue>{competition.blockHash}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Total Tickets:</InfoLabel>
              <InfoValue>{competition.totalTickets}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Tickets Sold:</InfoLabel>
              <InfoValue>{competition.ticketsSold}</InfoValue>
            </InfoRow>
            
            <StatsContainer>
              <StatCard>
                <StatValue>{participationRate.toFixed(2)}%</StatValue>
                <StatLabel>Participation Rate</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatValue>1 in {competition.ticketsSold}</StatValue>
                <StatLabel>Winning Odds</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatValue>{odds.toFixed(2)}%</StatValue>
                <StatLabel>Win Percentage</StatLabel>
              </StatCard>
            </StatsContainer>
            
            {verificationStatus !== 'pending' && (
              <VerificationStatus status={verificationStatus as 'success' | 'error' | 'loading'}>
                {verificationStatus === 'success' && (
                  <>
                    <SuccessIcon /> Verified: The draw was conducted fairly.
                  </>
                )}
                {verificationStatus === 'error' && (
                  <>
                    <ErrorIcon /> Verification Failed: The calculated result doesn't match.
                  </>
                )}
                {verificationStatus === 'loading' && (
                  <>
                    <LoadingIcon /> Verifying...
                  </>
                )}
              </VerificationStatus>
            )}
            
            {verificationDetails && (
              <div style={{ marginTop: '1.5rem' }}>
                <StepTitle>Verification Result:</StepTitle>
                <CodeBlock>
                  {`Expected Winning Ticket: #${verificationDetails.expected}
Calculated Winning Ticket: #${verificationDetails.calculated}
Result: ${verificationDetails.expected === verificationDetails.calculated ? 'VALID ✓' : 'INVALID ✗'}`}
                </CodeBlock>
              </div>
            )}
          </>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>How Verification Works</CardTitle>
          <CardDescription>
            Our provably fair draw system ensures complete transparency and fairness.
          </CardDescription>
        </CardHeader>
        
        <VerificationStep>
          <StepTitle>Step 1: Pre-committed Seed</StepTitle>
          <StepDescription>
            Before the competition ends, we generate and commit to a random seed. This seed is used as one source of randomness for the draw.
          </StepDescription>
        </VerificationStep>
        
        <VerificationStep>
          <StepTitle>Step 2: External Randomness</StepTitle>
          <StepDescription>
            We use a blockchain block hash as an external source of randomness that cannot be predicted or manipulated by us or any participant.
          </StepDescription>
        </VerificationStep>
        
        <VerificationStep>
          <StepTitle>Step 3: Combining Randomness</StepTitle>
          <StepDescription>
            We combine our seed with the blockchain hash to create a deterministic but unpredictable result. This combined value is hashed using SHA-256.
          </StepDescription>
          <CodeBlock>{`Combined Input: ${competition.seed}-${competition.blockHash}
SHA-256 Hash: [Calculated in your browser]`}</CodeBlock>
        </VerificationStep>
        
        <VerificationStep>
          <StepTitle>Step 4: Selecting the Winner</StepTitle>
          <StepDescription>
            The first 8 characters of the resulting hash are converted to a number. We take this number modulo the total number of tickets to get a value between 1 and the total number of tickets.
          </StepDescription>
          <CodeBlock>{`Winning Ticket = hash_number % ${competition.totalTickets} + 1`}</CodeBlock>
        </VerificationStep>
        
        <VerificationStep>
          <StepTitle>Step 5: Verification</StepTitle>
          <StepDescription>
            You can independently verify the result by running the same calculation using the provided seed and block hash. This page performs this verification automatically in your browser.
          </StepDescription>
        </VerificationStep>
      </Card>
    </Container>
  );
} 