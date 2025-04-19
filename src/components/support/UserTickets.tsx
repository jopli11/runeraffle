import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { getUserSupportTickets, SupportTicket, getTicketMessages, TicketMessage, addTicketMessage } from '../../services/firestore';
import { useLocation, useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
  background: transparent;
  border-radius: 0.75rem;
  overflow: hidden;
`;

const Title = styled.h2`
  display: none; /* Hide this as we already have a title in the support section */
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: hsl(var(--muted-foreground));
  background: hsla(var(--muted), 0.03);
  border-radius: 0.75rem;
  border: 1px dashed hsl(var(--border));
`;

const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: none;
  overflow-y: visible;
  
  @media (min-width: 1024px) {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 1rem;
  }
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: hsla(var(--muted), 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: hsla(var(--muted), 0.5);
    border-radius: 3px;
  }
`;

const TicketItem = styled.div<{ isSelected?: boolean }>`
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: ${props => props.isSelected ? 'hsla(var(--primary), 0.08)' : 'hsla(var(--background), 0.8)'};
  border: 1px solid ${props => props.isSelected ? 'hsla(var(--primary), 0.3)' : 'hsl(var(--border))'};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.isSelected ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    background: hsla(var(--primary), 0.05);
    border-color: hsla(var(--primary), 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const TicketTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const TicketStatus = styled.span<{ status: string }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'open': return 'rgba(22, 163, 74, 0.6)';
      case 'in_progress': return 'rgba(234, 181, 22, 0.6)';
      case 'resolved': return 'rgba(234, 181, 22, 0.6)';
      case 'closed': return 'rgba(107, 114, 128, 0.6)';
      default: return 'rgba(107, 114, 128, 0.6)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'open': return 'rgb(240, 253, 244)';
      case 'in_progress': return 'rgb(20, 20, 43)';
      case 'resolved': return 'rgb(20, 20, 43)';
      case 'closed': return 'rgb(228, 228, 231)';
      default: return 'rgb(228, 228, 231)';
    }
  }};
`;

const TicketType = styled.span<{ type: string }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  margin-right: 0.5rem;
  background-color: ${props => {
    switch (props.type) {
      case 'prize_collection': return 'rgba(239, 68, 68, 0.6)';
      case 'support': return 'rgba(234, 181, 22, 0.6)';
      case 'refund': return 'rgba(245, 158, 11, 0.6)';
      default: return 'rgba(107, 114, 128, 0.6)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'prize_collection': return 'rgb(254, 226, 226)';
      case 'support': return 'rgb(20, 20, 43)';
      case 'refund': return 'rgb(254, 243, 199)';
      default: return 'rgb(228, 228, 231)';
    }
  }};
`;

const TicketFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.5rem;
`;

const TicketDate = styled.span``;

const TicketMetadata = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const TicketDetails = styled.div`
  margin-top: 0;
  padding: 2rem;
  background: hsla(var(--background), 0.5);
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: hsl(var(--primary));
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 2.5rem;
      height: 2px;
      background-color: hsl(var(--primary));
    }
  }
`;

const TicketInfo = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: hsla(var(--background), 0.3);
  border: 1px solid hsla(var(--border), 0.5);
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  align-items: center;
`;

const InfoLabel = styled.div`
  width: 120px;
  font-weight: 600;
  color: hsl(var(--primary));
`;

const InfoValue = styled.div`
  flex: 1;
  font-weight: 500;
`;

const Description = styled.div`
  padding: 1.5rem;
  background: hsla(var(--background), 0.3);
  border-radius: 0.5rem;
  white-space: pre-wrap;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  border: 1px solid hsla(var(--border), 0.5);
`;

const Messages = styled.div`
  margin-top: 1.5rem;
`;

const MessagesTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 3rem;
    height: 2px;
    background-color: hsl(var(--primary));
  }
`;

const Message = styled.div<{ isAdmin?: boolean }>`
  display: flex;
  margin-bottom: 1.5rem;
  flex-direction: ${props => props.isAdmin ? 'row' : 'row-reverse'};
`;

const MessageAvatar = styled.div<{ isAdmin?: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: ${props => props.isAdmin ? 'rgba(37, 99, 235, 0.2)' : 'rgba(22, 163, 74, 0.2)'};
  color: ${props => props.isAdmin ? 'rgb(37, 99, 235)' : 'rgb(22, 163, 74)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: ${props => props.isAdmin ? '0.75rem' : '0'};
  margin-left: ${props => props.isAdmin ? '0' : '0.75rem'};
`;

const MessageContent = styled.div<{ isAdmin?: boolean }>`
  max-width: 80%;
  background: ${props => props.isAdmin ? 'rgba(37, 99, 235, 0.1)' : 'rgba(22, 163, 74, 0.1)'};
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${props => props.isAdmin ? 'rgba(37, 99, 235, 0.1)' : 'rgba(22, 163, 74, 0.1)'};
    border-bottom: 0;
    top: 0.75rem;
    left: ${props => props.isAdmin ? '-8px' : 'auto'};
    right: ${props => props.isAdmin ? 'auto' : '-8px'};
    border-left-color: ${props => props.isAdmin ? 'transparent' : 'rgba(22, 163, 74, 0.1)'};
    border-right-color: ${props => props.isAdmin ? 'rgba(37, 99, 235, 0.1)' : 'transparent'};
  }
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  font-size: 0.875rem;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.375rem;
  text-align: right;
`;

const ReplyForm = styled.form`
  margin-top: 1.5rem;
`;

const ReplyInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  color: hsl(var(--foreground));
  resize: vertical;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }
`;

const Button = styled.button`
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

const NoTicketSelected = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  background: hsla(var(--muted), 0.03);
  border-radius: 0.75rem;
  border: 1px dashed hsl(var(--border));
  
  svg {
    margin-bottom: 1.5rem;
    color: hsla(var(--muted), 0.5);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 3fr;
  }
`;

const TicketsListContainer = styled.div`
  @media (max-width: 1024px) {
    display: ${props => props.hidden ? 'none' : 'block'};
  }
`;

const TicketDetailsContainer = styled.div`
  @media (max-width: 1024px) {
    display: ${props => props.hidden ? 'none' : 'block'};
  }
`;

const BackButton = styled.button`
  display: none;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.75rem;
  color: hsl(var(--primary));
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: 500;
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  } catch (error) {
    return 'N/A';
  }
};

// Add interface for component props
interface UserTicketsProps {
  onTicketUpdate?: () => void;
  initialTicketId?: string;
}

const UserTickets: React.FC<UserTicketsProps> = ({ onTicketUpdate, initialTicketId }) => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters
  const getQueryParam = (name: string): string | null => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(name);
  };

  useEffect(() => {
    const loadTickets = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userTickets = await getUserSupportTickets(currentUser.uid);
        setTickets(userTickets);
        
        // Check for ticketId in URL or from props
        const ticketIdToLoad = getQueryParam('ticketId') || initialTicketId;
        console.log('Looking for ticket ID:', ticketIdToLoad);
        
        if (ticketIdToLoad) {
          // Find the ticket in the loaded tickets
          const ticketToSelect = userTickets.find(ticket => ticket.id === ticketIdToLoad);
          
          if (ticketToSelect) {
            console.log('Found ticket:', ticketToSelect.subject);
            setSelectedTicket(ticketToSelect);
            
            // Load messages for this ticket
            if (ticketToSelect.id) {
              await loadMessages(ticketToSelect.id);
            }
            
            // On mobile, show details and hide list
            if (window.innerWidth <= 1024) {
              setShowList(false);
              setShowDetails(true);
            }
          } else {
            console.log('Ticket ID not found in user tickets');
          }
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTickets();
  }, [currentUser, location.search, initialTicketId]);
  
  const loadMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const ticketMessages = await getTicketMessages(ticketId);
      setMessages(ticketMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (ticket.id) {
      loadMessages(ticket.id);
      
      // Update URL with ticketId query parameter without full page reload
      navigate(`/support?ticketId=${ticket.id}`, { replace: true });
    }
    
    // On mobile, show details and hide list
    if (window.innerWidth <= 1024) {
      setShowList(false);
      setShowDetails(true);
    }
  };
  
  const handleBackToList = () => {
    setShowList(true);
    setShowDetails(false);
    
    // Remove ticketId from URL
    navigate('/support', { replace: true });
  };
  
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !selectedTicket || !selectedTicket.id || !reply.trim()) {
      return;
    }
    
    try {
      setSending(true);
      
      // Add message - notification will be handled in the service layer
      await addTicketMessage({
        ticketId: selectedTicket.id,
        userId: currentUser.uid,
        isAdmin: false,
        message: reply
      });
      
      // Clear reply and reload messages
      setReply('');
      await loadMessages(selectedTicket.id);
      
      // Call the onTicketUpdate prop if provided
      if (onTicketUpdate) {
        onTicketUpdate();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };
  
  if (!currentUser) {
    return (
      <Container>
        <Title>Your Support Tickets</Title>
        <EmptyState>
          Please sign in to view your support tickets.
        </EmptyState>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Container>
        <Title>Your Support Tickets</Title>
        <LoadingSpinner>Loading your tickets...</LoadingSpinner>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Your Support Tickets</Title>
      
      {tickets.length === 0 ? (
        <EmptyState>
          You don't have any support tickets yet.
        </EmptyState>
      ) : (
        <Layout>
          <TicketsListContainer hidden={!showList}>
            <TicketsList>
              {tickets.map(ticket => (
                <TicketItem 
                  key={ticket.id} 
                  onClick={() => handleTicketClick(ticket)}
                  isSelected={selectedTicket?.id === ticket.id}
                >
                  <TicketHeader>
                    <TicketTitle>{ticket.subject}</TicketTitle>
                    <TicketStatus status={ticket.status}>
                      {ticket.status === 'open' ? 'Open' : 
                       ticket.status === 'in_progress' ? 'In Progress' : 
                       ticket.status === 'resolved' ? 'Resolved' : 
                       'Closed'}
                    </TicketStatus>
                  </TicketHeader>
                  
                  <TicketMetadata>
                    <TicketType type={ticket.type}>
                      {ticket.type === 'prize_collection' ? 'Prize Collection' : 
                       ticket.type === 'support' ? 'Support' : 
                       ticket.type === 'refund' ? 'Refund' : 
                       'Other'}
                    </TicketType>
                  </TicketMetadata>
                  
                  <TicketFooter>
                    <TicketDate>
                      Created: {formatDate(ticket.createdAt)}
                    </TicketDate>
                  </TicketFooter>
                </TicketItem>
              ))}
            </TicketsList>
          </TicketsListContainer>
          
          <TicketDetailsContainer hidden={!showDetails && window.innerWidth <= 1024}>
            {selectedTicket ? (
              <TicketDetails>
                <BackButton onClick={handleBackToList}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to tickets
                </BackButton>
                
                <TicketInfo>
                  <InfoRow>
                    <InfoLabel>Subject:</InfoLabel>
                    <InfoValue>{selectedTicket.subject}</InfoValue>
                  </InfoRow>
                  
                  <InfoRow>
                    <InfoLabel>Status:</InfoLabel>
                    <InfoValue>
                      <TicketStatus status={selectedTicket.status}>
                        {selectedTicket.status === 'open' ? 'Open' : 
                         selectedTicket.status === 'in_progress' ? 'In Progress' : 
                         selectedTicket.status === 'resolved' ? 'Resolved' : 
                         'Closed'}
                      </TicketStatus>
                    </InfoValue>
                  </InfoRow>
                  
                  <InfoRow>
                    <InfoLabel>Type:</InfoLabel>
                    <InfoValue>
                      <TicketType type={selectedTicket.type}>
                        {selectedTicket.type === 'prize_collection' ? 'Prize Collection' : 
                         selectedTicket.type === 'support' ? 'Support' : 
                         selectedTicket.type === 'refund' ? 'Refund' : 
                         'Other'}
                      </TicketType>
                    </InfoValue>
                  </InfoRow>
                  
                  <InfoRow>
                    <InfoLabel>Created:</InfoLabel>
                    <InfoValue>{formatDate(selectedTicket.createdAt)}</InfoValue>
                  </InfoRow>
                  
                  {selectedTicket.resolvedAt && (
                    <InfoRow>
                      <InfoLabel>Resolved:</InfoLabel>
                      <InfoValue>{formatDate(selectedTicket.resolvedAt)}</InfoValue>
                    </InfoRow>
                  )}
                </TicketInfo>
                
                <div>
                  <h3>Description</h3>
                  <Description>
                    {selectedTicket.description}
                  </Description>
                </div>
                
                <Messages>
                  <MessagesTitle>Messages</MessagesTitle>
                  
                  {loadingMessages && (
                    <LoadingSpinner>Loading messages...</LoadingSpinner>
                  )}
                  
                  {!loadingMessages && messages.length === 0 && (
                    <EmptyState>No messages yet.</EmptyState>
                  )}
                  
                  {!loadingMessages && messages.map(message => (
                    <Message key={message.id} isAdmin={message.isAdmin}>
                      <MessageAvatar isAdmin={message.isAdmin}>
                        {message.isAdmin ? 'A' : currentUser?.displayName?.[0] || 'U'}
                      </MessageAvatar>
                      <MessageContent isAdmin={message.isAdmin}>
                        <MessageText>{message.message}</MessageText>
                        <MessageTime>{formatDate(message.createdAt)}</MessageTime>
                      </MessageContent>
                    </Message>
                  ))}
                  
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <ReplyForm onSubmit={handleSubmitReply}>
                      <ReplyInput 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply here..."
                        required
                      />
                      <Button type="submit" disabled={sending || !reply.trim()}>
                        {sending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </ReplyForm>
                  )}
                </Messages>
              </TicketDetails>
            ) : (
              <NoTicketSelected>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Select a ticket to view details
              </NoTicketSelected>
            )}
          </TicketDetailsContainer>
        </Layout>
      )}
    </Container>
  );
};

export default UserTickets; 