import React, { useState } from 'react';
import styled from '@emotion/styled';

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
}

// Sample data
const sampleCompetitions: Competition[] = [
  {
    id: 1,
    title: 'Dragon Slayer Challenge',
    description: 'Win the ultimate Dragon gear set and 100M OSRS Gold.',
    prize: 'Dragon Gear + 100M OSRS Gold',
    prizeValue: '100M OSRS Gold',
    status: 'active',
    difficulty: 'hard',
    ticketPrice: 5,
    ticketsSold: 683,
    totalTickets: 1000,
    endsIn: '3 days'
  },
  {
    id: 2,
    title: 'Goblin Slayer Raffle',
    description: 'Win 10M OSRS Gold in this easy entry raffle.',
    prize: '10M OSRS Gold',
    prizeValue: '10M OSRS Gold',
    status: 'active',
    difficulty: 'easy',
    ticketPrice: 2,
    ticketsSold: 450,
    totalTickets: 500,
    endsIn: '5 days'
  },
  {
    id: 3,
    title: 'Barrows Gear Raffle',
    description: 'Complete set of Barrows equipment up for grabs!',
    prize: 'Full Barrows Set',
    prizeValue: 'Barrows Set',
    status: 'ending',
    difficulty: 'medium',
    ticketPrice: 3,
    ticketsSold: 720,
    totalTickets: 750,
    endsIn: '12 hours'
  },
  {
    id: 4,
    title: 'Bandos Raffle',
    description: 'Win the coveted Bandos armor set in this limited raffle.',
    prize: 'Bandos Armor Set + 25M Gold',
    prizeValue: 'Bandos Set + 25M',
    status: 'active',
    difficulty: 'hard',
    ticketPrice: 4,
    ticketsSold: 124,
    totalTickets: 300,
    endsIn: '4 days'
  },
  {
    id: 5,
    title: 'Abyssal Whip Giveaway',
    description: 'Legendary whip for the lucky winner!',
    prize: 'Abyssal Whip + 5M OSRS Gold',
    prizeValue: 'Whip + 5M Gold',
    status: 'complete',
    difficulty: 'medium',
    ticketPrice: 2,
    ticketsSold: 500,
    totalTickets: 500,
    endsIn: 'Completed',
    completedAt: '2 days ago',
    winner: 'DragonSlayer92',
    seed: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    id: 6,
    title: 'Armadyl Godsword Raffle',
    description: 'One of the most powerful weapons in OSRS!',
    prize: 'Armadyl Godsword + 10M OSRS Gold',
    prizeValue: 'AGS + 10M Gold',
    status: 'complete',
    difficulty: 'hard',
    ticketPrice: 5,
    ticketsSold: 800,
    totalTickets: 800,
    endsIn: 'Completed',
    completedAt: '5 days ago',
    winner: 'GodSwordMaster',
    seed: '3c6e0b8a9c15224a8228b9a98ca1531d5f3d8d474c9c7b1bc37ea1c77d3f6db7'
  }
];

