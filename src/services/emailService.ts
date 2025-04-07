import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

/**
 * Check if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

/**
 * Get environment variables
 */
const MAILGUN_API_KEY = import.meta.env.VITE_MAILGUN_API_KEY;
const MAILGUN_DOMAIN = import.meta.env.VITE_MAILGUN_DOMAIN;
const MAILGUN_REGION = import.meta.env.VITE_MAILGUN_REGION || 'eu';
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || 'noreply@runeraffle.com';

/**
 * Check if Mailgun is configured
 */
const isMailgunConfigured = MAILGUN_API_KEY && MAILGUN_DOMAIN;

/**
 * Send an email via Mailgun directly from the client
 * Note: This should only be used for non-sensitive emails as it exposes your API key
 * For production, it's better to use a server-side function to send emails
 */
const sendMailgunEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    if (!isMailgunConfigured) {
      console.warn('[EMAIL SERVICE] Mailgun is not properly configured. Check your environment variables.');
      return false;
    }

    const endpoint = MAILGUN_REGION === 'eu' 
      ? 'https://api.eu.mailgun.net/v3' 
      : 'https://api.mailgun.net/v3';
    
    const url = `${endpoint}/${MAILGUN_DOMAIN}/messages`;
    
    const formData = new FormData();
    formData.append('from', EMAIL_FROM);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun API error: ${error}`);
    }
    
    console.log('[EMAIL SERVICE] Email sent successfully via Mailgun');
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending email via Mailgun:', error);
    return false;
  }
};

/**
 * Send email using Firebase Cloud Function (preferred for production)
 */
const sendEmailViaFirebase = async (
  to: string,
  subject: string,
  html: string,
  templateId?: string,
  data?: any
): Promise<boolean> => {
  try {
    // Initialize the callable function with EU region
    const sendEmailFn = firebase.app().functions('europe-west2').httpsCallable('sendEmail');
    
    // Call the function with the email data
    await sendEmailFn({
      to,
      subject,
      html,
      template: templateId,
      data
    });
    
    console.log('[EMAIL SERVICE] Email sent successfully via Firebase Cloud Function');
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending email via Firebase:', error);
    throw error; // Re-throw to allow the main function to try the fallback
  }
};

/**
 * Send an email to a user
 * Tries Firebase Cloud Function first, then falls back to Mailgun direct API if configured,
 * and finally just logs the email content if in development mode
 */
export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  templateId?: string,
  data?: any
): Promise<boolean> => {
  try {
    // In development mode with emulator flag disabled, just log the email
    if (isDevelopment && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'true') {
      console.log(`[EMAIL SERVICE DEV MODE] Would send email to ${to}`);
      console.log(`[EMAIL SERVICE DEV MODE] Subject: ${subject}`);
      console.log(`[EMAIL SERVICE DEV MODE] Body: ${body}`);
      return true;
    }
    
    // First attempt: Use Firebase Cloud Function
    try {
      return await sendEmailViaFirebase(to, subject, body, templateId, data);
    } catch (firebaseError) {
      console.log('[EMAIL SERVICE] Firebase email failed, trying Mailgun fallback');
      
      // Second attempt: Use Mailgun API directly if configured
      if (isMailgunConfigured) {
        return await sendMailgunEmail(to, subject, body);
      }
      
      // If Mailgun is not configured, throw the original error
      throw firebaseError;
    }
  } catch (error) {
    console.error('[EMAIL SERVICE] All email sending methods failed:', error);
    
    // Fallback to console log for development
    console.log(`[EMAIL SERVICE] Fallback: Email content that would be sent to ${to}`);
    console.log(`[EMAIL SERVICE] Subject: ${subject}`);
    console.log(`[EMAIL SERVICE] Body: ${body}`);
    
    return false;
  }
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
    <h1>Welcome to RuneRaffle, ${displayName || 'there'}!</h1>
    <p>Thank you for joining RuneRaffle, the premier place for RuneScape raffles!</p>
    <p>Get started by browsing our active competitions and purchasing tickets.</p>
    <p>Good luck!</p>
    <p>The RuneRaffle Team</p>
  `;
  
  return sendEmail(email, subject, body, 'welcome', { displayName })
    .catch(err => {
      console.error('[EMAIL SERVICE] Failed to send welcome email:', err);
      return false;
    });
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
  try {
    const subject = `Ticket Purchase Confirmation - ${competitionTitle}`;
    const body = `
      <h1>Ticket Purchase Confirmation</h1>
      <p>Hello ${displayName},</p>
      <p>Thank you for purchasing a ticket for the "${competitionTitle}" competition!</p>
      <h2>Ticket Details:</h2>
      <ul>
        <li>Ticket Number: #${ticketNumber}</li>
        <li>Purchase Date: ${purchaseDate.toLocaleDateString()}</li>
        <li>Competition Ends: ${competitionEndsAt.toLocaleDateString()}</li>
      </ul>
      <p>You can view the competition details and track your entry at:<br/>
      <a href="${window.location.origin}/competition/${competitionId}">${window.location.origin}/competition/${competitionId}</a></p>
      <p>Good luck!</p>
      <p>The RuneRaffle Team</p>
    `;
    
    return sendEmail(email, subject, body, 'ticket_purchase', {
      displayName,
      competitionTitle,
      ticketNumber,
      purchaseDate,
      competitionEndsAt,
      competitionId
    });
  } catch (error) {
    console.error('[EMAIL SERVICE] Error preparing ticket purchase email:', error);
    return false;
  }
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
    <h1>Congratulations! You're a Winner!</h1>
    <p>Hello ${displayName},</p>
    <p>CONGRATULATIONS! You're a winner in the "${competitionTitle}" competition!</p>
    <h2>Prize Details:</h2>
    <ul>
      <li>Prize: ${prize}</li>
      <li>Value: ${prizeValue}</li>
    </ul>
    <p>You can verify the draw results at:<br/>
    <a href="${window.location.origin}/verification/${competitionId}">${window.location.origin}/verification/${competitionId}</a></p>
    <p>Our team will contact you shortly to arrange the delivery of your prize.</p>
    <p>Best regards,</p>
    <p>The RuneRaffle Team</p>
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
    <h1>Competition Ending Soon!</h1>
    <p>Hello ${displayName},</p>
    <p>The "${competitionTitle}" competition is ending soon! Only ${hoursRemaining} hours remaining.</p>
    <p>Don't miss your chance to win! Purchase additional tickets now:<br/>
    <a href="${window.location.origin}/competition/${competitionId}">${window.location.origin}/competition/${competitionId}</a></p>
    <p>Good luck!</p>
    <p>The RuneRaffle Team</p>
  `;
  
  return sendEmail(email, subject, body, 'competition_ending', {
    displayName,
    competitionTitle,
    hoursRemaining,
    competitionId
  });
};

// Send emails to users who have successfully earned referral rewards
export const sendReferralRewardEmail = async (
  email: string,
  displayName: string,
  creditAmount: number
): Promise<boolean> => {
  try {
    const subject = 'Referral Reward Earned!';
    const body = `
      <h1>Referral Reward Earned!</h1>
      <p>Hello ${displayName},</p>
      <p>Great news! One of your referred friends has made their first purchase, and you've earned a reward!</p>
      <h2>Reward Details:</h2>
      <ul>
        <li>Credits Added: ${creditAmount}</li>
        <li>Date: ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Your credits have been automatically added to your account and are ready to use!</p>
      <p>Keep referring friends to earn more rewards!</p>
      <p>The RuneRaffle Team</p>
    `;
    
    return sendEmail(email, subject, body, 'referral-reward', {
      displayName,
      creditAmount,
      date: new Date().toLocaleDateString(),
      loginUrl: `${window.location.origin}/login`
    });
  } catch (error) {
    console.error('Error sending referral reward email:', error);
    return false;
  }
}; 