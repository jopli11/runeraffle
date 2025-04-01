import React from 'react'
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';

const UserButton = styled.button`
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.3);
  }
`;

const UserInitial = styled.span`
  font-size: 1rem;
  font-weight: 600;
`;

export function UserNav() {
  const { currentUser } = useAuth();
  
  const getUserInitial = (): string => {
    if (!currentUser?.email) return 'U';
    return currentUser.email.charAt(0).toUpperCase();
  };

  const handleProfileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.navigate('/profile');
  };

  return (
    <UserButton onClick={handleProfileClick} title="View Profile">
      <UserInitial>{getUserInitial()}</UserInitial>
    </UserButton>
  );
} 