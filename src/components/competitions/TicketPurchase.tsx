import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { buyTicket, updateUserCredits, getUserCompetitionTickets } from '../../services/firestore';
import { Competition } from '../../services/firestore';
import toast from '../../utils/toast';

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
  flex-direction: column;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Slider = styled.input`
  flex-grow: 1;
  height: 8px;
  appearance: none;
  background: hsl(var(--secondary) / 0.2);
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const TicketCount = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  padding: 0 1rem;
  min-width: 3rem;
  text-align: center;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
`;

const LimitWarning = styled.div`
  font-size: 0.75rem;
  color: hsl(var(--warning));
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WarningIcon = styled.span`
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  background: hsl(var(--warning) / 0.2);
  color: hsl(var(--warning));
  border-radius: 50%;
  font-weight: bold;
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
  onPurchase?: (count: number) => Promise<void>;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  userEntries?: number;
}

export default function TicketPurchase({ 
  competition, 
  onPurchaseComplete,
  ticketCount: externalTicketCount,
  ticketPrice: externalTicketPrice,
  onIncrement: externalIncrement,
  onDecrement: externalDecrement,
  onPurchase: externalPurchase,
  loading: externalLoading,
  success: externalSuccess,
  disabled: externalDisabled,
  userEntries
}: TicketPurchaseProps) {
  const { currentUser, userCredits, setUserCredits } = useAuth();
  const [internalTicketCount, setInternalTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPurchasedTickets, setUserPurchasedTickets] = useState(0);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [availableTickets, setAvailableTickets] = useState<number>(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  const ticketCount = externalTicketCount !== undefined ? externalTicketCount : internalTicketCount;
  const ticketPrice = externalTicketPrice !== undefined ? externalTicketPrice : competition?.ticketPrice || 0;
  const isLoading = externalLoading !== undefined ? externalLoading : isProcessing;
  const isSuccess = externalSuccess !== undefined ? externalSuccess : internalSuccess;
  const isDisabled = externalDisabled !== undefined ? externalDisabled : false;
  
  // Default maximum tickets per user is 30, but competitions can override this
  const maxTicketsPerUser = competition?.maxTicketsPerUser || 30;
  
  useEffect(() => {
    if (competition && currentUser) {
      setInternalTicketCount(1);
      setInternalSuccess(false);
      setError(null);
      
      // Load user's already purchased tickets
      const loadUserTickets = async () => {
        if (!competition.id || !currentUser.uid) return;
        
        setIsLoadingTickets(true);
        try {
          const tickets = await getUserCompetitionTickets(currentUser.uid, competition.id);
          setUserPurchasedTickets(tickets.length);
        } catch (err) {
          console.error("Error loading user tickets:", err);
        } finally {
          setIsLoadingTickets(false);
        }
      };
      
      loadUserTickets();
    }
  }, [competition, currentUser]);
  
  useEffect(() => {
    if (competition?.maxTicketsPerUser && userEntries) {
      const purchased = userEntries || 0;
      const remaining = competition.maxTicketsPerUser - purchased;
      setUserPurchasedTickets(purchased);
      setAvailableTickets(remaining);
      
      // Reset ticket count if it's more than available
      if (ticketCount > remaining) {
        setInternalTicketCount(Math.max(1, remaining));
      }
    }
  }, [competition, userEntries, ticketCount]);
  
  const maxTicketsAvailable = competition ? competition.totalTickets - competition.ticketsSold : 99;
  const maxTicketsAffordable = Math.floor(userCredits / ticketPrice);
  const remainingUserQuota = maxTicketsPerUser - userPurchasedTickets;
  const maxTickets = Math.min(maxTicketsAvailable, maxTicketsAffordable, remainingUserQuota);
  
  const totalCost = ticketCount * ticketPrice;
  const notEnoughCredits = userCredits < totalCost;
  
  // Override the increment function to respect ticket limits
  const incrementTickets = () => {
    if (externalIncrement) {
      externalIncrement();
      return;
    }
    
    // Calculate remaining tickets the user can purchase
    const maxTicketsAllowed = maxTicketsPerUser - userPurchasedTickets;
    
    // Don't increment if at the limit
    if (internalTicketCount >= maxTicketsAllowed) {
      return;
    }
    
    setInternalTicketCount(prevCount => prevCount + 1);
  };
  
  const handleIncrement = () => {
    if (externalIncrement) {
      externalIncrement();
    } else {
      incrementTickets();
    }
  };
  
  const handleDecrement = () => {
    if (externalDecrement) {
      externalDecrement();
    } else if (internalTicketCount > 1) {
      setInternalTicketCount(prevCount => prevCount - 1);
    }
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    if (externalTicketCount !== undefined) {
      // If we're controlled externally, we need to call increment/decrement
      // the right number of times to reach the desired value
      const diff = value - ticketCount;
      
      if (diff > 0) {
        // Need to increment
        for (let i = 0; i < diff; i++) {
          externalIncrement && externalIncrement();
        }
      } else if (diff < 0) {
        // Need to decrement
        for (let i = 0; i < Math.abs(diff); i++) {
          externalDecrement && externalDecrement();
        }
      }
    } else {
      // We control our own state
      setInternalTicketCount(value);
    }
  };
  
  const handlePurchase = async () => {
    if (externalPurchase) {
      await externalPurchase(ticketCount);
      return;
    }
    
    if (!currentUser || !competition?.id) return;
    if (notEnoughCredits) return;
    if (userPurchasedTickets + ticketCount > maxTicketsPerUser) {
      setError(`You can only purchase a maximum of ${maxTicketsPerUser} tickets per competition`);
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Use the new buyTicket function signature
      await buyTicket(currentUser.uid, competition.id, ticketCount);
      
      const newCredits = userCredits - totalCost;
      if (currentUser.email) {
        await updateUserCredits(currentUser.email, newCredits);
        setUserCredits(newCredits);
      }
      
      // Update local state with new purchased tickets count
      setUserPurchasedTickets(prevCount => prevCount + ticketCount);
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
  
  const isAtMaxQuota = userPurchasedTickets >= maxTicketsPerUser;
  const isApproachingQuota = userPurchasedTickets + ticketCount >= maxTicketsPerUser;
  
  // Calculate max tickets user can purchase based on:
  // 1. Available tickets in competition
  // 2. User's credits
  // 3. Maximum tickets per user limit
  const maxTicketsUserCanBuy = Math.min(
    // Limited by available tickets
    competition ? competition.totalTickets - competition.ticketsSold : 99,
    // Limited by user's credits
    ticketPrice > 0 ? Math.floor(userCredits / ticketPrice) : 99,
    // Limited by the per-user maximum
    maxTicketsPerUser - userPurchasedTickets
  );
  
  return (
    <PurchaseContainer>
      <Title>Purchase Tickets</Title>
      
      {isSuccess && (
        <SuccessMessage>
          Successfully purchased {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}!
        </SuccessMessage>
      )}
      
      {error && (
        <CreditWarning>{error}</CreditWarning>
      )}
      
      <CreditsAvailable>
        You have <strong>{userCredits} credits</strong> available.
      </CreditsAvailable>
      
      {isAtMaxQuota ? (
        <CreditWarning>
          You've reached the maximum number of tickets ({maxTicketsPerUser}) allowed for this competition.
        </CreditWarning>
      ) : (
        <>
          <TicketControls>
            <SliderContainer>
              <SliderRow>
                <Slider 
                  type="range" 
                  min={1} 
                  max={maxTicketsUserCanBuy} 
                  value={ticketCount}
                  onChange={handleSliderChange}
                  disabled={isLoading || isDisabled || maxTicketsUserCanBuy <= 0 || isAtMaxQuota}
                  ref={sliderRef}
                />
                <TicketCount>{ticketCount}</TicketCount>
              </SliderRow>
              <SliderLabels>
                <span>1</span>
                <span>{maxTicketsUserCanBuy}</span>
              </SliderLabels>
              
              {isApproachingQuota && (
                <LimitWarning>
                  <WarningIcon>!</WarningIcon>
                  You're approaching the limit of {maxTicketsPerUser} tickets per competition
                </LimitWarning>
              )}
              
              {userPurchasedTickets > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                  You've already purchased {userPurchasedTickets} ticket{userPurchasedTickets !== 1 ? 's' : ''} ({remainingUserQuota} remaining)
                </div>
              )}
            </SliderContainer>
          </TicketControls>
          
          {ticketCount > 0 && (
            <PurchaseSummary>
              <SummaryRow>
                <div>Price per ticket:</div>
                <div>{ticketPrice} credits</div>
              </SummaryRow>
              <SummaryRow>
                <div>Number of tickets:</div>
                <div>{ticketCount}</div>
              </SummaryRow>
              <SummaryRow>
                <div>Total:</div>
                <div>{totalCost} credits</div>
              </SummaryRow>
            </PurchaseSummary>
          )}
          
          {/* Credit warning if not enough */}
          {notEnoughCredits && (
            <CreditWarning>
              You don't have enough credits for {ticketCount} tickets. Please add more credits or reduce the number of tickets.
            </CreditWarning>
          )}
          
          {/* Ticket limit warnings */}
          {isAtMaxQuota && (
            <LimitWarning>
              <WarningIcon>!</WarningIcon>
              You've reached your maximum ticket limit ({maxTicketsPerUser}) for this competition.
            </LimitWarning>
          )}
          
          {!isAtMaxQuota && isApproachingQuota && (
            <LimitWarning>
              <WarningIcon>!</WarningIcon>
              You've purchased {userPurchasedTickets} tickets already. Adding {ticketCount} more will bring your total to {userPurchasedTickets + ticketCount} of your {maxTicketsPerUser} ticket limit.
            </LimitWarning>
          )}
          
          {/* Show loading state when checking user's tickets */}
          {isLoadingTickets && (
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
              Checking your ticket purchases...
            </div>
          )}
          
          <Button 
            variant="primary"
            onClick={handlePurchase}
            disabled={
              isLoading || 
              isDisabled || 
              ticketCount <= 0 || 
              notEnoughCredits || 
              maxTicketsUserCanBuy <= 0 ||
              isAtMaxQuota
            }
          >
            {isLoading ? 'Processing...' : `Buy ${ticketCount} Ticket${ticketCount !== 1 ? 's' : ''}`}
          </Button>
        </>
      )}
    </PurchaseContainer>
  );
} 