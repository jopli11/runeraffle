import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Define the region
const region = 'europe-west2';
const db = admin.firestore();

// Configure Mailgun
const getMailgunConfig = () => {
  return {
    apiKey: functions.config().mailgun?.key || '',
    domain: functions.config().mailgun?.domain || '',
    sender: functions.config().mailgun?.sender || 'noreply@runeraffle.com',
    senderName: functions.config().mailgun?.sender_name || 'RuneRaffle'
  };
};

// Create a nodemailer transport as fallback
const createMailTransport = () => {
  // For testing, use a test SMTP service like Ethereal
  return nodemailer.createTransport({
    host: functions.config().smtp?.host || 'smtp.ethereal.email',
    port: parseInt(functions.config().smtp?.port || '587'),
    secure: functions.config().smtp?.secure === 'true',
    auth: {
      user: functions.config().smtp?.user || '',
      pass: functions.config().smtp?.pass || ''
    }
  });
};

/**
 * Generic function to send an email
 */
export const sendEmail = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { to, subject, html, text } = data;

    // Validate inputs
    if (!to || !subject || (!html && !text)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email data is missing required fields (to, subject, and either html or text)'
      );
    }

    try {
      // Prefer Mailgun if configured
      const mailgunConfig = getMailgunConfig();
      
      if (mailgunConfig.apiKey && mailgunConfig.domain) {
        await sendMailWithMailgun(to, subject, html, text);
      } else {
        // Fallback to SMTP
        await sendMailWithSMTP(to, subject, html, text);
      }
      
      // Log the email for tracking purposes
      await db.collection('emailLogs').add({
        to,
        subject,
        sent: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: null
      });
      
      return { success: true };
    } catch (error) {
      // Log the error
      console.error('Error sending email:', error);
      
      // Log to Firestore
      await db.collection('emailLogs').add({
        to,
        subject,
        sent: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send email',
        error instanceof Error ? error.message : undefined
      );
    }
  });

/**
 * Send email using Mailgun API
 */
async function sendMailWithMailgun(to: string, subject: string, html?: string, text?: string): Promise<void> {
  const config = getMailgunConfig();
  
  if (!config.apiKey || !config.domain) {
    throw new Error('Mailgun configuration is missing');
  }
  
  const form = new FormData();
  form.append('from', `${config.senderName} <${config.sender}>`);
  form.append('to', to);
  form.append('subject', subject);
  
  if (html) {
    form.append('html', html);
  }
  
  if (text) {
    form.append('text', text);
  }
  
  const auth = Buffer.from(`api:${config.apiKey}`).toString('base64');
  
  const response = await fetch(`https://api.mailgun.net/v3/${config.domain}/messages`, {
    method: 'POST',
    body: form as any,
    headers: {
      Authorization: `Basic ${auth}`
    }
  });
  
  if (!response.ok) {
    const responseData = await response.text();
    throw new Error(`Mailgun API error: ${response.status} ${response.statusText} - ${responseData}`);
  }
}

/**
 * Send email using SMTP (fallback)
 */
