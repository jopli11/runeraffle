import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getCompletedCompetitions } from '../../services/firestore';
import type { Competition } from '../../services/firestore';

// Styled components - similar to other admin components
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

const ViewButton = styled.button`
  padding: 0.375rem 0.625rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: hsl(var(--secondary) / 0.1);
  color: hsl(var(--secondary));
  
  &:hover {
    background-color: hsl(var(--secondary) / 0.2);
  }
`;

const HashDisplay = styled.span`
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const VerificationButton = styled.button`
  padding: 0.375rem 0.625rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  
  &:hover {
    background-color: hsl(var(--primary) / 0.2);
  }
`;

export default function AdminWinners() {
  const [completedCompetitions, setCompletedCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedCompetitions = async () => {
      try {
        const data = await getCompletedCompetitions();
        setCompletedCompetitions(data);
      } catch (error) {
        console.error('Error fetching completed competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCompetitions();
  }, []);

  const handleViewCompetition = (id: string) => {
    window.navigate(`/competition/${id}`);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Could not copy text: ', err));
  };

  const showVerificationDetails = (competition: Competition) => {
    const details = `
Competition: ${competition.title}
Completed: ${formatDate(competition.completedAt)}
Winner: ${competition.winner?.username} (${competition.winner?.email})
Seed: ${competition.seed}
Block Hash: ${competition.blockHash}
Winning Ticket: ${competition.winningTicket}
    `;
    
    alert(details);
  };

  if (loading) {
    return <LoadingMessage>Loading completed competitions...</LoadingMessage>;
  }

  if (completedCompetitions.length === 0) {
    return <NoDataMessage>No completed competitions found.</NoDataMessage>;
  }

  return (
    <Container>
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Competition</TableHeaderCell>
            <TableHeaderCell>Prize</TableHeaderCell>
            <TableHeaderCell>Completed Date</TableHeaderCell>
            <TableHeaderCell>Winner</TableHeaderCell>
            <TableHeaderCell>Seed</TableHeaderCell>
            <TableHeaderCell>Winning Ticket</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {completedCompetitions.map((competition) => (
            <TableRow key={competition.id}>
              <TableCell>{competition.title}</TableCell>
              <TableCell>{competition.prizeValue}</TableCell>
              <TableCell>{formatDate(competition.completedAt)}</TableCell>
              <TableCell>{competition.winner?.username}</TableCell>
              <TableCell>
                <HashDisplay 
                  onClick={() => copyToClipboard(competition.seed || '')}
                  title="Click to copy"
                >
                  {competition.seed || 'N/A'}
                </HashDisplay>
              </TableCell>
              <TableCell>{competition.winningTicket || 'N/A'}</TableCell>
              <TableCell>
                <ViewButton onClick={() => handleViewCompetition(competition.id!)}>
                  View
                </ViewButton>
                {' '}
                <VerificationButton onClick={() => showVerificationDetails(competition)}>
                  Verification
                </VerificationButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
} 