import React, { useState } from 'react';
import styled from '@emotion/styled';
import { registerWithEmail, loginWithEmail, signInWithGoogle, sendPasswordResetEmail } from '../../config/firebase';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 1.5rem;
  background: linear-gradient(to bottom, rgba(13, 6, 32, 0.8) 0%, rgba(13, 6, 32, 0.95) 100%);
`;

const Card = styled.div`
  width: 100%;
  max-width: 450px;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  background: linear-gradient(to right, hsl(var(--primary)), hsl(265, 83%, 45%));
  color: white;
  text-align: center;
`;

const CardTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: ${props => props.active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? 'hsl(var(--primary))' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => !props.active && 'hsl(var(--foreground))'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsla(var(--primary), 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background: hsl(var(--primary));
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: hsl(265, 83%, 45%);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(Button)`
  background: #4285F4;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #3367D6;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: hsl(var(--border));
  }

  &::before {
    margin-right: 1rem;
  }

  &::after {
    margin-left: 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: hsl(var(--destructive));
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await loginWithEmail(email, password);
        window.navigate('/');
      } else if (activeTab === 'register') {
        await registerWithEmail(email, password, displayName);
        setSuccessMessage('Account created! Please check your email for verification.');
        setTimeout(() => window.navigate('/'), 2000);
      } else if (activeTab === 'reset') {
        await sendPasswordResetEmail(email);
        setSuccessMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Format Firebase error messages to be more user-friendly
      const errorCode = err.code || '';
      
      // Handle specific error codes
      if (errorCode.includes('auth/user-not-found') || errorCode.includes('auth/wrong-password')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorCode.includes('auth/email-already-in-use')) {
        setError('This email is already registered. Please log in instead.');
      } else if (errorCode.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else if (errorCode.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (errorCode.includes('auth/network-request-failed')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorCode.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else if (errorCode.includes('auth/api-key-not-valid')) {
        setError('Authentication service error. Please contact support.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signInWithGoogle();
      window.navigate('/');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      // Format Firebase error messages to be more user-friendly
      const errorCode = err.code || '';
      
      // Handle specific error codes
      if (errorCode.includes('auth/popup-closed-by-user')) {
        setError('Sign-in popup was closed. Please try again.');
      } else if (errorCode.includes('auth/popup-blocked')) {
        setError('Sign-in popup was blocked. Please allow popups for this site.');
      } else if (errorCode.includes('auth/cancelled-popup-request')) {
        // This is a normal flow when user closes the popup, don't show error
        setError(null);
      } else if (errorCode.includes('auth/network-request-failed')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorCode.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else if (errorCode.includes('auth/api-key-not-valid')) {
        setError('Authentication service error. Please contact support.');
      } else {
        setError(err.message || 'An error occurred during Google sign-in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'login' ? 'Welcome Back' : activeTab === 'register' ? 'Create Account' : 'Reset Password'}</CardTitle>
          <CardDescription>
            {activeTab === 'login' ? 'Sign in to your account to continue' : 
             activeTab === 'register' ? 'Create a new account to get started' :
             'Enter your email to reset your password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs>
            <Tab 
              active={activeTab === 'login'} 
              onClick={() => { setActiveTab('login'); setError(null); setSuccessMessage(null); }}
            >
              Login
            </Tab>
            <Tab 
              active={activeTab === 'register'} 
              onClick={() => { setActiveTab('register'); setError(null); setSuccessMessage(null); }}
            >
              Register
            </Tab>
            <Tab 
              active={activeTab === 'reset'} 
              onClick={() => { setActiveTab('reset'); setError(null); setSuccessMessage(null); }}
            >
              Reset
            </Tab>
          </Tabs>
          
          {successMessage && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'rgb(22, 163, 74)', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {successMessage}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <FormGroup>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  required={activeTab === 'register'}
                />
              </FormGroup>
            )}
            
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </FormGroup>
            
            {activeTab !== 'reset' && (
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required={activeTab !== 'reset'}
                />
              </FormGroup>
            )}
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : activeTab === 'register' ? 'Create Account' : 'Reset Password'}
            </Button>
          </Form>
          
          {activeTab !== 'reset' && (
            <>
              <Divider>Or continue with</Divider>
              <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon />
                Sign {activeTab === 'login' ? 'in' : 'up'} with Google
              </GoogleButton>
            </>
          )}
          
          {activeTab === 'login' && (
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setActiveTab('reset'); setError(null); setSuccessMessage(null); }}
                style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}
              >
                Forgot your password?
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
} 