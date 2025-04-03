import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { createCompetition, getCompetition, updateCompetition } from '../../services/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Styled components
const FormContainer = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: hsl(var(--foreground));
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SplitRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
`;

const Button = styled.button`
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: white;

  &:hover {
    background-color: hsl(var(--primary) / 0.9);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));

  &:hover {
    background-color: hsl(var(--muted) / 0.3);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

interface AdminCompetitionFormProps {
  competitionId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function AdminCompetitionForm({ competitionId, onCancel, onSuccess }: AdminCompetitionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    prizeValue: '',
    imageUrl: '',
    difficulty: 'medium',
    ticketPrice: 3,
    totalTickets: 500,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    status: 'active',
    triviaQuestion: '',
    triviaAnswer: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch competition data if editing an existing competition
  useEffect(() => {
    const fetchCompetitionData = async () => {
      if (!competitionId) return;
      
      setIsLoading(true);
      try {
        const competition = await getCompetition(competitionId);
        
        if (competition) {
          // Convert Firestore timestamp to date string for the form
          const endsAtDate = competition.endsAt.toDate().toISOString().split('T')[0];
          
          setFormData({
            title: competition.title || '',
            description: competition.description || '',
            prize: competition.prize || '',
            prizeValue: competition.prizeValue || '',
            imageUrl: competition.imageUrl || '',
            difficulty: competition.difficulty || 'medium',
            ticketPrice: competition.ticketPrice || 3,
            totalTickets: competition.totalTickets || 500,
            endsAt: endsAtDate,
            status: competition.status || 'active',
            triviaQuestion: competition.triviaQuestion || '',
            triviaAnswer: competition.triviaAnswer || ''
          });
        } else {
          setError('Competition not found');
        }
      } catch (err: any) {
        console.error('Error fetching competition:', err);
        setError(err.message || 'An error occurred while fetching the competition');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompetitionData();
  }, [competitionId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.prize || 
          !formData.prizeValue || !formData.ticketPrice || !formData.totalTickets || 
          !formData.endsAt || !formData.triviaQuestion || !formData.triviaAnswer) {
        throw new Error('Please fill in all required fields.');
      }
      
      // Validate ticket price and total tickets
      if (Number(formData.ticketPrice) <= 0) {
        throw new Error('Ticket price must be greater than 0.');
      }
      
      if (Number(formData.totalTickets) <= 0) {
        throw new Error('Total tickets must be greater than 0.');
      }
      
      // Validate end date
      const endDate = new Date(formData.endsAt);
      
      if (endDate <= new Date()) {
        throw new Error('End date must be in the future.');
      }
      
      // Prepare data object with correct types for Firestore
      const data = {
        ...formData,
        ticketPrice: Number(formData.ticketPrice),
        totalTickets: Number(formData.totalTickets),
        status: formData.status as 'active' | 'ending',
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        endsAt: firebase.firestore.Timestamp.fromDate(endDate)
      };
      
      if (competitionId) {
        // Update existing competition
        await updateCompetition(competitionId, data);
        alert('Competition updated successfully!');
      } else {
        // Create new competition
        await createCompetition(data);
        alert('Competition created successfully!');
      }
      
      if (onSuccess) onSuccess();
      else onCancel();
    } catch (err: any) {
      console.error('Error saving competition:', err);
      setError(err.message || 'An error occurred while saving the competition.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <FormContainer>
        <FormTitle>Loading competition data...</FormTitle>
      </FormContainer>
    );
  }
  
  return (
    <FormContainer>
      <FormTitle>{competitionId ? 'Edit Competition' : 'Create New Competition'}</FormTitle>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title*</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Dragon Slayer Challenge"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description*</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about the competition and prizes"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
            Provide a URL to an image for this competition (optional)
          </div>
        </FormGroup>
        
        <SplitRow>
          <FormGroup>
            <Label htmlFor="prize">Prize*</Label>
            <Input
              id="prize"
              name="prize"
              value={formData.prize}
              onChange={handleChange}
              placeholder="e.g. Dragon Gear + 100M OSRS Gold"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="prizeValue">Prize Value Display*</Label>
            <Input
              id="prizeValue"
              name="prizeValue"
              value={formData.prizeValue}
              onChange={handleChange}
              placeholder="e.g. 100M OSRS Gold"
              required
            />
          </FormGroup>
        </SplitRow>
        
        <SplitRow>
          <FormGroup>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="ending">Ending Soon</option>
            </Select>
          </FormGroup>
        </SplitRow>
        
        <SplitRow>
          <FormGroup>
            <Label htmlFor="ticketPrice">Ticket Price (Credits)*</Label>
            <Input
              id="ticketPrice"
              name="ticketPrice"
              type="number"
              min="1"
              value={formData.ticketPrice}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="totalTickets">Total Tickets*</Label>
            <Input
              id="totalTickets"
              name="totalTickets"
              type="number"
              min="1"
              value={formData.totalTickets}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </SplitRow>
        
        <FormGroup>
          <Label htmlFor="endsAt">End Date*</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="date"
            value={formData.endsAt}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="triviaQuestion">Trivia Question*</Label>
          <TextArea
            id="triviaQuestion"
            name="triviaQuestion"
            value={formData.triviaQuestion}
            onChange={handleChange}
            placeholder="Enter a RuneScape related trivia question"
            required
          />
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
            Trivia questions help classify competitions as skill-based contests
          </div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="triviaAnswer">Correct Answer*</Label>
          <Input
            id="triviaAnswer"
            name="triviaAnswer"
            value={formData.triviaAnswer}
            onChange={handleChange}
            placeholder="Enter the correct answer to the trivia question"
            required
          />
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonsContainer>
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? competitionId ? 'Updating...' : 'Creating...' 
              : competitionId ? 'Update Competition' : 'Create Competition'
            }
          </PrimaryButton>
        </ButtonsContainer>
      </Form>
    </FormContainer>
  );
} 