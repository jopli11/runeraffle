import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { buyTicket, updateUserCredits } from '../../services/firestore';
import { Competition } from '../../services/firestore';

const PurchaseContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const TicketControls = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const TicketCount = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  padding: 0 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'outline' | 'danger' }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: hsl(var(--primary));
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  ` : props.variant === 'danger' ? `
    background: hsl(var(--destructive));
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  ` : `
    background: transparent;
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
    
    &:hover:not(:disabled) {
      background: hsl(var(--accent));
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TicketButton = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  padding: 0;
`;

const PurchaseSummary = styled.div`
  background: hsl(var(--accent));
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 0.5rem;
    border-top: 1px solid hsl(var(--border));
    font-weight: 600;
  }
`;

const CreditsAvailable = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const CreditWarning = styled.div`
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

interface TicketPurchaseProps {
  competition: Competition;
  onPurchaseComplete?: () => void;
}

export function TicketPurchase({ competition, onPurchaseComplete }: TicketPurchaseProps) {
  const { currentUser, userCredits, setUserCredits } = useAuth();
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset states when competition changes
  useEffect(() => {
    setTicketCount(1);
    setSuccess(false);
    setError(null);
  }, [competition.id]);
  
  const maxTicketsAvailable = competition.totalTickets - competition.ticketsSold;
  const maxTicketsAffordable = Math.floor(userCredits / competition.ticketPrice);
  const maxTickets = Math.min(maxTicketsAvailable, maxTicketsAffordable, 10); // Limit to 10 tickets max per purchase
  
  const totalCost = ticketCount * competition.ticketPrice;
  const notEnoughCredits = userCredits < totalCost;
  
  const handleIncrement = () => {
    if (ticketCount < maxTickets) {
      setTicketCount(prev => prev + 1);
    }
  };
  
  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };
  
  const handlePurchase = async () => {
    if (!currentUser || !competition.id) return;
    if (notEnoughCredits) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Calculate the starting ticket number
      const startingTicketNumber = competition.ticketsSold + 1;
      
      // Purchase each ticket
      const ticketPromises = [];
      for (let i = 0; i < ticketCount; i++) {
        const ticketNumber = startingTicketNumber + i;
        ticketPromises.push(
          buyTicket({
            competitionId: competition.id,
            userId: currentUser.uid,
            ticketNumber,
            isWinner: false
          })
        );
      }
      
      // Wait for all tickets to be purchased
      await Promise.all(ticketPromises);
      
      // Update user credits
      const newCredits = userCredits - totalCost;
      await updateUserCredits(currentUser.email, newCredits);
      setUserCredits(newCredits);
      
      // Show success message
      setSuccess(true);
      
      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setError('An error occurred while purchasing tickets. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // If competition is not active, don't show purchase form
  if (competition.status !== 'active') {
    return (
      <PurchaseContainer>
        <Title>Ticket Purchase</Title>
        <div>This competition is no longer accepting entries.</div>
      </PurchaseContainer>
    );
  }
  
  // If no tickets are available, show message
  if (maxTicketsAvailable <= 0) {
    return (
      <PurchaseContainer>
        <Title>Ticket Purchase</Title>
        <div>All tickets for this competition have been sold.</div>
      </PurchaseContainer>
    );
  }
  
  return (
    <PurchaseContainer>
      <Title>Purchase Tickets</Title>
      
      {success ? (
        <>
          <SuccessMessage>
            Congratulations! You have successfully purchased {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}.
          </SuccessMessage>
          <Button
            variant="primary"
            onClick={() => setSuccess(false)}
          >
            Purchase More Tickets
          </Button>
        </>
      ) : (
        <>
          <CreditsAvailable>
            <span>Available Credits:</span>
            <strong>{userCredits}</strong>
          </CreditsAvailable>
          
          <TicketControls>
            <TicketButton 
              onClick={handleDecrement}
              disabled={ticketCount <= 1 || isProcessing}
            >
              -
            </TicketButton>
            <TicketCount>{ticketCount}</TicketCount>
            <TicketButton 
              onClick={handleIncrement}
              disabled={ticketCount >= maxTickets || isProcessing}
            >
              +
            </TicketButton>
          </TicketControls>
          
          <PurchaseSummary>
            <SummaryRow>
              <div>Ticket Price:</div>
              <div>{competition.ticketPrice} credits</div>
            </SummaryRow>
            <SummaryRow>
              <div>Quantity:</div>
              <div>{ticketCount}</div>
            </SummaryRow>
            <SummaryRow>
              <div>Total:</div>
              <div>{totalCost} credits</div>
            </SummaryRow>
          </PurchaseSummary>
          
          {notEnoughCredits && (
            <CreditWarning>
              You don't have enough credits. Please add more credits or reduce the number of tickets.
            </CreditWarning>
          )}
          
          {error && (
            <div style={{ color: 'hsl(var(--destructive))', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={notEnoughCredits || isProcessing || ticketCount <= 0}
          >
            {isProcessing ? 'Processing...' : `Buy ${ticketCount} Ticket${ticketCount !== 1 ? 's' : ''}`}
          </Button>
        </>
      )}
    </PurchaseContainer>
  );
} 