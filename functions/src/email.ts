import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Create a Firestore reference - needed for Firebase queries below
// const db = admin.firestore();

// Configure Nodemailer with environment variables
// In production, use your actual SMTP service
// For development, we can use test credentials from ethereal.email
const mailTransport = nodemailer.createTransport({
  host: functions.config().smtp?.host || 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: functions.config().smtp?.user || 'test@example.com',
    pass: functions.config().smtp?.pass || 'password',
  },
});

// Define interface for email payload
interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  data?: Record<string, any>;
}

/**
 * Generic function to send emails
 * Can be triggered from client side code via HTTP request
 * Requires authentication
 */
export const sendEmail = functions.https.onCall(async (data, context) => {
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
    // If template is specified, generate email content from template
    let htmlContent = emailData.html;
    let textContent = emailData.text;

    if (emailData.template) {
      // In a real app, you'd render a template here
      // This is a simple implementation for demonstration
      switch (emailData.template) {
        case 'welcome':
          htmlContent = `<h1>Welcome to RuneRaffle, ${emailData.data?.displayName || 'there'}!</h1>
                        <p>Thank you for joining RuneRaffle, the premier platform for RuneScape competitions.</p>
                        <p>Get started by browsing our active competitions and purchasing tickets.</p>
                        <p>Good luck!</p>`;
          textContent = `Welcome to RuneRaffle, ${emailData.data?.displayName || 'there'}!\n\n
                         Thank you for joining RuneRaffle, the premier platform for RuneScape competitions.\n
                         Get started by browsing our active competitions and purchasing tickets.\n\n
                         Good luck!`;
          break;
        
        case 'ticket_purchase':
          htmlContent = `<h1>Ticket Purchase Confirmation</h1>
                        <p>Thank you for purchasing a ticket for the "${emailData.data?.competitionTitle}" competition!</p>
                        <h2>Ticket Details:</h2>
                        <ul>
                          <li>Ticket Number: #${emailData.data?.ticketNumber}</li>
                          <li>Purchase Date: ${emailData.data?.purchaseDate}</li>
                          <li>Competition Ends: ${emailData.data?.competitionEndsAt}</li>
                        </ul>`;
          textContent = `Ticket Purchase Confirmation\n\n
                         Thank you for purchasing a ticket for the "${emailData.data?.competitionTitle}" competition!\n\n
                         Ticket Details:\n
                         - Ticket Number: #${emailData.data?.ticketNumber}\n
                         - Purchase Date: ${emailData.data?.purchaseDate}\n
                         - Competition Ends: ${emailData.data?.competitionEndsAt}\n`;
          break;
          
        // Add more templates as needed
      }
    }

    // Send the email
    const mailOptions = {
      from: `RuneRaffle <${functions.config().smtp?.from || 'noreply@runeraffle.com'}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: textContent,
      html: htmlContent
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

// User type for Firebase Auth
interface FirebaseUser {
  email?: string;
  displayName?: string;
  uid: string;
}

/**
 * Function to send welcome email to new users
 * Triggered by user creation in Authentication
 */
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user: FirebaseUser) => {
  const { email, displayName } = user;
  
  if (!email) {
    console.log('No email found for user, skipping welcome email');
    return null;
  }

  try {
    const mailOptions = {
      from: `RuneRaffle <${functions.config().smtp?.from || 'noreply@runeraffle.com'}>`,
      to: email,
      subject: 'Welcome to RuneRaffle!',
      html: `<h1>Welcome to RuneRaffle, ${displayName || 'there'}!</h1>
            <p>Thank you for joining RuneRaffle, the premier platform for RuneScape competitions.</p>
            <p>Get started by browsing our active competitions and purchasing tickets.</p>
            <p>Good luck!</p>`,
      text: `Welcome to RuneRaffle, ${displayName || 'there'}!\n\n
             Thank you for joining RuneRaffle, the premier platform for RuneScape competitions.\n
             Get started by browsing our active competitions and purchasing tickets.\n\n
             Good luck!`
    };

    await mailTransport.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}`);
    
    return null;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return null;
  }
});

interface TicketData {
  userId: string;
  competitionId: string;
  ticketNumber: number;
  [key: string]: any;
}

interface FirestoreDocument {
  data(): any;
  exists: boolean;
}

/**
 * Function to send ticket purchase confirmation emails
 * Triggered by a Firestore write to tickets collection
 */
export const sendTicketPurchaseEmail = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snapshot: FirestoreDocument, context: functions.EventContext) => {
    const ticketData = snapshot.data() as TicketData;
    const { userId, competitionId, ticketNumber } = ticketData;
    
    try {
      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log('No user document found, cannot send email');
        return null;
      }
      
      const userData = userDoc.data();
      if (!userData || !userData.email) {
        console.log('No email found for user, skipping purchase email');
        return null;
      }
      
      // Get competition data
      const competitionDoc = await admin.firestore().collection('competitions').doc(competitionId).get();
      if (!competitionDoc.exists) {
        console.log('No competition document found, cannot send email');
        return null;
      }
      
      const competition = competitionDoc.data();
      
      // Send email
      const mailOptions = {
        from: `RuneRaffle <${functions.config().smtp?.from || 'noreply@runeraffle.com'}>`,
        to: userData.email,
        subject: `Ticket Purchase Confirmation - ${competition?.title}`,
        html: `<h1>Ticket Purchase Confirmation</h1>
              <p>Thank you for purchasing a ticket for the "${competition?.title}" competition!</p>
              <h2>Ticket Details:</h2>
              <ul>
                <li>Ticket Number: #${ticketNumber}</li>
                <li>Purchase Date: ${new Date().toLocaleDateString()}</li>
                <li>Competition Ends: ${competition?.endsAt.toDate().toLocaleDateString()}</li>
              </ul>
              <p>Good luck!</p>`,
        text: `Ticket Purchase Confirmation\n\n
               Thank you for purchasing a ticket for the "${competition?.title}" competition!\n\n
               Ticket Details:\n
               - Ticket Number: #${ticketNumber}\n
               - Purchase Date: ${new Date().toLocaleDateString()}\n
               - Competition Ends: ${competition?.endsAt.toDate().toLocaleDateString()}\n\n
               Good luck!`
      };

      await mailTransport.sendMail(mailOptions);
      console.log(`Ticket purchase email sent to: ${userData.email}`);
      
      return null;
    } catch (error) {
      console.error('Error sending ticket purchase email:', error);
      return null;
    }
  }); 