async function sendMailWithSMTP(to: string, subject: string, html?: string, text?: string): Promise<void> {
  const config = getMailgunConfig();
  const transport = createMailTransport();
  
  const mailOptions = {
    from: `${config.senderName} <${config.sender}>`,
    to,
    subject,
    html,
    text
  };
  
  await transport.sendMail(mailOptions);
}

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { email, displayName } = data;
    
    if (!email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email address is required'
      );
    }
    
    const name = displayName || 'Valued User';
    
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Welcome to RuneRaffle!</h1>
          <p>Hello ${name},</p>
          <p>Thank you for joining RuneRaffle, the premier platform for RuneScape competitions and giveaways!</p>
          <p>Your account has been successfully created and you can now start participating in exciting competitions for a chance to win amazing prizes.</p>
          <p>To get started:</p>
          <ol>
            <li>Browse our active competitions</li>
            <li>Purchase tickets for competitions that interest you</li>
            <li>Check your dashboard regularly for results</li>
          </ol>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Happy raffling!</p>
          <p>The RuneRaffle Team</p>
        </div>
      `;
      
      const text = `
        Welcome to RuneRaffle!
        
        Hello ${name},
        
        Thank you for joining RuneRaffle, the premier platform for RuneScape competitions and giveaways!
        
        Your account has been successfully created and you can now start participating in exciting competitions for a chance to win amazing prizes.
        
        To get started:
        1. Browse our active competitions
        2. Purchase tickets for competitions that interest you
        3. Check your dashboard regularly for results
        
        If you have any questions, please don't hesitate to contact our support team.
        
        Happy raffling!
        
        The RuneRaffle Team
      `;
      
      // Prefer Mailgun if configured
      const mailgunConfig = getMailgunConfig();
      
      if (mailgunConfig.apiKey && mailgunConfig.domain) {
        await sendMailWithMailgun(email, 'Welcome to RuneRaffle!', html, text);
      } else {
        // Fallback to SMTP
        await sendMailWithSMTP(email, 'Welcome to RuneRaffle!', html, text);
      }
      
      // Log the email
      await db.collection('emailLogs').add({
        to: email,
        subject: 'Welcome to RuneRaffle!',
        sent: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      
      // Log to Firestore
      await db.collection('emailLogs').add({
        to: email,
        subject: 'Welcome to RuneRaffle!',
        sent: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new functions.https.HttpsError('internal', 'Failed to send welcome email');
    }
  });

/**
 * Send an email to a user when they purchase a ticket
 */
export const sendTicketPurchaseEmail = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { email, displayName, competitionTitle, ticketNumber, ticketPrice } = data;
    
    if (!email || !competitionTitle || !ticketNumber) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields for ticket purchase email'
      );
    }
    
    const name = displayName || 'Valued User';
    
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Your RuneRaffle Ticket Purchase</h1>
          <p>Hello ${name},</p>
          <p>Thank you for purchasing a ticket for the <strong>${competitionTitle}</strong> competition!</p>
          <p><strong>Ticket Details:</strong></p>
          <ul>
            <li>Ticket Number: #${ticketNumber}</li>
            <li>Competition: ${competitionTitle}</li>
            <li>Price: ${ticketPrice} credits</li>
          </ul>
          <p>Good luck! You will be notified if you win this competition.</p>
          <p>The RuneRaffle Team</p>
        </div>
      `;
      
      const text = `
        Your RuneRaffle Ticket Purchase
        
        Hello ${name},
        
        Thank you for purchasing a ticket for the "${competitionTitle}" competition!
        
        Ticket Details:
        - Ticket Number: #${ticketNumber}
        - Competition: ${competitionTitle}
        - Price: ${ticketPrice} credits
        
        Good luck! You will be notified if you win this competition.
        
        The RuneRaffle Team
      `;
      
      // Prefer Mailgun if configured
      const mailgunConfig = getMailgunConfig();
      
      if (mailgunConfig.apiKey && mailgunConfig.domain) {
        await sendMailWithMailgun(email, `Ticket Purchase Confirmation - ${competitionTitle}`, html, text);
      } else {
        // Fallback to SMTP
        await sendMailWithSMTP(email, `Ticket Purchase Confirmation - ${competitionTitle}`, html, text);
      }
      
      // Log the email
      await db.collection('emailLogs').add({
        to: email,
        subject: `Ticket Purchase Confirmation - ${competitionTitle}`,
        sent: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending ticket purchase email:', error);
      
      // Log to Firestore
      await db.collection('emailLogs').add({
        to: email,
        subject: `Ticket Purchase Confirmation - ${competitionTitle}`,
        sent: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new functions.https.HttpsError('internal', 'Failed to send ticket purchase email');
    }
  });

/**
 * Send a winner notification email
 */
export const sendWinnerEmail = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { email, displayName, competitionTitle, prize, prizeValue, competitionId } = data;
    
    if (!email || !competitionTitle || !prize) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields for winner email'
      );
    }
    
    const name = displayName || 'Winner';
    
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Congratulations! You Won!</h1>
          <p>Hello ${name},</p>
          <p>Congratulations! You are the winner of the <strong>${competitionTitle}</strong> competition!</p>
          <p><strong>Your Prize:</strong> ${prize} ${prizeValue ? `(Value: ${prizeValue})` : ''}</p>
          <p>Our team will contact you shortly to arrange delivery of your prize.</p>
          <p>You can verify the draw results at: https://runeraffle.com/verification/${competitionId}</p>
          <p>Thank you for participating in RuneRaffle!</p>
          <p>The RuneRaffle Team</p>
        </div>
      `;
      
      const text = `
        Congratulations! You Won!
        
        Hello ${name},
        
        Congratulations! You are the winner of the "${competitionTitle}" competition!
        
        Your Prize: ${prize} ${prizeValue ? `(Value: ${prizeValue})` : ''}
        
        Our team will contact you shortly to arrange delivery of your prize.
        
        You can verify the draw results at: https://runeraffle.com/verification/${competitionId}
        
        Thank you for participating in RuneRaffle!
        
        The RuneRaffle Team
      `;
      
      // Prefer Mailgun if configured
      const mailgunConfig = getMailgunConfig();
      
      if (mailgunConfig.apiKey && mailgunConfig.domain) {
        await sendMailWithMailgun(email, `You Won! - ${competitionTitle}`, html, text);
      } else {
        // Fallback to SMTP
        await sendMailWithSMTP(email, `You Won! - ${competitionTitle}`, html, text);
      }
      
      // Log the email
      await db.collection('emailLogs').add({
        to: email,
        subject: `You Won! - ${competitionTitle}`,
        sent: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending winner email:', error);
      
      // Log to Firestore
      await db.collection('emailLogs').add({
        to: email,
        subject: `You Won! - ${competitionTitle}`,
        sent: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new functions.https.HttpsError('internal', 'Failed to send winner email');
    }
  });
