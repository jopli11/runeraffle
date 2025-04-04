import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Create a Firestore reference
// const db = admin.firestore();

/**
 * Basic test function to verify setup
 */
export const helloWorld = functions.https.onRequest((request, response) => {
  console.log('Hello logs!', {date: new Date().toISOString()});
  response.json({
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString()
  });
});

// Export all function modules
export * from './email';
export * from './auth';
export * from './referrals'; 