import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

// Define the region
const region = 'europe-west2';
const db = admin.firestore();

/**
 * Scheduled function that runs every hour to check for competitions
 * that need to be processed (ended, marked as ending soon, etc.)
 */
export const scheduledCompetitionProcessor = functions
  .region(region)
  .pubsub.schedule('every 60 minutes')
  .onRun(async (context) => {
    console.log('Running scheduled competition processor');
    const now = admin.firestore.Timestamp.now();
    
    // 1. Check for active competitions that have ended
    const endedCompetitionsQuery = await db.collection('competitions')
      .where('status', '==', 'active')
      .where('endsAt', '<=', now)
      .get();
      
    console.log(`Found ${endedCompetitionsQuery.size} ended competitions to process`);
      
    // Process each ended competition
    const processingPromises = [];
    
    for (const doc of endedCompetitionsQuery.docs) {
      processingPromises.push(processEndedCompetition(doc.id));
    }
    
    // 2. Check for competitions ending within 24 hours
    const oneDayFromNow = admin.firestore.Timestamp.fromDate(
      new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000)
    );
    
    const endingSoonQuery = await db.collection('competitions')
      .where('status', '==', 'active')
      .where('endsAt', '<=', oneDayFromNow)
      .where('endsAt', '>', now)
      .where('markedEndingSoon', '==', false) // Only select those not already marked
      .get();
      
    console.log(`Found ${endingSoonQuery.size} competitions ending soon to process`);
      
    // Mark competitions as ending soon and notify participants
    for (const doc of endingSoonQuery.docs) {
      processingPromises.push(markCompetitionEndingSoon(doc.id));
    }
    
    await Promise.all(processingPromises);
    
    console.log(`Processed ${endedCompetitionsQuery.size} ended competitions and ${endingSoonQuery.size} ending soon competitions`);
    return null;
  });

/**
 * Process a competition that has ended
 */
