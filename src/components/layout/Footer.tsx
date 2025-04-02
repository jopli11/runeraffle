import React from 'react';
import styled from '@emotion/styled';

// Styled components
const FooterContainer = styled.footer`
  width: 100%;
  background-color: hsl(222, 47%, 8%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 0 1.5rem;
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 2rem;
  color: white;

  span {
    letter-spacing: 0.5px;
  }
`;

const LogoHighlight = styled.span`
  color: hsl(var(--primary));
  font-weight: 800;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: hsl(222, 47%, 11%);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &:hover {
    background-color: hsl(var(--primary));
    color: white;
    transform: translateY(-3px);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s ease;
  text-decoration: none;
  
  &:hover {
    color: white;
  }
`;

const DisclaimerSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  max-width: 900px;
`;

const Disclaimer = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const CompanyInfo = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  line-height: 1.6;
`;

const Copyright = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  text-align: center;
`;

const CookieNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: hsl(222, 47%, 11%);
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const CookieText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0;
`;

const CookieButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// SVG Icons
const TwitterIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
  </svg>
);

const DiscordIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17L4 12"></path>
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <FooterContainer>
        <FooterContent>
          <LogoContainer>
            <Logo>
              Rune<LogoHighlight>Raffle</LogoHighlight>
            </Logo>
          </LogoContainer>
          
          <SocialLinks>
            <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <TwitterIcon />
            </SocialLink>
            <SocialLink href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <DiscordIcon />
            </SocialLink>
            <SocialLink href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <YouTubeIcon />
            </SocialLink>
            <SocialLink href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon />
            </SocialLink>
          </SocialLinks>
          
          <NavLinks>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/fairness">Fairness</NavLink>
            <NavLink href="/support">Support</NavLink>
          </NavLinks>
          
          <DisclaimerSection>
            
            <Disclaimer>
              RuneRaffle.com is not affiliated, endorsed by, or in any way associated with RuneScape, Jagex Ltd or any of its subsidiaries or its affiliates.
            </Disclaimer>
            
            <CompanyInfo>
              RuneRaffle.com is a fan-made raffle website created for the RuneScape community.
            </CompanyInfo>
          </DisclaimerSection>
          
          <Copyright>
            ©{currentYear}-{currentYear + 3} RuneRaffle. All Rights Reserved.
          </Copyright>
        </FooterContent>
      </FooterContainer>
      
      <CookieNotice>
        <CookieText>
          This website uses cookies to improve your experience. By using this site, you agree to our use of cookies.
        </CookieText>
      </CookieNotice>
    </>
  );
} 