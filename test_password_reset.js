/**
 * Test script to verify password reset email sending
 */
import { sendPasswordResetOTP, generateOTP } from './server/email-service.js';

async function testPasswordResetEmail() {
  try {
    console.log('Testing password reset email functionality...');
    
    // Generate a random OTP for testing
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp}`);
    
    // Send password reset email
    const email = 'brizkishor.azad@gmail.com';
    const result = await sendPasswordResetOTP(email, otp);
    
    if (result) {
      console.log(`✅ Password reset email sent successfully to ${email}`);
    } else {
      console.error(`❌ Failed to send password reset email to ${email}`);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testPasswordResetEmail();