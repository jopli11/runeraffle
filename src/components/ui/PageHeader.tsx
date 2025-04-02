import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  centered?: boolean;
  withAnimation?: boolean;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HeaderContainer = styled.div<{ centered?: boolean, withAnimation?: boolean }>`
  margin-bottom: 2rem;
  text-align: ${props => props.centered ? 'center' : 'left'};
  animation: ${props => props.withAnimation ? fadeIn : 'none'} 0.5s ease-out forwards;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: hsl(var(--foreground));
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  max-width: 800px;
  margin-left: ${props => props.style?.textAlign === 'center' ? 'auto' : '0'};
  margin-right: ${props => props.style?.textAlign === 'center' ? 'auto' : '0'};
`;

const ExtraContent = styled.div`
  margin-top: 1.5rem;
`;

export function PageHeader({ 
  title, 
  description, 
  children, 
  centered = false, 
  withAnimation = true 
}: PageHeaderProps) {
  return (
    <HeaderContainer centered={centered} withAnimation={withAnimation}>
      <Title>{title}</Title>
      {description && (
        <Description style={{ textAlign: centered ? 'center' : 'left' }}>
          {description}
        </Description>
      )}
      {children && <ExtraContent>{children}</ExtraContent>}
    </HeaderContainer>
  );
} 