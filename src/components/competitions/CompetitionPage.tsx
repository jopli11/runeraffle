import React, { useState } from 'react';
import styled from '@emotion/styled';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const CompetitionLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const Sidebar = styled.div`
  @media (max-width: 1024px) {
    grid-row: 1;
    margin-bottom: 2rem;
  }
`;

const Card = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CompetitionHeader = styled.div`
  margin-bottom: 2rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ variant: 'primary' | 'featured' | 'limited' | 'status' }>`
  background-color: ${props => {
    switch (props.variant) {
      case 'featured': return 'rgba(245, 158, 11, 0.2)';
      case 'limited': return 'rgba(239, 68, 68, 0.2)';
      case 'status': return 'rgba(22, 163, 74, 0.2)';
      default: return 'rgba(0, 136, 204, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'featured': return 'rgb(245, 158, 11)';
      case 'limited': return 'rgb(239, 68, 68)';
      case 'status': return 'rgb(22, 163, 74)';
      default: return 'rgb(0, 174, 239)';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
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
`;

const PrizeHeader = styled.div`
  margin-top: 3rem;
  margin-bottom: 1.5rem;
`;

const Heading2 = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
`;

const PrizeCard = styled.div`
  display: flex;
  background-color: hsl(var(--card));
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PrizeIconContainer = styled.div`
  width: 5rem;
  height: 5rem;
  flex-shrink: 0;
  background-color: rgba(245, 158, 11, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  color: rgb(245, 158, 11);
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const PrizeContent = styled.div`
  flex: 1;
`;

const PrizeName = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
`;

const PrizeValue = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
  color: rgb(245, 158, 11);
  margin-bottom: 1rem;
`;

const PrizeDescription = styled.p`
  opacity: 0.9;
  line-height: 1.6;
`;

const ProgressContainer = styled.div`
  margin: 1.5rem 0;
`;

const ProgressLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ProgressBarOuter = styled.div`
  height: 8px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressBarInner = styled.div<{ width: string }>`
  height: 100%;
  width: ${props => props.width};
  background-color: hsl(var(--primary));
  border-radius: 9999px;
  transition: width 0.3s ease;
`;

const ProgressDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const TicketInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
`;

const TicketIconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(0, 174, 239, 0.2);
  color: hsl(var(--primary));
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TicketDetails = styled.div`
  flex: 1;
`;

const TicketPrice = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
`;

const TicketDescription = styled.div`
  font-size: 0.875rem;
  opacity: 0.7;
`;

const TicketQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const QuantityButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.div`
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
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
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: white;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.span`
  font-weight: 600;
`;

const EndsInValue = styled(InfoValue)<{ ending?: boolean }>`
  color: ${props => props.ending ? 'rgb(245, 158, 11)' : 'white'};
`;

const FairDrawSection = styled.div`
  margin-top: 3rem;
`;

const CodeBlock = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0.375rem;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 1rem 0;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  border-bottom: 2px solid ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
  }
`;

// Define SVG icons as components
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.8333 10H4.16675M4.16675 10L10.0001 4.16667M4.16675 10L10.0001 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TicketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 14L15 8M9.5 8.5H9.51M14.5 13.5H14.51M19 21V15.5C19 15.5 19 15 18.5 15C18 15 17 14.5 17 13.5C17 12.5 18 12 18.5 12C19 12 19 11.5 19 11.5V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V11.5C5 11.5 5 12 5.5 12C6 12 7 12.5 7 13.5C7 14.5 6 15 5.5 15C5 15 5 15.5 5 15.5V21C5 22.1046 5.89543 23 7 23H17C18.1046 23 19 22.1046 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17C8.41015 17 5.5 14.0899 5.5 10.5V4.5H18.5V10.5C18.5 14.0899 15.5899 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 20.5H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17V20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 7.5H20.5C21.6046 7.5 22.5 6.60457 22.5 5.5C22.5 4.39543 21.6046 3.5 20.5 3.5H18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 7.5H3.5C2.39543 7.5 1.5 6.60457 1.5 5.5C1.5 4.39543 2.39543 3.5 3.5 3.5H5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 9.16667V6.66667C13.3333 4.36548 11.4678 2.5 9.16667 2.5C6.86548 2.5 5 4.36548 5 6.66667V9.16667M6.66667 17.5H11.6667C12.5871 17.5 13.3333 16.7538 13.3333 15.8333V10.8333C13.3333 9.91286 12.5871 9.16667 11.6667 9.16667H6.66667C5.74619 9.16667 5 9.91286 5 10.8333V15.8333C5 16.7538 5.74619 17.5 6.66667 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Sample competition data
const competition = {
  id: 1,
  title: 'Dragon Slayer Challenge',
  description: 'Enter this raffle for a chance to win the ultimate Dragon gear set and 100M OSRS Gold. The winner will be selected randomly when all tickets are sold.',
  status: 'active',
  difficulty: 'hard',
  prizeTitle: 'Dragon Gear Set + 100M OSRS Gold',
  prizeValue: '100M OSRS Gold',
  prizeDescription: 'The complete Dragon armor set including the full helmet, platebody, platelegs, boots, and shield. Additionally, the winner receives 100M OSRS Gold to spend however they like.',
  ticketPrice: 5,
  ticketsSold: 683,
  totalTickets: 1000,
  endsIn: '3 days',
  createdAt: '2023-07-15',
  hashProof: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  maxTicketsPerUser: 20,
  isLimitedEntry: true,
  featured: true
};

export default function CompetitionPage() {
  const [ticketCount, setTicketCount] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fairDraw'>('details');

  const incrementTickets = () => {
    if (ticketCount < competition.maxTicketsPerUser) {
      setTicketCount(prev => prev + 1);
    }
  };

  const decrementTickets = () => {
    setTicketCount(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleBackClick = () => {
    window.navigate('/competitions');
  };

  return (
    <Container>
      <BackButton onClick={handleBackClick}>
        <ArrowLeftIcon />
        Back to Raffles
      </BackButton>
      
      <CompetitionLayout>
        <MainContent>
          <CompetitionHeader>
            <BadgeContainer>
              {competition.featured && (
                <Badge variant="featured">
                  Featured
                </Badge>
              )}
              <Badge variant="primary">
                Ends in {competition.endsIn}
              </Badge>
              {competition.isLimitedEntry && (
                <Badge variant="limited">
                  Limited Entries
                </Badge>
              )}
              <Badge variant="status">
                Active
              </Badge>
            </BadgeContainer>
            <Heading1>{competition.title}</Heading1>
            <Description>{competition.description}</Description>
          </CompetitionHeader>
          
          <TabsContainer>
            <Tab 
              active={activeTab === 'details'} 
              onClick={() => setActiveTab('details')}
            >
              Details
            </Tab>
            <Tab 
              active={activeTab === 'fairDraw'} 
              onClick={() => setActiveTab('fairDraw')}
            >
              Provably Fair
            </Tab>
          </TabsContainer>
          
          {activeTab === 'details' && (
            <>
              <PrizeHeader>
                <Heading2>Prize Details</Heading2>
              </PrizeHeader>
              
              <PrizeCard>
                <PrizeIconContainer>
                  <TrophyIcon />
                </PrizeIconContainer>
                <PrizeContent>
                  <PrizeName>{competition.prizeTitle}</PrizeName>
                  <PrizeValue>{competition.prizeValue}</PrizeValue>
                  <PrizeDescription>{competition.prizeDescription}</PrizeDescription>
                </PrizeContent>
              </PrizeCard>
            </>
          )}
          
          {activeTab === 'fairDraw' && (
            <FairDrawSection>
              <Heading2>Provably Fair Drawing System</Heading2>
              <Description>
                Our raffle system uses a provably fair mechanism to ensure transparency and fairness in selecting winners. Here's how it works:
              </Description>
              
              <Card>
                <CardHeader>
                  <CardHeading>Step 1: Pre-Generated Seed</CardHeading>
                  <CardDescription>
                    Before the raffle begins, we generate a random seed and store its cryptographic hash. This hash is publicly visible throughout the raffle.
                  </CardDescription>
                </CardHeader>
                <CardBody>
                  <InfoLabel>Hash proof (SHA-256):</InfoLabel>
                  <CodeBlock>{competition.hashProof}</CodeBlock>
                </CardBody>
              </Card>
              
              <Card style={{ marginTop: '1.5rem' }}>
                <CardHeader>
                  <CardHeading>Step 2: Winner Selection</CardHeading>
                  <CardDescription>
                    Once all tickets are sold, we combine the original seed with additional public entropy (e.g., the most recent Bitcoin block hash) to determine the winning ticket.
                  </CardDescription>
                </CardHeader>
                <CardBody>
                  <InfoLabel>Current status:</InfoLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <LockIcon />
                    <span>Seed will be revealed when all tickets are sold</span>
                  </div>
                </CardBody>
              </Card>
              
              <Card style={{ marginTop: '1.5rem' }}>
                <CardHeader>
                  <CardHeading>Step 3: Verification</CardHeading>
                  <CardDescription>
                    After the draw, we publish the original seed. Anyone can verify that:
                    <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      <li>The hash of the seed matches the pre-published hash</li>
                      <li>The winner was correctly selected using the seed + entropy</li>
                    </ol>
                  </CardDescription>
                </CardHeader>
              </Card>
            </FairDrawSection>
          )}
        </MainContent>
        
        <Sidebar>
          <Card>
            <CardHeader>
              <CardHeading>Entry Details</CardHeading>
            </CardHeader>
            <CardBody>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue>Active</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Ends In</InfoLabel>
                  <EndsInValue ending={competition.endsIn.includes('hours')}>{competition.endsIn}</EndsInValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Created On</InfoLabel>
                  <InfoValue>{competition.createdAt}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Max Tickets Per User</InfoLabel>
                  <InfoValue>{competition.maxTicketsPerUser}</InfoValue>
                </InfoItem>
              </InfoGrid>
              
              <ProgressContainer>
                <ProgressLabel>Ticket Sales Progress</ProgressLabel>
                <ProgressBarOuter>
                  <ProgressBarInner width={`${(competition.ticketsSold / competition.totalTickets) * 100}%`} />
                </ProgressBarOuter>
                <ProgressDetails>
                  <span>{competition.ticketsSold}/{competition.totalTickets} tickets sold</span>
                  <span>{Math.round((competition.ticketsSold / competition.totalTickets) * 100)}% filled</span>
                </ProgressDetails>
              </ProgressContainer>
              
              <TicketInfo>
                <TicketIconWrapper>
                  <TicketIcon />
                </TicketIconWrapper>
                <TicketDetails>
                  <TicketPrice>1 Ticket = {competition.ticketPrice} Credits</TicketPrice>
                  <TicketDescription>Buy more tickets to increase your chances</TicketDescription>
                </TicketDetails>
                <TicketQuantity>
                  <QuantityButton onClick={decrementTickets} disabled={ticketCount <= 1}>-</QuantityButton>
                  <QuantityDisplay>{ticketCount}</QuantityDisplay>
                  <QuantityButton onClick={incrementTickets} disabled={ticketCount >= competition.maxTicketsPerUser}>+</QuantityButton>
                </TicketQuantity>
              </TicketInfo>
            </CardBody>
            <CardFooter>
              <PrimaryButton>
                Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} ({ticketCount * competition.ticketPrice} Credits)
              </PrimaryButton>
              <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem', opacity: 0.7 }}>
                You can buy up to {competition.maxTicketsPerUser} tickets
              </div>
            </CardFooter>
          </Card>
        </Sidebar>
      </CompetitionLayout>
    </Container>
  );
} 