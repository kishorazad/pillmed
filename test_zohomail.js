/**
 * Test script to verify Zoho Mail email sending functionality
 */
import { execSync } from 'child_process';

console.log('Testing Zoho Mail email service...');

try {
  // Execute the email test using tsx to handle TypeScript
  const result = execSync('tsx -e "import { sendEmail } from \'./server/email-service\'; async function test() { try { const result = await sendEmail(\'brizkishor.azad@gmail.com\', \'Test Email from PillNow via Zoho Mail\', \'This is a test email sent to verify the Zoho Mail integration.\', \'<div style=\"font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;\"><h2 style=\"color: #FF8F00; text-align: center;\">Zoho Mail Test</h2><p>This is a test email sent to verify that the Zoho Mail integration is working correctly.</p><p>If you received this email, it means the configuration was successful!</p><p style=\"margin-top: 30px; color: #666; font-size: 12px; text-align: center;\">&copy; \' + new Date().getFullYear() + \' PillNow. All rights reserved.</p></div>\'); console.log(result ? \'✅ Test email sent successfully!\' : \'❌ Failed to send test email.\'); } catch (error) { console.error(\'❌ Error:\', error); } } test();"', { 
    encoding: 'utf-8',
    stdio: 'inherit'
  });
  
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error executing test:', error.message);
}