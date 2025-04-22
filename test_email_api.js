import fetch from 'node-fetch';

/**
 * Test the forgot password API endpoint to send an email
 */
async function testForgotPasswordEmail() {
  console.log("Testing Forgot Password Email API endpoint...");
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com' // This will be redirected to delivered@resend.dev in dev mode
      })
    });
    
    const data = await response.json();
    console.log("API Response:", data);
    
    if (response.ok) {
      console.log("Forgot password email request successful!");
    } else {
      console.log("Forgot password email request failed:", data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error making API request:", error);
  }
}

/**
 * Test the welcome email API endpoint
 */
async function testWelcomeEmail() {
  console.log("\nTesting Welcome Email API endpoint...");
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/test-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User'
      })
    });
    
    const data = await response.json();
    console.log("API Response:", data);
    
    if (response.ok) {
      console.log("Welcome email request successful!");
    } else {
      console.log("Welcome email request failed:", data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error making API request:", error);
  }
}

// Run the test functions
testForgotPasswordEmail()
  .then(() => testWelcomeEmail())
  .catch(console.error);