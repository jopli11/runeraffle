import React from 'react';
import styled from '@emotion/styled';

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

// Sample winners data
const winners = [
  {
    id: 1,
    username: 'DragonSlayer92',
    date: 'July 10, 2023',
    competitionTitle: 'Abyssal Whip Giveaway',
    competitionDescription: 'Legendary whip for the lucky winner!',
    prize: 'Abyssal Whip + 5M OSRS Gold',
    prizeValue: '5M Gold',
    verificationDetails: {
      seed: '8f6b0a06',
      hash: '7f83b1657ff1fc53...',
      blockHash: '00000000000000...',
      winningTicket: '324 of 500'
    }
  },
  {
    id: 2,
    username: 'GodSwordMaster',
    date: 'July 5, 2023',
    competitionTitle: 'Armadyl Godsword Raffle',
    competitionDescription: 'One of the most powerful weapons in OSRS!',
    prize: 'Armadyl Godsword + 10M OSRS Gold',
    prizeValue: '10M Gold',
    verificationDetails: {
      seed: 'a9cd1e48',
      hash: '3c6e0b8a9c15224a...',
      blockHash: '00000000000000...',
      winningTicket: '712 of 800'
    }
  },
  {
    id: 3,
    username: 'RuneWarrior55',
    date: 'June 27, 2023',
    competitionTitle: 'Bandos Chest Plate Raffle',
    competitionDescription: 'Win the coveted Bandos armor piece!',
    prize: 'Bandos Chest Plate + 15M OSRS Gold',
    prizeValue: '15M Gold',
    verificationDetails: {
      seed: 'c4f31b2a',
      hash: '5e884898da28047...',
      blockHash: '00000000000000...',
      winningTicket: '229 of 600'
    }
  },
  {
    id: 4,
    username: 'MagicMaster42',
    date: 'June 20, 2023',
    competitionTitle: 'Ancestral Robes Giveaway',
    competitionDescription: 'The most powerful magic gear in OSRS!',
    prize: 'Ancestral Robe Set + 25M OSRS Gold',
    prizeValue: '25M Gold',
    verificationDetails: {
      seed: 'd7e94c18',
      hash: '8d969eef6ecad3c...',
      blockHash: '00000000000000...',
      winningTicket: '427 of 750'
    }
  },
  {
    id: 5,
    username: 'PKchampion',
    date: 'June 15, 2023',
    competitionTitle: 'Dragon Claws Giveaway',
    competitionDescription: 'The ultimate PK weapon!',
    prize: 'Dragon Claws + 20M OSRS Gold',
    prizeValue: '20M Gold',
    verificationDetails: {
      seed: 'f2a8e051',
      hash: '1c383cd30b7c298...',
      blockHash: '00000000000000...',
      winningTicket: '142 of 500'
    }
  },
  {
    id: 6,
    username: 'Slayer99',
    date: 'June 8, 2023',
    competitionTitle: 'Slayer Equipment Bundle',
    competitionDescription: 'Everything you need for efficient Slayer training!',
    prize: 'Slayer Bundle + 15M OSRS Gold',
    prizeValue: '15M Gold',
    verificationDetails: {
      seed: 'b3e72d09',
      hash: '19fa61d75522a4...',
      blockHash: '00000000000000...',
      winningTicket: '389 of 600'
    }
  }
];

export default function WinnersPage() {
  const handleViewCompetition = (id: number) => {
    window.navigate(`/competition/${id}`);
  };

  return (
    <Container>
      <PageHeader>
        <Heading1>Recent Winners</Heading1>
        <Description>
          Check out the most recent winners from our provably fair raffles. All drawings are transparent and verifiable through our blockchain-based verification system.
        </Description>
      </PageHeader>
      
      <WinnersGrid>
        {winners.map(winner => (
          <WinnerCard key={winner.id}>
            <WinnerCardHeader>
              <WinnerUsername>{winner.username}</WinnerUsername>
              <WinnerDate>Won on {winner.date}</WinnerDate>
              <PrizeLabel>{winner.prizeValue}</PrizeLabel>
            </WinnerCardHeader>
            
            <WinnerCardBody>
              <CompetitionTitle>{winner.competitionTitle}</CompetitionTitle>
              <CompetitionDescription>{winner.competitionDescription}</CompetitionDescription>
              
              <PrizeDetails>
                <PrizeTitle>Prize Won:</PrizeTitle>
                <PrizeValue>{winner.prize}</PrizeValue>
              </PrizeDetails>
              
              <VerificationContainer>
                <VerificationHeading>
                  <VerifiedIcon />
                  Verified Fair Draw
                </VerificationHeading>
                
                <VerificationDetails>
                  <VerificationItem>
                    <VerificationLabel>Seed:</VerificationLabel>
                    <VerificationValue>{winner.verificationDetails.seed}</VerificationValue>
                  </VerificationItem>
                  <VerificationItem>
                    <VerificationLabel>Hash:</VerificationLabel>
                    <VerificationValue>{winner.verificationDetails.hash}</VerificationValue>
                  </VerificationItem>
                  <VerificationItem>
                    <VerificationLabel>Block Hash:</VerificationLabel>
                    <VerificationValue>{winner.verificationDetails.blockHash}</VerificationValue>
                  </VerificationItem>
                  <VerificationItem>
                    <VerificationLabel>Winning Ticket:</VerificationLabel>
                    <VerificationValue>{winner.verificationDetails.winningTicket}</VerificationValue>
                  </VerificationItem>
                </VerificationDetails>
                
                <VerificationLink href="#" onClick={(e) => e.preventDefault()}>
                  Verify on blockchain <ExternalLinkIcon />
                </VerificationLink>
                
                <SecondaryButton onClick={() => handleViewCompetition(winner.id)}>
                  View Competition Details
                </SecondaryButton>
              </VerificationContainer>
            </WinnerCardBody>
          </WinnerCard>
        ))}
      </WinnersGrid>
    </Container>
  );
} 