import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../config/firebase';
import { Competition, User, Ticket } from '../services/firestore';

// Sample competition data
export const seedCompetitions = async () => {
  const competitions = [
    {
      title: 'Dragon Slayer Challenge',
      description: 'Win epic dragon slayer gear and gold!',
      prize: 'Full Dragon Slayer Kit + 50M OSRS GP',
      prizeValue: '50M OSRS Gold',
      status: 'active',
      difficulty: 'medium',
      ticketPrice: 150,
      ticketsSold: 425,
      totalTickets: 1000,
      endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    },
    {
      title: 'Wilderness Warrior Pack',
      description: 'Dominate the wilderness with this premium gear set!',
      prize: 'Elite PK Gear + 25M OSRS GP',
      prizeValue: '25M OSRS Gold',
      status: 'active',
      difficulty: 'hard',
      ticketPrice: 200,
      ticketsSold: 310,
      totalTickets: 750,
      endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000))
    },
    {
      title: 'Beginner\'s Treasure',
      description: 'Perfect starter pack for new adventurers',
      prize: 'Starter Kit + 10M OSRS GP',
      prizeValue: '10M OSRS Gold',
      status: 'active',
      difficulty: 'easy',
      ticketPrice: 75,
      ticketsSold: 850,
      totalTickets: 1000,
      endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
    },
    {
      title: 'Elite Skiller Bundle',
      description: 'Boost your skilling with these rare materials and tools',
      prize: 'Ultimate Skilling Package + 30M OSRS GP',
      prizeValue: '30M OSRS Gold',
      status: 'ending',
      difficulty: 'medium',
      ticketPrice: 175,
      ticketsSold: 925,
      totalTickets: 1000,
      endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000))
    },
    {
      title: 'Grandmaster Quest Gear',
      description: 'Complete the hardest quests with this specialized gear',
      prize: 'Questmaster Kit + 40M OSRS GP',
      prizeValue: '40M OSRS Gold',
      status: 'complete',
      difficulty: 'hard',
      ticketPrice: 225,
      ticketsSold: 1000,
      totalTickets: 1000,
      endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
      completedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
      winner: {
        userId: 'demo-user-1',
        username: 'QuestMaster99',
        email: 'winner@example.com'
      },
      seed: '0x123456789abcdef',
      blockHash: '0x987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
      winningTicket: 777
    }
  ];

  // Add each competition to the firestore
  for (const competition of competitions) {
    try {
      const competitionWithTimestamps = {
        ...competition,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add to competitions collection
      await db.collection('competitions').add(competitionWithTimestamps);
      console.log(`Added competition: ${competition.title}`);
    } catch (error) {
      console.error(`Error adding competition ${competition.title}:`, error);
    }
  }
};

// Sample user data
export const seedUsers = async () => {
  const users = [
    {
      email: 'admin@runeraffle.com',
      displayName: 'Admin User',
      credits: 1000,
      isAdmin: true
    },
    {
      email: 'user@example.com',
      displayName: 'Demo User',
      credits: 500,
      isAdmin: false
    }
  ];

  // Add each user to the firestore
  for (const user of users) {
    try {
      const userWithTimestamps = {
        ...user,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Set user document with email as ID
      await db.collection('users').doc(user.email).set(userWithTimestamps);
      console.log(`Added user: ${user.email}`);
    } catch (error) {
      console.error(`Error adding user ${user.email}:`, error);
    }
  }
};

// Sample ticket data
export const seedTickets = async () => {
  // Get a reference to the first active competition and user
  const competitionsSnapshot = await db.collection('competitions').where('status', '==', 'active').limit(1).get();
  const userSnapshot = await db.collection('users').where('email', '==', 'user@example.com').get();
  
  if (competitionsSnapshot.empty || userSnapshot.empty) {
    console.error('Could not find competition or user to seed tickets');
    return;
  }
  
  const competitionDoc = competitionsSnapshot.docs[0];
  const competition = { id: competitionDoc.id, ...competitionDoc.data() } as Competition;
  const userDoc = userSnapshot.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() } as User;
  
  // Create some tickets
  const tickets = Array.from({ length: 5 }, (_, i) => ({
    competitionId: competition.id as string,
    userId: user.email,
    ticketNumber: i + 1,
    isWinner: false,
    purchasedAt: firebase.firestore.FieldValue.serverTimestamp()
  }));
  
  // Add each ticket to the firestore
  for (const ticket of tickets) {
    try {
      await db.collection('tickets').add(ticket);
      console.log(`Added ticket #${ticket.ticketNumber} for competition ${competition.title}`);
    } catch (error) {
      console.error(`Error adding ticket #${ticket.ticketNumber}:`, error);
    }
  }
}; 