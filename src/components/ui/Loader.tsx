import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface LoaderProps {
  size?: number;
  fullPage?: boolean;
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const LoaderContainer = styled.div<{ fullPage?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  ${props => props.fullPage && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: hsla(var(--background), 0.8);
    z-index: 50;
  `}
`;

const LoaderWrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SpinnerSvg = styled.svg`
  animation: ${rotate} 2s linear infinite;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${pulse} 1.5s ease-in-out infinite;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 24px;
  line-height: 1;
`;

const FirstLetter = styled.span`
  color: white;
`;

const SecondLetter = styled.span`
  color: hsl(var(--primary));
`;

export function Loader({ size = 60, fullPage = false }: LoaderProps) {
  return (
    <LoaderContainer fullPage={fullPage}>
      <LoaderWrapper size={size}>
        <SpinnerSvg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            stroke="hsla(var(--primary), 0.3)"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            stroke="hsl(var(--primary))"
            strokeDasharray="125.6"
            strokeDashoffset="37.7"
            strokeLinecap="round"
          />
        </SpinnerSvg>
        <LogoContainer>
          <FirstLetter>R</FirstLetter>
          <SecondLetter>R</SecondLetter>
        </LogoContainer>
      </LoaderWrapper>
    </LoaderContainer>
  );
} 