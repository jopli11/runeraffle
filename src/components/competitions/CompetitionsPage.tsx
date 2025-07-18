import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getActiveCompetitions, getCompletedCompetitions, Competition as FirestoreCompetition } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../ui/Loader';
import { StyledContainer } from '../ui/StyledContainer';
import { keyframes } from '@emotion/react';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
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

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  border: none;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'};
  
  &:hover {
    background-color: ${props => props.active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
  }
`;

const Separator = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
`;

const CompetitionListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ListHeading = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SortLabel = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
  }
`;

const CompetitionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const CompetitionCard = styled.div`
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: hsl(var(--card));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease-out forwards;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.1);
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
  color: rgb(0, 174, 239);
`;

const CardBadges = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
`;

const StatusBadge = styled.div<{ status: 'active' | 'ending' | 'complete' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return 'rgba(20, 83, 45, 0.8)';
      case 'ending': return 'rgba(146, 64, 14, 0.8)';
      case 'complete': return 'rgba(55, 65, 81, 0.8)';
      default: return 'rgba(20, 83, 45, 0.8)';
    }
  }};
  color: white;
  text-transform: uppercase;
`;

const DifficultyBadge = styled.div<{ difficulty: 'easy' | 'medium' | 'hard' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return 'rgba(20, 83, 45, 0.8)';
      case 'medium': return 'rgba(146, 64, 14, 0.8)';
      case 'hard': return 'rgba(76, 5, 25, 0.8)';
      default: return 'rgba(20, 83, 45, 0.8)';
    }
  }};
  color: white;
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const PrizeValue = styled.div`
  margin-top: -1.5rem;
  margin-bottom: 1rem;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: rgb(245, 158, 11);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  display: inline-block;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const ProgressContainer = styled.div`
  margin: 1rem 0;
`;

const ProgressBarOuter = styled.div`
  height: 6px;
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
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PriceLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Price = styled.span`
  font-weight: 600;
