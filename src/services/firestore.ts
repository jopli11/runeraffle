import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface Competition {
  id?: string;
  title: string;
  description: string;
  prize: string;
  prizeValue: string;
  status: 'active' | 'ending' | 'complete' | 'cancelled';
  difficulty: 'easy' | 'medium' | 'hard';
  ticketPrice: number;
  ticketsSold: number;
  totalTickets: number;
  endsAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
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
  purchasedAt: Timestamp;
  ticketNumber: number;
  isWinner: boolean;
}

export interface User {
  id?: string;
  email: string;
  displayName?: string;
  credits: number;
  isAdmin: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection references
const competitionsRef = collection(db, 'competitions');
const ticketsRef = collection(db, 'tickets');
const usersRef = collection(db, 'users');

// Competition operations
export const getCompetitions = async (): Promise<Competition[]> => {
  const snapshot = await getDocs(competitionsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getActiveCompetitions = async (): Promise<Competition[]> => {
  const q = query(
    competitionsRef, 
    where('status', 'in', ['active', 'ending']),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getCompletedCompetitions = async (): Promise<Competition[]> => {
  const q = query(
    competitionsRef, 
    where('status', 'in', ['complete']),
    orderBy('completedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Competition }));
};

export const getCompetition = async (id: string): Promise<Competition | null> => {
  const docRef = doc(db, 'competitions', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() as Competition };
  }
  
  return null;
};

export const createCompetition = async (competition: Omit<Competition, 'id' | 'createdAt' | 'updatedAt' | 'ticketsSold'>): Promise<string> => {
  const newCompetition = {
    ...competition,
    ticketsSold: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(competitionsRef, newCompetition);
  return docRef.id;
};

export const updateCompetition = async (id: string, data: Partial<Competition>): Promise<void> => {
  const docRef = doc(db, 'competitions', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteCompetition = async (id: string): Promise<void> => {
  const docRef = doc(db, 'competitions', id);
  await deleteDoc(docRef);
};

export const completeCompetition = async (id: string, winner: Competition['winner'], seed: string, blockHash: string, winningTicket: number): Promise<void> => {
  const docRef = doc(db, 'competitions', id);
  await updateDoc(docRef, {
    status: 'complete',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    winner,
    seed,
    blockHash,
    winningTicket
  });
};

export const cancelCompetition = async (id: string): Promise<void> => {
  const docRef = doc(db, 'competitions', id);
  await updateDoc(docRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  });
};

// Ticket operations
export const buyTicket = async (ticket: Omit<Ticket, 'id' | 'purchasedAt' | 'isWinner'>): Promise<string> => {
  const newTicket = {
    ...ticket,
    purchasedAt: serverTimestamp(),
    isWinner: false
  };
  
  const docRef = await addDoc(ticketsRef, newTicket);
  
  // Update competition ticket count
  const competitionRef = doc(db, 'competitions', ticket.competitionId);
  const competitionSnap = await getDoc(competitionRef);
  
  if (competitionSnap.exists()) {
    const competition = competitionSnap.data() as Competition;
    await updateDoc(competitionRef, {
      ticketsSold: competition.ticketsSold + 1,
      updatedAt: serverTimestamp()
    });
  }
  
  return docRef.id;
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const q = query(
    ticketsRef,
    where('userId', '==', userId),
    orderBy('purchasedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Ticket }));
};

export const getCompetitionTickets = async (competitionId: string): Promise<Ticket[]> => {
  const q = query(
    ticketsRef,
    where('competitionId', '==', competitionId),
    orderBy('purchasedAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Ticket }));
};

// User operations
export const createUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const userRef = doc(db, 'users', user.email);
  await setDoc(userRef, {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUser = async (email: string): Promise<User | null> => {
  const docRef = doc(db, 'users', email);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() as User };
  }
  
  return null;
};

export const updateUser = async (email: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', email);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const updateUserCredits = async (email: string, credits: number): Promise<void> => {
  const docRef = doc(db, 'users', email);
  await updateDoc(docRef, {
    credits,
    updatedAt: serverTimestamp()
  });
}; 