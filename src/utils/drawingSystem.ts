/**
 * Implements a verifiable random drawing system for competition winners
 * 
 * The system works as follows:
 * 1. We combine a seed (which can be public) with a block hash from a blockchain
 * 2. We hash this combined value to get a deterministic yet unpredictable result
 * 3. We use this hash to select a winning ticket number within the range of sold tickets
 * 
 * This approach ensures:
 * - The drawing is verifiable (anyone can reproduce the result with the inputs)
 * - The drawing is fair (no one can predict the outcome in advance)
 * - The drawing is transparent (all inputs are public after the draw)
 */

/**
 * Generates a random seed that can be published before the draw
 */
export function generateSeed(): string {
  // Create a random string that's different each time
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

/**
 * Simulates getting a block hash from a blockchain
 * In a real system, this would pull from an actual blockchain like Ethereum or Bitcoin
 */
export function simulateBlockHash(): string {
  // This is a simulation - in a real system this would be a hash from a blockchain
  const characters = '0123456789abcdef';
  let result = '';
  
  // Create a fake 64-character blockchain hash
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Determines the winning ticket based on the seed and block hash using browser crypto
 */
export async function determineWinningTicket(
  seed: string, 
  blockHash: string, 
  totalTickets: number
): Promise<number> {
  return browserCompatibleDrawing(seed, blockHash, totalTickets);
}

/**
 * Verify that a draw was conducted fairly
 */
export async function verifyDraw(
  seed: string,
  blockHash: string,
  totalTickets: number,
  claimedWinningTicket: number
): Promise<boolean> {
  const calculatedWinningTicket = await determineWinningTicket(seed, blockHash, totalTickets);
  return calculatedWinningTicket === claimedWinningTicket;
}

/**
 * Use browser's Web Crypto API to generate a hash and determine the winning ticket
 */
export function browserCompatibleDrawing(
  seed: string,
  blockHash: string, 
  totalTickets: number
): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      if (totalTickets <= 0) {
        throw new Error('Total tickets must be greater than 0');
      }

      // Use TextEncoder to convert string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(`${seed}-${blockHash}`);
      
      // Use Web Crypto API to create SHA-256 hash
      crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
        // Convert buffer to byte array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        // Convert bytes to hex string
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Convert the first 8 characters of the hash to a number
        const hashAsNumber = parseInt(hashHex.substring(0, 8), 16);
        
        // Get a number between 1 and totalTickets (inclusive)
        const winningTicket = (hashAsNumber % totalTickets) + 1;
        
        resolve(winningTicket);
      });
    } catch (error) {
      reject(error);
    }
  });
} 