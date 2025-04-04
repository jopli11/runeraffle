import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { nanoid } from 'nanoid';

// Create a Firestore reference
const db = admin.firestore();

// Length of the referral code
const REFERRAL_CODE_LENGTH = 8;

// Reward amount for referrals (in credits)
const REFERRAL_REWARD_AMOUNT = 5;

/**
 * Generate a unique referral code for a user
 * This is a callable function that users can invoke
 */
export const generateReferralCode = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated'
    );
  }
  
  const uid = context.auth.uid;
  
  try {
    // Check if the user already has a referral code
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }
    
    const userData = userDoc.data();
    
    // If user already has a referral code, return it
    if (userData && userData.referralCode) {
      return { 
        referralCode: userData.referralCode,
        isNew: false
      };
    }
    
    // Generate a new unique referral code
    let isUnique = false;
    let referralCode = '';
    
    while (!isUnique) {
      referralCode = nanoid(REFERRAL_CODE_LENGTH);
      
      // Check if the code is already in use
      const existingRefs = await db.collection('users')
        .where('referralCode', '==', referralCode)
        .limit(1)
        .get();
      
      isUnique = existingRefs.empty;
    }
    
    // Save the referral code to the user's document
    await db.collection('users').doc(uid).update({
      referralCode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      referralCode,
      isNew: true
    };
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error generating referral code'
    );
  }
});

/**
 * Process a referral when a new user signs up
 * This should be called once during user registration if they have a referral code
 */
export const processReferral = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated'
    );
  }
  
  const newUserId = context.auth.uid;
  const { referralCode } = data;
  
  if (!referralCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Referral code is required'
    );
  }
  
  try {
    // Find the referring user
    const referringUserSnapshot = await db.collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();
    
    if (referringUserSnapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Invalid referral code'
      );
    }
    
    const referringUserDoc = referringUserSnapshot.docs[0];
    const referringUserId = referringUserDoc.id;
    
    // Make sure the user isn't referring themselves
    if (referringUserId === newUserId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You cannot refer yourself'
      );
    }
    
    // Check if the new user already has a referral processed
    const newUserDoc = await db.collection('users').doc(newUserId).get();
    const newUserData = newUserDoc.data();
    
    if (newUserData && newUserData.referredBy) {
      throw new functions.https.HttpsError(
        'already-exists',
        'You have already used a referral code'
      );
    }
    
    // Create a referral record
    const referralId = await db.collection('referrals').add({
      referringUserId,
      referredUserId: newUserId,
      status: 'pending', // Pending until the referred user makes a purchase
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      rewardClaimed: false
    });
    
    // Update the new user's document with the referral info
    await db.collection('users').doc(newUserId).update({
      referredBy: referringUserId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true,
      referralId: referralId.id
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error processing referral'
    );
  }
});

/**
 * Complete a referral and issue rewards when a referred user makes their first purchase
 * This is triggered by Firestore write to tickets collection
 */
export const completeReferral = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snapshot, context) => {
    const ticketData = snapshot.data();
    const { userId } = ticketData;
    
    try {
      // Get the user's document
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log('User not found, skipping referral check');
        return null;
      }
      
      const userData = userDoc.data();
      if (!userData || !userData.referredBy) {
        // User wasn't referred, nothing to do
        return null;
      }
      
      // Find pending referrals for this user
      const referralsSnapshot = await db.collection('referrals')
        .where('referredUserId', '==', userId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();
      
      if (referralsSnapshot.empty) {
        console.log('No pending referrals found for user');
        return null;
      }
      
      const referralDoc = referralsSnapshot.docs[0];
      const referralData = referralDoc.data();
      const referringUserId = referralData.referringUserId;
      
      // Update the referral status to completed
      await referralDoc.ref.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Award credits to the referring user
      await db.collection('users').doc(referringUserId).update({
        credits: admin.firestore.FieldValue.increment(REFERRAL_REWARD_AMOUNT),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Create credit transaction record
      await db.collection('creditTransactions').add({
        userId: referringUserId,
        amount: REFERRAL_REWARD_AMOUNT,
        type: 'referral_reward',
        description: `Referral reward for user ${userId}`,
        referralId: referralDoc.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Referral completed for user ${userId}, reward given to user ${referringUserId}`);
      return null;
    } catch (error) {
      console.error('Error completing referral:', error);
      return null;
    }
  });

/**
 * Get a user's referrals (who they've referred)
 * This is a callable function for users to check their referrals
 */
export const getUserReferrals = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated'
    );
  }
  
  const uid = context.auth.uid;
  
  try {
    // Get all referrals where this user is the referrer
    const referralsSnapshot = await db.collection('referrals')
      .where('referringUserId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Transform the data for the client
    const referrals = await Promise.all(referralsSnapshot.docs.map(async (doc) => {
      const referralData = doc.data();
      
      // Get the referred user's display name
      const referredUserDoc = await db.collection('users').doc(referralData.referredUserId).get();
      const referredUserData = referredUserDoc.data();
      
      return {
        id: doc.id,
        referredUserId: referralData.referredUserId,
        referredUserName: referredUserData?.displayName || 'Unknown User',
        status: referralData.status,
        createdAt: referralData.createdAt?.toDate().toISOString() || null,
        completedAt: referralData.completedAt?.toDate().toISOString() || null,
        rewardClaimed: referralData.rewardClaimed
      };
    }));
    
    // Get the user's referral code
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    return { 
      referrals,
      referralCode: userData?.referralCode || null,
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length
    };
  } catch (error) {
    console.error('Error getting user referrals:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error getting user referrals'
    );
  }
}); 