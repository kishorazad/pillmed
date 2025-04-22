// Test email sending with Zoho Mail
import { sendEmail } from './server/email-service.js';

async function testZohoEmail() {
  console.log('Testing email delivery with Zoho Mail...');
  
  try {
    const result = await sendEmail(
      'brizkishor.azad@gmail.com', 
      'Test Email from PillNow via Zoho Mail',
      'This is a test email sent to verify the Zoho Mail integration.',
      `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #FF8F00; text-align: center;">Zoho Mail Test</h2>
        <p>This is a test email sent to verify that the Zoho Mail integration is working correctly.</p>
        <p>If you received this email, it means the configuration was successful!</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PillNow. All rights reserved.</p>
      </div>`
    );
    
    if (result) {
      console.log('✅ Test email sent successfully using Zoho Mail!');
    } else {
      console.error('❌ Failed to send test email using Zoho Mail.');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testZohoEmail();