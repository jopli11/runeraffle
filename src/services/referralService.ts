import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../config/firebase';
import { updateUserCredits } from './firestore';
import { sendReferralRewardEmail } from './emailService';

// Types 
export interface Referral {
  id?: string;
  code: string;
  userId: string;
  referredUsers: string[];
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}

export interface ReferralReward {
  id?: string;
  referrerId: string;
  referredUserId: string;
  creditAmount: number;
  status: 'pending' | 'completed';
  createdAt: firebase.firestore.Timestamp;
  completedAt?: firebase.firestore.Timestamp;
}

// Constants
export const REFERRAL_CREDIT_REWARD = 50; // Credits rewarded for each successful referral
export const REFEREE_CREDIT_REWARD = 25; // Credits given to the person who was referred

// Generate a unique referral code
export const generateReferralCode = (userId: string): string => {
  // Create a code using the first 6 chars of userId and a random 4-char alphanumeric string
  const userIdPrefix = userId.substring(0, 6);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${userIdPrefix}-${randomChars}`;
};

// Create or get a user's referral code
export const getOrCreateReferralCode = async (userId: string, userEmail: string): Promise<string> => {
  const referralsRef = db.collection('referrals');
  const userReferralQuery = await referralsRef.where('userId', '==', userId).limit(1).get();
  
  if (!userReferralQuery.empty) {
    // User already has a referral code
    return userReferralQuery.docs[0].data().code;
  }
  
  // Create a new referral code for the user
  const code = generateReferralCode(userId);
  
  const newReferral: Omit<Referral, 'id'> = {
    code,
    userId,
    referredUsers: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp
  };
  
  await referralsRef.add(newReferral);
  return code;
};

// Find a referral by code
export const findReferralByCode = async (code: string): Promise<Referral | null> => {
  const referralsRef = db.collection('referrals');
  const referralQuery = await referralsRef.where('code', '==', code).limit(1).get();
  
  if (referralQuery.empty) {
    return null;
  }
  
  const doc = referralQuery.docs[0];
  return { id: doc.id, ...doc.data() as Referral };
};

// Process a referral when a user signs up
export const processReferral = async (
  referralCode: string,
  newUserId: string,
  newUserEmail: string
): Promise<boolean> => {
  try {
    // Find the referral code
    const referral = await findReferralByCode(referralCode);
    if (!referral || !referral.id) {
      console.error(`Invalid referral code: ${referralCode}`);
      return false;
    }
    
    // Make sure user isn't referring themselves
    if (referral.userId === newUserId) {
      console.error('User cannot refer themselves');
      return false;
    }
    
    // Check if user is already referred
    if (referral.referredUsers.includes(newUserId)) {
      console.error('User already referred');
      return false;
    }
    
    // Update the referral document with the new referred user
    const referralRef = db.collection('referrals').doc(referral.id);
    await referralRef.update({
      referredUsers: firebase.firestore.FieldValue.arrayUnion(newUserId),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Create a pending reward
    const rewardsRef = db.collection('referralRewards');
    const newReward: Omit<ReferralReward, 'id'> = {
      referrerId: referral.userId,
      referredUserId: newUserId,
      creditAmount: REFERRAL_CREDIT_REWARD,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp
    };
    
    await rewardsRef.add(newReward);
    
    // Add initial credits to the referred user
    const referrerSnapshot = await db.collection('users').doc(referral.userId).get();
    if (referrerSnapshot.exists) {
      const referrerData = referrerSnapshot.data();
      if (referrerData) {
        // Give the new user a bonus for using a referral code
        await updateUserCredits(newUserEmail, REFEREE_CREDIT_REWARD);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
};

// Claim a referral reward after the referred user makes their first purchase
export const claimReferralReward = async (
  referredUserId: string
): Promise<boolean> => {
  try {
    // Find pending rewards for this referred user
    const rewardsRef = db.collection('referralRewards');
    const pendingRewardQuery = await rewardsRef
      .where('referredUserId', '==', referredUserId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    
    if (pendingRewardQuery.empty) {
      return false;
    }
    
    const rewardDoc = pendingRewardQuery.docs[0];
    const reward = { id: rewardDoc.id, ...rewardDoc.data() as ReferralReward };
    
    // Get the referrer user for their email
    const referrerSnapshot = await db.collection('users').doc(reward.referrerId).get();
    if (!referrerSnapshot.exists) {
      return false;
    }
    
    const referrerData = referrerSnapshot.data();
    if (!referrerData || !referrerData.email) {
      return false;
    }
    
    // Update the reward status
    await rewardsRef.doc(reward.id).update({
      status: 'completed',
      completedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Add credits to the referrer
    await updateUserCredits(referrerData.email, REFERRAL_CREDIT_REWARD);
    
    // Send email notification about the reward
    if (referrerData.email) {
      await sendReferralRewardEmail(
        referrerData.email,
        referrerData.displayName || 'User',
        REFERRAL_CREDIT_REWARD
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error claiming referral reward:', error);
    return false;
  }
};

// Get all referrals for a user
export const getUserReferrals = async (userId: string): Promise<Referral[]> => {
  const referralsRef = db.collection('referrals');
  const userReferralQuery = await referralsRef.where('userId', '==', userId).get();
  
  if (userReferralQuery.empty) {
    return [];
  }
  
  return userReferralQuery.docs.map(doc => ({ id: doc.id, ...doc.data() as Referral }));
};

// Get referral statistics for a user
export const getUserReferralStats = async (userId: string): Promise<{ 
  totalReferrals: number; 
  pendingRewards: number;
  completedRewards: number;
  totalEarned: number;
}> => {
  // Get the user's referrals
  const referrals = await getUserReferrals(userId);
  if (referrals.length === 0) {
    return { totalReferrals: 0, pendingRewards: 0, completedRewards: 0, totalEarned: 0 };
  }
  
  // Count total referred users
  const totalReferrals = referrals.reduce((total, referral) => total + referral.referredUsers.length, 0);
  
  // Get referral rewards
  const rewardsRef = db.collection('referralRewards');
  const rewardsQuery = await rewardsRef.where('referrerId', '==', userId).get();
  
  if (rewardsQuery.empty) {
    return { totalReferrals, pendingRewards: 0, completedRewards: 0, totalEarned: 0 };
  }
  
  const rewards = rewardsQuery.docs.map(doc => doc.data() as ReferralReward);
  
  const pendingRewards = rewards.filter(reward => reward.status === 'pending').length;
  const completedRewards = rewards.filter(reward => reward.status === 'completed').length;
  const totalEarned = rewards
    .filter(reward => reward.status === 'completed')
    .reduce((total, reward) => total + reward.creditAmount, 0);
  
  return { totalReferrals, pendingRewards, completedRewards, totalEarned };
}; 