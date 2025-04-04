import React, { useState } from 'react';
import styled from '@emotion/styled';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

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

export function CompetitionProcessor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleProcessCompetitions = async () => {
    if (loading) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      // Get the Firebase functions instance with the correct region
      const functions = firebase.app().functions('europe-west2');
      const processCompetitions = functions.httpsCallable('manualProcessCompetitions');
      
      const response = await processCompetitions();
      const data = response.data as { success: boolean; processedCount: number };
      
      if (data.success) {
        setResult({
          success: true,
          message: `Successfully processed ${data.processedCount} competitions.`
        });
      } else {
        setResult({
          success: false,
          message: 'Error processing competitions.'
        });
      }
    } catch (error) {
      console.error('Error processing competitions:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Competition Processor</Title>
      <Description>
        Use this tool to manually process all competitions that have ended and are waiting to be completed.
        This will select winners for ended competitions using a fair and transparent selection algorithm.
      </Description>
      <Description>
        Note: Competitions are automatically processed every hour, but you can use this to process them immediately.
      </Description>
      
      <ButtonContainer>
        <Button 
          variant="primary" 
          onClick={handleProcessCompetitions}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Process Ended Competitions'}
        </Button>
      </ButtonContainer>
      
      {result && (
        <Status success={result.success}>
          {result.message}
        </Status>
      )}
    </Container>
  );
} 