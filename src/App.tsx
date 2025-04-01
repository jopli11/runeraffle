import styled from '@emotion/styled';
import { useState } from 'react';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const HeroContainer = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
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

const HeroDescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
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
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: white;
`;

const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
  color: white;
`;

const FeaturedCompetition = styled.div`
  border-radius: 0.75rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background-color: hsl(var(--card));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CompetitionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const CompetitionDetails = styled.div`
  flex: 2;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ variant: 'primary' | 'featured' | 'limited' }>`
  background-color: ${props => {
    switch (props.variant) {
      case 'featured': return 'rgba(245, 158, 11, 0.2)';
      case 'limited': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(0, 136, 204, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'featured': return 'rgb(245, 158, 11)';
      case 'limited': return 'rgb(239, 68, 68)';
      default: return 'rgb(0, 174, 239)';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Heading2 = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
`;

const Description = styled.p`
  margin-bottom: 1.5rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const PrizePoolLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
`;

const PrizePoolValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: rgb(245, 158, 11);
`;

const ProgressContainer = styled.div`
  margin: 1.5rem 0;
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

const TicketIcon = styled.div`
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
`;

const QuantityDisplay = styled.div`
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ViewAllButton = styled.button`
  color: hsl(var(--primary));
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CompetitionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CompetitionCard = styled.div`
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: hsl(var(--card));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const CardImageContainer = styled.div`
  height: 10rem;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const IconContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 3.5rem;
  height: 3.5rem;
  background-color: rgba(0, 174, 239, 0.2);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const CardBadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const DifficultyBadge = styled.span<{ difficulty: 'easy' | 'medium' | 'hard' }>`
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return 'rgba(22, 163, 74, 0.2)';
      case 'medium': return 'rgba(245, 158, 11, 0.2)';
      case 'hard': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(22, 163, 74, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.difficulty) {
      case 'easy': return 'rgb(22, 163, 74)';
      case 'medium': return 'rgb(245, 158, 11)';
      case 'hard': return 'rgb(239, 68, 68)';
      default: return 'rgb(22, 163, 74)';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TimeBadge = styled.span`
  background-color: rgba(0, 174, 239, 0.2);
  color: rgb(0, 174, 239);
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Heading3 = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const CardPrizeLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: rgba(255, 255, 255, 0.7);
`;

const CardPrizeValue = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
  color: rgb(245, 158, 11);
  margin-bottom: 1rem;
`;

const EnterButton = styled(PrimaryButton)`
  width: 100%;
  text-align: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
`;

const CenteredHeading = styled(Heading2)`
  text-align: center;
  margin-bottom: 3rem;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const StepContent = styled.div`
  text-align: center;
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  padding: 2rem;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StepIcon = styled.div<{ color: string }>`
  width: 4rem;
  height: 4rem;
  background-color: ${props => `rgba(${props.color}, 0.2)`};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
`;

const StepNumber = styled.span<{ color: string }>`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => `rgb(${props.color})`};
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
`;

const StepDescription = styled.p`
  opacity: 0.9;
  line-height: 1.6;
`;

