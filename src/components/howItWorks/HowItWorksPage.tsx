import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(265, 83%, 45%));
  border-radius: 1rem;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/pattern.svg') repeat;
    opacity: 0.1;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem 1rem;
    margin-bottom: 2rem;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Heading1 = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
`;

const StepCard = styled(motion.div)`
  background-color: hsl(var(--card));
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: hsl(var(--primary));
  }
`;

const StepNumber = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background-color: #eab516;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const StepHeading = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
`;

const StepDescription = styled.p`
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const StepIcon = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  opacity: 0.1;
  transform: translate(20px, -20px);
`;

const FeatureSection = styled.div`
  background-color: hsl(var(--card));
  border-radius: 1rem;
  padding: 3rem;
  margin-bottom: 4rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const FeatureIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: #eab516;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FeatureContent = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
`;

const FeatureDescription = styled.p`
  opacity: 0.9;
  line-height: 1.6;
`;

const FAQSection = styled.div`
  margin-top: 4rem;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FAQItem = styled(motion.div)`
  background-color: hsl(var(--card));
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  
  &:hover {
    border-color: hsl(var(--primary));
  }
`;

const FAQQuestion = styled.h4`
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FAQAnswer = styled(motion.p)`
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  gap: 0.5rem;
  background-color: #eab516;
  color: black;
  font-size: 1.125rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(234, 181, 22, 0.3);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

const StyledArrowIcon = styled.svg<{ isExpanded: boolean }>`
  width: 20px;
  height: 20px;
  transform: ${props => props.isExpanded ? 'rotate(90deg)' : 'none'};
  transition: transform 0.2s ease;
`;

const ArrowIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <StyledArrowIcon isExpanded={isExpanded} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16667M15.8334 10L10.0001 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </StyledArrowIcon>
);

// Icon components
const AccountIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CreditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TicketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7M4 7V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FairIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SecurityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CodeBlock = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.75rem;
  }
`;

const WarningBlock = styled.div`
  background-color: rgba(245, 158, 11, 0.1);
  border-left: 4px solid rgb(245, 158, 11);
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 0.5rem;
`;

const WarningHeading = styled.div`
  font-weight: bold;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(245, 158, 11);
`;

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.57465 3.34064L1.51631 15.0782C1.37078 15.3327 1.29873 15.6223 1.30566 15.9158C1.31258 16.2093 1.3982 16.4949 1.55414 16.7417C1.71008 16.9885 1.9309 17.1866 2.19475 17.3142C2.4586 17.4419 2.75334 17.4942 3.04798 17.4656H17.1647C17.4593 17.4942 17.754 17.4419 18.0179 17.3142C18.2817 17.1866 18.5026 16.9885 18.6585 16.7417C18.8144 16.4949 18.9 16.2093 18.907 15.9158C18.9139 15.6223 18.8418 15.3327 18.6963 15.0782L11.638 3.34064C11.473 3.10683 11.2463 2.92137 10.9818 2.80094C10.7172 2.6805 10.4246 2.62964 10.1363 2.62964C9.84798 2.62964 9.55538 2.6805 9.29083 2.80094C9.02628 2.92137 8.79957 3.10683 8.63465 3.34064V3.34064Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.1064 7.5V10.8333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.1064 14.1667H10.1147" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StepContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    border-color: hsl(var(--primary));
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }
`;

const StepContent = styled.div`
  flex: 1;
