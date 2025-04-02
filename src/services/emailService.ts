import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

/**
 * Send an email to a user
 * Note: This would normally use Firebase Cloud Functions to send emails
 * For now, we'll simulate this process with console logs
 */
export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  templateId?: string,
  data?: any
): Promise<boolean> => {
  // In a real application, this would call a Cloud Function to send the email
  console.log(`[EMAIL SERVICE] Sending email to ${to}`);
  console.log(`[EMAIL SERVICE] Subject: ${subject}`);
  console.log(`[EMAIL SERVICE] Body: ${body}`);
  
  // Simulating a successful email send
  return true;
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (
  email: string,
  displayName?: string
): Promise<boolean> => {
  const subject = 'Welcome to RuneRaffle!';
  const body = `
    Hello ${displayName || 'there'},
    
    Welcome to RuneRaffle, the premier place for RuneScape raffles!
    
    Get started by browsing our active competitions and purchasing tickets.
    
    Good luck!
    
    The RuneRaffle Team
  `;
  
  return sendEmail(email, subject, body, 'welcome_email', { displayName });
};

/**
 * Send a ticket purchase confirmation email
 */
export const sendTicketPurchaseEmail = async (
  email: string,
  displayName: string,
  competitionTitle: string,
  ticketNumber: number,
  purchaseDate: Date,
  competitionEndsAt: Date,
  competitionId: string
): Promise<boolean> => {
  const subject = `Ticket Purchase Confirmation - ${competitionTitle}`;
  const body = `
    Hello ${displayName},
    
    Thank you for purchasing a ticket for the "${competitionTitle}" competition!
    
    Ticket Details:
    - Ticket Number: #${ticketNumber}
    - Purchase Date: ${purchaseDate.toLocaleDateString()}
    - Competition Ends: ${competitionEndsAt.toLocaleDateString()}
    
    You can view the competition details and track your entry at:
    ${window.location.origin}/competition/${competitionId}
    
    Good luck!
    
    The RuneRaffle Team
  `;
  
  return sendEmail(email, subject, body, 'ticket_purchase', {
    displayName,
    competitionTitle,
    ticketNumber,
    purchaseDate,
    competitionEndsAt,
    competitionId
  });
};

/**
 * Send a winner notification email
 */
export const sendWinnerEmail = async (
  email: string,
  displayName: string,
  competitionTitle: string,
  prize: string,
  prizeValue: string,
  competitionId: string
): Promise<boolean> => {
  const subject = `Congratulations! You've Won - ${competitionTitle}`;
  const body = `
    Hello ${displayName},
    
    CONGRATULATIONS! You're a winner in the "${competitionTitle}" competition!
    
    Prize Details:
    - Prize: ${prize}
    - Value: ${prizeValue}
    
    You can verify the draw results at:
    ${window.location.origin}/verification/${competitionId}
    
    Our team will contact you shortly to arrange the delivery of your prize.
    
    Best regards,
    
    The RuneRaffle Team
  `;
  
  return sendEmail(email, subject, body, 'winner_notification', {
    displayName,
    competitionTitle,
    prize,
    prizeValue,
    competitionId
  });
};

/**
 * Send a competition ending soon notification
 */
export const sendCompetitionEndingSoonEmail = async (
  email: string,
  displayName: string,
  competitionTitle: string,
  hoursRemaining: number,
  competitionId: string
): Promise<boolean> => {
  const subject = `Competition Ending Soon - ${competitionTitle}`;
  const body = `
    Hello ${displayName},
    
    The "${competitionTitle}" competition is ending soon! Only ${hoursRemaining} hours remaining.
    
    Don't miss your chance to win! Purchase additional tickets now:
    ${window.location.origin}/competition/${competitionId}
    
    Good luck!
    
    The RuneRaffle Team
  `;
  
  return sendEmail(email, subject, body, 'competition_ending', {
    displayName,
    competitionTitle,
    hoursRemaining,
    competitionId
  });
};

// Add this function to send emails to users who have successfully earned referral rewards
export const sendReferralRewardEmail = async (
  email: string,
  displayName: string,
  creditAmount: number
): Promise<void> => {
  try {
    console.log(`[EMAIL] Sending referral reward email to ${email}...`);
    
    const payload = {
      to: email,
      template: {
        name: 'referral-reward',
        data: {
          displayName,
          creditAmount,
          date: new Date().toLocaleDateString(),
          loginUrl: `${window.location.origin}/login`
        }
      }
    };
    
    // In a real implementation, this would call an API endpoint
    console.log(`[EMAIL] Referral reward email payload:`, payload);
    console.log(`[EMAIL] Referral reward email sent to ${email} successfully!`);
    
  } catch (error) {
    console.error('Error sending referral reward email:', error);
  }
}; 