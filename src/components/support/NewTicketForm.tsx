import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { createSupportTicket, getCompetition, getUserTickets } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const FormDescription = styled.p`
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  color: hsl(var(--foreground));
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  color: hsl(var(--foreground));
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }
`;

const CompetitionSelect = styled(Select)`
  margin-top: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  color: hsl(var(--foreground));
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1rem;
  background: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const InfoCard = styled.div`
  padding: 1rem;
  background-color: hsl(var(--accent));
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

interface NewTicketFormProps {
  onSuccess?: (ticketId: string) => void;
  initialType?: 'prize_collection' | 'support' | 'refund' | 'other';
  competitionId?: string;
}

export function NewTicketForm({ 
  onSuccess, 
  initialType = 'support',
  competitionId: initialCompetitionId 
}: NewTicketFormProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState(initialType);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [competitionId, setCompetitionId] = useState(initialCompetitionId || '');
  const [inGameName, setInGameName] = useState('');
  const [wonCompetitions, setWonCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    // If this is a prize collection ticket, load the user's won competitions
    if (type === 'prize_collection' && currentUser) {
      const loadWonCompetitions = async () => {
        try {
          // Get user tickets
          const tickets = await getUserTickets(currentUser.uid);
          
          // Find winning tickets
          const winningTickets = tickets.filter(ticket => ticket.isWinner);
          
          if (winningTickets.length === 0) {
            return;
          }
          
          // Get competition details for each winning ticket
          const competitions = await Promise.all(
            winningTickets.map(ticket => getCompetition(ticket.competitionId))
          );
          
          // Filter out null values and competitions that don't have this user as winner
          const userWonCompetitions = competitions
            .filter((comp): comp is NonNullable<typeof comp> => 
              comp !== null && comp.winner !== undefined && comp.winner.userId === currentUser.uid);
          
          setWonCompetitions(userWonCompetitions);
          
          // If we have a competitionId from props, use it
          if (initialCompetitionId) {
            setCompetitionId(initialCompetitionId);
            
            // Pre-fill subject
            const competition = userWonCompetitions.find(c => c.id === initialCompetitionId);
            if (competition) {
              setSubject(`Prize Collection: ${competition.title}`);
            }
          } else if (userWonCompetitions.length > 0) {
            // Otherwise use the first won competition
            const firstComp = userWonCompetitions[0];
            if (firstComp && firstComp.id) {
              setCompetitionId(firstComp.id);
              setSubject(`Prize Collection: ${firstComp.title}`);
            }
          }
        } catch (error) {
          console.error('Error loading won competitions:', error);
          setError('Failed to load your winning competitions. Please try again.');
        }
      };
      
      loadWonCompetitions();
    }
  }, [type, currentUser, initialCompetitionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentUser.email) {
      setError('You must be logged in to create a support ticket');
      return;
    }
    
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    if (type === 'prize_collection' && !competitionId) {
      setError('Please select a competition');
      return;
    }
    
    if (type === 'prize_collection' && !inGameName.trim()) {
      setError('Please enter your in-game name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the ticket data
      interface TicketData {
        userId: string;
        userEmail: string;
        type: 'prize_collection' | 'support' | 'refund' | 'other';
        priority: 'low' | 'medium' | 'high';
        subject: string;
        description: string;
        competitionId?: string;
      }
      
      const ticketData: TicketData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        type,
        priority,
        subject,
        description: type === 'prize_collection' 
          ? `${description}\n\nIn-game name: ${inGameName}` 
          : description,
      };
      
      // Only add competitionId if it exists and type is prize_collection
      if (type === 'prize_collection' && competitionId) {
        ticketData.competitionId = competitionId;
      }
      
      // Create the ticket
      const newTicketId = await createSupportTicket(ticketData);
      setTicketId(newTicketId);
      setSuccess(true);
      
      // Reset form if not redirecting
      if (!onSuccess) {
        setSubject('');
        setDescription('');
        setPriority('medium');
        setInGameName('');
      } else {
        onSuccess(newTicketId);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <FormContainer>
        <FormTitle>Support Ticket</FormTitle>
        <FormDescription>
          You need to be logged in to create a support ticket.
        </FormDescription>
        <SubmitButton 
          onClick={() => navigate('/login')}
        >
          Sign In
        </SubmitButton>
      </FormContainer>
    );
  }

  if (success) {
    return (
      <FormContainer>
        <FormTitle>Ticket Created Successfully</FormTitle>
        <SuccessMessage>
          Your ticket has been created successfully. We'll get back to you as soon as possible.
        </SuccessMessage>
        {ticketId && (
          <InfoCard>
            <strong>Ticket ID:</strong> {ticketId}
          </InfoCard>
        )}
        <SubmitButton 
          onClick={() => navigate('/profile')}
        >
          View Your Tickets
        </SubmitButton>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormTitle>
        {type === 'prize_collection' ? 'Prize Collection Request' : 'Support Ticket'}
      </FormTitle>
      
      <FormDescription>
        {type === 'prize_collection' 
          ? 'Fill out this form to arrange collection of your prize.'
          : 'Let us know how we can help you.'}
      </FormDescription>
      
      {type === 'prize_collection' && wonCompetitions.length === 0 && (
        <InfoCard>
          You don't have any prizes to collect. If you believe this is an error, please create a support ticket instead.
        </InfoCard>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="type">Ticket Type</Label>
          <Select 
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="support">General Support</option>
            <option value="prize_collection">Prize Collection</option>
            <option value="refund">Refund Request</option>
            <option value="other">Other</option>
          </Select>
        </FormGroup>
        
        {type === 'prize_collection' && (
          <FormGroup>
            <Label>Select Prize</Label>
            <CompetitionSelect
              value={competitionId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setCompetitionId(selectedId);
                
                // Update subject based on selected competition
                const competition = wonCompetitions.find(c => c.id === selectedId);
                if (competition) {
                  setSubject(`Prize Collection: ${competition.title}`);
                }
              }}
              disabled={wonCompetitions.length === 0}
            >
              <option value="">Select a competition</option>
              {wonCompetitions.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.title} - {comp.prize}
                </option>
              ))}
            </CompetitionSelect>
          </FormGroup>
        )}
        
        <FormGroup>
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
            required
          />
        </FormGroup>
        
        {type === 'prize_collection' && (
          <FormGroup>
            <Label htmlFor="inGameName">Your In-Game Name</Label>
            <Input 
              id="inGameName"
              type="text"
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="Your RuneScape username"
              required
            />
          </FormGroup>
        )}
        
        <FormGroup>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'prize_collection' 
              ? "Please let us know your preferred time for prize collection and any other relevant details."
              : "Please describe your issue in detail."
            }
            required
          />
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <SubmitButton 
          type="submit"
          disabled={loading || (type === 'prize_collection' && wonCompetitions.length === 0)}
        >
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
} 