export default function CompetitionsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'ending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');

  // Filter competitions based on selected filter
  const filteredCompetitions = sampleCompetitions.filter(comp => {
    if (filter === 'all') return true;
    if (filter === 'active') return comp.status === 'active';
    if (filter === 'ending') return comp.status === 'ending';
    if (filter === 'completed') return comp.status === 'complete';
    return true;
  });

  // Sort competitions based on selected sort
  const sortedCompetitions = [...filteredCompetitions].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;
    if (sortBy === 'price-low') return a.ticketPrice - b.ticketPrice;
    if (sortBy === 'price-high') return b.ticketPrice - a.ticketPrice;
    return 0;
  });

  // Group competitions by status for display
  const activeCompetitions = sortedCompetitions.filter(comp => comp.status === 'active' || comp.status === 'ending');
  const completedCompetitions = sortedCompetitions.filter(comp => comp.status === 'complete');

  const handleCompetitionClick = (id: number) => {
    window.navigate(`/competition/${id}`);
  };

  return (
    <Container>
      <PageHeader>
        <Heading1>All Raffles</Heading1>
        <Description>
          Browse all active and completed raffles. Enter for a chance to win epic RuneScape items and gold.
        </Description>
        
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
      </PageHeader>
      
      {/* Active Competitions */}
      {(filter === 'all' || filter === 'active' || filter === 'ending') && activeCompetitions.length > 0 && (
        <>
          <CompetitionListHeader>
            <ListHeading>Active Raffles</ListHeading>
            <SortContainer>
              <SortLabel>Sort by:</SortLabel>
              <Select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </Select>
            </SortContainer>
          </CompetitionListHeader>
          
          <CompetitionGrid>
            {activeCompetitions.map(competition => (
              <CompetitionCard key={competition.id} onClick={() => handleCompetitionClick(competition.id)}>
                <CardImageContainer>
                  <CardBadges>
                    <StatusBadge status={competition.status}>
                      {competition.status === 'ending' ? 'Ending Soon' : 'Active'}
                    </StatusBadge>
                    <DifficultyBadge difficulty={competition.difficulty}>
                      {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
                    </DifficultyBadge>
                  </CardBadges>
                  <IconContainer>
                    <TimerIcon />
                  </IconContainer>
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
                      <span>{competition.ticketsSold}/{competition.totalTickets} tickets</span>
                      <span>{Math.round((competition.ticketsSold / competition.totalTickets) * 100)}%</span>
                    </ProgressDetails>
                  </ProgressContainer>
                  
                  <CardFooter>
                    <PriceContainer>
                      <PriceLabel>Ticket Price</PriceLabel>
                      <Price>{competition.ticketPrice} Credits</Price>
                    </PriceContainer>
                    <TimeContainer>
                      <TimeLabel>Ends In</TimeLabel>
                      <Time color={competition.status === 'ending' ? 'rgb(245, 158, 11)' : undefined}>
                        {competition.endsIn}
                      </Time>
                    </TimeContainer>
                  </CardFooter>
                </CardContent>
              </CompetitionCard>
            ))}
          </CompetitionGrid>
        </>
      )}
      
      {/* Separator between sections */}
      {activeCompetitions.length > 0 && completedCompetitions.length > 0 && 
        (filter === 'all') && (
        <Separator />
      )}
      
      {/* Completed Competitions */}
      {(filter === 'all' || filter === 'completed') && completedCompetitions.length > 0 && (
        <>
          <CompetitionListHeader>
            <ListHeading>Completed Raffles</ListHeading>
          </CompetitionListHeader>
          
          <CompetitionGrid>
            {completedCompetitions.map(competition => (
              <CompetitionCard key={competition.id} onClick={() => handleCompetitionClick(competition.id)}>
                <CardImageContainer>
                  <CardBadges>
                    <StatusBadge status="complete">
                      Completed
                    </StatusBadge>
                    <DifficultyBadge difficulty={competition.difficulty}>
                      {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
                    </DifficultyBadge>
                  </CardBadges>
                  <IconContainer>
                    <TimerIcon />
                  </IconContainer>
                </CardImageContainer>
                
                <CardContent>
                  <PrizeValue>{competition.prizeValue}</PrizeValue>
                  <CardTitle>{competition.title}</CardTitle>
                  <CardDescription>{competition.description}</CardDescription>
                  
                  <ProgressContainer>
                    <ProgressBarOuter>
                      <ProgressBarInner width="100%" />
                    </ProgressBarOuter>
                    <ProgressDetails>
                      <span>{competition.ticketsSold}/{competition.totalTickets} tickets</span>
                      <span>100%</span>
                    </ProgressDetails>
                  </ProgressContainer>
                  
                  <CardFooter>
                    <PriceContainer>
                      <PriceLabel>Winner</PriceLabel>
                      <Price>{competition.winner}</Price>
                    </PriceContainer>
                    <TimeContainer>
                      <TimeLabel>Completed</TimeLabel>
                      <Time>{competition.completedAt}</Time>
                    </TimeContainer>
                  </CardFooter>
                </CardContent>
              </CompetitionCard>
            ))}
          </CompetitionGrid>
        </>
      )}
      
      {/* Empty state when no competitions match the filter */}
      {sortedCompetitions.length === 0 && (
        <EmptyState>
          <EmptyStateIcon>
            <SearchIcon />
          </EmptyStateIcon>
          <EmptyStateHeading>No raffles found</EmptyStateHeading>
          <EmptyStateText>
            There are no raffles matching your current filter. Try changing your filter or check back soon for new raffles.
          </EmptyStateText>
        </EmptyState>
      )}
      
      {/* Pagination */}
      {sortedCompetitions.length > 0 && (
        <Pagination>
          <PageButton disabled>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8334 10H4.16675M4.16675 10L10.0001 4.16667M4.16675 10L10.0001 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </PageButton>
          <PageButton active>1</PageButton>
          <PageButton>2</PageButton>
          <PageButton>3</PageButton>
          <PageButton>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16667M15.8334 10L10.0001 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </PageButton>
        </Pagination>
      )}
    </Container>
  );
} 