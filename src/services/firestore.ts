import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../config/firebase';
import { notifyTicketPurchase } from './notificationService';
import { sendTicketPurchaseEmail } from './emailService';

// Types
export interface Competition {
  id?: string;
  title: string;
  description: string;
  prize: string;
  prizeValue: string;
  imageUrl?: string;
  status: 'active' | 'ending' | 'complete' | 'cancelled';
  difficulty: 'easy' | 'medium' | 'hard';
  ticketPrice: number;
  ticketsSold: number;
  totalTickets: number;
  endsAt: firebase.firestore.Timestamp;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  completedAt?: firebase.firestore.Timestamp;
  winner?: {
    userId: string;
    username: string;
    email: string;
  };
  seed?: string;
  blockHash?: string;
  winningTicket?: number;
  triviaQuestion?: string;
  triviaAnswer?: string;
}

export interface Ticket {
  id?: string;
  competitionId: string;
  userId: string;
  purchasedAt: firebase.firestore.Timestamp;
  ticketNumber: number;
  isWinner: boolean;
}

export interface User {
  id?: string;
  email: string;
  displayName?: string;
  credits: number;
  isAdmin: boolean;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}

export interface SupportTicket {
  id?: string;
  userId: string;
  userEmail: string;
  type: 'prize_collection' | 'support' | 'refund' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  subject: string;
  description: string;
  competitionId?: string;
  prizeId?: string;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  resolvedAt?: firebase.firestore.Timestamp;
  assignedTo?: string;
}

export interface TicketMessage {
  id?: string;
  ticketId: string;
  userId: string;
  isAdmin: boolean;
  message: string;
  createdAt: firebase.firestore.Timestamp;
  attachments?: string[];
}

// Collection references
const competitionsRef = db.collection('competitions');
const ticketsRef = db.collection('tickets');
const usersRef = db.collection('users');
const supportTicketsRef = db.collection('supportTickets');
const ticketMessagesRef = db.collection('ticketMessages');

