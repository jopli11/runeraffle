import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { getUser, updateUser, getUserTickets } from '../../services/firestore';
import { getCompetition } from '../../services/firestore';
import { auth, updateUserProfile, sendEmailVerification, getUserCreationTime } from '../../config/firebase';
import { Dashboard } from './Dashboard';

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

// New styled components
const CreditCard = styled.div`
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const CreditBalance = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const CreditLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const AddCreditsButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.375rem;
  color: white;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  border: 1px dashed hsl(var(--border));
  border-radius: 0.5rem;
  color: hsl(var(--muted-foreground));
`;

const SuccessMessage = styled.div`
  padding: 0.75rem;
  background-color: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: hsl(var(--primary));
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export function ProfilePage() {
  const { currentUser, userCredits, setUserCredits, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  // Format the user's email or display a fallback
  const email = currentUser?.email || 'Not available';
  
  // Get the username from displayName or email
  const username = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'User');
  
  // Get the user's initial for the avatar
  const userInitial = username.charAt(0).toUpperCase();
  
  // Get join date from user creation time or fallback
  const joinDate = getUserCreationTime() 
    ? new Date(getUserCreationTime() as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'March 1, 2024';
    
  // Load user data and tickets
  useEffect(() => {
    if (currentUser?.email) {
      setDisplayName(currentUser.displayName || '');
      loadUserTickets();
    }
  }, [currentUser]);
  
  // Function to load user tickets
  const loadUserTickets = async () => {
    if (!currentUser) return;
    
    setIsLoadingTickets(true);
    try {
      const userTickets = await getUserTickets(currentUser.uid);
      
      // For each ticket, get the competition details
      const ticketsWithDetails = await Promise.all(
        userTickets.map(async (ticket) => {
          const competition = await getCompetition(ticket.competitionId);
          return {
            ...ticket,
            competition
          };
        })
      );
      
      setTickets(ticketsWithDetails);
      setTicketHistory(ticketsWithDetails);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };
  
  // Handle saving profile changes
  const handleSaveProfile = async () => {
    if (!currentUser?.email) return;
    
    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      await updateUserProfile(displayName);
      
      // Update Firestore user document
      await updateUser(currentUser.email, {
        displayName: displayName
      });
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle adding credits (simulated)
  const handleAddCredits = () => {
    if (!currentUser?.email) return;
    
    const newCredits = userCredits + 100;
    
    // Update credits in Firestore
    updateUser(currentUser.email, {
      credits: newCredits
    }).then(() => {
      // Update local state
      setUserCredits(newCredits);
      setSuccessMessage('100 credits added to your account!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }).catch(error => {
      console.error('Error adding credits:', error);
    });
  };
  
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
  
  // Check if email is verified
  const isEmailVerified = currentUser.emailVerified;
  
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
            {!isEmailVerified && (
              <span style={{ 
                display: 'inline-block', 
                fontSize: '0.75rem', 
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                color: 'rgb(234, 179, 8)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                marginTop: '0.5rem'
              }}>
                Email not verified
              </span>
            )}
          </UserInfo>
          
          {activeTab === 'account' && !isEditing && (
            <EditButton onClick={() => setIsEditing(true)}>
              Edit Profile
            </EditButton>
          )}
        </ProfileHeaderFlex>
      </ProfileHeader>
      
      {successMessage && (
        <SuccessMessage>{successMessage}</SuccessMessage>
      )}
      
      <ContentWrapper>
        <Sidebar>
          <SidebarNav>
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </NavItem>
            <NavItem 
              active={activeTab === 'account'} 
              onClick={() => setActiveTab('account')}
            >
              Account
            </NavItem>
            <NavItem 
              active={activeTab === 'competitions'} 
              onClick={() => setActiveTab('competitions')}
            >
              My Competitions
            </NavItem>
            <NavItem 
              active={activeTab === 'credits'} 
              onClick={() => setActiveTab('credits')}
            >
              Credits
            </NavItem>
            <NavItem 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </NavItem>
          </SidebarNav>
        </Sidebar>
        
        <MainContent>
          {activeTab === 'dashboard' && (
            <Section>
              <SectionTitle>Dashboard</SectionTitle>
              <Dashboard />
            </Section>
          )}
          
          {activeTab === 'account' && (
            <Section>
              <SectionTitle>Account Information</SectionTitle>
              
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
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your display name"
                />
              </FormGroup>
              
              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    onClick={() => { 
                      setIsEditing(false); 
                      setDisplayName(currentUser.displayName || '');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: 'transparent',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <SaveButton 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </SaveButton>
                </div>
              )}
              
              <div style={{ marginTop: '2rem' }}>
                {!isEmailVerified && (
                  <div style={{ 
                    padding: '1rem', 
                    backgroundColor: 'rgba(234, 179, 8, 0.1)', 
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Verify Your Email</h3>
                    <p style={{ marginBottom: '1rem' }}>
                      Please verify your email address to unlock all features.
                    </p>
                    <button 
                      onClick={async () => {
                        try {
                          await sendEmailVerification();
                          setSuccessMessage('Verification email sent! Please check your inbox.');
                        } catch (error) {
                          console.error('Error sending verification email:', error);
                        }
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        backgroundColor: 'rgb(234, 179, 8)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Resend Verification Email
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={async () => {
                    try {
                      await auth.signOut();
                      window.navigate('/login');
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    color: 'hsl(var(--destructive))',
                    border: '1px solid hsl(var(--destructive))',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </Section>
          )}
          
          {activeTab === 'competitions' && (
            <Section>
              <SectionTitle>My Competitions</SectionTitle>
              
              {isLoadingTickets ? (
                <LoadingMessage>Loading your competitions...</LoadingMessage>
              ) : ticketHistory.length > 0 ? (
                <CardContainer>
                  {ticketHistory.map((ticket) => (
                    <CardItem key={ticket.id}>
                      <CardItemFlex>
                        <div style={{ flex: 1 }}>
                          <CompetitionName>{ticket.competition?.title || 'Unknown Competition'}</CompetitionName>
                          <CompetitionDate>
                            {ticket.purchasedAt?.toDate ? new Date(ticket.purchasedAt.toDate()).toLocaleDateString() : 'Unknown date'}
                          </CompetitionDate>
                          <div style={{ marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                              Ticket #{ticket.ticketNumber}
                            </span>
                          </div>
                        </div>
                        
                        <PositionBadge winner={ticket.isWinner}>
                          {ticket.isWinner ? 'Winner' : 'Entered'}
                        </PositionBadge>
                        
                        <PrizeContainer>
                          <PrizeLabel>
                            {ticket.competition?.status === 'complete' 
                              ? (ticket.isWinner ? 'You won!' : 'Better luck next time') 
                              : 'In progress'}
                          </PrizeLabel>
                        </PrizeContainer>
                      </CardItemFlex>
                    </CardItem>
                  ))}
                </CardContainer>
              ) : (
                <EmptyState>
                  <p>You haven't entered any competitions yet.</p>
                  <button 
                    onClick={() => window.navigate('/competitions')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '1rem'
                    }}
                  >
                    Browse Competitions
                  </button>
                </EmptyState>
              )}
            </Section>
          )}
          
          {activeTab === 'credits' && (
            <Section>
              <SectionTitle>Credit Balance</SectionTitle>
              
              <CreditCard>
                <CreditBalance>{userCredits}</CreditBalance>
                <CreditLabel>Available Credits</CreditLabel>
                <AddCreditsButton onClick={handleAddCredits}>
                  + Add 100 Credits
                </AddCreditsButton>
              </CreditCard>
              
              <CardContainer>
                <CardItem>
                  <h3 style={{ marginTop: 0 }}>What are Credits?</h3>
                  <p>
                    Credits are used to enter competitions. Each competition has a different credit cost depending on the prize value.
                  </p>
                </CardItem>
                <CardItem>
                  <h3 style={{ marginTop: 0 }}>How to Get Credits</h3>
                  <p>
                    In this demo version, you can add free credits to test the platform. In a real application, credits would be purchased.
                  </p>
                </CardItem>
              </CardContainer>
            </Section>
          )}
          
          {activeTab === 'settings' && (
            <Section>
              <SectionTitle>Account Settings</SectionTitle>
              
              <CardContainer>
                <CardItem>
                  <h3 style={{ marginTop: 0 }}>Email Preferences</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Receive competition updates</span>
                    </label>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Receive winner announcements</span>
                    </label>
                  </div>
                </CardItem>
                <CardItem>
                  <h3 style={{ marginTop: 0 }}>Password</h3>
                  <p>
                    You can reset your password via the login page by selecting "Reset Password" and entering your email address.
                  </p>
                </CardItem>
                <CardItem>
                  <h3 style={{ marginTop: 0, color: 'hsl(var(--destructive))' }}>Danger Zone</h3>
                  <p>
                    Permanently delete your account and all associated data.
                  </p>
                  <button 
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: 'transparent',
                      color: 'hsl(var(--destructive))',
                      border: '1px solid hsl(var(--destructive))',
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    Delete Account
                  </button>
                </CardItem>
              </CardContainer>
            </Section>
          )}
        </MainContent>
      </ContentWrapper>
    </Container>
  );
} 