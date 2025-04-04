import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Basic test function with CORS headers
export const helloWorld = functions
  .region('europe-west2') // Use London region for better UK performance
  .https.onRequest((request, response) => {
    // Set CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request (for CORS preflight)
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }
    
    console.log('Hello logs!', {date: new Date().toISOString()});
    response.json({
      message: "Hello from Firebase Functions!",
      timestamp: new Date().toISOString(),
      region: "europe-west2"
    });
  });

// Export email functions
export * from './email';
// Export auth functions
export * from './auth';
// Export referral functions
export * from './referrals'; 