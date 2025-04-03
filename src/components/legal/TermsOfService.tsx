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

export default function TermsOfService() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container>
      <Title>TERMS & CONDITIONS</Title>
      <LastUpdated>Last Updated: {lastUpdated}</LastUpdated>

      <ContentBlock>
        <p>
          These Terms & Conditions ("Terms") govern your use of the RuneRaffle website (the "Site") and participation in any competitions, 
          prize draws, or skill-based challenges ("Competitions") hosted on the Site. By accessing or using the Site, or by entering 
          any Competition, you agree to these Terms. If you do not agree, do not use this Site.
        </p>
      </ContentBlock>

      <Disclaimer>
        <strong>Important:</strong> We are not affiliated with or endorsed by Jagex Ltd. ("Jagex") or RuneScape in any way. 
        RuneScape is a trademark of Jagex. The Site is an independent, fan-operated platform.
      </Disclaimer>

      <Section>
        <SectionTitle>1. Operator Information</SectionTitle>
        <ContentBlock>
          <p>Website Operator: RuneRaffle Ltd. ("We," "Us," "Our").</p>
          <p>Registered Address: 123 Gaming Street, London, UK.</p>
          <p>Contact Email: support@runeraffle.com.</p>
          <p>
            Please note we are not a gambling operator. Our Competitions are designed as skill-based prize competitions with a 
            free entry route, intended to comply with the Gambling Act 2005 (UK). If you have any queries about these Terms, 
            please contact us at the email above.
          </p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>2. Eligibility</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Age Requirement:</strong> You must be at least 18 years old to enter Competitions on this Site. 
              By registering or participating, you confirm that you meet this requirement.
            </ListItem>
            <ListItem>
              <strong>Residency:</strong> Competitions are primarily open to residents of the United Kingdom. Participants from 
              outside the UK may be subject to additional verification or restrictions, at Our sole discretion.
            </ListItem>
            <ListItem>
              <strong>Exclusions:</strong> Employees, agents, affiliates, or family members of RuneRaffle Ltd. may be excluded 
              from entering or winning Competitions, at Our discretion.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>3. Nature of Competitions</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Skill Component:</strong> Our Competitions require participants to answer a question, puzzle, or other 
              skill-based task ("Skill Question") correctly in order to be entered into a prize draw. Only correct entries 
              proceed to the final selection stage.
            </ListItem>
            <ListItem>
              <strong>Free Entry Route:</strong> A free entry method is available to all participants. You can post a written 
              entry request to our registered address, including your full name, email address, and your answer to the Skill 
              Question. No purchase is necessary to enter via this route. All free entries have an equal chance of winning.
            </ListItem>
            <ListItem>
              <strong>Chance Element:</strong> Among all correct entries, a random process (e.g. a draw or random number generator) 
              is used to determine the winner. While random selection is used, the overall Competition is classified as skill-based 
              due to the requirement of answering the Skill Question correctly.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>4. Tickets, Entry & Payments</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Tickets:</strong> Where tickets are offered for entry (paid or free), these represent your entries into 
              the Competition once you have correctly answered the Skill Question.
            </ListItem>
            <ListItem>
              <strong>Payment (If Any):</strong> Currently, we do not accept real-money payments for entries. We may offer optional 
              paid entry methods in future. In that event, these Terms will be updated and you will be notified.
            </ListItem>
            <ListItem>
              <strong>No Real-World Value:</strong> Prizes are in-game RuneScape items and are considered to have no real-world 
              monetary value. They cannot be exchanged for cash or any other real currency.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>5. Conduct & Compliance</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Accurate Information:</strong> You are responsible for providing true, accurate, and complete information 
              during registration and Competition entry (including your RuneScape username if applicable).
            </ListItem>
            <ListItem>
              <strong>One Account:</strong> You must not create multiple accounts or attempt to circumvent entry limits.
            </ListItem>
            <ListItem>
              <strong>Cheating or Fraud:</strong> Any manipulation, hacking, or fraudulent activity to gain unfair advantage may 
              result in disqualification, account termination, or legal action.
            </ListItem>
            <ListItem>
              <strong>Legal Compliance:</strong> You agree to comply with all applicable local, national, and international laws 
              and regulations relating to your participation in the Competitions.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>6. Winners & Prizes</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Selection of Winners:</strong> At the close of each Competition, all correct entries will be placed into a 
              random draw. The winner(s) will be selected using a provably fair or random algorithm.
            </ListItem>
            <ListItem>
              <strong>Announcement:</strong> Winners will be notified by email and may be announced on the Site (e.g., username/first name) 
              for transparency. You consent to limited publication of your username or first name for promotional purposes.
            </ListItem>
            <ListItem>
              <strong>Prize Delivery:</strong> Prizes are RuneScape in-game items. Arrangements for in-game delivery (trade) will be 
              communicated. We are not responsible for any restrictions or conditions imposed by Jagex.
            </ListItem>
            <ListItem>
              <strong>No Cash Alternative:</strong> Prizes cannot be exchanged for real money or other real-world items.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>7. Disclaimers</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>No Affiliation:</strong> We are not endorsed by or associated with Jagex, and Jagex has no responsibility or 
              liability for our Site or Competitions.
            </ListItem>
            <ListItem>
              <strong>No Guarantee of Uninterrupted Service:</strong> While we strive for continuous availability, the Site may be 
              subject to downtime, maintenance, or technical issues. We are not liable for lost entries or technical malfunctions.
            </ListItem>
            <ListItem>
              <strong>Compliance with RuneScape Terms:</strong> You are responsible for following RuneScape's Terms of Service regarding 
              item trades. We disclaim liability if Jagex imposes restrictions or penalties on your account due to prize acceptance.
            </ListItem>
            <ListItem>
              <strong>Not Gambling:</strong> We have designed these Competitions as skill-based, with a free entry route, to ensure 
              compliance with UK law. We do not accept liability if any regulatory body reclassifies our Competitions as gambling.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>8. Limitation of Liability</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Extent of Liability:</strong> To the fullest extent permitted by law, We and our affiliates, officers, employees, 
              or agents shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of 
              the Site or participation in Competitions.
            </ListItem>
            <ListItem>
              <strong>Prize Fulfilment:</strong> We shall make all reasonable efforts to deliver in-game items but shall not be 
              responsible for circumstances outside our control, such as game server downtime or game policy changes affecting trades.
            </ListItem>
            <ListItem>
              <strong>No Guarantee of Winnings:</strong> Participation does not guarantee winning a prize. All entries are subject to 
              random selection from among eligible participants.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>9. Data Protection & Privacy</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Personal Data:</strong> We collect and store your personal data (name, email, RuneScape username, etc.) only as 
              necessary to operate Competitions and maintain user accounts.
            </ListItem>
            <ListItem>
              <strong>Compliance:</strong> We process personal data in accordance with UK GDPR and other relevant data protection laws.
            </ListItem>
            <ListItem>
              <strong>Privacy Policy:</strong> Please see our Privacy Policy for full details on how we handle and protect your data.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>10. Termination & Disqualification</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Site Termination:</strong> We reserve the right to discontinue or suspend the Site or any Competition at any time 
              without prior notice if circumstances necessitate.
            </ListItem>
            <ListItem>
              <strong>Disqualification:</strong> We reserve the right to disqualify any participant for breaching these Terms, providing 
              false information, or engaging in fraudulent or illegal activities.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>11. Changes to These Terms</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Updates:</strong> We may update or revise these Terms at any time. When we do, we will post the revised Terms with 
              a new "Last Updated" date.
            </ListItem>
            <ListItem>
              <strong>Acceptance of Revisions:</strong> Continued use of the Site after updates constitutes acceptance of the revised Terms.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>12. Governing Law & Dispute Resolution</SectionTitle>
        <ContentBlock>
          <List>
            <ListItem>
              <strong>Governing Law:</strong> These Terms and any dispute or claim arising out of or in connection with them (including 
              non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of England and Wales.
            </ListItem>
            <ListItem>
              <strong>Jurisdiction:</strong> You agree that courts of England and Wales shall have exclusive jurisdiction to settle any 
              disputes related to these Terms, the Site, or any Competitions.
            </ListItem>
          </List>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>13. Severability</SectionTitle>
        <ContentBlock>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck out and the remaining 
            provisions shall remain in full force and effect.
          </p>
        </ContentBlock>
      </Section>

      <Section>
        <SectionTitle>14. Contact Us</SectionTitle>
        <ContentBlock>
          <p>If you have any questions or complaints about these Terms, please contact us at:</p>
          <p>Email: support@runeraffle.com</p>
          <p>Address: 123 Gaming Street, London, UK</p>
        </ContentBlock>
      </Section>

      <Disclaimer>
        <strong>Disclaimer:</strong> This document is a general example and does not constitute legal advice. For specific guidance, 
        consult a qualified legal professional knowledgeable in UK law.
      </Disclaimer>
    </Container>
  );
} 