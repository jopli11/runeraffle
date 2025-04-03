import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { getActiveCompetitions, buyTicket, Competition as FirestoreCompetition } from './services/firestore';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader } from './components/ui/Loader';
import { StyledContainer } from './components/ui/StyledContainer';
import { keyframes } from '@emotion/react';

// Add animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const HeroSection = styled.div`
  padding: 6rem 2rem;
  margin-bottom: 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, hsl(var(--background)), hsl(222, 47%, 15%));
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.05) 2px, transparent 0);
    background-size: 30px 30px;
    opacity: 0.4;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const HeroContainer = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const LogoHeading = styled.h1`
  font-size: 4.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1;
  letter-spacing: -0.03em;
  animation: ${float} 6s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const FirstWord = styled.span`
  color: white;
`;

const SecondWord = styled.span`
  color: hsl(var(--primary));
`;

const HeroDescription = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  color: hsl(var(--foreground) / 0.9);
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeIn 1s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: white;
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: ${shimmer} 3s infinite;
    background-size: 200% 100%;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const FeaturedCompetition = styled.div`
  border-radius: 1rem;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  background-color: hsl(var(--card));
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    cursor: pointer;
  }
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

const CompetitionImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
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

// Define a className for the step
const StepWrapper = styled.div<{ itemKey?: number }>`
  text-align: center;
  background-color: hsl(var(--card));
  border-radius: 1rem;
  padding: 2.5rem;
  transition: all 0.3s ease;
  animation: ${pulse} 10s ease-in-out infinite;
  animation-delay: ${props => (props.itemKey || 0) * 2}s;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid transparent;
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  background-image: 
    linear-gradient(to bottom, hsl(var(--card)), hsl(var(--card))), 
    linear-gradient(to bottom, hsla(var(--primary), 0.2), transparent);
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }
  
  &:hover .step-icon {
    transform: scale(1.1);
    background-color: rgba(0, 174, 239, 0.3);
  }
  
  &:hover .step-icon::after {
    opacity: 1;
  }
`;

