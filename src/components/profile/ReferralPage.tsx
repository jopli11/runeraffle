import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { 
  getOrCreateReferralCode, 
  getUserReferralStats,
  REFERRAL_CREDIT_REWARD,
  REFEREE_CREDIT_REWARD
} from '../../services/referralService';
import ShareButtons from '../social/ShareButtons';

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
`;

const Card = styled.div`
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  overflow: hidden;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  color: hsl(var(--muted-foreground));
  margin-bottom: 0;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const ReferralCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ReferralCode = styled.div`
  background-color: hsl(var(--muted) / 0.1);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px dashed hsl(var(--border));
  text-align: center;
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  color: hsl(var(--primary));
`;

const CopyButton = styled.button`
  background-color: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: hsl(var(--primary) / 0.9);
  }
`;

const ReferralUrl = styled.div`
  margin-top: 2rem;
  background-color: hsl(var(--muted) / 0.1);
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  word-break: break-all;
`;

const ReferralStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: hsl(var(--muted) / 0.1);
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: hsl(var(--primary));
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const RewardInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RewardInfoCard = styled.div`
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RewardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const RewardDescription = styled.p`
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  margin-bottom: 0;
  flex-grow: 1;
`;

const RewardAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: hsl(var(--primary));
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: hsl(var(--muted-foreground));
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: hsl(var(--destructive));
  background-color: hsl(var(--destructive) / 0.1);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
`;

export function ReferralPage() {
  const { currentUser } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    pendingRewards: number;
    completedRewards: number;
    totalEarned: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  const referralUrl = currentUser && referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}`
    : '';
  
  useEffect(() => {
    const loadReferralData = async () => {
      if (!currentUser || !currentUser.email) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get or create the user's referral code
        const code = await getOrCreateReferralCode(currentUser.uid, currentUser.email);
        setReferralCode(code);
        
        // Get referral stats
        const stats = await getUserReferralStats(currentUser.uid);
        setReferralStats(stats);
      } catch (err) {
        console.error('Error loading referral data:', err);
        setError('Failed to load referral data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReferralData();
  }, [currentUser]);
  
  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  const handleCopyUrl = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  if (loading) {
    return <LoadingContainer>Loading referral information...</LoadingContainer>;
  }
  
  return (
    <Container>
      <Header>
        <Title>Refer Friends, Earn Credits</Title>
        <Subtitle>
          Share your unique referral code with friends and earn credits when they sign up and participate.
        </Subtitle>
      </Header>
      
      {error && (
        <ErrorContainer>{error}</ErrorContainer>
      )}
      
      <RewardInfoGrid>
        <RewardInfoCard>
          <RewardTitle>You'll receive</RewardTitle>
          <RewardDescription>
            When someone uses your referral code to sign up and makes their first purchase, you'll receive credits as a reward.
          </RewardDescription>
          <RewardAmount>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {REFERRAL_CREDIT_REWARD} credits
          </RewardAmount>
        </RewardInfoCard>
        
        <RewardInfoCard>
          <RewardTitle>They'll receive</RewardTitle>
          <RewardDescription>
            Your friends will also get bonus credits when they sign up using your referral code. A win-win for everyone!
          </RewardDescription>
          <RewardAmount>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {REFEREE_CREDIT_REWARD} credits
          </RewardAmount>
        </RewardInfoCard>
      </RewardInfoGrid>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends or use the direct link below.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <ReferralCodeContainer>
            <ReferralCode>{referralCode}</ReferralCode>
            <CopyButton onClick={handleCopyCode}>
              {copied ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                  </svg>
                  Copy Code
                </>
              )}
            </CopyButton>
          </ReferralCodeContainer>
          
          <ReferralUrl>
            <strong>Direct sign-up link:</strong> {referralUrl}
            <CopyButton onClick={handleCopyUrl} style={{ marginTop: '1rem' }}>
              {copied ? 'Link Copied!' : 'Copy Sign-up Link'}
            </CopyButton>
          </ReferralUrl>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>
            Easily share your referral link on social media or via message.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <ShareButtons 
            title="Join me on RuneRaffle and get free credits!"
            url={referralUrl}
            description="Sign up using my referral link and get bonus credits to start entering raffles for epic RuneScape prizes."
          />
        </CardBody>
      </Card>
      
      {referralStats && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Stats</CardTitle>
            <CardDescription>
              Track how many friends you've referred and credits you've earned.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <ReferralStatsGrid>
              <StatCard>
                <StatValue>{referralStats.totalReferrals}</StatValue>
                <StatLabel>Total Referrals</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{referralStats.pendingRewards}</StatValue>
                <StatLabel>Pending Rewards</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{referralStats.completedRewards}</StatValue>
                <StatLabel>Completed Rewards</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{referralStats.totalEarned}</StatValue>
                <StatLabel>Total Credits Earned</StatLabel>
              </StatCard>
            </ReferralStatsGrid>
          </CardBody>
        </Card>
      )}
    </Container>
  );
} 