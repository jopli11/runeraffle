import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { 
  getOpenSupportTickets, 
  getSupportTicket, 
  updateSupportTicket, 
  getTicketMessages, 
  addTicketMessage,
  SupportTicket, 
  TicketMessage
} from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 1.5rem;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  color: ${props => props.active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => !props.active && 'hsl(var(--foreground))'};
  }
`;

const TicketsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const TicketsList = styled.div`
  max-height: 700px;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
`;

const TicketItem = styled.div<{ isSelected?: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  background: ${props => props.isSelected ? 'hsl(var(--accent))' : 'transparent'};
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: hsl(var(--accent));
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const TicketTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
`;

const TicketStatus = styled.span<{ status: string }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'open': return 'rgba(22, 163, 74, 0.2)';
      case 'in_progress': return 'rgba(245, 158, 11, 0.2)';
      case 'resolved': return 'rgba(37, 99, 235, 0.2)';
      case 'closed': return 'rgba(107, 114, 128, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'open': return 'rgb(22, 163, 74)';
      case 'in_progress': return 'rgb(245, 158, 11)';
      case 'resolved': return 'rgb(37, 99, 235)';
      case 'closed': return 'rgb(107, 114, 128)';
      default: return 'rgb(107, 114, 128)';
    }
  }};
`;

const TicketType = styled.span<{ type: string }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  margin-right: 0.5rem;
  background-color: ${props => {
    switch (props.type) {
      case 'prize_collection': return 'rgba(239, 68, 68, 0.2)';
      case 'support': return 'rgba(37, 99, 235, 0.2)';
      case 'refund': return 'rgba(245, 158, 11, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'prize_collection': return 'rgb(239, 68, 68)';
      case 'support': return 'rgb(37, 99, 235)';
      case 'refund': return 'rgb(245, 158, 11)';
      default: return 'rgb(107, 114, 128)';
    }
  }};
`;

const TicketMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
`;

const TicketDetails = styled.div`
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
`;

const TicketDetailsEmpty = styled.div`
  padding: 3rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
`;

const DetailHeader = styled.div`
  padding: 1rem;
  background: hsl(var(--accent));
  border-bottom: 1px solid hsl(var(--border));
`;

const DetailTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const DetailMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DetailMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
`;

const DetailContent = styled.div`
  padding: 1rem;
`;

const DetailDescription = styled.div`
  white-space: pre-wrap;
  background: hsl(var(--background));
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const MessagesSection = styled.div`
  margin-top: 1.5rem;
`;

const MessagesList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
`;

