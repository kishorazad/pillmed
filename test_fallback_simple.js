/**
 * Tests the fallback functionality by temporarily replacing the Resend send function
 * with one that always throws an error
 */
import { sendEmail } from './server/email-service.js';

async function testFallback() {
  console.log('Testing fallback to ZohoMail with simple method...');
  
  // Create a simple wrapper that forces the Resend API to fail
  const originalFetch = global.fetch;
  
  try {
    // Replace fetch with a function that fails for Resend API calls
    global.fetch = function(url, options) {
      if (url && url.toString().includes('resend.com')) {
        console.log('🔄 Intercepted Resend API call and forcing failure');
        return Promise.reject(new Error('Simulated Resend API failure'));
      }
      
      // Pass through all other fetches
      return originalFetch(url, options);
    };
    
    // Now send an email - should fall back to ZohoMail
    const result = await sendEmail(
      'brizkishor.azad@gmail.com',
      'Testing Fallback to ZohoMail',
      'This email tests the fallback mechanism to ZohoMail when Resend fails.',
      `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #FF8F00; text-align: center;">Fallback Test</h2>
        <p>This email is testing the fallback mechanism from Resend to ZohoMail.</p>
        <p>If you received this email, it means the fallback is working!</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PillNow</p>
      </div>`
    );
    
    console.log('Email sending result:', result);
  } catch (error) {
    console.error('Error during fallback test:', error);
  } finally {
    // Always restore the original fetch
    global.fetch = originalFetch;
    console.log('Restored original fetch function');
  }
}

testFallback();