import React from 'react';
import styled from '@emotion/styled';

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`;

const LastUpdated = styled.p`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
  text-align: center;
`;

const Disclaimer = styled.div`
  background-color: hsl(var(--muted) / 0.1);
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
  font-weight: 500;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: hsl(var(--primary));
`;

const ContentBlock = styled.div`
  margin-bottom: 1rem;
`;

const List = styled.ul`
  padding-left: 1.5rem;
  margin-bottom: 1rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
`;

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container>
      <Title>PRIVACY POLICY</Title>
      <LastUpdated>Last Updated: {lastUpdated}</LastUpdated>

      <ContentBlock>
        <p>
          This Privacy Policy explains how RuneRaffle ("we", "us", "our") collects, uses, and protects your personal information
          when you visit our website or use our services. We are committed to ensuring that your privacy is protected.
        </p>
      </ContentBlock>

      <Disclaimer>
        <strong>Important:</strong> We are not affiliated with or endorsed by Jagex Ltd. ("Jagex") or RuneScape in any way. 
        RuneScape is a trademark of Jagex. RuneRaffle is an independent, fan-operated platform.
      </Disclaimer>

      <Section>
        <SectionTitle>1. Information We Collect</SectionTitle>
        <ContentBlock>
          <p>We may collect the following information:</p>
          <List>
            <ListItem>Personal information such as name and email address</ListItem>
            <ListItem>RuneScape username/in-game identity</ListItem>
            <ListItem>Account information and preferences</ListItem>
            <ListItem>IP address and basic device information</ListItem>
            <ListItem>Website usage data through cookies and similar technologies</ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>2. Why We Collect Your Information</SectionTitle>
        <ContentBlock>
          <p>We collect your information for the following purposes:</p>
          <List>
            <ListItem>To provide and maintain our services</ListItem>
            <ListItem>To verify your identity and manage your account</ListItem>
            <ListItem>To process competition entries and distribute prizes</ListItem>
            <ListItem>To communicate with you about competitions, updates, and support</ListItem>
            <ListItem>To improve our website and user experience</ListItem>
            <ListItem>To prevent fraud and ensure compliance with our Terms of Service</ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>3. How We Use Your Information</SectionTitle>
        <ContentBlock>
          <p>We use your information in the following ways:</p>
          <List>
            <ListItem>
              <strong>Account Management:</strong> We use your email and personal details to create and maintain your account, 
              verify your identity, and provide customer support.
            </ListItem>
            <ListItem>
              <strong>Competition Administration:</strong> We use your information to process your competition entries, notify you 
              of results, and arrange delivery of prizes.
            </ListItem>
            <ListItem>
              <strong>Communications:</strong> We may contact you regarding prize notifications, account updates, service announcements, 
              and customer support.
            </ListItem>
            <ListItem>
              <strong>Service Improvement:</strong> We analyze usage patterns to improve our website functionality and user experience.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>4. How We Store and Protect Your Information</SectionTitle>
        <ContentBlock>
          <p>We are committed to ensuring that your information is secure. We have implemented suitable physical, electronic, and managerial 
          procedures to safeguard and secure the information we collect online.</p>
          <p>Your data is stored securely on Firebase servers (Google Cloud Platform) with industry-standard security measures. We retain your 
          personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy.</p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>5. Cookies and Tracking</SectionTitle>
        <ContentBlock>
          <p>Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us 
          provide you with a better website by enabling us to monitor which pages you find useful.</p>
          <p>We use cookies for:</p>
          <List>
            <ListItem>Authentication and maintaining your login session</ListItem>
            <ListItem>Understanding how you use our website</ListItem>
            <ListItem>Remembering your preferences</ListItem>
          </List>
          <p>You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your 
          browser settings to decline cookies if you prefer.</p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>6. Third-Party Services</SectionTitle>
        <ContentBlock>
          <p>We may use third-party services to help operate our business and the website or administer activities on our behalf. These 
          third-party services include:</p>
          <List>
            <ListItem>Google Firebase (authentication, hosting, and database)</ListItem>
            <ListItem>Email service providers for notifications</ListItem>
            <ListItem>Analytics services to improve our website</ListItem>
          </List>
          <p>These services may collect or access your information for the purposes of supporting our services. All third-party providers 
          have their own privacy policies governing how they use this information.</p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>7. Your Rights</SectionTitle>
        <ContentBlock>
          <p>Under data protection laws, you have rights regarding your personal data including:</p>
          <List>
            <ListItem>
              <strong>Right to Access:</strong> You can request copies of your personal data.
            </ListItem>
            <ListItem>
              <strong>Right to Rectification:</strong> You can request that we correct inaccurate personal data.
            </ListItem>
            <ListItem>
              <strong>Right to Erasure:</strong> You can request that we delete your personal data in certain circumstances.
            </ListItem>
            <ListItem>
              <strong>Right to Restrict Processing:</strong> You can request we restrict the processing of your personal data.
            </ListItem>
            <ListItem>
              <strong>Right to Data Portability:</strong> You can request the transfer of your personal data to you or a third party.
            </ListItem>
            <ListItem>
              <strong>Right to Object:</strong> You can object to processing of your personal data in certain circumstances.
            </ListItem>
          </List>
          <p>To exercise any of these rights, please contact us using the information in the "Contact Us" section below.</p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>8. Children's Privacy</SectionTitle>
        <ContentBlock>
          <p>Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from 
          children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please 
          contact us, and we will delete such information from our systems.</p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>9. Changes to This Privacy Policy</SectionTitle>
        <ContentBlock>
          <p>We may update this Privacy Policy from time to time by posting a new version on our website. You should check this page 
          occasionally to ensure you are happy with any changes. If we make significant changes to this Privacy Policy, we will notify 
          you through a prominent notice on our website or by email.</p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>10. Contact Us</SectionTitle>
        <ContentBlock>
          <p>If you have any questions about this Privacy Policy or how we handle your personal information, please contact us at:</p>
          <p>Email: support@runeraffle.com</p>
          <p>Address: 123 Gaming Street, London, UK</p>
        </ContentBlock>
      </Section>

      <Disclaimer>
        <strong>Disclaimer:</strong> This document is a general example and does not constitute legal advice. For specific guidance, 
        consult a qualified legal professional knowledgeable in data protection law.
      </Disclaimer>
    </Container>
  );
} 