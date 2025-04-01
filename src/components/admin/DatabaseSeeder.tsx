import React, { useState } from 'react';
import styled from '@emotion/styled';
import { seedDatabase } from '@/utils/seedData';

const Container = styled.div`
  padding: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
`;

const SeedButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 0;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ResultMessage = styled.div<{ success?: boolean }>`
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.success ? '#dff0d8' : '#f2dede'};
  color: ${props => props.success ? '#3c763d' : '#a94442'};
`;

export default function DatabaseSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);
    
    try {
      const success = await seedDatabase();
      
      if (success) {
        setResult({
          success: true,
          message: 'Database seeded successfully!'
        });
      } else {
        setResult({
          success: false,
          message: 'Failed to seed database. Check console for errors.'
        });
      }
    } catch (error) {
      console.error('Error in seed operation:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSeeding(false);
    }
  };
  
  return (
    <Container>
      <Title>Database Seeder</Title>
      <Description>
        Use this tool to seed the database with sample data for testing. 
        This will add sample users, competitions, and completed competitions.
      </Description>
      
      <SeedButton onClick={handleSeed} disabled={seeding}>
        {seeding ? 'Seeding...' : 'Seed Database'}
      </SeedButton>
      
      {result && (
        <ResultMessage success={result.success}>
          {result.message}
        </ResultMessage>
      )}
    </Container>
  );
} 