import React, { useState } from 'react';
import styled from '@emotion/styled';
import { processCompetitions, endCompetition } from '../../services/competitionManager';
import { getActiveCompetitions, getCompletedCompetitions } from '../../services/firestore';

const Container = styled.div`
  padding: 1.5rem;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  border: 1px solid hsl(var(--border));
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  margin-bottom: 1.5rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'outline' | 'success' | 'destructive' }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: hsl(var(--primary));
          color: white;
          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        `;
      case 'success':
        return `
          background: rgb(22, 163, 74);
          color: white;
          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        `;
      case 'destructive':
        return `
          background: hsl(var(--destructive));
          color: white;
          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        `;
      default:
        return `
          background: transparent;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          &:hover:not(:disabled) {
            background: hsl(var(--accent));
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Status = styled.div<{ success?: boolean }>`
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  background-color: ${props => props.success 
    ? 'rgba(22, 163, 74, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.success 
    ? 'rgb(22, 163, 74)' 
    : 'rgb(239, 68, 68)'};
  font-size: 0.875rem;
`;

const CompetitionsList = styled.div`
  margin-top: 1.5rem;
`;

const CompetitionItem = styled.div`
  padding: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CompetitionInfo = styled.div`
  flex: 1;
`;

const CompetitionTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const CompetitionStatus = styled.div<{ status: string }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return 'rgba(22, 163, 74, 0.2)';
      case 'ending': return 'rgba(245, 158, 11, 0.2)';
      case 'complete': return 'rgba(37, 99, 235, 0.2)';
      case 'cancelled': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return 'rgb(22, 163, 74)';
      case 'ending': return 'rgb(245, 158, 11)';
      case 'complete': return 'rgb(37, 99, 235)';
      case 'cancelled': return 'rgb(239, 68, 68)';
      default: return 'rgb(107, 114, 128)';
    }
  }};
`;

const ActionButton = styled(Button)`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
`;

export function CompetitionProcessor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeCompetitions, setActiveCompetitions] = useState<any[]>([]);
  const [showCompetitions, setShowCompetitions] = useState(false);
  
  const runProcessor = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      await processCompetitions();
      setResult({
        success: true,
        message: 'Successfully processed competitions. Check console for details.'
      });
    } catch (error) {
      console.error('Error in competition processor:', error);
      setResult({
        success: false,
        message: `Error processing competitions: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadActiveCompetitions = async () => {
    setLoading(true);
    try {
      const competitions = await getActiveCompetitions();
      setActiveCompetitions(competitions);
      setShowCompetitions(true);
    } catch (error) {
      setResult({
        success: false,
        message: `Error loading competitions: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEndCompetition = async (competitionId: string) => {
    if (!confirm('Are you sure you want to end this competition?')) {
      return;
    }
    
    setLoading(true);
    try {
      const success = await endCompetition(competitionId);
      
      if (success) {
        setResult({
          success: true,
          message: `Successfully ended competition ${competitionId}`
        });
        
        // Refresh the list
        const competitions = await getActiveCompetitions();
        setActiveCompetitions(competitions);
      } else {
        setResult({
          success: false,
          message: `Failed to end competition ${competitionId}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error ending competition: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Title>Competition Processor</Title>
      <Description>
        This tool allows you to manually trigger the competition processing system.
        It will check for competitions that have ended and automatically select winners
        using the verifiable random drawing system.
      </Description>
      
      <ButtonContainer>
        <Button 
          variant="primary" 
          onClick={runProcessor}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Process All Competitions'}
        </Button>
        
        <Button
          variant="outline"
          onClick={loadActiveCompetitions}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Active Competitions'}
        </Button>
      </ButtonContainer>
      
      {result && (
        <Status success={result.success}>
          {result.message}
        </Status>
      )}
      
      {showCompetitions && (
        <CompetitionsList>
          <h3 style={{ marginBottom: '1rem' }}>Active Competitions</h3>
          
          {activeCompetitions.length === 0 ? (
            <p>No active competitions found.</p>
          ) : (
            activeCompetitions.map(competition => (
              <CompetitionItem key={competition.id}>
                <CompetitionInfo>
                  <CompetitionTitle>{competition.title}</CompetitionTitle>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                    Tickets: {competition.ticketsSold} / {competition.totalTickets}
                  </div>
                  <CompetitionStatus status={competition.status}>
                    {competition.status}
                  </CompetitionStatus>
                </CompetitionInfo>
                
                <ActionButton
                  variant="destructive"
                  onClick={() => handleEndCompetition(competition.id)}
                  disabled={loading}
                >
                  End Now
                </ActionButton>
              </CompetitionItem>
            ))
          )}
        </CompetitionsList>
      )}
    </Container>
  );
} 