const Message = styled.div<{ isAdmin?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const MessageAvatar = styled.div<{ isAdmin?: boolean }>`
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: ${props => props.isAdmin ? 'rgba(37, 99, 235, 0.2)' : 'rgba(107, 114, 128, 0.2)'};
  color: ${props => props.isAdmin ? 'rgb(37, 99, 235)' : 'rgb(107, 114, 128)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
`;

const MessageContent = styled.div`
  flex: 1;
  background: hsl(var(--background));
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
`;

const MessageSender = styled.span`
  font-weight: 600;
`;

const MessageTime = styled.span`
  color: hsl(var(--muted-foreground));
`;

const MessageText = styled.div`
  white-space: pre-wrap;
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
  border-radius: 0.375rem;
  color: hsl(var(--foreground));
  resize: vertical;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
`;

const Button = styled.button<{ variant?: 'primary' | 'default' | 'outline' | 'danger' }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: hsl(var(--primary));
          color: white;
          border: none;
          
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'danger':
        return `
          background: hsl(var(--destructive));
          color: white;
          border: none;
          
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          
          &:hover {
            background: hsl(var(--accent));
          }
        `;
      default:
        return `
          background: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
          border: none;
          
          &:hover {
            opacity: 0.9;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

const AdminSupportTickets: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'prize' | 'support'>('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Parse query parameters
  const getQueryParam = (name: string): string | null => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(name);
  };
  
  // Load open tickets on component mount
  useEffect(() => {
    const loadTickets = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const openTickets = await getOpenSupportTickets();
        setTickets(openTickets);
        
        // Check for ticketId in URL
        const ticketId = getQueryParam('ticketId');
        if (ticketId) {
          console.log('Looking for ticket ID from URL:', ticketId);
          
          // Try to find ticket in the loaded tickets
          let ticketToSelect = openTickets.find(t => t.id === ticketId);
          
          // If not found in open tickets, try to load it directly
          if (!ticketToSelect) {
            console.log('Ticket not found in open tickets, attempting to load directly');
            try {
              const ticket = await getSupportTicket(ticketId);
              if (ticket) {
                ticketToSelect = ticket;
                // Add to tickets list if not already there
                setTickets(prev => {
                  if (!prev.some(t => t.id === ticket.id)) {
                    return [...prev, ticket];
                  }
                  return prev;
                });
              }
            } catch (error) {
              console.error('Error loading ticket by ID:', error);
            }
          }
          
          // If we found the ticket, select it
          if (ticketToSelect) {
            console.log('Found ticket from URL param:', ticketToSelect.subject);
            await selectTicket(ticketToSelect);
          } else {
            console.log('Ticket ID from URL not found');
          }
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTickets();
  }, [currentUser, location.search]);
  
  const selectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    
    if (ticket.id) {
      try {
        // If ticket is "open", mark as "in_progress"
        if (ticket.status === 'open') {
          const assigneeEmail = currentUser?.email || undefined;
          
          await updateSupportTicket(ticket.id, {
            status: 'in_progress',
            assignedTo: assigneeEmail
          });
          
          // Update ticket in the list
          setTickets(prevTickets => prevTickets.map(t => 
            t.id === ticket.id ? { 
              ...t, 
              status: 'in_progress',
              assignedTo: assigneeEmail 
            } : t
          ));
          
          // Update selected ticket
          setSelectedTicket(prev => prev ? { 
            ...prev, 
            status: 'in_progress',
            assignedTo: assigneeEmail 
          } : null);
        }
        
        // Load messages
        const ticketMessages = await getTicketMessages(ticket.id);
        setMessages(ticketMessages);
        
        // Update URL with ticketId parameter without full page reload
        navigate(`/admin?tab=support&ticketId=${ticket.id}`, { replace: true });
      } catch (error) {
        console.error('Error updating ticket status:', error);
      }
    }
  };
  
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !selectedTicket || !selectedTicket.id || !reply.trim()) return;
    
    try {
      setSending(true);
      
      // Add the message - notification will be handled in the service layer
      await addTicketMessage({
        ticketId: selectedTicket.id,
        userId: currentUser.uid,
        isAdmin: true,
        message: reply
      });
      
      // Clear reply and reload messages
      setReply('');
      if (selectedTicket.id) {
        const ticketMessages = await getTicketMessages(selectedTicket.id);
        setMessages(ticketMessages);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };
  
  const resolveTicket = async () => {
    if (!selectedTicket || !selectedTicket.id) return;
    
    if (!confirm('Are you sure you want to mark this ticket as resolved?')) return;
    
    try {
      // Update ticket status - notification will be handled in the service layer
      await updateSupportTicket(selectedTicket.id, {
        status: 'resolved'
      });
      
      // Update ticket in the list and selected ticket
      setTickets(prevTickets => prevTickets.filter(t => t.id !== selectedTicket.id));
      setSelectedTicket(null);
      
      // Remove ticketId from URL
      navigate('/admin?tab=support', { replace: true });
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  };
  
  // Compute filtered tickets based on active tab
  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    if (activeTab === 'prize') return ticket.type === 'prize_collection';
    if (activeTab === 'support') return ticket.type === 'support';
    return true;
  });
  
  return (
    <Container>
      <Title>Support Tickets</Title>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All Tickets
        </Tab>
        <Tab 
          active={activeTab === 'prize'} 
          onClick={() => setActiveTab('prize')}
        >
          Prize Collection
        </Tab>
        <Tab 
          active={activeTab === 'support'} 
          onClick={() => setActiveTab('support')}
        >
          Support
        </Tab>
      </TabsContainer>
      
      {loading ? (
        <EmptyState>Loading tickets...</EmptyState>
      ) : filteredTickets.length === 0 ? (
        <EmptyState>No open tickets found.</EmptyState>
      ) : (
        <TicketsContainer>
          <TicketsList>
            {filteredTickets.map(ticket => (
              <TicketItem 
                key={ticket.id}
                isSelected={selectedTicket?.id === ticket.id}
                onClick={() => selectTicket(ticket)}
              >
                <TicketHeader>
                  <TicketTitle>{ticket.subject}</TicketTitle>
                  <TicketStatus status={ticket.status}>
                    {ticket.status.replace('_', ' ')}
                  </TicketStatus>
                </TicketHeader>
                
                <TicketMeta>
                  <div>
                    <TicketType type={ticket.type}>
                      {ticket.type.replace('_', ' ')}
                    </TicketType>
                    {ticket.priority === 'high' && (
                      <TicketType type="high">
                        High Priority
                      </TicketType>
                    )}
                  </div>
                  <div>{formatDate(ticket.createdAt)}</div>
                </TicketMeta>
              </TicketItem>
            ))}
          </TicketsList>
          
          <TicketDetails>
            {!selectedTicket ? (
              <TicketDetailsEmpty>
                Select a ticket to view details
              </TicketDetailsEmpty>
            ) : (
              <>
                <DetailHeader>
                  <DetailTitle>{selectedTicket.subject}</DetailTitle>
                  <DetailMeta>
                    <DetailMetaItem>
                      <span>From:</span>
                      <strong>{selectedTicket.userEmail}</strong>
                    </DetailMetaItem>
                    <DetailMetaItem>
                      <span>Created:</span>
                      <strong>{formatDate(selectedTicket.createdAt)}</strong>
                    </DetailMetaItem>
                    <DetailMetaItem>
                      <span>Status:</span>
                      <TicketStatus status={selectedTicket.status}>
                        {selectedTicket.status.replace('_', ' ')}
                      </TicketStatus>
                    </DetailMetaItem>
                    <DetailMetaItem>
                      <span>Type:</span>
                      <TicketType type={selectedTicket.type}>
                        {selectedTicket.type.replace('_', ' ')}
                      </TicketType>
                    </DetailMetaItem>
                  </DetailMeta>
                  
                  <ActionsContainer>
                    <button 
                      onClick={resolveTicket}
                      disabled={selectedTicket.status === 'resolved'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'hsl(var(--primary))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        opacity: selectedTicket.status === 'resolved' ? 0.5 : 1
                      }}
                    >
                      Mark as Resolved
                    </button>
                  </ActionsContainer>
                </DetailHeader>
                
                <DetailContent>
                  <h4>Description</h4>
                  <DetailDescription>
                    {selectedTicket.description}
                  </DetailDescription>
                  
                  <MessagesSection>
                    <h4>Messages</h4>
                    
                    {messages.length === 0 ? (
                      <EmptyState>No messages yet.</EmptyState>
                    ) : (
                      <MessagesList>
                        {messages.map(message => (
                          <Message 
                            key={message.id}
                            isAdmin={message.isAdmin}
                          >
                            <MessageAvatar isAdmin={message.isAdmin}>
                              {message.isAdmin ? 'A' : 'U'}
                            </MessageAvatar>
                            <MessageContent>
                              <MessageHeader>
                                <MessageSender>
                                  {message.isAdmin ? 'Admin' : selectedTicket.userEmail}
                                </MessageSender>
                                <MessageTime>
                                  {formatDate(message.createdAt)}
                                </MessageTime>
                              </MessageHeader>
                              <MessageText>{message.message}</MessageText>
                            </MessageContent>
                          </Message>
                        ))}
                      </MessagesList>
                    )}
                    
                    <ReplyForm onSubmit={handleSendReply}>
                      <ReplyInput 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply here..."
                        required
                      />
                      
                      <ActionButtons>
                        <ButtonGroup>
                          <Button 
                            variant="primary" 
                            type="submit"
                            disabled={sending || !reply.trim()}
                          >
                            {sending ? 'Sending...' : 'Send Reply'}
                          </Button>
                        </ButtonGroup>
                      </ActionButtons>
                    </ReplyForm>
                  </MessagesSection>
                </DetailContent>
              </>
            )}
          </TicketDetails>
        </TicketsContainer>
      )}
    </Container>
  );
}

export default AdminSupportTickets; 