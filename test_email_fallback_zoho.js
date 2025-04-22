/**
 * Test script to verify the email fallback functionality with ZohoMail
 * This forces Resend to fail and checks if ZohoMail takes over
 */
import { mongoDBService } from './server/services/mongodb-service';
import { initializeEmailService, sendPasswordResetOTP, sendWelcomeEmail, sendEmail } from './server/email-service';

async function testEmailFallbackToZoho() {
  console.log('Testing email service fallback to ZohoMail...');
  
  try {
    // Initialize email service
    await initializeEmailService();
    
    // Save original Resend email function
    const originalSendEmail = globalThis.sendEmailViaResend;
    
    // Override Resend function to force failure
    globalThis.sendEmailViaResend = async () => {
      console.log('🔄 Forcing Resend to fail for testing fallback...');
      throw new Error('Forced Resend failure for testing');
    };
    
    console.log('\n1. Testing password reset email with forced Resend failure:');
    const email = 'brizkishor.azad@gmail.com';
    const otp = '123456';
    
    console.log(`Sending password reset email to ${email} with OTP ${otp}`);
    const resetResult = await sendPasswordResetOTP(email, otp);
    
    console.log(`Password reset email result: ${resetResult ? 'Success ✅' : 'Failed ❌'}`);
    
    console.log('\n2. Testing welcome email with forced Resend failure:');
    const name = 'Test User';
    
    console.log(`Sending welcome email to ${email} for ${name}`);
    const welcomeResult = await sendWelcomeEmail(email, name);
    
    console.log(`Welcome email result: ${welcomeResult ? 'Success ✅' : 'Failed ❌'}`);
    
    console.log('\n3. Testing generic email with forced Resend failure:');
    
    console.log(`Sending generic email to ${email}`);
    const genericResult = await sendEmail({
      to: email,
      subject: 'Testing Fallback Chain',
      text: 'This is a test email sent through the fallback chain.',
      html: '<p>This is a test email sent through the fallback chain.</p>'
    });
    
    console.log(`Generic email result: ${genericResult ? 'Success ✅' : 'Failed ❌'}`);
    
    // Restore original Resend function
    globalThis.sendEmailViaResend = originalSendEmail;
    console.log('\nRestored original Resend function');
    
  } catch (error) {
    console.error('Error during email fallback test:', error);
  }
}

// Run the test
testEmailFallbackToZoho();