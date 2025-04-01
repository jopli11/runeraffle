import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

// Styled components
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 3rem;
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

const Card = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardHeading = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const StepContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StepNumber = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background-color: hsl(var(--primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: white;
`;

const StepDescription = styled.p`
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 3rem 0;
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

const WarningBlock = styled.div`
  background-color: rgba(245, 158, 11, 0.1);
  border-left: 4px solid rgb(245, 158, 11);
  padding: 1rem;
  margin: 1.5rem 0;
`;

const WarningHeading = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(245, 158, 11);
`;

const FAQ = styled.div`
  margin-top: 3rem;
`;

const FAQItem = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const FAQQuestion = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: white;
`;

const FAQAnswer = styled.p`
  opacity: 0.9;
  line-height: 1.6;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

// Icon components
const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.57465 3.34064L1.51631 15.0782C1.37078 15.3327 1.29873 15.6223 1.30566 15.9158C1.31258 16.2093 1.3982 16.4949 1.55414 16.7417C1.71008 16.9885 1.9309 17.1866 2.19475 17.3142C2.4586 17.4419 2.75334 17.4942 3.04798 17.4656H17.1647C17.4593 17.4942 17.754 17.4419 18.0179 17.3142C18.2817 17.1866 18.5026 16.9885 18.6585 16.7417C18.8144 16.4949 18.9 16.2093 18.907 15.9158C18.9139 15.6223 18.8418 15.3327 18.6963 15.0782L11.638 3.34064C11.473 3.10683 11.2463 2.92137 10.9818 2.80094C10.7172 2.6805 10.4246 2.62964 10.1363 2.62964C9.84798 2.62964 9.55538 2.6805 9.29083 2.80094C9.02628 2.92137 8.79957 3.10683 8.63465 3.34064V3.34064Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.1064 7.5V10.8333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.1064 14.1667H10.1147" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16667M15.8334 10L10.0001 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function HowItWorksPage() {
  const navigate = useNavigate();
  
  return (
    <Container>
      <PageHeader>
        <Heading1>How RuneRaffle Works</Heading1>
        <Description>
          Learn about our fair and transparent raffle system that allows players to win epic RuneScape prizes. Our draws are provably fair and fully transparent.
        </Description>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardHeading>How to Enter Raffles</CardHeading>
        </CardHeader>
        <CardBody>
          <StepContainer>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepHeading>Create an Account</StepHeading>
              <StepDescription>
                Sign up for a free RuneRaffle account. You'll need this to enter raffles and track your entries.
              </StepDescription>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepHeading>Purchase Credits</StepHeading>
              <StepDescription>
                Add credits to your account. Credits are used to purchase raffle tickets, with each raffle having its own ticket price.
              </StepDescription>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepHeading>Choose a Raffle</StepHeading>
              <StepDescription>
                Browse our active raffles and select the prizes you're interested in winning. Each raffle has a limited number of tickets available.
              </StepDescription>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepHeading>Buy Tickets</StepHeading>
              <StepDescription>
                Purchase one or more tickets for your chosen raffle. The more tickets you buy, the higher your chances of winning. Some raffles have limits on how many tickets one user can purchase.
              </StepDescription>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>5</StepNumber>
            <StepContent>
              <StepHeading>Wait for the Draw</StepHeading>
              <StepDescription>
                Once all tickets are sold, the raffle ends and a winner is automatically selected using our provably fair system.
              </StepDescription>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>6</StepNumber>
            <StepContent>
              <StepHeading>Collect Your Prize</StepHeading>
              <StepDescription>
                If you win, we'll contact you to arrange delivery of your prize. All prizes are delivered within 24 hours of the draw.
              </StepDescription>
            </StepContent>
          </StepContainer>
        </CardBody>
      </Card>
      
      <SectionDivider />
      
      <Card>
        <CardHeader>
          <CardHeading>Our Provably Fair System</CardHeading>
        </CardHeader>
        <CardBody>
          <StepContainer>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepHeading>Creating a Cryptographic Seed</StepHeading>
              <StepDescription>
                Before the raffle begins, our system generates a random seed. This seed is then hashed using SHA-256 encryption, creating a unique cryptographic fingerprint that cannot be reverse-engineered.
              </StepDescription>
              <CodeBlock>
                Original Seed: 8f6b0a06c7d1e2f354b9a687c0d31e25<br />
                SHA-256 Hash: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </CodeBlock>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepHeading>Public Hash Verification</StepHeading>
              <StepDescription>
                The hash is published publicly at the start of the raffle, so everyone can see it. This proves we've already determined a seed but cannot change it, as any modification would produce a completely different hash.
              </StepDescription>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepHeading>Adding External Entropy</StepHeading>
              <StepDescription>
                When the raffle ends, we combine our original seed with a source of external entropy that couldn't have been predicted when the raffle started. We use the hash of the most recent Bitcoin block at the time the raffle ends.
              </StepDescription>
              <CodeBlock>
                Original Seed: 8f6b0a06c7d1e2f354b9a687c0d31e25<br />
                Bitcoin Block Hash: 0000000000000000000392ff974383c752f58e86f86abc293ade35208c5c4808<br />
                Combined Value: 8f6b0a06c7d1e2f354b9a687c0d31e250000000000000000000392ff974383c752f58e86f86abc293ade35208c5c4808
              </CodeBlock>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepHeading>Selecting the Winner</StepHeading>
              <StepDescription>
                The combined value is hashed again, and the resulting number is used to determine the winning ticket. This is done by taking the modulo of the number with the total tickets sold.
              </StepDescription>
              <CodeBlock>
                Final Hash: e9c0f8f2d5b5a9e7b5c6d3f9a8c7b6a5d4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9<br />
                Numeric Value (first 8 chars): 0xe9c0f8f2 = 3,922,317,554<br />
                Total Tickets: 500<br />
                Winning Ticket Number: 3,922,317,554 % 500 = 54
              </CodeBlock>
            </StepContent>
          </StepContainer>
          
          <StepContainer>
            <StepNumber>5</StepNumber>
            <StepContent>
              <StepHeading>Revealing the Original Seed</StepHeading>
              <StepDescription>
                After the winner is selected, we publish the original seed. Anyone can verify that:
              </StepDescription>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>The SHA-256 hash of our original seed matches the pre-published hash</li>
                <li>The Bitcoin block hash we used is authentic and corresponds to the correct block</li>
                <li>When combined, these values correctly determine the winning ticket</li>
              </ul>
            </StepContent>
          </StepContainer>
          
          <WarningBlock>
            <WarningHeading>
              <WarningIcon />
              Important Note
            </WarningHeading>
            <p>
              Our provably fair system ensures that neither we nor any player can manipulate the outcome. The combination of our pre-committed seed and external entropy from the Bitcoin blockchain guarantees a completely fair and transparent draw.
            </p>
          </WarningBlock>
        </CardBody>
      </Card>
      
      <SectionDivider />
      
      <FAQ>
        <CardHeading>Frequently Asked Questions</CardHeading>
        
        <FAQItem>
          <FAQQuestion>How do I know the raffles are fair?</FAQQuestion>
          <FAQAnswer>
            Our provably fair system ensures complete transparency. We publish a hash of our random seed before the raffle begins, and we use the Bitcoin blockchain as an additional source of randomness. After each draw, all the data needed to verify the results is published.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>How long do I have to wait to receive my prize?</FAQQuestion>
          <FAQAnswer>
            If you win, we'll contact you via the email associated with your account. Prizes are delivered in-game within 24 hours of the draw completion. Make sure to provide your correct RuneScape username when prompted.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>Are there limits to how many tickets I can buy?</FAQQuestion>
          <FAQAnswer>
            Yes, most raffles have a maximum number of tickets per user to ensure fair participation. This limit is clearly displayed on each raffle page.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>What happens if a raffle doesn't sell all tickets?</FAQQuestion>
          <FAQAnswer>
            Most raffles have a set time limit. If all tickets aren't sold by the end date, the draw will still take place with the tickets that have been purchased. In rare cases, we may extend the raffle period, but this will always be clearly communicated.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>Can I get a refund for my tickets?</FAQQuestion>
          <FAQAnswer>
            Generally, all ticket purchases are final. However, if a raffle is cancelled for any reason, all credits will be refunded to your account automatically.
          </FAQAnswer>
        </FAQItem>
      </FAQ>
      
      <ButtonContainer>
        <PrimaryButton onClick={() => navigate('/competitions')}>
          Browse Competitions <ArrowRightIcon />
        </PrimaryButton>
      </ButtonContainer>
    </Container>
  );
} 