`;

const TimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const TimeLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Time = styled.span`
  font-weight: 600;
  color: ${props => props.color || 'white'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
`;

const EmptyStateIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  color: rgba(255, 255, 255, 0.5);
`;

const EmptyStateHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  opacity: 0.7;
  max-width: 24rem;
  margin: 0 auto;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  border: none;
  background-color: ${props => props.active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Define SVG icons as components
const TimerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Format a Firestore timestamp for display
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

// Types
type CompetitionStatus = 'active' | 'ending' | 'complete';
type CompetitionDifficulty = 'easy' | 'medium' | 'hard';

interface Competition {
  id: number;
  title: string;
  description: string;
  prize: string;
  prizeValue: string;
  status: CompetitionStatus;
  difficulty: CompetitionDifficulty;
  ticketPrice: number;
  ticketsSold: number;
  totalTickets: number;
  endsIn: string;
  completedAt?: string;
  winner?: string;
  seed?: string;
  imageUrl?: string;
}

export default function CompetitionsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'ending' | 'completed'>('all');
  const [competitions, setCompetitions] = useState<FirestoreCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, [filter]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let comps: FirestoreCompetition[] = [];
      
      if (filter === 'completed') {
        comps = await getCompletedCompetitions();
      } else {
        comps = await getActiveCompetitions();
        
        // Filter by status if needed
        if (filter === 'active') {
          comps = comps.filter(comp => comp.status === 'active');
        } else if (filter === 'ending') {
          comps = comps.filter(comp => comp.status === 'ending');
        }
      }
      
      // Apply sorting
      const sortedComps = sortCompetitions(comps, sortBy);
      setCompetitions(sortedComps);
      
    } catch (err) {
      console.error('Error fetching competitions:', err);
      setError('Failed to load competitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to sort competitions based on selected sort option
  const sortCompetitions = (comps: FirestoreCompetition[], sort: string) => {
    switch (sort) {
      case 'popularity':
        return [...comps].sort((a, b) => (b.ticketsSold / b.totalTickets) - (a.ticketsSold / a.totalTickets));
      case 'newest':
        return [...comps].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      case 'ending-soon':
        return [...comps].sort((a, b) => {
          const aEndsAt = a.endsAt ? new Date(a.endsAt.seconds * 1000) : new Date(0);
          const bEndsAt = b.endsAt ? new Date(b.endsAt.seconds * 1000) : new Date(0);
          return aEndsAt.getTime() - bEndsAt.getTime();
        });
      case 'price-low':
        return [...comps].sort((a, b) => a.ticketPrice - b.ticketPrice);
      case 'price-high':
        return [...comps].sort((a, b) => b.ticketPrice - a.ticketPrice);
      default:
        return comps;
    }
  };

  const handleCompetitionClick = (id: string) => {
    navigate(`/competition/${id}`);
  };
  
  return (
    <Container>
      <PageHeader>
        <Heading1>Raffles</Heading1>
        <Description>
          Skip the Grind. Gear Up. Enjoy the Game. Enter our raffles for a chance to win 
          valuable items with our provably fair drawing system.
        </Description>
      </PageHeader>
      
      <StyledContainer withGlow>
        <FiltersContainer>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All Raffles
          </FilterButton>
          <FilterButton 
            active={filter === 'active'} 
            onClick={() => setFilter('active')}
          >
            Active
          </FilterButton>
          <FilterButton 
            active={filter === 'ending'} 
            onClick={() => setFilter('ending')}
          >
            Ending Soon
          </FilterButton>
          <FilterButton 
            active={filter === 'completed'} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </FilterButton>
        </FiltersContainer>
        
        <CompetitionListHeader>
          <ListHeading>
            {filter === 'all' ? 'All Raffles' : 
             filter === 'active' ? 'Active Raffles' : 
             filter === 'ending' ? 'Ending Soon' : 'Completed Raffles'}
          </ListHeading>
          
          <SortContainer>
            <SortLabel>Sort by:</SortLabel>
            <Select 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCompetitions(sortCompetitions(competitions, e.target.value));
              }}
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="ending-soon">Ending Soon</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </Select>
          </SortContainer>
        </CompetitionListHeader>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <Loader />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'hsl(var(--destructive))', marginBottom: '1rem' }}>{error}</p>
            <button 
              onClick={fetchCompetitions} 
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : competitions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            No competitions found for the selected filter.
          </div>
        ) : (
          <CompetitionGrid>
            {competitions.map((competition, index) => (
              <CompetitionCard 
                key={competition.id} 
                onClick={() => handleCompetitionClick(competition.id!)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardImageContainer>
                  {competition.imageUrl ? (
                    <CompetitionImage src={competition.imageUrl} alt={competition.title} />
                  ) : (
                    <IconContainer>
                      <TimerIcon />
                    </IconContainer>
                  )}
                  <CardBadges>
                    <StatusBadge status={competition.status as 'active' | 'ending' | 'complete'}>
                      {competition.status}
                    </StatusBadge>
                    <DifficultyBadge difficulty={competition.difficulty}>
                      {competition.difficulty}
                    </DifficultyBadge>
                  </CardBadges>
                </CardImageContainer>
                
                <CardContent>
                  <PrizeValue>{competition.prizeValue}</PrizeValue>
                  <CardTitle>{competition.title}</CardTitle>
                  <CardDescription>{competition.description}</CardDescription>
                  
                  <ProgressContainer>
                    <ProgressBarOuter>
                      <ProgressBarInner width={`${(competition.ticketsSold / competition.totalTickets) * 100}%`} />
                    </ProgressBarOuter>
                    <ProgressDetails>
                      <span>{competition.ticketsSold} / {competition.totalTickets} tickets sold</span>
                      <span>{Math.round((competition.ticketsSold / competition.totalTickets) * 100)}%</span>
                    </ProgressDetails>
                  </ProgressContainer>
                  
                  <CardFooter>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                        {competition.ticketPrice} credits
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        per ticket
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: '#eab516' }}>
                          <TimerIcon />
                        </div>
                        <div style={{ fontWeight: 'bold' }}>
                          {competition.status === 'complete' 
                            ? 'Completed' 
                            : formatTimeLeft(competition.endsAt)
                          }
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'right' }}>
                        {competition.status === 'complete' ? 'Winner drawn' : 'remaining'}
                      </div>
                    </div>
                  </CardFooter>
                </CardContent>
              </CompetitionCard>
            ))}
          </CompetitionGrid>
        )}
      </StyledContainer>
    </Container>
  );
} 