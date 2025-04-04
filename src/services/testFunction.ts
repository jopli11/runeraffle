import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

/**
 * Test the helloWorld function
 */
export const testHelloWorld = async (): Promise<any> => {
  try {
    const functionUrl = `https://europe-west2-runeraffle-6fb42.cloudfunctions.net/helloWorld`;
    
    // Use no-cors mode as fallback if needed
    const response = await fetch(functionUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Check if response was successful
    if (!response.ok) {
      return { 
        error: `HTTP error: ${response.status} ${response.statusText}`,
        headers: Object.fromEntries([...response.headers])
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error testing helloWorld function:', error);
    return { error: 'Failed to call helloWorld function', details: String(error) };
  }
};

/**
 * Test the helloWorld function's CORS configuration
 */
export const testHelloWorldCORS = async (): Promise<any> => {
  try {
    const functionUrl = `https://europe-west2-runeraffle-6fb42.cloudfunctions.net/helloWorld`;
    
    // First try a preflight request with fetch
    try {
      // Check CORS preflight response with manual OPTIONS request
      const preflightResponse = await fetch(functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      // Get the CORS response headers
      const corsHeaders = {
        'access-control-allow-origin': preflightResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': preflightResponse.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': preflightResponse.headers.get('access-control-allow-headers')
      };
      
      return {
        status: preflightResponse.status,
        statusText: preflightResponse.statusText,
        corsHeaders,
        mode: 'preflight',
        headers: Object.fromEntries([...preflightResponse.headers])
      };
    } catch (preflightError) {
      // Fallback to a simple GET with CORS mode
      const response = await fetch(functionUrl, {
        headers: {
          'Origin': window.location.origin
        }
      });
      
      return {
        status: response.status,
        statusText: response.statusText,
        corsHeaders: {
          'access-control-allow-origin': response.headers.get('access-control-allow-origin')
        },
        mode: 'simple',
        headers: Object.fromEntries([...response.headers])
      };
    }
  } catch (error) {
    console.error('Error testing helloWorld CORS:', error);
    return { error: 'Failed to test CORS configuration', details: String(error) };
  }
};

/**
 * Test the sendEmail function
 */
export const testSendEmail = async (email: string): Promise<any> => {
  try {
    // Set the region for callable functions
    const sendEmailFn = firebase.app().functions('europe-west2').httpsCallable('sendEmail');
    const result = await sendEmailFn({
      to: email,
      subject: 'Test Email from Firebase Cloud Functions',
      text: 'This is a test email sent from Firebase Cloud Functions',
      html: '<h1>Test Email</h1><p>This is a test email sent from Firebase Cloud Functions</p>'
    });
    
    return result.data;
  } catch (error) {
    console.error('Error testing sendEmail function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: 'Failed to call sendEmail function', details: errorMessage };
  }
};

/**
 * Test the generateReferralCode function
 */
export const testGenerateReferralCode = async (): Promise<any> => {
  try {
    const generateReferralCodeFn = firebase.app().functions('europe-west2').httpsCallable('generateReferralCode');
    const result = await generateReferralCodeFn();
    
    return result.data;
  } catch (error) {
    console.error('Error testing generateReferralCode function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: 'Failed to call generateReferralCode function', details: errorMessage };
  }
};

/**
 * Test the verifyUserEmail function
 */
export const testVerifyUserEmail = async (email: string): Promise<any> => {
  try {
    const verifyUserEmailFn = firebase.app().functions('europe-west2').httpsCallable('verifyUserEmail');
    const result = await verifyUserEmailFn({ email });
    
    return result.data;
  } catch (error) {
    console.error('Error testing verifyUserEmail function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: 'Failed to call verifyUserEmail function', details: errorMessage };
  }
}; 