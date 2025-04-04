import * as functions from 'firebase-functions/v1';
import * as nodemailer from 'nodemailer';

// Define interface for email payload
interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// For development, default to development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Generic function to send emails
 * Can be triggered from client side code via HTTP request
 * Requires authentication
 */
export const sendEmail = functions
  .region('europe-west2') // Use London region for better UK performance
  .https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated'
    );
  }

  // Cast data to EmailPayload 
  const emailData = data as EmailPayload;
  
  try {
    // For development, just log the email details
    if (isDevelopment) {
      console.log('Would send email with following details:', {
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      });
      return { success: true, development: true };
    }
    
    // In production, set up nodemailer with actual credentials
    const mailTransport = nodemailer.createTransport({
      host: functions.config().smtp?.host || 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: functions.config().smtp?.user || 'user@example.com',
        pass: functions.config().smtp?.pass || 'password',
      },
    });

    // Send the email
    const mailOptions = {
      from: `RuneRaffle <${functions.config().smtp?.from || 'noreply@runeraffle.com'}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    };

    await mailTransport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error sending email'
    );
  }
});
