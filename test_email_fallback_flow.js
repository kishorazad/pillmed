/**
 * Tests the fallback to ZohoMail when Resend fails by modifying the resendInitialized flag temporarily
 */
import { sendEmail } from './server/email-service.js';

// Get global variable references (workaround since we can't directly modify the exports)
// We'll have to access the zohomailInitialized variable through a trick
const globalScope = global;

async function testFallbackFlow() {
  console.log('Testing email fallback flow to ZohoMail...');
  
  try {
    // Create a dummy test module to check if ZohoMail is initialized
    const checkZohoMailStatus = new Function(`
      const isReady = ${globalScope.zohomailInitialized ? 'true' : 'false'};
      return isReady;
    `);
    
    console.log(`ZohoMail initialized: ${checkZohoMailStatus()}`);

    // Capture original flags values
    console.log(`Current resendInitialized status: ${globalScope.resendInitialized}`);
    
    // Create a wrapper function to temporarily disable Resend
    const sendWithFallback = new Function(`
      // Temporarily disable Resend
      const originalResendInitialized = global.resendInitialized;
      global.resendInitialized = false;
      
      // Try sending the email, should fall back to ZohoMail
      const result = await import('./server/email-service.js').then(module => {
        return module.sendEmail(
          'brizkishor.azad@gmail.com',
          'Test Email Fallback Flow',
          'Testing the fallback mechanism to ZohoMail when Resend is unavailable.',
          '<div>Testing fallback to ZohoMail</div>'
        );
      });
      
      // Restore the original value
      global.resendInitialized = originalResendInitialized;
      
      return result;
    `);
    
    // Run the test
    const fallbackTestResult = await sendWithFallback();
    
    console.log('Fallback test completed with result:', fallbackTestResult);
  } catch (error) {
    console.error('Error during fallback test:', error);
  }
}

// Execute the test
testFallbackFlow();