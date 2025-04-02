import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { createSupportTicket, getCompetition, getUserTickets } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';

const FormContainer = styled.div`
  width: 100%;
  background: hsla(var(--background), 0.5);
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const FormHeader = styled.div`
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FormSubtitle = styled.p`
  margin: 0.75rem 0 0;
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
`;

const FormBody = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: hsl(var(--foreground));
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  color: hsl(var(--foreground));
  transition: all 0.2s ease;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  color: hsl(var(--foreground));
  transition: all 0.2s ease;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
  
  option {
    padding: 0.5rem;
  }
`;

const CompetitionSelect = styled(Select)`
  margin-top: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.875rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  color: hsl(var(--foreground));
  resize: vertical;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
`;

const ButtonContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
  padding: 0.875rem 1.75rem;
  background: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: hsl(265, 83%, 45%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: hsla(var(--destructive), 0.1);
  border-radius: 0.375rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InfoCard = styled.div`
  padding: 1rem;
  background-color: hsla(var(--muted), 0.2);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  border-left: 4px solid hsl(var(--primary));
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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
        <FormHeader>
          <FormTitle>Support Ticket</FormTitle>
          <FormSubtitle>You need to be logged in to create a support ticket.</FormSubtitle>
        </FormHeader>
        <FormBody>
          <ButtonContainer>
            <SubmitButton onClick={() => navigate('/login')}>
              Sign In
            </SubmitButton>
          </ButtonContainer>
        </FormBody>
      </FormContainer>
    );
  }

  if (success) {
    return (
      <FormContainer>
        <FormHeader>
          <FormTitle>Ticket Created Successfully</FormTitle>
          <FormSubtitle>We'll get back to you as soon as possible.</FormSubtitle>
        </FormHeader>
        <FormBody>
          <SuccessMessage>
            Your ticket has been created successfully. You can view its status in your tickets list.
          </SuccessMessage>
          {ticketId && (
            <InfoCard>
              <strong>Ticket ID:</strong> {ticketId}
            </InfoCard>
          )}
          <ButtonContainer>
            <SubmitButton 
              style={{ marginRight: '1rem' }}
              onClick={() => setSuccess(false)}
            >
              Create Another Ticket
            </SubmitButton>
            {ticketId && (
              <SubmitButton
                onClick={() => navigate(`/support?ticketId=${ticketId}`)}
              >
                View Ticket
              </SubmitButton>
            )}
          </ButtonContainer>
        </FormBody>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>
          {type === 'prize_collection' ? 'Prize Collection Request' : 'Support Ticket'}
        </FormTitle>
        <FormSubtitle>
          {type === 'prize_collection' 
            ? 'Fill out this form to arrange collection of your prize.'
            : 'Let us know how we can help you.'}
        </FormSubtitle>
      </FormHeader>
      
      <FormBody>
        {type === 'prize_collection' && wonCompetitions.length === 0 && (
          <InfoCard>
            You don't have any prizes to collect. If you believe this is an error, please create a support ticket instead.
          </InfoCard>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormRow>
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
          </FormRow>
          
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
          
          <ButtonContainer>
            <SubmitButton 
              type="submit"
              disabled={loading || (type === 'prize_collection' && wonCompetitions.length === 0)}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </SubmitButton>
          </ButtonContainer>
        </form>
      </FormBody>
    </FormContainer>
  );
} 