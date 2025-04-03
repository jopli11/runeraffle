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
  competition?: Competition;
  onPurchaseComplete?: () => void;
  ticketCount?: number;
  ticketPrice?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onPurchase?: () => Promise<void>;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
}

export function TicketPurchase({ 
  competition, 
  onPurchaseComplete,
  ticketCount: externalTicketCount,
  ticketPrice: externalTicketPrice,
  onIncrement: externalIncrement,
  onDecrement: externalDecrement,
  onPurchase: externalPurchase,
  loading: externalLoading,
  success: externalSuccess,
  disabled: externalDisabled
}: TicketPurchaseProps) {
  const { currentUser, userCredits, setUserCredits } = useAuth();
  const [internalTicketCount, setInternalTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const ticketCount = externalTicketCount !== undefined ? externalTicketCount : internalTicketCount;
  const ticketPrice = externalTicketPrice !== undefined ? externalTicketPrice : competition?.ticketPrice || 0;
  const isLoading = externalLoading !== undefined ? externalLoading : isProcessing;
  const isSuccess = externalSuccess !== undefined ? externalSuccess : internalSuccess;
  const isDisabled = externalDisabled !== undefined ? externalDisabled : false;
  
  useEffect(() => {
    if (competition) {
      setInternalTicketCount(1);
      setInternalSuccess(false);
      setError(null);
    }
  }, [competition?.id]);
  
  const maxTicketsAvailable = competition ? competition.totalTickets - competition.ticketsSold : 99;
  const maxTicketsAffordable = Math.floor(userCredits / ticketPrice);
  const maxTickets = Math.min(maxTicketsAvailable, maxTicketsAffordable, 10);
  
  const totalCost = ticketCount * ticketPrice;
  const notEnoughCredits = userCredits < totalCost;
  
  const handleIncrement = () => {
    if (externalIncrement) {
      externalIncrement();
    } else if (ticketCount < maxTickets) {
      setInternalTicketCount(prev => prev + 1);
    }
  };
  
  const handleDecrement = () => {
    if (externalDecrement) {
      externalDecrement();
    } else if (ticketCount > 1) {
      setInternalTicketCount(prev => prev - 1);
    }
  };
  
  const handlePurchase = async () => {
    if (externalPurchase) {
      await externalPurchase();
      return;
    }
    
    if (!currentUser || !competition?.id) return;
    if (notEnoughCredits) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const startingTicketNumber = competition.ticketsSold + 1;
      
      const ticketPromises = [];
      for (let i = 0; i < ticketCount; i++) {
        const ticketNumber = startingTicketNumber + i;
        ticketPromises.push(
          buyTicket({
            competitionId: competition.id,
            userId: currentUser.uid,
            ticketNumber
          })
        );
      }
      
      await Promise.all(ticketPromises);
      
      const newCredits = userCredits - totalCost;
      if (currentUser.email) {
        await updateUserCredits(currentUser.email, newCredits);
        setUserCredits(newCredits);
      }
      
      setInternalSuccess(true);
      
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
      
      setTimeout(() => {
        setInternalSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error purchasing tickets:', err);
      setError(err.message || 'Failed to purchase tickets');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (competition?.status !== 'active') {
    return (
      <PurchaseContainer>
        <Title>Ticket Purchase</Title>
        <div>This competition is no longer accepting entries.</div>
      </PurchaseContainer>
    );
  }
  
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
      
      {isSuccess ? (
        <>
          <SuccessMessage>
            Congratulations! You have successfully purchased {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}.
          </SuccessMessage>
          <Button
            variant="primary"
            onClick={() => setInternalSuccess(false)}
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
              disabled={ticketCount <= 1 || isLoading}
            >
              -
            </TicketButton>
            <TicketCount>{ticketCount}</TicketCount>
            <TicketButton 
              onClick={handleIncrement}
              disabled={ticketCount >= maxTickets || isLoading}
            >
              +
            </TicketButton>
          </TicketControls>
          
          <PurchaseSummary>
            <SummaryRow>
              <div>Ticket Price:</div>
              <div>{ticketPrice} credits</div>
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
            disabled={notEnoughCredits || isLoading || ticketCount <= 0}
          >
            {isLoading ? 'Processing...' : `Buy ${ticketCount} Ticket${ticketCount !== 1 ? 's' : ''}`}
          </Button>
        </>
      )}
    </PurchaseContainer>
  );
} 