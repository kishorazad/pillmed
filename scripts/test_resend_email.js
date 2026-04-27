import { sendWelcomeEmail, sendPasswordResetOTP, generateOTP } from './server/email-service.ts';

async function testResendEmail() {
  console.log("Testing Direct Email Service with Resend...");

  // Generate OTP for password reset
  const otp = generateOTP(6);
  console.log(`Generated OTP: ${otp}`);
  
  // Test recipient - will be redirected to delivered@resend.dev in development
  const testEmail = "user@example.com";
  const userName = "Test User";

  try {
    // Test welcome email
    console.log(`\nSending welcome email to ${testEmail}...`);
    const welcomeResult = await sendWelcomeEmail(testEmail, userName);
    
    if (welcomeResult) {
      console.log("Welcome email sent successfully!");
    } else {
      console.log("Failed to send welcome email.");
    }

    // Test password reset email
    console.log(`\nSending password reset email to ${testEmail}...`);
    const resetResult = await sendPasswordResetOTP(testEmail, otp);
    
    if (resetResult) {
      console.log("Password reset email sent successfully!");
    } else {
      console.log("Failed to send password reset email.");
    }
  } catch (error) {
    console.error("Error during email tests:", error);
  }
}

testResendEmail();