`;

export function HowItWorksPage() {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  const steps = [
    {
      number: 1,
      title: 'Create an Account',
      description: 'Sign up for a free RuneRaffle account. You\'ll need this to enter raffles and track your entries.',
      icon: <AccountIcon />
    },
    {
      number: 2,
      title: 'Purchase Credits',
      description: 'Add credits to your account. Credits are used to purchase raffle tickets, with each raffle having its own ticket price.',
      icon: <CreditIcon />
    },
    {
      number: 3,
      title: 'Choose a Raffle',
      description: 'Browse our active raffles and select the prizes you\'re interested in winning. Each raffle has a limited number of tickets available.',
      icon: <TicketIcon />
    },
    {
      number: 4,
      title: 'Buy Tickets',
      description: 'Purchase one or more tickets for your chosen raffle. The more tickets you buy, the higher your chances of winning. Some raffles have limits on how many tickets one user can purchase.',
      icon: <TicketIcon />
    },
    {
      number: 5,
      title: 'Wait for the Draw',
      description: 'Once all tickets are sold, the raffle ends and a winner is automatically selected using our provably fair system.',
      icon: <FairIcon />
    },
    {
      number: 6,
      title: 'Collect Your Prize',
      description: 'If you win, we\'ll contact you to arrange delivery of your prize. All prizes are delivered within 24 hours of the draw.',
      icon: <SecurityIcon />
    }
  ];

  const features = [
    {
      title: 'Provably Fair',
      description: 'Our drawing system uses cryptographic methods to ensure complete fairness and transparency.',
      icon: <FairIcon />
    },
    {
      title: 'Secure Platform',
      description: 'Your account and transactions are protected with industry-standard security measures.',
      icon: <SecurityIcon />
    }
  ];

  const faqs = [
    {
      question: 'How does the provably fair system work?',
      answer: 'Our system uses a combination of server-generated seeds and blockchain data to ensure random and verifiable results. Each draw can be independently verified by anyone.'
    },
    {
      question: 'What happens if I win?',
      answer: 'If you win a raffle, you\'ll receive an email notification and in-app notification. Our team will contact you to arrange the delivery of your prize.'
    },
    {
      question: 'How do I verify a draw result?',
      answer: 'You can verify any draw result by visiting the verification page for that competition. The page will show you the exact process used to determine the winner.'
    },
    {
      question: 'How long do I have to wait to receive my prize?',
      answer: 'If you win, we\'ll contact you via the email associated with your account. Prizes are delivered in-game within 24 hours of the draw completion. Make sure to provide your correct RuneScape username when prompted.'
    },
    {
      question: 'Are there limits to how many tickets I can buy?',
      answer: 'Yes, most raffles have a maximum number of tickets per user to ensure fair participation. This limit is clearly displayed on each raffle page.'
    },
    {
      question: 'What happens if a raffle doesn\'t sell all tickets?',
      answer: 'Most raffles have a set time limit. If all tickets aren\'t sold by the end date, the draw will still take place with the tickets that have been purchased. In rare cases, we may extend the raffle period, but this will always be clearly communicated.'
    },
    {
      question: 'Can I get a refund for my tickets?',
      answer: 'Generally, all ticket purchases are final. However, if a raffle is cancelled for any reason, all credits will be refunded to your account automatically.'
    }
  ];

  return (
    <Container>
      <HeroSection>
        <HeroContent>
          <Heading1>How RuneRaffle Works</Heading1>
          <Description>
            Learn about our fair and transparent raffle system that allows players to win epic RuneScape prizes. Our draws are provably fair and fully transparent.
          </Description>
        </HeroContent>
      </HeroSection>
      
      <StepsGrid>
        {steps.map((step, index) => (
          <StepCard
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <StepNumber>{step.number}</StepNumber>
            <StepIcon>{step.icon}</StepIcon>
            <StepHeading>{step.title}</StepHeading>
            <StepDescription>{step.description}</StepDescription>
          </StepCard>
        ))}
      </StepsGrid>
      
      <FeatureSection>
        <h2>Our Provably Fair System</h2>
        <StepDescription>
          We use a sophisticated cryptographic system to ensure complete fairness and transparency in our draws. Here's how it works:
        </StepDescription>
        
        <div style={{ marginTop: '2rem' }}>
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
            <p style={{ fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem' }}>
              Our provably fair system ensures that neither we nor any player can manipulate the outcome. The combination of our pre-committed seed and external entropy from the Bitcoin blockchain guarantees a completely fair and transparent draw.
            </p>
          </WarningBlock>
        </div>
      </FeatureSection>
      
      <FAQSection>
        <h2>Frequently Asked Questions</h2>
        <FAQGrid>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
            >
              <FAQQuestion>
                {faq.question}
                <ArrowIcon isExpanded={expandedFAQ === index} />
              </FAQQuestion>
              <AnimatePresence>
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FAQAnswer>{faq.answer}</FAQAnswer>
                  </motion.div>
                )}
              </AnimatePresence>
            </FAQItem>
          ))}
        </FAQGrid>
      </FAQSection>
      
      <ButtonContainer>
        <Button onClick={() => navigate('/competitions')}>
          Start Entering Raffles
          <ArrowIcon isExpanded={false} />
        </Button>
      </ButtonContainer>
    </Container>
  );
} 