const StepIconWrapper = styled.div<{ color: string }>`
  width: 5rem;
  height: 5rem;
  background-color: ${props => `rgba(${props.color}, 0.2)`};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 9999px;
    border: 2px solid ${props => `rgba(${props.color}, 0.3)`};
    opacity: 0;
    transition: all 0.3s ease;
  }
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

// Helper function to format timestamp
const formatTimeLeft = (endsAt: any) => {
  if (!endsAt) return 'N/A';
  
  try {
    const endDate = new Date(endsAt.seconds * 1000);
    const now = new Date();
    
    // If already ended
    if (endDate <= now) {
      return 'Ended';
    }
    
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours} hours`;
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minutes`;
  } catch (error) {
    console.error('Error formatting time', error);
    return 'N/A';
  }
};

// Add back the styled components that were accidentally removed but are still being used
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

export default function App() {
  const [ticketCount, setTicketCount] = useState(1);
  const [featuredCompetition, setFeaturedCompetition] = useState<FirestoreCompetition | null>(null);
  const [activeCompetitions, setActiveCompetitions] = useState<FirestoreCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const { currentUser, userCredits, setUserCredits } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const competitions = await getActiveCompetitions();
      
      if (competitions.length > 0) {
        // Find competition with most tickets sold to feature
        const sorted = [...competitions].sort((a, b) => b.ticketsSold - a.ticketsSold);
        setFeaturedCompetition(sorted[0]);
        setActiveCompetitions(competitions.slice(0, 4));
      } else {
        setFeaturedCompetition(null);
        setActiveCompetitions([]);
      }
    } catch (err) {
      console.error("Error fetching competitions:", err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const incrementTickets = () => {
    // Limit by user's credits and available tickets
    if (featuredCompetition) {
      const maxTickets = Math.min(
        Math.floor((userCredits || 0) / featuredCompetition.ticketPrice),
        featuredCompetition.totalTickets - featuredCompetition.ticketsSold
      );
      
      if (ticketCount < maxTickets) {
        setTicketCount(ticketCount + 1);
      }
    } else {
      setTicketCount(prev => prev + 1);
    }
  };

  const decrementTickets = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };
  
  const handleNavigateToCompetitions = () => {
    navigate('/competitions');
  };
  
  const handleNavigateToHowItWorks = () => {
    navigate('/how-it-works');
  };
  
  const handleNavigateToCompetition = (id: string) => {
    navigate(`/competition/${id}`);
  };
  
  const handleNavigateToViewAll = () => {
    navigate('/competitions');
  };
  
  const handleNavigateToLogin = () => {
    navigate('/login');
  };
  
  const handleNavigateToProfile = () => {
    navigate('/profile');
  };
  
  const handleBuyTickets = async () => {
    if (!currentUser || !featuredCompetition || !featuredCompetition.id) {
      if (!currentUser) {
        handleNavigateToLogin();
      }
      return;
    }
    
    const totalCost = ticketCount * featuredCompetition.ticketPrice;
    
    if (userCredits < totalCost) {
      alert('Not enough credits to purchase tickets.');
      return;
    }
    
    if (featuredCompetition.ticketsSold + ticketCount > featuredCompetition.totalTickets) {
      alert('Not enough tickets available.');
      return;
    }
    
    setPurchaseLoading(true);
    
    try {
      // Buy tickets one by one to get unique ticket numbers
      for (let i = 0; i < ticketCount; i++) {
        await buyTicket({
          competitionId: featuredCompetition.id,
          userId: currentUser.uid,
          ticketNumber: featuredCompetition.ticketsSold + i + 1
        });
      }
      
      // Update local competition state
      setFeaturedCompetition({
        ...featuredCompetition,
        ticketsSold: featuredCompetition.ticketsSold + ticketCount
      });
      
      // Update user credits
      setUserCredits(userCredits - totalCost);
      
      // Reset ticket count and show success message
      setTicketCount(1);
      setPurchaseSuccess(true);
      
      setTimeout(() => {
        setPurchaseSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      alert('Failed to purchase tickets. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <Container>
      <HeroSection>
        <HeroContainer>
          <LogoHeading>
            <FirstWord>Rune</FirstWord><SecondWord>Raffle</SecondWord>
          </LogoHeading>
          <HeroDescription>
            Enter exclusive RuneScape item giveaways with verified fair draw technology.
            Buy tickets, win rare items, and join a community of passionate players.
          </HeroDescription>
          <ButtonGroup>
            <PrimaryButton onClick={handleNavigateToCompetitions}>
              Browse Competitions <ArrowRightSvg />
            </PrimaryButton>
            <SecondaryButton onClick={handleNavigateToHowItWorks}>
              How It Works
            </SecondaryButton>
          </ButtonGroup>
        </HeroContainer>
      </HeroSection>

      <Section>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <Loader />
          </div>
        ) : error ? (
          <StyledContainer withGlow>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ color: 'hsl(var(--destructive))', marginBottom: '1rem' }}>{error}</p>
              <Button onClick={fetchCompetitions}>Try Again</Button>
            </div>
          </StyledContainer>
        ) : !featuredCompetition ? (
          <StyledContainer withGlow withPattern>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Heading2>No active competitions</Heading2>
              <Description>Check back soon for new competitions!</Description>
            </div>
          </StyledContainer>
        ) : (
          <StyledContainer withGlow withPattern>
            <FeaturedCompetition onClick={() => featuredCompetition.id && handleNavigateToCompetition(featuredCompetition.id)}>
              <CompetitionContent>
                <CompetitionDetails>
                  <BadgeContainer>
                    <Badge variant="featured">
                      Featured
                    </Badge>
                    <Badge variant="primary">
                      Ends in {formatTimeLeft(featuredCompetition.endsAt)}
                    </Badge>
                    {featuredCompetition.status === 'ending' && (
                      <Badge variant="limited">
                        Limited Time
                      </Badge>
                    )}
                  </BadgeContainer>
                  <Heading2>{featuredCompetition.title}</Heading2>
                  <Description>
                    {featuredCompetition.description}
                  </Description>
                  
                  {/* Ticket Progress */}
                  <ProgressContainer>
                    <PrizePoolLabel>Ticket Sales Progress</PrizePoolLabel>
                    <ProgressBarOuter>
                      <ProgressBarInner 
                        width={`${Math.min(Math.round((featuredCompetition.ticketsSold / featuredCompetition.totalTickets) * 100), 100)}%`} 
                      />
                    </ProgressBarOuter>
                    <ProgressDetails>
                      <span>{featuredCompetition.ticketsSold}/{featuredCompetition.totalTickets} tickets sold</span>
                      <span>{Math.min(Math.round((featuredCompetition.ticketsSold / featuredCompetition.totalTickets) * 100), 100)}% filled</span>
                    </ProgressDetails>
                  </ProgressContainer>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <PrizePoolLabel>Prize Pool:</PrizePoolLabel>
                    <PrizePoolValue>{featuredCompetition.prize}</PrizePoolValue>
                  </div>
                  
                  {/* Ticket Purchase UI */}
                  <TicketInfo>
                    <TicketIcon>
                      <TicketSvg />
                    </TicketIcon>
                    <TicketDetails>
                      <TicketPrice>1 Ticket = {featuredCompetition.ticketPrice} Credits</TicketPrice>
                      <TicketDescription>Buy more tickets to increase your chances</TicketDescription>
                    </TicketDetails>
                    <TicketQuantity>
                      <QuantityButton 
                        onClick={decrementTickets}
                        disabled={ticketCount <= 1}
                      >-</QuantityButton>
                      <QuantityDisplay>{ticketCount}</QuantityDisplay>
                      <QuantityButton 
                        onClick={incrementTickets}
                        disabled={ticketCount >= Math.min(
                          Math.floor((userCredits || 0) / featuredCompetition.ticketPrice),
                          featuredCompetition.totalTickets - featuredCompetition.ticketsSold
                        )}
                      >+</QuantityButton>
                    </TicketQuantity>
                  </TicketInfo>
                  
                  <PrimaryButton 
                    onClick={!currentUser ? handleNavigateToLogin : handleBuyTickets}
                    disabled={purchaseLoading || (!!currentUser && (userCredits || 0) < ticketCount * featuredCompetition.ticketPrice)}
                  >
                    {!currentUser 
                      ? 'Sign In to Buy Tickets' 
                      : purchaseLoading 
                        ? 'Processing...' 
                        : purchaseSuccess 
                          ? 'Purchase Complete!' 
                          : `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''} (${ticketCount * featuredCompetition.ticketPrice} Credits)`
                    }
                  </PrimaryButton>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <SecondaryButton onClick={(e) => {
                      e.stopPropagation();
                      featuredCompetition.id && handleNavigateToCompetition(featuredCompetition.id);
                    }}>
                      View Details
                    </SecondaryButton>
                  </div>
                  
                  {currentUser && userCredits < featuredCompetition.ticketPrice && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigateToProfile();
                        }}
                        style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}
                      >
                        Add more credits to your account
                      </a>
                    </div>
                  )}
                </CompetitionDetails>
              </CompetitionContent>
            </FeaturedCompetition>
          </StyledContainer>
        )}
      </Section>

      {/* Active Competitions */}
      <Section>
        <SectionHeader>
          <Heading2>Active Competitions</Heading2>
          <ViewAllButton onClick={handleNavigateToViewAll}>
            View All
            <ArrowRightSvg />
          </ViewAllButton>
        </SectionHeader>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading competitions...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
        ) : activeCompetitions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>No other active competitions found.</div>
        ) : (
          <CompetitionGrid>
            {activeCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} onClick={() => competition.id && handleNavigateToCompetition(competition.id)}>
                <CardImageContainer>
                  {competition.imageUrl ? (
                    <CompetitionImage src={competition.imageUrl} alt={competition.title} />
                  ) : (
                    <IconContainer>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" color="rgb(0, 174, 239)">
                        <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8.41l2.54 2.53a1 1 0 0 1-1.42 1.42L11.3 12.7A1 1 0 0 1 11 12V8a1 1 0 0 1 2 0v3.59z"/>
                      </svg>
                    </IconContainer>
                  )}
                </CardImageContainer>
                <CardContent>
                  <CardBadgeContainer>
                    <DifficultyBadge difficulty={competition.difficulty}>
                      {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
                    </DifficultyBadge>
                    <TimeBadge>
                      Ends in {formatTimeLeft(competition.endsAt)}
                    </TimeBadge>
                  </CardBadgeContainer>
                  <Heading3>{competition.title}</Heading3>
                  <CardDescription>
                    {competition.description}
                  </CardDescription>
                  
                  {/* Ticket Progress */}
                  <ProgressContainer>
                    <ProgressBarOuter>
                      <ProgressBarInner width={`${Math.min(Math.round((competition.ticketsSold / competition.totalTickets) * 100), 100)}%`} />
                    </ProgressBarOuter>
                    <ProgressDetails>
                      <span>{competition.ticketsSold}/{competition.totalTickets} tickets</span>
                      <span>{Math.min(Math.round((competition.ticketsSold / competition.totalTickets) * 100), 100)}%</span>
                    </ProgressDetails>
                  </ProgressContainer>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <CardPrizeLabel>Prize Pool:</CardPrizeLabel>
                    <CardPrizeValue>{competition.prize}</CardPrizeValue>
                  </div>
                  <EnterButton onClick={(e) => {
                    e.stopPropagation();
                    competition.id && handleNavigateToCompetition(competition.id);
                  }}>
                    Enter Raffle
                  </EnterButton>
                </CardContent>
              </CompetitionCard>
            ))}
          </CompetitionGrid>
        )}
      </Section>

      {/* How It Works */}
      <Section>
        <CenteredHeading>How Our Raffles Work</CenteredHeading>
        <StepsGrid>
          {[
            {
              step: 1,
              title: "Buy Tickets",
              description: "Purchase tickets using credits. The more tickets you buy, the higher your chances of winning."
            },
            {
              step: 2,
              title: "Wait for the Draw",
              description: "Once all tickets are sold, our provably fair system randomly selects a winning ticket."
            },
            {
              step: 3,
              title: "Collect Your Prize",
              description: "If you win, we'll contact you to arrange delivery of your in-game prize within 24 hours."
            }
          ].map((item, index) => (
            <StepWrapper key={index} itemKey={index}>
              <StepIconWrapper className="step-icon" color="0, 174, 239">
                <StepNumber color="0, 174, 239">{item.step}</StepNumber>
              </StepIconWrapper>
              <StepTitle>{item.title}</StepTitle>
              <StepDescription>
                {item.description}
              </StepDescription>
            </StepWrapper>
          ))}
        </StepsGrid>
        <ButtonGroup style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <SecondaryButton onClick={handleNavigateToHowItWorks}>
            Learn More About Our Fair Draw System
          </SecondaryButton>
        </ButtonGroup>
      </Section>
    </Container>
  );
} 