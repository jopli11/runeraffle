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
  const snapshot = await competitionsRef
    .where('status', 'in', ['active', 'ending'])
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getCompletedCompetitions = async (): Promise<Competition[]> => {
  const snapshot = await competitionsRef
    .where('status', 'in', ['complete'])
    .orderBy('completedAt', 'desc')
    .get();
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
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
    const userSnapshot = await db.collection('users').doc(ticket.userId).get();
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
  const snapshot = await ticketsRef
    .where('userId', '==', userId)
    .orderBy('purchasedAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Ticket }));
};

export const getCompetitionTickets = async (competitionId: string): Promise<Ticket[]> => {
  const snapshot = await ticketsRef
    .where('competitionId', '==', competitionId)
    .orderBy('purchasedAt', 'asc')
    .get();
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
export const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
  const newTicket = {
    ...ticket,
    status: 'open',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  const docRef = await supportTicketsRef.add(newTicket);
  return docRef.id;
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
  const docRef = supportTicketsRef.doc(ticketId);
  await docRef.update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const getUserSupportTickets = async (userId: string): Promise<SupportTicket[]> => {
  const snapshot = await supportTicketsRef
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as SupportTicket }));
};

export const getOpenSupportTickets = async (): Promise<SupportTicket[]> => {
  const snapshot = await supportTicketsRef
    .where('status', 'in', ['open', 'in_progress'])
    .orderBy('priority', 'desc')
    .orderBy('createdAt', 'asc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as SupportTicket }));
};

export const closeSupportTicket = async (ticketId: string, resolution?: string): Promise<void> => {
  const docRef = supportTicketsRef.doc(ticketId);
  await docRef.update({
    status: 'resolved',
    resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
    resolution,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// Ticket Message operations
export const addTicketMessage = async (message: Omit<TicketMessage, 'id' | 'createdAt'>): Promise<string> => {
  const newMessage = {
    ...message,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  const docRef = await ticketMessagesRef.add(newMessage);
  
  // Update the ticket's updatedAt timestamp
  await supportTicketsRef.doc(message.ticketId).update({
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  return docRef.id;
};

export const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
  const snapshot = await ticketMessagesRef
    .where('ticketId', '==', ticketId)
    .orderBy('createdAt', 'asc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as TicketMessage }));
}; 