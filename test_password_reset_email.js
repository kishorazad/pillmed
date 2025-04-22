import { sendPasswordResetOTP, generateOTP } from './server/email-service.ts';

async function testPasswordResetEmail() {
  console.log("Testing Password Reset Email Function...");
  
  // Generate a random OTP
  const otp = generateOTP(6);
  console.log(`Generated OTP: ${otp}`);
  
  // Test email address (this will be redirected to delivered@resend.dev in development)
  const testEmail = "test@example.com";
  
  try {
    console.log(`Sending password reset email to ${testEmail}...`);
    const result = await sendPasswordResetOTP(testEmail, otp);
    
    if (result) {
      console.log("Password reset email sent successfully!");
    } else {
      console.log("Failed to send password reset email.");
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}

testPasswordResetEmail();