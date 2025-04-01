import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getActiveCompetitions, getCompletedCompetitions, Competition as FirestoreCompetition } from '../../services/firestore';

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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  border: none;
  
  &:hover {
    background-color: ${props => props.active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.1)'};
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
      case 'active': return 'rgba(22, 163, 74, 0.8)';
      case 'ending': return 'rgba(245, 158, 11, 0.8)';
      case 'complete': return 'rgba(107, 114, 128, 0.8)';
      default: return 'rgba(22, 163, 74, 0.8)';
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
      case 'easy': return 'rgba(22, 163, 74, 0.8)';
      case 'medium': return 'rgba(245, 158, 11, 0.8)';
      case 'hard': return 'rgba(239, 68, 68, 0.8)';
      default: return 'rgba(22, 163, 74, 0.8)';
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
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'priceAsc' | 'priceDesc'>('newest');
  const [competitions, setCompetitions] = useState<FirestoreCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch competitions from Firestore
  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      try {
        let competitionsData: FirestoreCompetition[] = [];
        
        if (filter === 'completed') {
          competitionsData = await getCompletedCompetitions();
        } else {
          // For 'all', 'active', or 'ending' filters, start with all active competitions
          const activeCompetitions = await getActiveCompetitions();
          
          // Then filter as needed
          if (filter === 'active') {
            competitionsData = activeCompetitions.filter(comp => comp.status === 'active');
          } else if (filter === 'ending') {
            competitionsData = activeCompetitions.filter(comp => comp.status === 'ending');
          } else {
            // 'all' filter
            competitionsData = activeCompetitions;
          }
        }
        
        // Sort competitions
        competitionsData = sortCompetitions(competitionsData, sortBy);
        
        setCompetitions(competitionsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError('Failed to load competitions. Please try again later.');
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompetitions();
  }, [filter, sortBy]);
  
  // Function to sort competitions based on selected sort option
  const sortCompetitions = (comps: FirestoreCompetition[], sort: string) => {
    switch (sort) {
      case 'newest':
        return [...comps].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      case 'popular':
        return [...comps].sort((a, b) => (b.ticketsSold / b.totalTickets) - (a.ticketsSold / a.totalTickets));
      case 'priceAsc':
        return [...comps].sort((a, b) => a.ticketPrice - b.ticketPrice);
      case 'priceDesc':
        return [...comps].sort((a, b) => b.ticketPrice - a.ticketPrice);
      default:
        return comps;
    }
  };

  const handleCompetitionClick = (id: string) => {
    if (typeof window !== 'undefined') {
      window.navigate(`/competition/${id}`);
    }
  };
  
  return (
    <Container>
      <PageHeader>
        <Heading1>Browse Competitions</Heading1>
        <Description>
          Explore available competitions, buy tickets, and win awesome prizes!
        </Description>
      </PageHeader>
      
      <FiltersContainer>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All Competitions
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
      
      <Separator />
      
      <CompetitionListHeader>
        <ListHeading>
          {filter === 'all' ? 'All Competitions' : 
           filter === 'active' ? 'Active Competitions' :
           filter === 'ending' ? 'Ending Soon' :
           'Completed Competitions'}
        </ListHeading>
        
        <SortContainer>
          <SortLabel>Sort by:</SortLabel>
          <Select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </Select>
        </SortContainer>
      </CompetitionListHeader>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading competitions...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
      ) : competitions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>No competitions found for the selected filter.</div>
      ) : (
        <CompetitionGrid>
          {competitions.map((competition) => (
            <CompetitionCard 
              key={competition.id} 
              onClick={() => handleCompetitionClick(competition.id!)}
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
                      <div style={{ color: 'rgb(14, 165, 233)' }}>
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
    </Container>
  );
} 