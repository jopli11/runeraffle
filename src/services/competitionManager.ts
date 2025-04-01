import { db } from '../config/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { 
  getCompetitions, 
  getCompetition, 
  getCompetitionTickets, 
  updateCompetition, 
  completeCompetition, 
  Competition 
} from './firestore';
import { generateSeed, simulateBlockHash, browserCompatibleDrawing } from '../utils/drawingSystem';

/**
 * Checks for competitions that have ended but haven't been marked as complete
 */
export async function checkEndedCompetitions(): Promise<Competition[]> {
  try {
    const now = firebase.firestore.Timestamp.now();
    
    // Query for active competitions that have passed their end date
    const snapshot = await db.collection('competitions')
      .where('status', '==', 'active')
      .where('endsAt', '<=', now)
      .get();
    
    if (snapshot.empty) {
      console.log('No competitions to end');
      return [];
    }
    
    // Convert to competitions array
    const endedCompetitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Competition));
    
    console.log(`Found ${endedCompetitions.length} competitions to end`);
    return endedCompetitions;
  } catch (error) {
    console.error('Error checking ended competitions:', error);
    return [];
  }
}

/**
 * Processes the end of a competition, selecting a winner and updating status
 */
export async function endCompetition(competitionId: string): Promise<boolean> {
  try {
    console.log(`Ending competition ${competitionId}`);
    
    // Get competition data
    const competition = await getCompetition(competitionId);
    if (!competition) {
      console.error(`Competition ${competitionId} not found`);
      return false;
    }
    
    // Check if already completed
    if (competition.status === 'complete') {
      console.log(`Competition ${competitionId} is already complete`);
      return true;
    }
    
    // Make sure tickets were sold
    if (competition.ticketsSold <= 0) {
      console.log(`No tickets sold for competition ${competitionId}, marking as cancelled`);
      await updateCompetition(competitionId, {
        status: 'cancelled',
        updatedAt: firebase.firestore.Timestamp.now()
      });
      return true;
    }
    
    // Get all tickets for the competition
    const tickets = await getCompetitionTickets(competitionId);
    if (tickets.length === 0) {
      console.error(`No tickets found for competition ${competitionId}`);
      return false;
    }
    
    // Generate seed and block hash
    const seed = generateSeed();
    const blockHash = simulateBlockHash();
    
    // Determine winning ticket number
    const winningTicket = await browserCompatibleDrawing(seed, blockHash, competition.ticketsSold);
    
    // Find the winning ticket
    const winnerTicket = tickets.find(ticket => ticket.ticketNumber === winningTicket);
    
    if (!winnerTicket) {
      console.error(`Winning ticket #${winningTicket} not found for competition ${competitionId}`);
      return false;
    }
    
    // Get user data for the winner
    const userSnapshot = await db.collection('users').doc(winnerTicket.userId).get();
    
    if (!userSnapshot.exists) {
      console.error(`Winner user ${winnerTicket.userId} not found`);
      return false;
    }
    
    const userData = userSnapshot.data();
    
    // Mark winner ticket
    await db.collection('tickets').doc(winnerTicket.id).update({
      isWinner: true
    });
    
    // Mark competition as complete with winner
    await completeCompetition(
      competitionId,
      {
        userId: winnerTicket.userId,
        username: userData?.displayName || 'Unknown',
        email: userData?.email || 'Unknown'
      },
      seed,
      blockHash,
      winningTicket
    );
    
    console.log(`Competition ${competitionId} ended. Winner: ${userData?.displayName}, Ticket: ${winningTicket}`);
    return true;
  } catch (error) {
    console.error(`Error ending competition ${competitionId}:`, error);
    return false;
  }
}

/**
 * Updates competitions that are close to ending (within 24 hours)
 * to show they are "ending soon"
 */
export async function updateEndingSoonCompetitions(): Promise<void> {
  try {
    const now = firebase.firestore.Timestamp.now();
    const oneDayFromNow = firebase.firestore.Timestamp.fromDate(
      new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000)
    );
    
    // Find active competitions ending within 24 hours
    const snapshot = await db.collection('competitions')
      .where('status', '==', 'active')
      .where('endsAt', '<=', oneDayFromNow)
      .where('endsAt', '>', now)
      .get();
    
    if (snapshot.empty) {
      return;
    }
    
    // Update them to "ending" status
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      const competitionRef = db.collection('competitions').doc(doc.id);
      batch.update(competitionRef, {
        status: 'ending',
        updatedAt: now
      });
    });
    
    await batch.commit();
    
    console.log(`Updated ${snapshot.docs.length} competitions to "ending" status`);
  } catch (error) {
    console.error('Error updating ending soon competitions:', error);
  }
}

/**
 * Main function to check and process all competitions
 */
export async function processCompetitions(): Promise<void> {
  try {
    // First update competitions that are ending soon
    await updateEndingSoonCompetitions();
    
    // Then check for competitions that have ended
    const endedCompetitions = await checkEndedCompetitions();
    
    // Process each ended competition
    for (const competition of endedCompetitions) {
      if (competition.id) {
        await endCompetition(competition.id);
      }
    }
  } catch (error) {
    console.error('Error processing competitions:', error);
  }
} 