import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Create a Firestore reference
const db = admin.firestore();

// Define the region
const region = 'europe-west2';

/**
 * Triggered when a user is created in Firebase Auth
 * Creates a user document in Firestore
 */
export const createUserDocument = functions
  .region(region)
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    
    try {
      const userRef = db.collection('users').doc(email || uid);
      
      // Check if user document already exists
      const doc = await userRef.get();
      if (!doc.exists) {
        // Create a new user document
        const userData = {
          uid,
          email: email || '',
          displayName: displayName || email || 'Anonymous User',
          photoURL: photoURL || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          credits: 100, // Default initial credits
          isAdmin: false, // Default is not admin
        };
        
        await userRef.set(userData);
        console.log(`Created user document for ${email || uid}`);
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user document:', error);
      return null;
    }
  });

/**
 * Triggered when a user is deleted from Firebase Auth
 * Cleans up user data from Firestore
 */
export const cleanupUserData = functions
  .region(region)
  .auth.user()
  .onDelete(async (user) => {
    const { uid, email } = user;
    
    try {
      // Delete user document
      if (email) {
        await db.collection('users').doc(email).delete();
      }
      
      // Delete user tickets
      const ticketsSnapshot = await db.collection('tickets').where('userId', '==', uid).get();
      
      const batch = db.batch();
      ticketsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Commit the batch delete
      if (ticketsSnapshot.docs.length > 0) {
        await batch.commit();
      }
      
      console.log(`Cleaned up data for user ${email || uid}`);
      return null;
    } catch (error) {
      console.error('Error cleaning up user data:', error);
      return null;
    }
  });

/**
 * Function to update a user's role
 * Can only be called by an admin
 */
export const updateUserRole = functions
  .region(region)
  .https.onCall(async (data, context) => {
    // Verify the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }
    
    // Verify the caller is an admin
    const callerEmail = context.auth.token.email || '';
    const callerDoc = await db.collection('users').doc(callerEmail).get();
    
    if (!callerDoc.exists || !callerDoc.data()?.isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can update user roles.'
      );
    }
    
    const { email, isAdmin } = data;
    
    if (!email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with an email identifier.'
      );
    }
    
    try {
      // Update the user's admin status
      await db.collection('users').doc(email).update({
        isAdmin: !!isAdmin,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error updating user role.'
      );
    }
  });

/**
 * Function to verify a user's email
 * Typically called after clicking a verification link
 */
export const verifyUserEmail = functions
  .region(region)
  .https.onCall(async (data, context) => {
    // Verify the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }
    
    const { email } = data;
    
    if (!email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with an email to verify.'
      );
    }
    
    try {
      // Check if user exists in Firestore
      const userDoc = await db.collection('users').doc(email).get();
      
      if (!userDoc.exists) {
        return { exists: false, verified: false };
      }
      
      // Check if the email belongs to the current user
      const userData = userDoc.data();
      const isCurrentUser = context.auth.token.email === email;
      
      // Only allow the user themselves or an admin to verify an email
      if (!isCurrentUser && (!userData?.isAdmin || !context.auth.token.email)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to verify this email.'
        );
      }
      
      return { 
        exists: true, 
        verified: true,
        userData: {
          displayName: userData?.displayName,
          credits: userData?.credits,
          createdAt: userData?.createdAt,
          isAdmin: userData?.isAdmin
        }
      };
    } catch (error) {
      console.error('Error verifying user email:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error verifying user email.'
      );
    }
  }); 