import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getCompetitions, deleteCompetition, updateCompetition, cancelCompetition } from '../../services/firestore';
import type { Competition } from '../../services/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useNavigate } from 'react-router-dom';

// Styled components
const Container = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHead = styled.thead`
  background-color: hsl(var(--muted) / 0.5);
  border-bottom: 1px solid hsl(var(--border));
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: hsl(var(--foreground));
  white-space: nowrap;
`;

const TableBody = styled.tbody`
  & tr:nth-of-type(even) {
    background-color: hsl(var(--muted) / 0.3);
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.2s;
  
  &:hover {
    background-color: hsl(var(--muted) / 0.5);
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
`;

const Badge = styled.span<{ status: Competition['status'] }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
      case 'active':
        return `
          background-color: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        `;
      case 'ending':
        return `
          background-color: rgba(234, 179, 8, 0.1);
          color: rgb(234, 179, 8);
        `;
      case 'complete':
        return `
          background-color: rgba(59, 130, 246, 0.1);
          color: rgb(59, 130, 246);
        `;
      case 'cancelled':
        return `
          background-color: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
        `;
      default:
        return '';
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.375rem 0.625rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin-right: 0.5rem;
  
  &:last-child {
    margin-right: 0;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  
  &:hover {
    background-color: hsl(var(--primary) / 0.2);
  }
`;

const ViewButton = styled(ActionButton)`
  background-color: hsl(var(--secondary) / 0.1);
  color: hsl(var(--secondary));
  
  &:hover {
    background-color: hsl(var(--secondary) / 0.2);
  }
`;

const CompleteButton = styled(ActionButton)`
  background-color: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
  
  &:hover {
    background-color: rgba(34, 197, 94, 0.2);
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
  }
  
  /* Add a title attribute for hover tooltip */
  &:after {
    content: attr(title);
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover:after {
    visibility: visible;
    opacity: 1;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
  }
  
  /* Add a title attribute for hover tooltip */
  &:after {
    content: attr(title);
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover:after {
    visibility: visible;
    opacity: 1;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
`;

const ActionCellContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch competitions on component mount
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await getCompetitions();
        setCompetitions(data);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const handleViewCompetition = (id: string) => {
    navigate(`/competition/${id}`);
  };

  const handleEditCompetition = (id: string) => {
    // Navigate to an edit form page for the competition
    navigate(`/admin/edit-competition/${id}`);
  };

  const handleDeleteCompetition = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
      try {
        await deleteCompetition(id);
        setCompetitions(competitions.filter(comp => comp.id !== id));
        alert('Competition deleted successfully');
      } catch (error) {
        console.error('Error deleting competition:', error);
        alert('Failed to delete competition');
      }
    }
  };

  const handleCancelCompetition = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this competition?\nNote: This keeps the competition in the system but marks it as cancelled.')) {
      const shouldRefund = window.confirm('Do you want to automatically refund all purchased tickets for this competition?');
      
      try {
        await cancelCompetition(id, shouldRefund);
        
        // Update the UI to show the competition as cancelled
        setCompetitions(competitions.map(comp => 
          comp.id === id ? { ...comp, status: 'cancelled' } : comp
        ));
        
        if (shouldRefund) {
          alert('Competition cancelled and refund process initiated. Users will receive credits for purchased tickets.');
        } else {
          alert('Competition cancelled successfully. No refunds were processed.');
        }
      } catch (error) {
        console.error('Error cancelling competition:', error);
        alert('Failed to cancel competition');
      }
    }
  };

  const handleCompleteCompetition = async (id: string) => {
    // In a real application, this would show a modal for drawing the winner
    if (window.confirm('This would normally open a modal for drawing the winner. Do you want to simulate completion?')) {
      try {
        const winnerData = {
          userId: 'simulated-user-id',
          username: 'SimulatedWinner',
          email: 'winner@example.com'
        };
        
        await updateCompetition(id, { 
          status: 'complete',
          completedAt: firebase.firestore.Timestamp.now(),
          winner: winnerData,
          seed: "0x" + Math.random().toString(16).substring(2, 10),
          blockHash: "0x" + Math.random().toString(16).substring(2, 66),
          winningTicket: Math.floor(Math.random() * 1000) + 1
        });
        
        // Update the local state
        setCompetitions(competitions.map(comp => 
          comp.id === id ? { 
            ...comp, 
            status: 'complete',
            completedAt: firebase.firestore.Timestamp.now(),
            winner: winnerData
          } : comp
        ));
        
        alert('Competition completed successfully');
      } catch (error) {
        console.error('Error completing competition:', error);
        alert('Failed to complete competition');
      }
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: firebase.firestore.Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  if (loading) {
    return <LoadingMessage>Loading competitions...</LoadingMessage>;
  }

  if (competitions.length === 0) {
    return <NoDataMessage>No competitions found. Create one to get started.</NoDataMessage>;
  }

  return (
    <Container>
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Difficulty</TableHeaderCell>
            <TableHeaderCell>Ticket Price</TableHeaderCell>
            <TableHeaderCell>Tickets</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Ends</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {competitions.map((competition) => (
            <TableRow key={competition.id}>
              <TableCell>{competition.title}</TableCell>
              <TableCell>
                <Badge status={competition.status}>
                  {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
              </TableCell>
              <TableCell>{competition.ticketPrice} Credits</TableCell>
              <TableCell>
                {competition.ticketsSold} / {competition.totalTickets}
              </TableCell>
              <TableCell>{formatDate(competition.createdAt)}</TableCell>
              <TableCell>{formatDate(competition.endsAt)}</TableCell>
              <TableCell>
                <ActionCellContainer>
                  <ViewButton onClick={() => handleViewCompetition(competition.id!)}>
                    View
                  </ViewButton>
                  
                  {competition.status !== 'complete' && competition.status !== 'cancelled' && (
                    <>
                      <EditButton onClick={() => handleEditCompetition(competition.id!)}>
                        Edit
                      </EditButton>
                      <CompleteButton onClick={() => handleCompleteCompetition(competition.id!)}>
                        Complete
                      </CompleteButton>
                      <CancelButton 
                        onClick={() => handleCancelCompetition(competition.id!)}
                        title="Cancel marks competition as cancelled but keeps it in the system"
                      >
                        Cancel
                      </CancelButton>
                    </>
                  )}
                  
                  <DeleteButton 
                    onClick={() => handleDeleteCompetition(competition.id!)}
                    title="Delete permanently removes the competition from the database"
                  >
                    Delete
                  </DeleteButton>
                </ActionCellContainer>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
} 