import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Create a Firestore reference
const db = admin.firestore();

/**
 * Triggered when a user is created in Firebase Auth
 * Creates a user document in Firestore
 */
export const createUserDocument = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  
  try {
    // Create a user document in Firestore
    await db.collection('users').doc(uid).set({
      email,
      displayName: displayName || email?.split('@')[0] || 'Anonymous Player',
      photoURL: photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user',
      isVerified: false,
      ticketCount: 0,
      winCount: 0,
      referralCode: null,
      referredBy: null,
      credits: 0
    });

    console.log(`User document created for: ${uid}`);
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
export const cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  
  try {
    // Delete user document
    await db.collection('users').doc(uid).delete();
    
    // Delete user's tickets
    const ticketsSnapshot = await db.collection('tickets').where('userId', '==', uid).get();
    const batch = db.batch();
    
    ticketsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`User data cleaned up for: ${uid}`);
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
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated'
    );
  }
  
  const callerUid = context.auth.uid;
  
  try {
    // Check if the caller is an admin
    const adminDoc = await db.collection('users').doc(callerUid).get();
    const adminData = adminDoc.data();
    
    if (!adminDoc.exists || !adminData || adminData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can update user roles'
      );
    }
    
    const { userId, newRole } = data;
    
    if (!userId || !newRole) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Both userId and newRole must be provided'
      );
    }
    
    // Ensure the role is valid
    if (!['user', 'admin', 'moderator'].includes(newRole)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Role must be one of: user, admin, moderator'
      );
    }
    
    // Update the user's role
    await db.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error updating user role'
    );
  }
});

/**
 * Function to verify a user's email
 * Typically called after clicking a verification link
 */
export const verifyUserEmail = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated'
    );
  }
  
  const uid = context.auth.uid;
  
  try {
    // Update the user's verification status
    await db.collection('users').doc(uid).update({
      isVerified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error verifying user email'
    );
  }
}); 