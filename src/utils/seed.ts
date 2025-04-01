import { addDoc, collection, Timestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Competition, User, Ticket } from '../services/firestore';

// Sample competition data
const sampleCompetitions: Omit<Competition, 'id' | 'createdAt' | 'updatedAt' | 'ticketsSold'>[] = [
  {
    title: 'Dragon Slayer Challenge',
    description: 'Win the ultimate Dragon gear set and 100M OSRS Gold.',
    prize: 'Dragon Gear + 100M OSRS Gold',
    prizeValue: '100M OSRS Gold',
    status: 'active',
    difficulty: 'hard',
    ticketPrice: 5,
    totalTickets: 1000,
    endsAt: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // 3 days from now
  },
  {
    title: 'Goblin Slayer Raffle',
    description: 'Win 10M OSRS Gold in this easy entry raffle.',
    prize: '10M OSRS Gold',
    prizeValue: '10M OSRS Gold',
    status: 'active',
    difficulty: 'easy',
    ticketPrice: 2,
    totalTickets: 500,
    endsAt: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
  },
  {
    title: 'Barrows Gear Raffle',
    description: 'Complete set of Barrows equipment up for grabs!',
    prize: 'Full Barrows Set',
    prizeValue: 'Barrows Set',
    status: 'ending',
    difficulty: 'medium',
    ticketPrice: 3,
    totalTickets: 750,
    endsAt: Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000)), // 12 hours from now
  },
  {
    title: 'Bandos Raffle',
    description: 'Win the coveted Bandos armor set in this limited raffle.',
    prize: 'Bandos Armor Set + 25M Gold',
    prizeValue: 'Bandos Set + 25M',
    status: 'active',
    difficulty: 'hard',
    ticketPrice: 4,
    totalTickets: 300,
    endsAt: Timestamp.fromDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)), // 4 days from now
  },
  {
    title: 'Abyssal Whip Giveaway',
    description: 'Legendary whip for the lucky winner!',
    prize: 'Abyssal Whip + 5M OSRS Gold',
    prizeValue: 'Whip + 5M Gold',
    status: 'complete',
    difficulty: 'medium',
    ticketPrice: 2,
    totalTickets: 500,
    endsAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
    completedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    winner: {
      userId: 'user1',
      username: 'DragonSlayer92',
      email: 'dragonslayer92@example.com'
    },
    seed: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    blockHash: '0000000000000000000725ec8c8b477bff8c0da1380b9862ec2e7a19c96b29b3',
    winningTicket: 42
  },
  {
    title: 'Armadyl Godsword Raffle',
    description: 'One of the most powerful weapons in OSRS!',
    prize: 'Armadyl Godsword + 10M OSRS Gold',
    prizeValue: 'AGS + 10M Gold',
    status: 'complete',
    difficulty: 'hard',
    ticketPrice: 5,
    totalTickets: 800,
    endsAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
    completedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    winner: {
      userId: 'user2',
      username: 'GodSwordMaster',
      email: 'godswordmaster@example.com'
    },
    seed: '3c6e0b8a9c15224a8228b9a98ca1531d5f3d8d474c9c7b1bc37ea1c77d3f6db7',
    blockHash: '00000000000000000003b78c64bdb9077616db74d3756fd98865050ea191ec82',
    winningTicket: 123
  }
];

// Sample user data
const sampleUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    email: 'admin@runeraffle.com',
    displayName: 'Admin',
    credits: 1000,
    isAdmin: true
  },
  {
    email: 'user@example.com',
    displayName: 'Regular User',
    credits: 100,
    isAdmin: false
  },
  {
    email: 'dragonslayer92@example.com',
    displayName: 'DragonSlayer92',
    credits: 250,
    isAdmin: false
  },
  {
    email: 'godswordmaster@example.com',
    displayName: 'GodSwordMaster',
    credits: 300,
    isAdmin: false
  }
];

// Function to seed the database
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Seeding database...');
    
    // Seed users
    console.log('Seeding users...');
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.email), {
        ...user,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    // Seed competitions
    console.log('Seeding competitions...');
    const competitionsRef = collection(db, 'competitions');
    const competitionsIds: string[] = [];
    
    for (const competition of sampleCompetitions) {
      const ticketsSold = competition.status === 'complete' 
        ? competition.totalTickets 
        : Math.floor(Math.random() * competition.totalTickets * 0.8);
      
      const docRef = await addDoc(competitionsRef, {
        ...competition,
        ticketsSold,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      competitionsIds.push(docRef.id);
    }
    
    // Seed tickets for active competitions
    console.log('Seeding tickets...');
    const ticketsRef = collection(db, 'tickets');
    const userIds = ['user1', 'user2', 'user3']; // Fake user IDs for tickets
    
    for (let i = 0; i < competitionsIds.length; i++) {
      const competitionId = competitionsIds[i];
      const competition = sampleCompetitions[i];
      
      // Skip if competition is not active
      if (competition.status === 'complete') continue;
      
      // Create some tickets
      const ticketCount = Math.floor(Math.random() * 50) + 10; // Between 10 and 60 tickets
      
      for (let j = 0; j < ticketCount; j++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        
        await addDoc(ticketsRef, {
          competitionId,
          userId,
          ticketNumber: j + 1,
          purchasedAt: Timestamp.now(),
          isWinner: false
        });
      }
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}; 