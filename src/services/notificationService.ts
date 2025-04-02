import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../config/firebase';

// Notification types
export interface Notification {
  id?: string;
  userId: string;
  type: 'competition_ending' | 'ticket_purchase' | 'competition_winner' | 'credit_update' | 'system' | 'ticket_update';
  title: string;
  message: string;
  competitionId?: string;
  ticketId?: string;
  supportTicketId?: string;
  imageUrl?: string;
  read: boolean;
  createdAt: firebase.firestore.Timestamp;
}

// Collection reference
const notificationsRef = db.collection('notifications');

/**
 * Create a new notification for a user
 */
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
): Promise<string> => {
  const newNotification = {
    ...notification,
    read: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  
  const docRef = await notificationsRef.add(newNotification);
  return docRef.id;
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    console.log(`Getting notifications for user ID: ${userId}`);
    const snapshot = await notificationsRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50) // Limit to the 50 most recent notifications
      .get();
    
    console.log(`Found ${snapshot.size} notifications for user ${userId}`);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Notification }));
  } catch (error) {
    // Check if this is an index error
    if (error instanceof Error && error.message.includes('requires an index')) {
      console.error(`
        ------------------------------------------------------------
        MISSING FIRESTORE INDEX DETECTED!
        
        Your notification query requires a Firestore index that does not exist yet.
        Follow these steps to fix it:
        
        1. Go to your Firebase Console
        2. Navigate to Firestore Database → Indexes
        3. Create a new composite index with:
           - Collection: notifications
           - Fields:
             - userId (Ascending)
             - createdAt (Descending)
        
        Or click this link in the error message to create it automatically.
        ------------------------------------------------------------
      `);
    }
    throw error;
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  const snapshot = await notificationsRef
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();
  
  return snapshot.size;
};

/**
 * Mark a notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await notificationsRef.doc(notificationId).update({
    read: true
  });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  const batch = db.batch();
  
  const snapshot = await notificationsRef
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  
  await batch.commit();
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await notificationsRef.doc(notificationId).delete();
};

/**
 * Create a notification for ticket purchase
 */
export const notifyTicketPurchase = async (
  userId: string, 
  competitionId: string, 
  ticketId: string,
  competitionTitle: string,
  ticketNumber: number
): Promise<void> => {
  await createNotification({
    userId,
    type: 'ticket_purchase',
    title: 'Ticket Purchased',
    message: `You've successfully purchased ticket #${ticketNumber} for "${competitionTitle}".`,
    competitionId,
    ticketId
  });
};

/**
 * Create a notification for competition ending soon
 */
export const notifyCompetitionEnding = async (
  userId: string,
  competitionId: string,
  competitionTitle: string,
  imageUrl?: string
): Promise<void> => {
  await createNotification({
    userId,
    type: 'competition_ending',
    title: 'Competition Ending Soon',
    message: `The competition "${competitionTitle}" is ending soon! Don't miss your chance to win.`,
    competitionId,
    imageUrl
  });
};

/**
 * Create a notification for competition winners
 */
export const notifyWinner = async (
  userId: string,
  competitionId: string,
  competitionTitle: string,
  prize: string,
  imageUrl?: string
): Promise<void> => {
  await createNotification({
    userId,
    type: 'competition_winner',
    title: 'Congratulations! You Won!',
    message: `You've won "${prize}" in the "${competitionTitle}" competition!`,
    competitionId,
    imageUrl
  });
};

/**
 * Create a notification for credit updates
 */
export const notifyCreditUpdate = async (
  userId: string,
  amount: number,
  newBalance: number
): Promise<void> => {
  const action = amount > 0 ? 'added to' : 'deducted from';
  const absAmount = Math.abs(amount);
  
  await createNotification({
    userId,
    type: 'credit_update',
    title: 'Credit Update',
    message: `${absAmount} credits have been ${action} your account. Your new balance is ${newBalance} credits.`
  });
};

/**
 * Send a system notification to a user
 */
export const sendSystemNotification = async (
  userId: string,
  title: string,
  message: string
): Promise<void> => {
  await createNotification({
    userId,
    type: 'system',
    title,
    message
  });
};

/**
 * Create a notification for a support ticket update
 */
export const notifyTicketUpdate = async (
  userId: string,
  ticketId: string,
  ticketSubject: string,
  updatedBy: 'admin' | 'user',
  statusChange?: string
): Promise<string> => {
  console.log(`Creating ticket notification for user ID: ${userId}`, {
    ticketId,
    ticketSubject,
    updatedBy,
    statusChange
  });
  
  let title = 'Support Ticket Updated';
  let message = '';
  
  if (statusChange === 'test') {
    message = `This is a test notification for ticket "${ticketSubject}". If you're seeing this, notifications are working properly.`;
    title = 'Test Notification';
  } else if (statusChange === 'new') {
    message = `New support ticket created: "${ticketSubject}"`;
    title = 'New Support Ticket';
  } else if (statusChange === 'assigned') {
    message = `You have been assigned to support ticket: "${ticketSubject}"`;
    title = 'Ticket Assigned';
  } else if (statusChange === 'unassigned') {
    message = `You have been unassigned from support ticket: "${ticketSubject}"`;
    title = 'Ticket Unassigned';
  } else if (statusChange) {
    message = `Your ticket "${ticketSubject}" status has been changed to ${statusChange}.`;
    title = 'Ticket Status Changed';
  } else if (updatedBy === 'admin') {
    message = `An admin has replied to your ticket "${ticketSubject}".`;
    title = 'New Admin Response';
  } else {
    message = `New message from user in ticket "${ticketSubject}".`;
    title = 'New User Message';
  }
  
  try {
    const notificationId = await createNotification({
      userId,
      type: 'ticket_update',
      title,
      message,
      supportTicketId: ticketId
    });
    
    console.log(`Successfully created notification (ID: ${notificationId}) for user ${userId}`);
    
    return notificationId;
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Debug function to check if a notification exists for a user
 */
/* export const debugCheckNotification = async (userId: string): Promise<void> => {
  try {
    console.log(`Checking notifications for user ID: ${userId}`);
    const notifications = await getUserNotifications(userId);
    console.log(`Found ${notifications.length} notifications for user ${userId}:`, 
      notifications.map(n => ({ 
        id: n.id, 
        title: n.title, 
        message: n.message.substring(0, 30) + (n.message.length > 30 ? '...' : ''),
        createdAt: n.createdAt
      }))
    );
  } catch (error) {
    console.error(`Error checking notifications for user ${userId}:`, error);
  }
}; */ 