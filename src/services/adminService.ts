import { db } from '../config/firebase';

/**
 * Get all admin user IDs from the users collection
 */
export const getAdminUserIds = async (): Promise<string[]> => {
  const adminIds: string[] = [];
  
  try {
    console.log(`Starting admin user ID lookup`);
    
    // Check the user profiles collection first
    console.log(`Checking users collection for admin accounts`);
    try {
      // Get users where isAdmin is true
      const snapshot = await db.collection('users')
        .where('isAdmin', '==', true)
        .get();
      
      if (snapshot.empty) {
        console.warn('No admin users found in users collection with isAdmin=true');
      } else {
        console.log(`Found ${snapshot.size} admin users in users collection`);
      }
      
      // Add each admin user ID to the array
      snapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`Processing admin user document:`, {
          docId: doc.id,
          hasUid: !!userData?.uid,
          email: userData?.email
        });
        
        // In Firebase Authentication, the user's ID is their UID
        // In Firestore, the document ID could be either the email or the UID
        if (userData && userData.uid) {
          // If uid field exists, use that
          adminIds.push(userData.uid);
          console.log(`Added admin user by uid: ${userData.uid}`);
        } else {
          // Otherwise use the document ID (likely the email)
          adminIds.push(doc.id);
          console.log(`Added admin user by doc.id: ${doc.id}`);
        }
      });
    } catch (error) {
      console.error('Error checking users collection for admins:', error);
    }
    
    // Check Firebase Auth custom claims
    console.log(`Checking for admin users in authentication custom claims`);
    try {
      // This assumes we're storing auth information in a separate collection
      const authAdmins = await db.collection('auth')
        .where('admin', '==', true)
        .get();
      
      if (authAdmins.empty) {
        console.warn('No admin users found in auth collection');
      } else {
        console.log(`Found ${authAdmins.size} admin users in auth collection`);
      }
      
      authAdmins.forEach(doc => {
        const id = doc.id;
        if (!adminIds.includes(id)) {
          adminIds.push(id);
          console.log(`Added admin user from auth collection: ${id}`);
        } else {
          console.log(`Admin ${id} from auth collection already in list`);
        }
      });
    } catch (error) {
      console.error('Error checking auth collection for admins:', error);
    }
    
    // As a last resort, check the user_roles collection if it exists
    console.log(`Checking for admin roles in user_roles collection`);
    try {
      const rolesAdmins = await db.collection('user_roles')
        .where('role', '==', 'admin')
        .get();
      
      if (rolesAdmins.empty) {
        console.warn('No admin roles found in user_roles collection');
      } else {
        console.log(`Found ${rolesAdmins.size} admin roles in user_roles collection`);
      }
      
      rolesAdmins.forEach(doc => {
        const userId = doc.data().userId;
        if (userId && !adminIds.includes(userId)) {
          adminIds.push(userId);
          console.log(`Added admin user from user_roles collection: ${userId}`);
        } else if (userId) {
          console.log(`Admin ${userId} from user_roles collection already in list`);
        }
      });
    } catch (error) {
      console.error('Error checking user_roles collection:', error);
    }
    
    // Final fallback - if no admins found, add at least one default admin
    if (adminIds.length === 0) {
      console.warn('No admin users found in any collection. Adding default admin if exists.');
      
      try {
        // Try to find an admin user by known email or ID
        const defaultAdminDoc = await db.collection('users')
          .doc('admin@runeraffle.com')
          .get();
          
        if (defaultAdminDoc.exists) {
          const userData = defaultAdminDoc.data();
          const adminId = userData?.uid || defaultAdminDoc.id;
          adminIds.push(adminId);
          console.log(`Added default admin: ${adminId}`);
        }
      } catch (error) {
        console.error('Error adding default admin:', error);
      }
    }
    
    console.log(`Found ${adminIds.length} total admin users:`, adminIds);
    return adminIds;
  } catch (error) {
    console.error('Error fetching admin IDs:', error);
    return [];
  }
};

/**
 * Check if a user is an admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData?.isAdmin === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Notify all administrators about something
 * @param notificationFn - The notification function to call for each admin
 * @returns The number of admins notified
 */
export const notifyAllAdmins = async <T>(
  notificationFn: (adminId: string) => Promise<T>
): Promise<number> => {
  try {
    // Get all admin user IDs
    const adminIds = await getAdminUserIds();
    
    if (adminIds.length === 0) {
      console.warn('No admins found to notify');
      return 0;
    }
    
    // Call the notification function for each admin
    await Promise.all(adminIds.map(adminId => 
      notificationFn(adminId).catch(error => {
        console.error(`Error notifying admin ${adminId}:`, error);
      })
    ));
    
    return adminIds.length;
  } catch (error) {
    console.error('Error notifying all admins:', error);
    return 0;
  }
}; 