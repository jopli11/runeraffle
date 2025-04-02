import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../config/firebase';
import { Competition, Ticket, User } from './firestore';

// Types
export interface RevenueData {
  totalRevenue: number;
  revenueByDay: { [date: string]: number };
  revenueByCompetition: { [competitionId: string]: number };
}

export interface UserStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  usersByJoinDate: { [date: string]: number };
  activeUsers: number; // Users who bought at least one ticket in the last 30 days
}

export interface CompetitionStats {
  totalCompetitions: number;
  activeCompetitions: number;
  completedCompetitions: number;
  averageTicketsSold: number;
  mostPopularCompetitions: Array<{id: string, title: string, ticketsSold: number}>;
  recentlyEndedCompetitions: Array<{id: string, title: string, winner: string, endDate: Date}>;
}

export interface TicketStats {
  totalTicketsSold: number;
  ticketsSoldLast7Days: number;
  ticketsSoldLast30Days: number;
  ticketsByDay: { [date: string]: number };
  averageTicketsPerUser: number;
}

export interface SystemStats {
  conversionRate: number; // % of users who have bought at least one ticket
  averageCreditsPerUser: number;
  totalSupportTickets: number;
  openSupportTickets: number;
}

export interface AnalyticsDashboardData {
  revenue: RevenueData;
  users: UserStats;
  competitions: CompetitionStats;
  tickets: TicketStats;
  system: SystemStats;
}

export const getRevenueData = async (): Promise<RevenueData> => {
  const competitionsSnapshot = await db.collection('competitions').get();
  const competitions = competitionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Competition[];
  
  let totalRevenue = 0;
  const revenueByCompetition: { [competitionId: string]: number } = {};
  const revenueByDay: { [date: string]: number } = {};
  
  competitions.forEach(competition => {
    const competitionRevenue = competition.ticketsSold * competition.ticketPrice;
    totalRevenue += competitionRevenue;
    revenueByCompetition[competition.id!] = competitionRevenue;
    
    // Add to daily revenue if completed
    if (competition.completedAt) {
      const dateStr = new Date(competition.completedAt.toDate()).toISOString().split('T')[0];
      revenueByDay[dateStr] = (revenueByDay[dateStr] || 0) + competitionRevenue;
    }
  });
  
  return {
    totalRevenue,
    revenueByCompetition,
    revenueByDay
  };
};

export const getUserStats = async (): Promise<UserStats> => {
  const usersSnapshot = await db.collection('users').get();
  const users = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const usersByJoinDate: { [date: string]: number } = {};
  let newUsersLast7Days = 0;
  let newUsersLast30Days = 0;
  
  users.forEach(user => {
    if (user.createdAt) {
      const createdDate = user.createdAt.toDate();
      const dateStr = createdDate.toISOString().split('T')[0];
      usersByJoinDate[dateStr] = (usersByJoinDate[dateStr] || 0) + 1;
      
      if (createdDate >= sevenDaysAgo) {
        newUsersLast7Days++;
      }
      
      if (createdDate >= thirtyDaysAgo) {
        newUsersLast30Days++;
      }
    }
  });
  
  // Get active users (bought tickets in last 30 days)
  const thirtyDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(thirtyDaysAgo);
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('purchasedAt', '>=', thirtyDaysAgoTimestamp)
    .get();
  
  const activeUserIds = new Set(
    ticketsSnapshot.docs.map(doc => doc.data().userId)
  );
  
  return {
    totalUsers: users.length,
    newUsersLast7Days,
    newUsersLast30Days,
    usersByJoinDate,
    activeUsers: activeUserIds.size
  };
};

