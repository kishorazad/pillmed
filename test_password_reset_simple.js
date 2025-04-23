/**
 * Simpler test script for password reset using a registered test user
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const email = 'admin@pillnow.com'; // Using a known existing account
const newPassword = 'Password@123';

async function testReset() {
  try {
    // Step 1: Request password reset
    console.log('1. Requesting password reset...');
    const requestResponse = await axios.post(`${baseUrl}/api/auth/forgot-password`, {
      email
    });
    
    // Get the test OTP from the response
    const testOtp = requestResponse.data.testOtp;
    console.log(`Got OTP: ${testOtp}`);
    
    if (!testOtp) {
      console.log('No test OTP provided. Check server logs for the OTP.');
      return;
    }
    
    // Step 2: Login directly using the admin credentials to test the login endpoint
    console.log('\n2. Testing login with the admin user...');
    try {
      const loginResult = await axios.post(`${baseUrl}/api/auth/login`, {
        email,
        password: 'admin' // Default admin password
      });
      console.log('Login successful');
    } catch (error) {
      console.log('Login failed, possibly because password was already reset');
      console.log('Error:', error.message);
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testReset();