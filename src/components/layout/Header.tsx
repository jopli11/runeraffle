import { UserNav } from './UserNav'
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../config/firebase';

// Styled components
const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: hsl(222, 47%, 11%);
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const NavBar = styled.div`
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1.5rem;
  text-decoration: none;
  color: white;
  position: relative;
  
  &:hover {
    color: hsl(var(--primary));
  }
  
  span {
    letter-spacing: 0.5px;
  }
`;

const LogoX = styled.span`
  color: hsl(var(--primary));
  font-weight: 800;
`;

const DesktopNav = styled.nav`
  display: flex;
  margin-left: 2.5rem;
  gap: 2rem;
`;

const NavLink = styled.a<{ active?: boolean }>`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  transition: all 0.2s;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  
  &:hover {
    color: white;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 2px;
    background-color: hsl(var(--primary));
    transition: width 0.2s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Button = styled.button`
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const GhostButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  border: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: hsl(var(--primary));
  color: white;
  border: none;
  
  &:hover {
    background-color: hsl(var(--primary), 0.9);
    transform: translateY(-1px);
  }
`;

const CreditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  margin-right: 0.5rem;
`;

const CreditIcon = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--primary));
`;

const CreditValue = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
`;

const MobileNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-x: auto;
  padding: 0.5rem 0;
`;

const MobileNavLink = styled(NavLink)`
  white-space: nowrap;
`;

const CreditSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { currentUser, userCredits } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.navigate(path);
  };
  
  // Get current path
  const currentPath = window.location.pathname;

  const handleLogout = async () => {
    try {
      await logOut();
      window.navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <HeaderContainer>
      <Container>
        <NavBar>
          <LogoContainer>
            <div>
              <Logo 
                href="#" 
                onClick={(e) => handleNavClick(e, '/')}
              >
                Rune<LogoX>Raffle</LogoX>
              </Logo>
            </div>
            
            {!isMobile && (
              <DesktopNav>
                <NavLink 
                  href="#" 
                  onClick={(e) => handleNavClick(e, '/')}
                  active={currentPath === '/'}
                >
                  Home
                </NavLink>
                <NavLink 
                  href="#" 
                  onClick={(e) => handleNavClick(e, '/competitions')}
                  active={currentPath === '/competitions'}
                >
                  Competitions
                </NavLink>
                <NavLink 
                  href="#" 
                  onClick={(e) => handleNavClick(e, '/winners')}
                  active={currentPath === '/winners'}
                >
                  Winners
                </NavLink>
                <NavLink 
                  href="#" 
                  onClick={(e) => handleNavClick(e, '/how-it-works')}
                  active={currentPath === '/how-it-works'}
                >
                  How It Works
                </NavLink>
              </DesktopNav>
            )}
          </LogoContainer>
          
          <ButtonsContainer>
            {currentUser ? (
              <>
                <CreditContainer>
                  <CreditIcon>
                    <CreditSvg />
                  </CreditIcon>
                  <CreditValue>{userCredits}</CreditValue>
                </CreditContainer>
                <GhostButton onClick={() => window.navigate('/profile')}>
                  Profile
                </GhostButton>
                <PrimaryButton onClick={handleLogout}>
                  Logout
                </PrimaryButton>
                <UserNav />
              </>
            ) : (
              <>
                <GhostButton onClick={() => window.navigate('/login')}>
                  Login
                </GhostButton>
                <PrimaryButton onClick={() => window.navigate('/register')}>
                  Register
                </PrimaryButton>
              </>
            )}
          </ButtonsContainer>
        </NavBar>
        
        {isMobile && (
          <MobileNav>
            <MobileNavLink 
              href="#" 
              onClick={(e) => handleNavClick(e, '/')}
              active={currentPath === '/'}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              href="#" 
              onClick={(e) => handleNavClick(e, '/competitions')}
              active={currentPath === '/competitions'}
            >
              Competitions
            </MobileNavLink>
            <MobileNavLink 
              href="#" 
              onClick={(e) => handleNavClick(e, '/winners')}
              active={currentPath === '/winners'}
            >
              Winners
            </MobileNavLink>
            <MobileNavLink 
              href="#" 
              onClick={(e) => handleNavClick(e, '/how-it-works')}
              active={currentPath === '/how-it-works'}
            >
              How It Works
            </MobileNavLink>
          </MobileNav>
        )}
      </Container>
    </HeaderContainer>
  );
} 