export const getCompetitionStats = async (): Promise<CompetitionStats> => {
  const competitionsSnapshot = await db.collection('competitions').get();
  const competitions = competitionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Competition[];
  
  const activeCompetitions = competitions.filter(comp => 
    comp.status === 'active' || comp.status === 'ending'
  );
  
  const completedCompetitions = competitions.filter(comp => 
    comp.status === 'complete'
  );
  
  // Calculate average tickets sold per competition
  const totalTickets = competitions.reduce((sum, comp) => sum + comp.ticketsSold, 0);
  const averageTicketsSold = competitions.length > 0 
    ? Math.round(totalTickets / competitions.length) 
    : 0;
  
  // Get most popular competitions
  const mostPopular = [...competitions]
    .sort((a, b) => b.ticketsSold - a.ticketsSold)
    .slice(0, 5)
    .map(comp => ({
      id: comp.id!,
      title: comp.title,
      ticketsSold: comp.ticketsSold
    }));
  
  // Get recently ended competitions
  const recentlyEnded = [...completedCompetitions]
    .filter(comp => comp.winner)
    .sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime();
    })
    .slice(0, 5)
    .map(comp => ({
      id: comp.id!,
      title: comp.title,
      winner: comp.winner?.username || 'Unknown',
      endDate: comp.completedAt?.toDate() || new Date()
    }));
  
  return {
    totalCompetitions: competitions.length,
    activeCompetitions: activeCompetitions.length,
    completedCompetitions: completedCompetitions.length,
    averageTicketsSold,
    mostPopularCompetitions: mostPopular,
    recentlyEndedCompetitions: recentlyEnded
  };
};

export const getTicketStats = async (): Promise<TicketStats> => {
  const ticketsSnapshot = await db.collection('tickets').get();
  const tickets = ticketsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ticket[];
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const ticketsByDay: { [date: string]: number } = {};
  let ticketsSoldLast7Days = 0;
  let ticketsSoldLast30Days = 0;
  
  // Count tickets by user to calculate average
  const ticketsByUser: { [userId: string]: number } = {};
  
  tickets.forEach(ticket => {
    if (ticket.purchasedAt) {
      const purchaseDate = ticket.purchasedAt.toDate();
      const dateStr = purchaseDate.toISOString().split('T')[0];
      ticketsByDay[dateStr] = (ticketsByDay[dateStr] || 0) + 1;
      
      if (purchaseDate >= sevenDaysAgo) {
        ticketsSoldLast7Days++;
      }
      
      if (purchaseDate >= thirtyDaysAgo) {
        ticketsSoldLast30Days++;
      }
    }
    
    // Add to user's ticket count
    ticketsByUser[ticket.userId] = (ticketsByUser[ticket.userId] || 0) + 1;
  });
  
  // Calculate average tickets per user
  const userCount = Object.keys(ticketsByUser).length;
  const averageTicketsPerUser = userCount > 0 
    ? Math.round((tickets.length / userCount) * 100) / 100 
    : 0;
  
  return {
    totalTicketsSold: tickets.length,
    ticketsSoldLast7Days,
    ticketsSoldLast30Days,
    ticketsByDay,
    averageTicketsPerUser
  };
};

export const getSystemStats = async (): Promise<SystemStats> => {
  const usersSnapshot = await db.collection('users').get();
  const usersCount = usersSnapshot.docs.length;
  
  // Get total credits in the system
  let totalCredits = 0;
  usersSnapshot.forEach(doc => {
    const userData = doc.data() as User;
    totalCredits += userData.credits || 0;
  });
  
  // Get users who bought at least one ticket
  const usersWithTicketsSnapshot = await db
    .collection('tickets')
    .get();
  
  const usersWithTickets = new Set(
    usersWithTicketsSnapshot.docs.map(doc => doc.data().userId)
  ).size;
  
  // Get support tickets
  const supportTicketsSnapshot = await db
    .collection('supportTickets')
    .get();
  
  const openSupportTicketsSnapshot = await db
    .collection('supportTickets')
    .where('status', 'in', ['open', 'in_progress'])
    .get();
  
  return {
    conversionRate: usersCount > 0 
      ? Math.round((usersWithTickets / usersCount) * 100) 
      : 0,
    averageCreditsPerUser: usersCount > 0 
      ? Math.round((totalCredits / usersCount) * 100) / 100 
      : 0,
    totalSupportTickets: supportTicketsSnapshot.docs.length,
    openSupportTickets: openSupportTicketsSnapshot.docs.length
  };
};

export const getDashboardAnalytics = async (): Promise<AnalyticsDashboardData> => {
  const [revenue, users, competitions, tickets, system] = await Promise.all([
    getRevenueData(),
    getUserStats(),
    getCompetitionStats(),
    getTicketStats(),
    getSystemStats()
  ]);
  
  return {
    revenue,
    users,
    competitions,
    tickets,
    system
  };
}; 