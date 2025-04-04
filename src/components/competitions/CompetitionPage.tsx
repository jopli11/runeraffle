import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getCompetition, buyTicket, Competition as FirestoreCompetition, getUserCompetitionTickets, updateUserCredits } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import TicketPurchase from './TicketPurchase';
import { useParams, useNavigate } from 'react-router-dom';
import ShareButtons from '../social/ShareButtons';
import toast from '../../utils/toast';

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
  font-size: 0.75rem;
`;

const ProgressText = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const ProgressPercentage = styled.span`
  font-weight: 600;
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

const CompetitionImage = styled.div<{ imageUrl?: string }>`
  height: 300px;
  width: 100%;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  background-color: hsl(var(--card));
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 0.75rem;
    opacity: ${props => props.imageUrl ? 1 : 0};
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
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

// Add new styled components for trivia section
const TriviaSection = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TriviaTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TriviaQuestion = styled.p`
  margin-bottom: 1.25rem;
  line-height: 1.6;
`;

const TriviaAnswer = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
  }
`;

const TriviaSubmitButton = styled.button`
  background-color: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background-color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }
`;

const TriviaResult = styled.div<{ correct: boolean }>`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: ${props => props.correct ? 'rgba(22, 163, 74, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.correct ? 'rgb(22, 163, 74)' : 'rgb(239, 68, 68)'};
  font-weight: 500;
`;

const QuizIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10.8333V10C10.9205 10 11.6667 9.25381 11.6667 8.33333C11.6667 7.41286 10.9205 6.66667 10 6.66667C9.07953 6.66667 8.33334 7.41286 8.33334 8.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99999 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

// Update How It Works section styling
const HowItWorksSection = styled.section`
  margin-top: 3rem;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const StepNumber = styled.div`
  background-color: hsl(var(--primary));
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
`;

const StepDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-size: 0.875rem;
`;

// Status components
const StatusItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const StatusLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 0.5rem;
`;

const StatusValue = styled.span`
  font-weight: 600;
`;

const StatusDot = styled.div<{ status: string }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return 'rgb(22, 163, 74)';
      case 'ending': return 'rgb(245, 158, 11)';
      case 'complete': return 'rgb(22, 163, 74)';
      case 'cancelled': return 'rgb(239, 68, 68)';
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  }};
  margin-right: 0.5rem;
`;

const TicketSelector = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const TicketSelectorLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 0.5rem;
`;

const TicketSelectorButtons = styled.div`
  display: flex;
  align-items: center;
`;

const TicketSelectorButton = styled.button`
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

const TicketCount = styled.span`
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
`;

const TotalPrice = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const TotalPriceLabel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 0.5rem;
`;

const TotalPriceValue = styled.span`
  font-weight: 600;
`;

const SignInButton = styled.button`
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
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const PurchaseButton = styled.button`
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
  background-color: hsl(var(--primary));
  color: white;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CreditsInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CreditsAvailable = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const CreditsValue = styled.span`
  font-weight: 600;
`;

const AddCreditsButton = styled.button`
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
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const CompletedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CompletedMessageText = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const YourEntries = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

