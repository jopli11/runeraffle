import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { db } from '../../config/firebase';
import { User, updateUserCredits } from '../../services/firestore';

// Styled components - similar to AdminCompetitions
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

const Badge = styled.span<{ admin: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ admin }) => admin 
    ? 'rgba(34, 197, 94, 0.1)' 
    : 'rgba(59, 130, 246, 0.1)'};
  color: ${({ admin }) => admin 
    ? 'rgb(34, 197, 94)' 
    : 'rgb(59, 130, 246)'};
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

const CreditButton = styled(ActionButton)`
  background-color: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
  
  &:hover {
    background-color: rgba(34, 197, 94, 0.2);
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

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = db.collection('users');
        const snapshot = await usersCollection.get();
        const usersData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddCredits = async (email: string, currentCredits: number) => {
    const creditsToAdd = parseInt(prompt(`Current credits: ${currentCredits}. Enter amount to add:`) || '0');
    
    if (isNaN(creditsToAdd) || creditsToAdd < 0) {
      alert('Please enter a valid number of credits');
      return;
    }

    try {
      const newCredits = currentCredits + creditsToAdd;
      
      await updateUserCredits(email, newCredits);
      
      setUsers(users.map(user => 
        user.email === email ? { ...user, credits: newCredits } : user
      ));
      
      alert(`Added ${creditsToAdd} credits to ${email}. New balance: ${newCredits}`);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits');
    }
  };

  const handleToggleAdmin = async (email: string, isCurrentlyAdmin: boolean) => {
    if (!window.confirm(`Are you sure you want to ${isCurrentlyAdmin ? 'remove' : 'grant'} admin privileges to ${email}?`)) {
      return;
    }

    try {
      const userRef = db.collection('users').doc(email);
      
      await userRef.update({
        isAdmin: !isCurrentlyAdmin,
        updatedAt: new Date()
      });
      
      setUsers(users.map(user => 
        user.email === email ? { ...user, isAdmin: !isCurrentlyAdmin } : user
      ));
      
      alert(`${isCurrentlyAdmin ? 'Removed' : 'Granted'} admin privileges for ${email}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update admin status');
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  if (loading) {
    return <LoadingMessage>Loading users...</LoadingMessage>;
  }

  if (users.length === 0) {
    return <NoDataMessage>No users found.</NoDataMessage>;
  }

  return (
    <Container>
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Display Name</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Credits</TableHeaderCell>
            <TableHeaderCell>Joined</TableHeaderCell>
            <TableHeaderCell>Last Updated</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.displayName || 'Not set'}</TableCell>
              <TableCell>
                <Badge admin={user.isAdmin}>
                  {user.isAdmin ? 'Admin' : 'User'}
                </Badge>
              </TableCell>
              <TableCell>{user.credits}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>{formatDate(user.updatedAt)}</TableCell>
              <TableCell>
                <ActionCellContainer>
                  <CreditButton onClick={() => handleAddCredits(user.email, user.credits)}>
                    Add Credits
                  </CreditButton>
                  <EditButton onClick={() => handleToggleAdmin(user.email, user.isAdmin)}>
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </EditButton>
                </ActionCellContainer>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
} 