// Define SVG icons as components
const TicketSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 14L15 8M9.5 8.5H9.51M14.5 13.5H14.51M19 21V15.5C19 15.5 19 15 18.5 15C18 15 17 14.5 17 13.5C17 12.5 18 12 18.5 12C19 12 19 11.5 19 11.5V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V11.5C5 11.5 5 12 5.5 12C6 12 7 12.5 7 13.5C7 14.5 6 15 5.5 15C5 15 5 15.5 5 15.5V21C5 22.1046 5.89543 23 7 23H17C18.1046 23 19 22.1046 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function App() {
  const [ticketCount, setTicketCount] = useState(1);

  const incrementTickets = () => {
    setTicketCount(prev => prev + 1);
  };

  const decrementTickets = () => {
    setTicketCount(prev => prev > 1 ? prev - 1 : 1);
  };
  
  const handleBrowseCompetitions = () => {
    window.navigate('/competitions');
  };
  
  const handleViewHowItWorks = () => {
    window.navigate('/how-it-works');
  };
  
  const handleViewCompetition = (id: number) => {
    window.navigate(`/competition/${id}`);
  };
  
  const handleViewAllCompetitions = () => {
    window.navigate('/competitions');
  };

  return (
    <Container>
      {/* Hero Section */}
      <Section>
        <HeroContainer>
          <Heading1>
            Win Epic RuneScape Prizes in Fair Raffles
          </Heading1>
          <HeroDescription>
            Enter our provably fair draws for a chance to win valuable RuneScape items and gold.
            Buy tickets, increase your odds, and win big!
          </HeroDescription>
          <ButtonGroup>
            <PrimaryButton onClick={handleBrowseCompetitions}>
              Browse Competitions
              <ArrowRightSvg />
            </PrimaryButton>
            <SecondaryButton onClick={handleViewHowItWorks}>
              How It Works
            </SecondaryButton>
          </ButtonGroup>
        </HeroContainer>
      </Section>

      {/* Featured Competition */}
      <Section>
        <FeaturedCompetition>
          <CompetitionContent>
            <CompetitionDetails>
              <BadgeContainer>
                <Badge variant="featured">
                  Featured
                </Badge>
                <Badge variant="primary">
                  Ends in 3 days
                </Badge>
                <Badge variant="limited">
                  Limited Entries
                </Badge>
              </BadgeContainer>
              <Heading2>Dragon Slayer Challenge</Heading2>
              <Description>
                Enter this raffle for a chance to win the ultimate Dragon gear set and 100M OSRS Gold.
                The winner will be selected randomly when all tickets are sold.
              </Description>
              
              {/* Ticket Progress */}
              <ProgressContainer>
                <PrizePoolLabel>Ticket Sales Progress</PrizePoolLabel>
                <ProgressBarOuter>
                  <ProgressBarInner width="68%" />
                </ProgressBarOuter>
                <ProgressDetails>
                  <span>683/1000 tickets sold</span>
                  <span>68% filled</span>
                </ProgressDetails>
              </ProgressContainer>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <PrizePoolLabel>Prize Pool:</PrizePoolLabel>
                <PrizePoolValue>100M OSRS Gold + Dragon Gear Set</PrizePoolValue>
              </div>
              
              {/* Ticket Purchase UI */}
              <TicketInfo>
                <TicketIcon>
                  <TicketSvg />
                </TicketIcon>
                <TicketDetails>
                  <TicketPrice>1 Ticket = 5 Credits</TicketPrice>
                  <TicketDescription>Buy more tickets to increase your chances</TicketDescription>
                </TicketDetails>
                <TicketQuantity>
                  <QuantityButton onClick={decrementTickets}>-</QuantityButton>
                  <QuantityDisplay>{ticketCount}</QuantityDisplay>
                  <QuantityButton onClick={incrementTickets}>+</QuantityButton>
                </TicketQuantity>
              </TicketInfo>
              
              <PrimaryButton onClick={() => handleViewCompetition(1)}>
                Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} ({ticketCount * 5} Credits)
              </PrimaryButton>
            </CompetitionDetails>
          </CompetitionContent>
        </FeaturedCompetition>
      </Section>

      {/* Active Competitions */}
      <Section>
        <SectionHeader>
          <Heading2>Active Competitions</Heading2>
          <ViewAllButton onClick={handleViewAllCompetitions}>
            View All
            <ArrowRightSvg />
          </ViewAllButton>
        </SectionHeader>
        <CompetitionGrid>
          {[
            { 
              id: 2, 
              title: 'Goblin Slayer Raffle', 
              description: 'Win 10M OSRS Gold in this easy entry raffle.',
              difficulty: 'easy' as const, 
              prize: '10M OSRS Gold',
              sold: 450,
              total: 500,
              daysLeft: 5
            },
            { 
              id: 3, 
              title: 'Barrows Gear Raffle', 
              description: 'Complete set of Barrows equipment up for grabs!', 
              difficulty: 'medium' as const, 
              prize: 'Full Barrows Set',
              sold: 320,
              total: 750,
              daysLeft: 7
            },
            { 
              id: 4, 
              title: 'Bandos Raffle', 
              description: 'Win the coveted Bandos armor set in this limited raffle.', 
              difficulty: 'hard' as const, 
              prize: 'Bandos Armor Set + 25M Gold',
              sold: 124,
              total: 300,
              daysLeft: 4
            }
          ].map((competition) => (
            <CompetitionCard key={competition.id} onClick={() => handleViewCompetition(competition.id)}>
              <CardImageContainer>
                <IconContainer>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" color="rgb(0, 174, 239)">
                    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8.41l2.54 2.53a1 1 0 0 1-1.42 1.42L11.3 12.7A1 1 0 0 1 11 12V8a1 1 0 0 1 2 0v3.59z"/>
                  </svg>
                </IconContainer>
              </CardImageContainer>
              <CardContent>
                <CardBadgeContainer>
                  <DifficultyBadge difficulty={competition.difficulty}>
                    {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
                  </DifficultyBadge>
                  <TimeBadge>
                    Ends in {competition.daysLeft} days
                  </TimeBadge>
                </CardBadgeContainer>
                <Heading3>{competition.title}</Heading3>
                <CardDescription>
                  {competition.description}
                </CardDescription>
                
                {/* Ticket Progress */}
                <ProgressContainer>
                  <ProgressBarOuter>
                    <ProgressBarInner width={`${(competition.sold / competition.total) * 100}%`} />
                  </ProgressBarOuter>
                  <ProgressDetails>
                    <span>{competition.sold}/{competition.total} tickets</span>
                    <span>{Math.round((competition.sold / competition.total) * 100)}%</span>
                  </ProgressDetails>
                </ProgressContainer>
                
                <div style={{ marginBottom: '1rem' }}>
                  <CardPrizeLabel>Prize Pool:</CardPrizeLabel>
                  <CardPrizeValue>{competition.prize}</CardPrizeValue>
                </div>
                <EnterButton onClick={(e) => {
                  e.stopPropagation();
                  handleViewCompetition(competition.id);
                }}>
                  Enter Raffle
                </EnterButton>
              </CardContent>
            </CompetitionCard>
          ))}
        </CompetitionGrid>
      </Section>

      {/* How It Works */}
      <Section>
        <CenteredHeading>How Our Raffles Work</CenteredHeading>
        <StepsGrid>
          <StepContent>
            <StepIcon color="0, 174, 239">
              <StepNumber color="0, 174, 239">1</StepNumber>
            </StepIcon>
            <StepTitle>Buy Tickets</StepTitle>
            <StepDescription>
              Purchase tickets using credits. The more tickets you buy, the higher your chances of winning.
            </StepDescription>
          </StepContent>
          <StepContent>
            <StepIcon color="0, 174, 239">
              <StepNumber color="0, 174, 239">2</StepNumber>
            </StepIcon>
            <StepTitle>Wait for the Draw</StepTitle>
            <StepDescription>
              Once all tickets are sold, our provably fair system randomly selects a winning ticket.
            </StepDescription>
          </StepContent>
          <StepContent>
            <StepIcon color="0, 174, 239">
              <StepNumber color="0, 174, 239">3</StepNumber>
            </StepIcon>
            <StepTitle>Collect Your Prize</StepTitle>
            <StepDescription>
              If you win, we'll contact you to arrange delivery of your in-game prize within 24 hours.
            </StepDescription>
          </StepContent>
        </StepsGrid>
        <ButtonGroup style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <SecondaryButton onClick={handleViewHowItWorks}>
            Learn More About Our Fair Draw System
          </SecondaryButton>
        </ButtonGroup>
      </Section>
    </Container>
  );
} 