export default function CompetitionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userCredits, setUserCredits } = useAuth();
  const [competition, setCompetition] = useState<FirestoreCompetition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'terms'>('details');
  const [triviaAnswer, setTriviaAnswer] = useState('');
  const [triviaCorrect, setTriviaCorrect] = useState(false);
  const [triviaSubmitted, setTriviaSubmitted] = useState(false);
  const [triviaError, setTriviaError] = useState<string | null>(null);
  const [userEntries, setUserEntries] = useState(0);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const fetchCompetition = async () => {
      setLoading(true);
      try {
        if (!id) {
          setError('Competition ID is missing');
          setLoading(false);
          return;
        }
        
        const data = await getCompetition(id);
        setCompetition(data);
        
        // Fetch user entries for this competition
        if (currentUser && data) {
          try {
            const entries = await getUserCompetitionTickets(currentUser.uid, id);
            setUserEntries(entries.length);
          } catch (entriesErr) {
            console.error("Error fetching user entries:", entriesErr);
            // Don't fail competition loading if entries can't be fetched
            setUserEntries(0);
          }
        }
      } catch (err: any) {
        console.error('Error fetching competition:', err);
        setError(err.message || 'Failed to load competition');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompetition();
  }, [id, currentUser]);

  const handleTriviaSubmit = () => {
    setTriviaSubmitted(true);
    
    // Example validation (replace with actual logic based on the question)
    const correctAnswer = competition?.triviaAnswer || 'jagex';
    const isCorrect = triviaAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      setTriviaCorrect(true);
      setTriviaError(null);
      toast.success('Correct answer! You can now purchase tickets.');
    } else {
      setTriviaError('Incorrect answer. Please try again.');
      toast.error('Incorrect answer. Please try again.');
    }
  };

  const handleBuyTickets = async (count: number) => {
    if (!currentUser) {
      toast.error('Please login to purchase tickets');
      return;
    }
    
    if (!competition) {
      toast.error('Competition not found');
      return;
    }
    
    if (!competition.id) {
      toast.error('Invalid competition ID');
      return;
    }
    
    // Check if user has enough credits
    const totalCost = count * competition.ticketPrice;
    if (userCredits < totalCost) {
      toast.error('You do not have enough credits');
      return;
    }
    
    setPurchasing(true);
    const loadingToastId = toast.loading('Processing your ticket purchase...');
    
    try {
      // Purchase tickets
      await buyTicket(currentUser.uid, competition.id, count);
      
      // Update user credits in the context (state)
      const newCredits = userCredits - totalCost;
      setUserCredits(newCredits);
      
      // Update user entries count
      setUserEntries(userEntries + count);
      
      // Refresh competition data
      const updatedCompetition = await getCompetition(competition.id);
      setCompetition(updatedCompetition);
      
      setPurchaseSuccess(true);
      toast.dismiss(loadingToastId);
      toast.success(`Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`);
      
      setTimeout(() => {
        setPurchaseSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error purchasing tickets:', err);
      toast.dismiss(loadingToastId);
      toast.error(err.message || 'Failed to purchase tickets');
    } finally {
      setPurchasing(false);
    }
  };

  const handleBackClick = () => {
    navigate('/competitions');
  };

  const incrementTickets = () => {
    if (!competition) return;
    
    const maxTickets = Math.min(
      Math.floor(userCredits / competition.ticketPrice),
      competition.totalTickets - competition.ticketsSold
    );
    
    if (ticketCount < maxTickets) {
      setTicketCount(prevCount => prevCount + 1);
    }
  };
  
  const decrementTickets = () => {
    if (ticketCount > 1) {
      setTicketCount(prevCount => prevCount - 1);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading competition details...
        </div>
      </Container>
    );
  }

  if (error || !competition) {
    return (
      <Container>
        <BackButton onClick={handleBackClick}>
          <ArrowLeftIcon /> Back to Competitions
        </BackButton>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
          {error || 'Competition not found'}
        </div>
      </Container>
    );
  }

  const remainingTickets = competition.totalTickets - competition.ticketsSold;
  const isEnded = competition.status === 'complete' || competition.status === 'cancelled';
  const formattedTimeLeft = formatTimeLeft(competition.endsAt);
  const progressPercentage = Math.min(
    Math.round((competition.ticketsSold / competition.totalTickets) * 100),
    100
  );

  return (
    <Container>
      <BackButton onClick={handleBackClick}>
        <ArrowLeftIcon /> Back to Competitions
      </BackButton>
      
      <CompetitionLayout>
        <MainContent>
          {competition.imageUrl && (
            <CompetitionImage imageUrl={competition.imageUrl} />
          )}
          <CompetitionHeader>
            <BadgeContainer>
              <Badge variant="status">
                {competition.status === 'active' ? 'Active' : 
                 competition.status === 'ending' ? 'Ending Soon' : 
                 competition.status === 'complete' ? 'Completed' : 'Cancelled'}
              </Badge>
              <Badge variant="primary">{competition.difficulty}</Badge>
              {competition.status === 'ending' && (
                <Badge variant="limited">Limited Time</Badge>
              )}
            </BadgeContainer>
            
            <Heading1>{competition.title}</Heading1>
            <Description>{competition.description}</Description>
          </CompetitionHeader>
          
          <PrizeHeader>
            <Heading2>Prize Details</Heading2>
          </PrizeHeader>
          
          <PrizeCard>
            <PrizeIconContainer>
              <TrophyIcon />
            </PrizeIconContainer>
            
            <PrizeContent>
              <PrizeName>{competition.prize}</PrizeName>
              <PrizeValue>Value: {competition.prizeValue}</PrizeValue>
              <PrizeDescription>
                Win this amazing prize by participating in our raffle. Each ticket gives you a chance to win!
              </PrizeDescription>
            </PrizeContent>
          </PrizeCard>
          
          {competition.status === 'complete' && competition.winner && (
            <Card>
              <CardHeader>
                <CardHeading>Winner Announcement</CardHeading>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Winner:</div>
                  <div>{competition.winner.username || competition.winner.email}</div>
                </div>
                
                {competition.winningTicket && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Winning Ticket:</div>
                    <div>#{competition.winningTicket}</div>
                  </div>
                )}
                
                {competition.seed && (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Verification Seed:</div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: 'rgba(0,0,0,0.2)', 
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      wordBreak: 'break-all'
                    }}>
                      {competition.seed}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
          
          <HowItWorksSection>
            <Heading2>How It Works</Heading2>
            <div>
              <Step>
                <StepNumber>1</StepNumber>
                <StepContent>
                  <StepTitle>Purchase Tickets</StepTitle>
                  <StepDescription>
                    Use your credits to buy raffle tickets. Each ticket gives you one entry in the draw 
                    and increases your chances of winning. You can purchase multiple tickets for better odds.
                  </StepDescription>
                </StepContent>
              </Step>
              
              <Step>
                <StepNumber>2</StepNumber>
                <StepContent>
                  <StepTitle>Fair Random Drawing</StepTitle>
                  <StepDescription>
                    When all tickets are sold or the competition end date is reached, 
                    a winner is selected using our provably fair system that ensures complete transparency 
                    and randomness in the selection process.
                  </StepDescription>
                </StepContent>
              </Step>
              
              <Step>
                <StepNumber>3</StepNumber>
                <StepContent>
                  <StepTitle>Claim Your Prize</StepTitle>
                  <StepDescription>
                    Winners are notified immediately, and prizes are delivered directly to your account. 
                    No complicated claims process - just enjoy your winnings and good luck on your next entry!
                  </StepDescription>
                </StepContent>
              </Step>
            </div>
          </HowItWorksSection>
          
          {/* Add the trivia section before or after the prize section */}
          <SectionDivider />
          
          <Heading2>Prize Details</Heading2>
          <PrizeCard>
            <PrizeIconContainer>
              <TrophyIcon />
            </PrizeIconContainer>
            <PrizeContent>
              <PrizeName>{competition.prize}</PrizeName>
              <PrizeValue>Value: {competition.prizeValue}</PrizeValue>
              <PrizeDescription>
                The winner will be contacted via email to arrange prize delivery.
              </PrizeDescription>
            </PrizeContent>
          </PrizeCard>
          
          {/* ... rest of existing sections ... */}
        </MainContent>
        
        <Sidebar>
          <Card>
            <CardHeader>
              <CardHeading>Purchase Tickets</CardHeading>
              <CardDescription>
                Buy tickets to enter this competition. Each ticket gives you a chance to win.
              </CardDescription>
            </CardHeader>
            
            <CardBody>
              {/* Trivia section */}
              {!isEnded && (
                <TriviaSection>
                  <TriviaTitle>
                    <QuizIcon /> Skill-Based Entry Question
                  </TriviaTitle>
                  <TriviaQuestion>
                    {competition.triviaQuestion || 'What game is RuneScape developed by?'}
                  </TriviaQuestion>
                  
                  {!triviaCorrect ? (
                    <>
                      <TriviaAnswer 
                        placeholder="Enter your answer"
                        value={triviaAnswer}
                        onChange={(e) => setTriviaAnswer(e.target.value)}
                        disabled={triviaCorrect}
                      />
                      <TriviaSubmitButton 
                        onClick={handleTriviaSubmit} 
                        disabled={!triviaAnswer.trim()}
                      >
                        Submit Answer
                      </TriviaSubmitButton>
                      
                      {triviaSubmitted && !triviaCorrect && (
                        <TriviaResult correct={false}>
                          {triviaError || 'Incorrect answer. Please try again.'}
                        </TriviaResult>
                      )}
                    </>
                  ) : (
                    <TriviaResult correct={true}>
                      Correct! You may now purchase tickets.
                    </TriviaResult>
                  )}
                </TriviaSection>
              )}
              
              {/* Use TicketPurchase component when trivia is correct */}
              {!isEnded && triviaCorrect && (
                <TicketPurchase 
                  competition={competition}
                  onPurchase={handleBuyTickets}
                  disabled={purchasing}
                  userEntries={userEntries}
                />
              )}
              
              <CreditsInfo>
                <CreditsAvailable>
                  Available Credits: <CreditsValue>{userCredits}</CreditsValue>
                </CreditsAvailable>
                {userCredits < competition.ticketPrice && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgb(239, 68, 68)' }}>
                    Not enough credits. <a href="/profile" style={{ color: 'hsl(var(--primary))' }}>Add more credits</a>
                  </div>
                )}
              </CreditsInfo>
              
              {currentUser ? (
                <YourEntries>
                  Your Entries: <span style={{ fontWeight: 'bold' }}>{userEntries}</span>
                </YourEntries>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <a href="/login" style={{ color: 'hsl(var(--primary))' }}>Sign in</a> to purchase tickets
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Competition stats */}
          <Card style={{ marginTop: '1.5rem' }}>
            <CardHeader>
              <CardHeading>Competition Stats</CardHeading>
            </CardHeader>
            <CardBody>
              <ProgressContainer>
                <ProgressLabel>Tickets Sold</ProgressLabel>
                <ProgressBarOuter>
                  <ProgressBarInner width={`${progressPercentage}%`} />
                </ProgressBarOuter>
                <ProgressDetails>
                  <ProgressText>{competition.ticketsSold} / {competition.totalTickets}</ProgressText>
                  <ProgressPercentage>{progressPercentage}%</ProgressPercentage>
                </ProgressDetails>
              </ProgressContainer>
              
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Ticket Price</InfoLabel>
                  <InfoValue>{competition.ticketPrice} credits</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Tickets Remaining</InfoLabel>
                  <InfoValue>{remainingTickets}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Difficulty</InfoLabel>
                  <InfoValue>{competition.difficulty}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Ends In</InfoLabel>
                  <EndsInValue ending={formattedTimeLeft === 'Ending Soon'}>
                    {formattedTimeLeft}
                  </EndsInValue>
                </InfoItem>
              </InfoGrid>
              
              {/* Share section */}
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ marginBottom: '0.75rem', fontWeight: '500' }}>Share</div>
                <ShareButtons 
                  title={competition.title} 
                  url={window.location.href}
                />
              </div>
            </CardBody>
          </Card>
        </Sidebar>
      </CompetitionLayout>
    </Container>
  );
} 