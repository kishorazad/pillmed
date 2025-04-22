/**
 * Email Deliverability Test
 * 
 * This script tests the email deliverability with our updated forced delivery settings.
 * The email will be sent to the test email address specified in the email service,
 * regardless of the address provided here.
 */

// Import required packages
import fetch from 'node-fetch';

// The email address to test (will be overridden by forced address in service)
const testEmail = 'brizkishor.azad@gmail.com';

// Test function to call the welcome email API
async function testWelcomeEmail() {
  console.log('Testing email deliverability to:', testEmail);
  
  try {
    const apiUrl = 'http://localhost:5000/api/test-welcome-email';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: testEmail,
        name: 'Briz Kishor Azad'
      })
    });
    
    console.log('API response:', response.status, response.statusText);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      console.log('\nEmail test complete! Check inbox for "brizkishor.azad@gmail.com"');
      console.log('The email should have forced delivery with debugging information');
    } else {
      console.error('Error response:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error data:', errorText);
    }
  } 
  catch (error) {
    console.error('Error while testing email:', error.message);
  }
}

// Run the test
testWelcomeEmail().catch(err => {
  console.error('Unhandled promise rejection in email test:', err);
  process.exit(1);
});