import React from 'react';
import styled from '@emotion/styled';

interface StyledContainerProps {
  children: React.ReactNode;
  withGlow?: boolean;
  withPattern?: boolean;
  fullWidth?: boolean;
}

const Container = styled.div<{ withGlow?: boolean; withPattern?: boolean; fullWidth?: boolean }>`
  position: relative;
  background-color: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
  padding: 2rem;
  margin-bottom: 2rem;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => props.withGlow && `
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.12);
    border: 1px solid transparent;
    background-image: 
      linear-gradient(hsl(var(--card)), hsl(var(--card))), 
      linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
    background-origin: border-box;
    background-clip: padding-box, border-box;
  `}
  
  ${props => props.withPattern && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/images/pattern.svg') repeat;
      opacity: 0.05;
      z-index: 0;
    }
  `}
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

export function StyledContainer({ 
  children, 
  withGlow = false, 
  withPattern = false,
  fullWidth = false
}: StyledContainerProps) {
  return (
    <Container withGlow={withGlow} withPattern={withPattern} fullWidth={fullWidth}>
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </Container>
  );
} 