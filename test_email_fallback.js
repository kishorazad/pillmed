// Test email fallback mechanism to ZohoMail
import * as emailService from './server/email-service.js';

// Temporarily modify the sendEmail function to force Resend to fail
const originalResendClient = emailService.resend;

async function testEmailFallback() {
  console.log('Testing email fallback to ZohoMail...');
  
  try {
    // Force Resend to fail by temporarily setting the client to null
    emailService.resend = null;
    emailService.resendInitialized = false;
    
    console.log('Temporarily disabled Resend client to test fallback');
    
    const result = await emailService.sendEmail(
      'brizkishor.azad@gmail.com', 
      'Test Email Fallback to ZohoMail',
      'This is a test email to verify the fallback mechanism to ZohoMail.',
      `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #FF8F00; text-align: center;">Email Fallback Test</h2>
        <p>This is a test email to verify that the fallback mechanism to ZohoMail is working correctly.</p>
        <p>If you received this email, it means the fallback configuration was successful!</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
      </div>`
    );
    
    if (result) {
      console.log('✅ Test email sent successfully using fallback to ZohoMail!');
    } else {
      console.error('❌ Failed to send test email using fallback to ZohoMail.');
    }
  } catch (error) {
    console.error('❌ Error during fallback test:', error);
  } finally {
    // Restore the original Resend client
    emailService.resend = originalResendClient;
    emailService.resendInitialized = !!originalResendClient;
    console.log('Restored original Resend client configuration');
  }
}

testEmailFallback();