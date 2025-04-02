import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../config/firebase';

// Notification types
export interface Notification {
  id?: string;
  userId: string;
  type: 'competition_ending' | 'ticket_purchase' | 'competition_winner' | 'credit_update' | 'system';
  title: string;
  message: string;
  competitionId?: string;
  ticketId?: string;
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
  const snapshot = await notificationsRef
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(50) // Limit to the 50 most recent notifications
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Notification }));
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