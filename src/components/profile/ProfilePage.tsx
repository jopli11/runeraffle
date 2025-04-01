import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';

// Styled components
const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  color: hsl(var(--foreground));
`;

const ProfileHeader = styled.div`
  margin-bottom: 3rem;
`;

const ProfileHeaderFlex = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const AvatarContainer = styled.div`
  height: 6rem;
  width: 6rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, hsla(var(--primary), 0.3), hsla(265, 83%, 45%, 0.3));
`;

const AvatarInitial = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: hsl(var(--primary));
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const MemberSince = styled.p`
  font-size: 0.875rem;
  opacity: 0.7;
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  @media (min-width: 768px) {
    margin-left: auto;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const Sidebar = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  
  @media (min-width: 1024px) {
    width: 16rem;
  }
`;

const SidebarNav = styled.nav`
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
`;

const NavItem = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-left: 2px solid ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  background-color: ${props => props.active ? 'hsla(var(--primary), 0.05)' : 'transparent'};
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => !props.active && 'hsla(var(--muted), 0.05)'};
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
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
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--card));
  color: hsl(var(--foreground));
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CardContainer = styled.div`
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  divide-y: 1px solid hsl(var(--border));
`;

const CardItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const CardItemFlex = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const CompetitionName = styled.h3`
  font-weight: 500;
`;

const CompetitionDate = styled.p`
  font-size: 0.875rem;
  opacity: 0.7;
`;

const PositionBadge = styled.span<{ winner?: boolean }>`
  display: inline-block;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  background-color: ${props => props.winner ? 'rgba(22, 163, 74, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
  color: ${props => props.winner ? 'rgb(22, 163, 74)' : 'rgb(59, 130, 246)'};
`;

const PrizeContainer = styled.div`
  text-align: right;
`;

const PrizeLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
  color: hsl(var(--muted-foreground));
`;

export function ProfilePage() {
  const { currentUser, userCredits, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  
  // Format the user's email or display a fallback
  const email = currentUser?.email || 'Not available';
  
  // Get the username from the email (before the @)
  const username = currentUser?.email ? currentUser.email.split('@')[0] : 'User';
  
  // Get the user's initial for the avatar
  const userInitial = username.charAt(0).toUpperCase();
  
  // Mock user join date
  const joinDate = 'March 1, 2024';
  
  // If still loading, show a loading message
  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading profile...</LoadingMessage>
      </Container>
    );
  }
  
  // If no user is logged in, redirect to login
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      window.navigate('/login');
    }
    return null;
  }

  return (
    <Container>
      <ProfileHeader>
        <ProfileHeaderFlex>
          <AvatarContainer>
            <AvatarInitial>{userInitial}</AvatarInitial>
          </AvatarContainer>
          
          <UserInfo>
            <Username>{username}</Username>
            <MemberSince>Member since {joinDate}</MemberSince>
          </UserInfo>
          
          <EditButton>Edit Profile</EditButton>
        </ProfileHeaderFlex>
      </ProfileHeader>
      
      <ContentWrapper>
        <Sidebar>
          <SidebarNav>
            <ul>
              <li>
                <NavItem 
                  href="#account" 
                  active={activeTab === 'account'}
                  onClick={() => setActiveTab('account')}
                >
                  Account
                </NavItem>
              </li>
              <li>
                <NavItem 
                  href="#competitions" 
                  active={activeTab === 'competitions'}
                  onClick={() => setActiveTab('competitions')}
                >
                  Competitions
                </NavItem>
              </li>
              <li>
                <NavItem 
                  href="#tickets" 
                  active={activeTab === 'tickets'}
                  onClick={() => setActiveTab('tickets')}
                >
                  Tickets
                </NavItem>
              </li>
              <li>
                <NavItem 
                  href="#credits" 
                  active={activeTab === 'credits'}
                  onClick={() => setActiveTab('credits')}
                >
                  Credits
                </NavItem>
              </li>
            </ul>
          </SidebarNav>
        </Sidebar>
        
        <MainContent>
          {activeTab === 'account' && (
            <Section id="account">
              <SectionTitle>Account Details</SectionTitle>
              <div>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    value={username}
                    disabled
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    disabled
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="credits">Available Credits</Label>
                  <Input 
                    id="credits" 
                    type="text" 
                    value={`${userCredits} Credits`}
                    disabled
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="member-since">Member Since</Label>
                  <Input 
                    id="member-since" 
                    type="text" 
                    value={joinDate}
                    disabled
                  />
                </FormGroup>
              </div>
            </Section>
          )}
          
          {activeTab === 'competitions' && (
            <Section id="competitions">
              <SectionTitle>Competition History</SectionTitle>
              <CardContainer>
                {[
                  { id: 1, name: 'Dragon Slayer Challenge', date: 'Jan 15, 2024', position: 'Runner-up', prize: '10M Gold' },
                  { id: 2, name: 'Wilderness PvP Tournament', date: 'Feb 10, 2024', position: '5th Place', prize: 'PvP Supplies' },
                  { id: 3, name: 'Skill Master Challenge', date: 'Mar 5, 2024', position: 'Winner', prize: 'Skill Cape' }
                ].map((comp) => (
                  <CardItem key={comp.id}>
                    <CardItemFlex>
                      <div style={{ flex: 1 }}>
                        <CompetitionName>{comp.name}</CompetitionName>
                        <CompetitionDate>Completed {comp.date}</CompetitionDate>
                      </div>
                      <div>
                        <PositionBadge winner={comp.position === 'Winner'}>
                          {comp.position}
                        </PositionBadge>
                      </div>
                      <PrizeContainer>
                        <PrizeLabel>Prize:</PrizeLabel>
                        <div>{comp.prize}</div>
                      </PrizeContainer>
                    </CardItemFlex>
                  </CardItem>
                ))}
              </CardContainer>
            </Section>
          )}
          
          {activeTab === 'tickets' && (
            <Section id="tickets">
              <SectionTitle>Ticket History</SectionTitle>
              <CardContainer>
                <CardItem>
                  <p>You haven't purchased any tickets yet.</p>
                </CardItem>
              </CardContainer>
            </Section>
          )}
          
          {activeTab === 'credits' && (
            <Section id="credits">
              <SectionTitle>Credit History</SectionTitle>
              <CardContainer>
                <CardItem>
                  <CardItemFlex>
                    <div style={{ flex: 1 }}>
                      <CompetitionName>Welcome Bonus</CompetitionName>
                      <CompetitionDate>Mar 1, 2024</CompetitionDate>
                    </div>
                    <div>
                      <PositionBadge winner={true}>
                        +100 Credits
                      </PositionBadge>
                    </div>
                  </CardItemFlex>
                </CardItem>
              </CardContainer>
            </Section>
          )}
        </MainContent>
      </ContentWrapper>
    </Container>
  );
} 