// Competition operations
export const getCompetitions = async (): Promise<Competition[]> => {
  const snapshot = await competitionsRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getActiveCompetitions = async (): Promise<Competition[]> => {
  const snapshot = await competitionsRef.where('status', 'in', ['active', 'ending']).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getCompletedCompetitions = async (): Promise<Competition[]> => {
  const snapshot = await competitionsRef.where('status', 'in', ['complete']).orderBy('completedAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getCompetition = async (id: string): Promise<Competition | null> => {
  const docRef = competitionsRef.doc(id);
  const docSnap = await docRef.get();
  
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() as Competition };
  }
  
  return null;
};

export const createCompetition = async (competition: Omit<Competition, 'id' | 'createdAt' | 'updatedAt' | 'ticketsSold'>): Promise<string> => {
  const newCompetition = {
    ...competition,
    ticketsSold: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    // Set default values for trivia question/answer if they're missing
    triviaQuestion: competition.triviaQuestion || 'What game is RuneScape developed by?',
    triviaAnswer: competition.triviaAnswer || 'Jagex'
  };
  
  const docRef = await competitionsRef.add(newCompetition);
  return docRef.id;
};

export const updateCompetition = async (id: string, data: Partial<Competition>): Promise<void> => {
  const docRef = competitionsRef.doc(id);
  await docRef.update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const deleteCompetition = async (id: string): Promise<void> => {
  const docRef = competitionsRef.doc(id);
  await docRef.delete();
};

export const completeCompetition = async (id: string, winner: Competition['winner'], seed: string, blockHash: string, winningTicket: number): Promise<void> => {
  const docRef = competitionsRef.doc(id);
  await docRef.update({
    status: 'complete',
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    winner,
    seed,
    blockHash,
    winningTicket
  });
};

export const cancelCompetition = async (id: string): Promise<void> => {
  const docRef = competitionsRef.doc(id);
  await docRef.update({
    status: 'cancelled',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// Ticket operations
export const buyTicket = async (ticket: Omit<Ticket, 'id' | 'purchasedAt' | 'isWinner'>): Promise<string> => {
  const newTicket = {
    ...ticket,
    purchasedAt: firebase.firestore.FieldValue.serverTimestamp(),
    isWinner: false
  };
  
  const docRef = await ticketsRef.add(newTicket);
  
  // Update competition ticket count
  const competitionRef = competitionsRef.doc(ticket.competitionId);
  const competitionSnap = await competitionRef.get();
  
  if (competitionSnap.exists) {
    const competition = competitionSnap.data() as Competition;
    await competitionRef.update({
      ticketsSold: competition.ticketsSold + 1,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Create notification for the user
    await notifyTicketPurchase(
      ticket.userId,
      ticket.competitionId,
      docRef.id,
      competition.title,
      ticket.ticketNumber
    );
    
    // Get user info for email
    const userSnapshot = await usersRef.doc(ticket.userId).get();
    if (userSnapshot.exists) {
      const userData = userSnapshot.data();
      if (userData && userData.email) {
        // Send purchase confirmation email
        sendTicketPurchaseEmail(
          userData.email,
          userData.displayName || 'User',
          competition.title,
          ticket.ticketNumber,
          new Date(),
          competition.endsAt.toDate(),
          ticket.competitionId
        ).catch(err => console.error('Error sending email:', err));
      }
    }
  }
  
  return docRef.id;
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const snapshot = await ticketsRef.where('userId', '==', userId).orderBy('purchasedAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Ticket }));
};

export const getCompetitionTickets = async (competitionId: string): Promise<Ticket[]> => {
  const snapshot = await ticketsRef.where('competitionId', '==', competitionId).orderBy('purchasedAt', 'asc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Ticket }));
};

// User operations
export const createUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const userRef = usersRef.doc(user.email);
  await userRef.set({
    ...user,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const getUser = async (email: string): Promise<User | null> => {
  const docRef = usersRef.doc(email);
  const docSnap = await docRef.get();
  
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() as User };
  }
  
  return null;
};

export const updateUser = async (email: string, data: Partial<User>): Promise<void> => {
  const docRef = usersRef.doc(email);
  await docRef.update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateUserCredits = async (email: string, credits: number): Promise<void> => {
  const docRef = usersRef.doc(email);
  await docRef.update({
    credits,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// Support Ticket operations
export const getAuthUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    console.log(`Looking up auth user ID for email: ${email}`);
    
    // First, check the auth collection if it exists (preferred method)
    try {
      console.log(`Checking auth collection first (best method)`);
      const authSnapshot = await firebase.firestore().collection('auth').where('email', '==', email).limit(1).get();
        
      if (!authSnapshot.empty) {
        const authId = authSnapshot.docs[0].id;
        console.log(`Found user auth ID via auth collection: ${authId}`);
        return authId;
      }
    } catch (error) {
      console.error('Error checking auth collection:', error);
    }
    
    // Then check using Firebase API (if available)
    try {
      console.log(`Looking for auth UID in users collection by email field`);
      const userSnapshot = await firebase.firestore().collection('users').where('email', '==', email).limit(1).get();
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        if (userData && userData.uid) {
          console.log(`Found user auth ID via user collection: ${userData.uid}`);
          return userData.uid;
        }
      }
    } catch (error) {
      console.error('Error checking users by email query:', error);
    }
    
    // Check if email is used as the document ID in users collection
    try {
      console.log(`Checking if email is the document ID`);
      const userDoc = await usersRef.doc(email).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData && userData.uid) {
          console.log(`Found user auth ID via direct document lookup: ${userData.uid}`);
          return userData.uid;
        }
      }
    } catch (error) {
      console.error('Error checking user document by email ID:', error);
    }
    
    // Check if we can find the user in authentication records
    console.log(`Looking for the user in the firebase authentication context`);
    // For debugging, let's query the location where we're storing current user data
    try {
      const authDataQuery = await firebase.firestore().collection('currentUsers').where('email', '==', email).limit(1).get();
        
      if (!authDataQuery.empty) {
        const authData = authDataQuery.docs[0].data();
        if (authData && authData.uid) {
          console.log(`Found user auth UID via currentUsers collection: ${authData.uid}`);
          return authData.uid;
        }
      }
    } catch (error) {
      console.log('Error checking currentUsers collection:', error);
    }
    
    // If all these methods fail, get the user's document ID
    try {
      console.log(`Attempting to get the user document with email ${email}`);
      const userQuery = await usersRef.where('email', '==', email).limit(1).get();
      
      if (!userQuery.empty) {
        const userDocId = userQuery.docs[0].id;
        console.log(`Found user document ID: ${userDocId}`);
        return userDocId;
      }
    } catch (error) {
      console.error('Error getting user document ID:', error);
    }
    
    // Search all collections for this user
    console.log(`No auth UID found directly. Checking notification history for this user.`);
    try {
      // See if we can find existing notifications for this user's email
      const userNotificationsQuery = await firebase.firestore().collection('notifications').where('email', '==', email).limit(1).get();
        
      if (!userNotificationsQuery.empty) {
        const userId = userNotificationsQuery.docs[0].data().userId;
        console.log(`Found user ID from past notifications: ${userId}`);
        return userId;
      }
    } catch (error) {
      console.log('Error checking notification history:', error);
    }
    
    // Last resort - use the email directly, but log a warning as this is problematic
    console.warn(`WARNING: Could not find auth ID for ${email}. This will likely cause notifications not to show up in the UI. Using email as fallback.`);
    console.warn(`IMPORTANT: Make sure your UI is looking for notifications with the same user ID format as what's being created.`);
    return email;
  } catch (error) {
    console.error(`Error getting auth user ID for ${email}:`, error);
    return null;
  }
};

export const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
  try {
    console.log(`Creating new support ticket:`, {
      userEmail: ticket.userEmail,
      userId: ticket.userId,
      subject: ticket.subject
    });
    
    const newTicket = {
      ...ticket,
      status: 'open',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await supportTicketsRef.add(newTicket);
    const ticketId = docRef.id;
    console.log(`Support ticket created with ID: ${ticketId}`);
    
    // Notify admins about the new ticket
    try {
      // Import needed services
      const { notifyTicketUpdate } = await import('./notificationService');
      const { notifyAllAdmins } = await import('./adminService');
      
      // Notify all admins about the new ticket
      const adminsNotified = await notifyAllAdmins((adminId) => {
        console.log(`Sending new ticket notification to admin: ${adminId}`);
        return notifyTicketUpdate(
          adminId,
          ticketId,
          ticket.subject,
          'user',
          'new' // Special status to indicate a new ticket
        );
      });
      
      console.log(`Sent new ticket notifications to ${adminsNotified} admins`);
    } catch (error) {
      // Log error but don't fail the ticket creation
      console.error('Error sending notifications to admins:', error);
    }
    
    return ticketId;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
};

export const getSupportTicket = async (ticketId: string): Promise<SupportTicket | null> => {
  const docRef = supportTicketsRef.doc(ticketId);
  const docSnap = await docRef.get();
  
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() as SupportTicket };
  }
  
  return null;
};

export const updateSupportTicket = async (ticketId: string, data: Partial<SupportTicket>): Promise<void> => {
  try {
    console.log(`Updating support ticket ${ticketId}:`, data);
    
    const docRef = supportTicketsRef.doc(ticketId);
    const currentTicket = await getSupportTicket(ticketId);
    
    if (!currentTicket) {
      console.error(`Cannot update ticket ${ticketId} - not found`);
      throw new Error(`Ticket not found: ${ticketId}`);
    }
    
    // Update the ticket
    await docRef.update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Ticket ${ticketId} updated successfully`);
    
    // Import needed services
    const { notifyTicketUpdate } = await import('./notificationService');
    
    // If there's a current ticket
    if (currentTicket) {
      // If status has changed, notify the ticket owner
      if (data.status && data.status !== currentTicket.status) {
        // Get the proper authenticated user ID for the ticket owner
        const userAuthId = await getAuthUserIdByEmail(currentTicket.userEmail);
        const notifyUserId = userAuthId || currentTicket.userId;
        
        console.log(`Status changed to ${data.status} - notifying user: ${notifyUserId} (original userId: ${currentTicket.userId})`);
        await notifyTicketUpdate(
          notifyUserId,
          ticketId,
          currentTicket.subject,
          'admin',
          data.status // Pass the new status
        );
      }
      
      // If the ticket is being assigned to a new admin, notify that admin
      if (data.assignedTo && data.assignedTo !== currentTicket.assignedTo) {
        // Notify the newly assigned admin
        console.log(`Ticket assigned to new admin: ${data.assignedTo}`);
        await notifyTicketUpdate(
          data.assignedTo,
          ticketId,
          currentTicket.subject,
          'admin',
          'assigned' // Special status for assignment
        );
        
        // If the ticket was previously assigned to another admin,
        // notify them that they're no longer assigned
        if (currentTicket.assignedTo) {
          console.log(`Notifying previous admin ${currentTicket.assignedTo} about unassignment`);
          await notifyTicketUpdate(
            currentTicket.assignedTo,
            ticketId,
            currentTicket.subject,
            'admin',
            'unassigned' // Special status for unassignment
          );
        }
      }
    }
  } catch (error) {
    console.error('Error updating support ticket:', error);
    throw error;
  }
};

export const getUserSupportTickets = async (userId: string): Promise<SupportTicket[]> => {
  const snapshot = await supportTicketsRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as SupportTicket }));
};

export const getOpenSupportTickets = async (): Promise<SupportTicket[]> => {
  const snapshot = await supportTicketsRef.where('status', 'in', ['open', 'in_progress']).orderBy('priority', 'desc').orderBy('createdAt', 'asc').get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as SupportTicket }));
};

export const closeSupportTicket = async (ticketId: string, resolution?: string): Promise<void> => {
  try {
    console.log(`Closing support ticket ${ticketId} with resolution: ${resolution || 'No resolution provided'}`);
    
    const currentTicket = await getSupportTicket(ticketId);
    if (!currentTicket) {
      console.error(`Cannot close ticket ${ticketId} - not found`);
      throw new Error(`Ticket not found: ${ticketId}`);
    }
    
    const docRef = supportTicketsRef.doc(ticketId);
    await docRef.update({
      status: 'resolved',
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      resolution,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Ticket ${ticketId} closed successfully`);
    
    // Notify the user that their ticket has been resolved
    try {
      const { notifyTicketUpdate } = await import('./notificationService');
      
      // Get the proper authenticated user ID for the ticket owner
      const userAuthId = await getAuthUserIdByEmail(currentTicket.userEmail);
      const notifyUserId = userAuthId || currentTicket.userId;
      
      console.log(`Sending resolved notification to user: ${notifyUserId} (original userId: ${currentTicket.userId})`);
      await notifyTicketUpdate(
        notifyUserId,
        ticketId,
        currentTicket.subject,
        'admin',
        'resolved' // Special status for resolved tickets
      );
    } catch (error) {
      console.error(`Error sending resolution notification:`, error);
    }
  } catch (error) {
    console.error(`Error closing support ticket:`, error);
    throw error;
  }
};

// Ticket Message operations
export const addTicketMessage = async (message: Omit<TicketMessage, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log(`Adding new ticket message to ticket ${message.ticketId}:`, {
      isAdmin: message.isAdmin,
      userId: message.userId
    });
    
    const newMessage = {
      ...message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await ticketMessagesRef.add(newMessage);
    console.log(`Message added successfully with ID: ${docRef.id}`);
    
    // Update the ticket's updatedAt timestamp
    await ticketMessagesRef.doc(message.ticketId).update({
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Get ticket info for notification
    console.log(`Fetching ticket data for ${message.ticketId} to send notifications`);
    const ticket = await getSupportTicket(message.ticketId);
    
    if (ticket) {
      console.log(`Found ticket:`, {
        subject: ticket.subject,
        userId: ticket.userId,
        userEmail: ticket.userEmail,
        assignedTo: ticket.assignedTo
      });
      
      // Import here to avoid circular dependency
      console.log(`Importing notification services`);
      const { notifyTicketUpdate } = await import('./notificationService');
      
      if (message.isAdmin) {
        // Admin sent message - notify the ticket owner
        // Get the proper authenticated user ID for the ticket owner
        const userAuthId = await getAuthUserIdByEmail(ticket.userEmail);
        const notifyUserId = userAuthId || ticket.userId;
        
        console.log(`Admin message detected - sending notification to ticket owner: ${notifyUserId} (original userId: ${ticket.userId})`);
        await notifyTicketUpdate(
          notifyUserId,
          message.ticketId,
          ticket.subject,
          'admin'
        );
      } else {
        // User sent message - notify admins
        if (ticket.assignedTo) {
          // If there's an assigned admin, notify them
          console.log(`User message detected - notifying assigned admin: ${ticket.assignedTo}`);
          await notifyTicketUpdate(
            ticket.assignedTo,
            message.ticketId,
            ticket.subject,
            'user'
          );
        } else {
          // If no assigned admin, notify all admins
          console.log(`No assigned admin - notifying all admins`);
          const { notifyAllAdmins } = await import('./adminService');
          
          const adminsNotified = await notifyAllAdmins((adminId) => {
            console.log(`Sending notification to admin: ${adminId}`);
            return notifyTicketUpdate(
              adminId,
              message.ticketId,
              ticket.subject,
              'user'
            );
          });
          
          console.log(`Sent notifications to ${adminsNotified} admins`);
        }
      }
    } else {
      console.error(`No ticket found with ID ${message.ticketId} - cannot send notifications`);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding ticket message:', error);
    throw error;
  }
};

export const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
  const snapshot = await ticketMessagesRef.where('ticketId', '==', ticketId).orderBy('createdAt', 'asc').get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as TicketMessage }));
};

/**
 * Utility function to verify and fix notification issues for support tickets
 * This can be called from the admin panel to diagnose notification problems
 */
/* export const verifyAndFixTicketNotifications = async (ticketId?: string): Promise<{
  checked: number;
  fixed: number;
  admins: string[];
}> => {
  // Function implementation removed
};
*/

/**
 * Create a direct test notification to verify notification system
 * This should be called from admin panel for debugging
 */
/* export const createTestNotification = async (userId: string, userEmail?: string): Promise<{
  success: boolean;
  notificationId?: string;
  error?: any;
}> => {
  // Function implementation removed
};
*/ 