async function processEndedCompetition(competitionId: string) {
  try {
    console.log(`Processing ended competition: ${competitionId}`);
    
    // Get competition data
    const competitionRef = db.collection('competitions').doc(competitionId);
    const competitionSnapshot = await competitionRef.get();
    
    if (!competitionSnapshot.exists) {
      console.error(`Competition ${competitionId} not found`);
      return;
    }
    
    const competition = competitionSnapshot.data();
    if (!competition) {
      console.error(`No data for competition ${competitionId}`);
      return;
    }
    
    // Check if already completed
    if (competition.status === 'complete' || competition.status === 'cancelled') {
      console.log(`Competition ${competitionId} is already ${competition.status}`);
      return;
    }
    
    // If no tickets sold, mark as cancelled
    if (competition.ticketsSold <= 0) {
      await competitionRef.update({
        status: 'cancelled',
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log(`No tickets sold for competition ${competitionId}, marked as cancelled`);
      return;
    }
    
    // Get all tickets for the competition
    const ticketsSnapshot = await db.collection('tickets')
      .where('competitionId', '==', competitionId)
      .get();
      
    if (ticketsSnapshot.empty) {
      console.error(`No tickets found for competition ${competitionId} despite ticketsSold = ${competition.ticketsSold}`);
      // Mark as cancelled due to data inconsistency
      await competitionRef.update({
        status: 'cancelled',
        updatedAt: admin.firestore.Timestamp.now()
      });
      return;
    }
    
    // Generate a seed and get a blockchain hash
    const seed = generateRandomSeed();
    const blockHash = await getBlockchainHash();
    
    // Determine winning ticket number
    const winningTicketNumber = await determineWinningTicket(seed, blockHash, competition.ticketsSold);
    
    // Find the winning ticket
    const winningTicket = ticketsSnapshot.docs.find(
      doc => doc.data().ticketNumber === winningTicketNumber
    );
    
    if (!winningTicket) {
      console.error(`Winning ticket #${winningTicketNumber} not found for competition ${competitionId}`);
      return;
    }
    
    const winningTicketData = winningTicket.data();
    const winnerId = winningTicketData.userId;
    
    // Get user data
    const userQuerySnapshot = await db.collection('users')
      .where('uid', '==', winnerId)
      .limit(1)
      .get();
      
    if (userQuerySnapshot.empty) {
      console.error(`User ${winnerId} not found for winning ticket`);
      return;
    }
    
    const userDoc = userQuerySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Mark the ticket as a winner
    await db.collection('tickets').doc(winningTicket.id).update({
      isWinner: true,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    // Mark competition as complete
    await competitionRef.update({
      status: 'complete',
      winner: {
        userId: winnerId,
        username: userData?.displayName || 'Unknown User',
        email: userData?.email || ''
      },
      winningTicket: winningTicketNumber,
      seed: seed,
      blockHash: blockHash,
      completedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    // Notify the winner via notification
    await db.collection('notifications').add({
      userId: winnerId,
      userEmail: userData?.email || null,
      title: 'Congratulations! You Won!',
      message: `You won the "${competition.title}" competition!`,
      type: 'win',
      competitionId: competitionId,
      imageUrl: competition.imageUrl || null,
      data: { prize: competition.prize },
      read: false,
      createdAt: admin.firestore.Timestamp.now()
    });
    
    // Send email to winner if email is available
    if (userData?.email) {
      await sendWinnerEmail(
        userData.email,
        userData.displayName || 'Winner',
        competition.title,
        competition.prize,
        competition.prizeValue || '',
        competitionId
      );
    }
    
    console.log(`Competition ${competitionId} completed. Winner: ${userData?.displayName || winnerId}, Ticket: ${winningTicketNumber}`);
  } catch (error) {
    console.error(`Error processing competition ${competitionId}:`, error);
  }
}

/**
 * Mark a competition as ending soon and notify participants
 */
async function markCompetitionEndingSoon(competitionId: string) {
  try {
    console.log(`Marking competition ${competitionId} as ending soon`);
    
    // Get competition data
    const competitionRef = db.collection('competitions').doc(competitionId);
    const competitionSnapshot = await competitionRef.get();
    
    if (!competitionSnapshot.exists) {
      console.error(`Competition ${competitionId} not found`);
      return;
    }
    
    const competition = competitionSnapshot.data();
    if (!competition) {
      console.error(`No data for competition ${competitionId}`);
      return;
    }
    
    // Update the competition status
    await competitionRef.update({
      status: 'ending',
      markedEndingSoon: true,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    // Get all tickets for this competition
    const ticketsSnapshot = await db.collection('tickets')
      .where('competitionId', '==', competitionId)
      .get();
      
    if (ticketsSnapshot.empty) {
      console.log(`No tickets found for competition ${competitionId}`);
      return;
    }
    
    // Create a Set to store unique user IDs
    const participantIds = new Set<string>();
    
    // Collect unique participant IDs
    ticketsSnapshot.docs.forEach(ticketDoc => {
      const ticketData = ticketDoc.data();
      participantIds.add(ticketData.userId);
    });
    
    console.log(`Notifying ${participantIds.size} participants about competition ending soon`);
    
    // Calculate hours remaining
    const now = admin.firestore.Timestamp.now();
    const endsAt = competition.endsAt;
    const hoursRemaining = Math.floor((endsAt.toMillis() - now.toMillis()) / (1000 * 60 * 60));
    
    // Notify each participant
    const notifications = Array.from(participantIds).map(userId => {
      return db.collection('notifications').add({
        userId,
        title: 'Competition Ending Soon!',
        message: `"${competition.title}" is ending in ${hoursRemaining} hours. Get your tickets now!`,
        type: 'ending_soon',
        competitionId,
        imageUrl: competition.imageUrl || null,
        read: false,
        createdAt: admin.firestore.Timestamp.now()
      });
    });
    
    await Promise.all(notifications);
    
    // Optionally send emails to participants
    // This would require getting user emails from their IDs
    
    console.log(`Successfully marked competition ${competitionId} as ending soon and notified ${participantIds.size} participants`);
  } catch (error) {
    console.error(`Error marking competition ${competitionId} as ending soon:`, error);
  }
}

/**
 * Generates a random seed for the drawing
 */
function generateRandomSeed(): string {
  // Generate a cryptographically secure random string
  return crypto.randomBytes(16).toString('hex') + Date.now().toString(36);
}

/**
 * Gets a recent block hash from a public blockchain
 */
async function getBlockchainHash(): Promise<string> {
  try {
    // Try to get from Ethereum blockchain via Etherscan
    // This requires an API key from https://etherscan.io/
    const apiKey = functions.config().etherscan?.key || '';
    
    if (apiKey) {
      // Get the latest block number
      const response = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`);
      const data = await response.json();
      
      if (data.result) {
        // Get the block details
        const blockResponse = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${data.result}&boolean=true&apikey=${apiKey}`);
        const blockData = await blockResponse.json();
        
        if (blockData.result && blockData.result.hash) {
          return blockData.result.hash.substring(2); // Remove '0x' prefix
        }
      }
    }
    
    // Fallback to Bitcoin blockchain via Blockchain.info
    const btcResponse = await fetch('https://blockchain.info/latestblock');
    const btcData = await btcResponse.json();
    
    if (btcData && btcData.hash) {
      return btcData.hash;
    }
    
    // Final fallback - generate a crypto-secure random hash
    console.warn('Using fallback random hash generator - consider configuring blockchain API access');
    return crypto.randomBytes(32).toString('hex');
  } catch (error) {
    console.error('Error getting blockchain hash:', error);
    // Fallback method if APIs fail
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * Determines the winning ticket using a cryptographic hash
 */
async function determineWinningTicket(
  seed: string,
  blockHash: string,
  totalTickets: number
): Promise<number> {
  if (totalTickets <= 0) {
    throw new Error('Total tickets must be greater than 0');
  }
  
  // Combine seed and block hash
  const data = `${seed}-${blockHash}`;
  
  // Create a SHA-256 hash
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  // Convert the first 8 characters of the hash to a number
  const hashAsNumber = parseInt(hash.substring(0, 8), 16);
  
  // Get a number between 1 and totalTickets (inclusive)
  const winningTicket = (hashAsNumber % totalTickets) + 1;
  
  return winningTicket;
}

/**
 * Send an email to the winner
 */
async function sendWinnerEmail(
  email: string,
  displayName: string,
  competitionTitle: string,
  prize: string,
  prizeValue: string,
  competitionId: string
): Promise<void> {
  try {
    // Create HTML content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Congratulations! You Won!</h1>
        <p>Hello ${displayName},</p>
        <p>Congratulations! You are the winner of the <strong>${competitionTitle}</strong> competition!</p>
        <p><strong>Your Prize:</strong> ${prize} ${prizeValue ? `(Value: ${prizeValue})` : ''}</p>
        <p>Our team will contact you shortly to arrange delivery of your prize.</p>
        <p>You can verify the draw results at: https://runeraffle.com/verification/${competitionId}</p>
        <p>Thank you for participating in RuneRaffle!</p>
        <p>The RuneRaffle Team</p>
      </div>
    `;
    
    // Create text content
    const text = `
      Congratulations! You Won!
      
      Hello ${displayName},
      
      Congratulations! You are the winner of the "${competitionTitle}" competition!
      
      Your Prize: ${prize} ${prizeValue ? `(Value: ${prizeValue})` : ''}
      
      Our team will contact you shortly to arrange delivery of your prize.
      
      You can verify the draw results at: https://runeraffle.com/verification/${competitionId}
      
      Thank you for participating in RuneRaffle!
      
      The RuneRaffle Team
    `;
    
    // Add an entry to emailLogs collection to track this
    await db.collection('emailLogs').add({
      to: email,
      subject: `You Won! - ${competitionTitle}`,
      sent: true,
      content: {
        html,
        text
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      error: null
    });
    
    console.log(`Winner notification recorded for ${email} for competition ${competitionId}`);
  } catch (error) {
    console.error('Error recording winner notification:', error);
  }
}

/**
 * HTTP function to manually trigger competition processing
 * Provides an API endpoint for admins to trigger processing
 */
export const manualProcessCompetitions = functions
  .region(region)
  .https.onCall(async (data, context) => {
    // Verify the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }
    
    // Get user email and check if they are an admin
    const userEmail = context.auth.token.email || '';
    
    if (!userEmail) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User email not found.'
      );
    }
    
    // Check if the user is an admin
    const userDoc = await db.collection('users').doc(userEmail).get();
    
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can manually process competitions.'
      );
    }
    
    try {
      const now = admin.firestore.Timestamp.now();
      
      // Check for competitions that have ended
      const endedCompetitionsQuery = await db.collection('competitions')
        .where('status', '==', 'active')
        .where('endsAt', '<=', now)
        .get();
        
      // Process each competition
      const processingPromises = [];
      
      for (const doc of endedCompetitionsQuery.docs) {
        processingPromises.push(processEndedCompetition(doc.id));
      }
      
      await Promise.all(processingPromises);
      
      return {
        success: true,
        processedCount: endedCompetitionsQuery.size
      };
    } catch (error) {
      console.error('Error in manual competition processing:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error processing competitions.'
      );
    }
  });

/**
 * HTTP function to manually end a specific competition
 */
export const manualEndCompetition = functions
  .region(region)
  .https.onCall(async (data, context) => {
    // Verify the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }
    
    // Get user email and check if they are an admin
    const userEmail = context.auth.token.email || '';
    
    if (!userEmail) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User email not found.'
      );
    }
    
    // Check if the user is an admin
    const userDoc = await db.collection('users').doc(userEmail).get();
    
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can manually end competitions.'
      );
    }
    
    const { competitionId } = data;
    
    if (!competitionId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Competition ID is required.'
      );
    }
    
    try {
      await processEndedCompetition(competitionId);
      
      return {
        success: true,
        message: `Competition ${competitionId} has been processed.`
      };
    } catch (error) {
      console.error(`Error ending competition ${competitionId}:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Error ending competition.'
      );
    }
  }); 