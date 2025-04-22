// Using ES module syntax since package.json has "type": "module"
import fetch from 'node-fetch';

async function testPasswordResetEmail() {
  console.log("Testing Password Reset Email API...");
  
  // Test email address (this will be redirected to delivered@resend.dev in development)
  const testEmail = "test@example.com";
  
  try {
    console.log(`Sending password reset request for ${testEmail}...`);
    
    // Use the forgot-password API endpoint which handles OTP generation and sending
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (response.ok) {
      console.log("Password reset request successful!");
    } else {
      console.log("Failed to send password reset request.");
    }
  } catch (error) {
    console.error("Error with password reset API:", error);
  }
}

testPasswordResetEmail();