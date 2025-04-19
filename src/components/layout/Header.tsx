import { UserNav } from './UserNav'
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../config/firebase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';

// Styled components
const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: hsl(var(--card));
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

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  text-decoration: none;
  color: white;
  position: relative;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoHighlight = styled.span`
  color: hsl(var(--primary));
`;

// New logo parts for Probemas Raffles
const LogoPro = styled.span`
  color: hsl(var(--primary));
  font-weight: 800;
`;

const LogoBemas = styled.span`
  color: white;
  font-weight: 800;
`;

const DesktopNav = styled.nav`
  display: flex;
  margin-left: 2.5rem;
  gap: 2rem;
`;

const NavLink = styled(Link)<{ active?: boolean | string }>`
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
  color: hsl(var(--primary-foreground));
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
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${({ isOpen }: { isOpen: boolean }) => (isOpen ? '300px' : '0')};
  background-color: hsl(222, 47%, 11%);
`;

const MobileNavLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.5rem 0;
`;

const MobileNavLink = styled(NavLink)`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const HamburgerButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 1rem;

  span {
    width: 100%;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
    transform-origin: left;
  }
  
  &.open {
    span:first-of-type {
      transform: rotate(45deg);
    }
    
    span:nth-of-type(2) {
      opacity: 0;
    }
    
    span:last-of-type {
      transform: rotate(-45deg);
    }
  }
`;

const MobileButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem 1rem;
`;

const CreditSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12L14 14M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userCredits, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get current path from useLocation
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <HeaderContainer>
      <Container>
        <NavBar>
          <LogoContainer>
            {isMobile && (
              <HamburgerButton 
                onClick={toggleMobileMenu}
                className={mobileMenuOpen ? 'open' : ''}
                aria-label="Toggle menu"
              >
                <span />
                <span />
                <span />
              </HamburgerButton>
            )}
            <Logo to="/">
              <span><LogoPro>Pro</LogoPro><LogoBemas>bemas</LogoBemas></span>
            </Logo>
            
            {!isMobile && (
              <DesktopNav>
                <NavLink to="/" active={currentPath === '/' ? true : undefined}>
                  Home
                </NavLink>
                <NavLink to="/competitions" active={(currentPath === '/competitions' || currentPath.startsWith('/competition/')) ? true : undefined}>
                  Raffles
                </NavLink>
                <NavLink to="/winners" active={currentPath === '/winners' ? true : undefined}>
                  Winners
                </NavLink>
                <NavLink to="/how-it-works" active={currentPath === '/how-it-works' ? true : undefined}>
                  How It Works
                </NavLink>
                <NavLink to="/support" active={currentPath === '/support' ? true : undefined}>
                  Support
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" active={currentPath === '/admin' ? true : undefined}>
                    Admin
                  </NavLink>
                )}
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
                <NotificationCenter />
                {!isMobile && (
                  <>
                    <GhostButton onClick={() => navigate('/profile')}>
                      Profile
                    </GhostButton>
                    <PrimaryButton onClick={handleLogout}>
                      Logout
                    </PrimaryButton>
                  </>
                )}
                {isMobile && <UserNav />}
              </>
            ) : (
              !isMobile && (
                <>
                  <GhostButton onClick={() => navigate('/login')}>
                    Login
                  </GhostButton>
                  <PrimaryButton onClick={() => navigate('/register')}>
                    Sign Up
                  </PrimaryButton>
                </>
              )
            )}
          </ButtonsContainer>
        </NavBar>
        
        {isMobile && (
          <MobileNav isOpen={mobileMenuOpen}>
            <MobileNavLinkContainer>
              <MobileNavLink to="/" active={currentPath === '/' ? 'true' : undefined}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/competitions" active={(currentPath === '/competitions' || currentPath.startsWith('/competition/')) ? 'true' : undefined}>
                Raffles
              </MobileNavLink>
              <MobileNavLink to="/winners" active={currentPath === '/winners' ? 'true' : undefined}>
                Winners
              </MobileNavLink>
              <MobileNavLink to="/how-it-works" active={currentPath === '/how-it-works' ? 'true' : undefined}>
                How It Works
              </MobileNavLink>
              <MobileNavLink to="/support" active={currentPath === '/support' ? 'true' : undefined}>
                Support
              </MobileNavLink>
              {isAdmin && (
                <MobileNavLink to="/admin" active={currentPath === '/admin' ? 'true' : undefined}>
                  Admin
                </MobileNavLink>
              )}
            </MobileNavLinkContainer>
            
            {!currentUser ? (
              <MobileButtonsContainer>
                <GhostButton onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}>
                  Login
                </GhostButton>
                <PrimaryButton onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}>
                  Sign Up
                </PrimaryButton>
              </MobileButtonsContainer>
            ) : (
              <MobileButtonsContainer>
                <GhostButton onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}>
                  Profile
                </GhostButton>
                <PrimaryButton onClick={handleLogout}>
                  Logout
                </PrimaryButton>
              </MobileButtonsContainer>
            )}
          </MobileNav>
        )}
      </Container>
    </HeaderContainer>
  );
} 