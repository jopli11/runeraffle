import { getFunctions } from '../config/firebase';

/**
 * Functions service for handling Firebase Cloud Functions.
 * 
 * This wrapper provides a safe interface for calling Cloud Functions
 * with fallbacks for environments where Functions may not be available.
 */

// Generic type for Cloud Function calls
type CloudFunction<T, R> = (data: T) => Promise<R>;

/**
 * Creates a callable function that will work even if Firebase Functions
 * is not properly initialized. This helps prevent runtime errors.
 * 
 * @param functionName Name of the Firebase Cloud Function
 * @returns A callable function that sends the data to the specified Cloud Function
 */
export function createCallableFunction<T = any, R = any>(functionName: string): CloudFunction<T, R> {
  try {
    const functions = getFunctions();
    const callable = functions.httpsCallable(functionName);
    
    return async (data: T): Promise<R> => {
      try {
        const result = await callable(data);
        return result.data as R;
      } catch (error) {
        console.error(`Error calling cloud function ${functionName}:`, error);
        throw error;
      }
    };
  } catch (error) {
    console.error(`Failed to initialize cloud function ${functionName}:`, error);
    
    // Return a function that will reject with a helpful error message
    return async () => {
      throw new Error(`Cloud function "${functionName}" is not available in this environment`);
    };
  }
}

// Examples of Cloud Functions you might use in your app
export const sendEmail = createCallableFunction<{
  to: string;
  subject: string;
  text: string;
}, { success: boolean }>('sendEmail');

// Add other function definitions here as needed 