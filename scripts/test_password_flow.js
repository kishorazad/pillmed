/**
 * Test script to verify the complete password reset flow
 * This script tests:
 * 1. Requesting a password reset
 * 2. Verifying the OTP
 * 3. Setting a new password
 * 4. Logging in with the new password
 */

import axios from 'axios';

// Test user credentials
const testEmail = 'test@example.com';
const oldPassword = 'oldPassword123';
const newPassword = 'newPassword456';

// API URLs
const baseUrl = 'http://localhost:5000';
const requestPasswordResetUrl = `${baseUrl}/api/password-reset/request`;
const verifyOtpUrl = `${baseUrl}/api/password-reset/verify-otp`;
const resetPasswordUrl = `${baseUrl}/api/password-reset/reset`;
const loginUrl = `${baseUrl}/api/auth/login`;

// Helper to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testPasswordResetFlow() {
  try {
    console.log('Starting password reset flow test...');
    
    // Step 1: Request password reset
    console.log('1. Requesting password reset OTP...');
    const requestResponse = await axios.post(requestPasswordResetUrl, { email: testEmail });
    console.log('Response:', requestResponse.data);

    if (!requestResponse.data.success) {
      throw new Error('Failed to request password reset OTP');
    }

    // First check if the API directly provided a test OTP
    let otp = requestResponse.data.testOtp;
    
    // If no test OTP was provided, prompt the user to enter the OTP they received
    if (!otp) {
      console.log('No test OTP was provided by the API.');
      console.log('IMPORTANT: Check the server logs to find the generated OTP.');
      console.log('It will look something like: "Generated OTP 123456 for test@example.com"');
      console.log('Please enter that OTP manually to continue testing.');
      
      // In a real test, you would wait for user input here
      // For this automated test, we'll use the OTP from the server logs
      // This is the value we saw in the logs: "Generated OTP 395256 for test@example.com"
      otp = '395256';
    }
    
    console.log(`Using OTP: ${otp}`);
    
    // Wait 2 seconds to simulate user checking email
    await delay(2000);
    
    // Step 2: Verify OTP
    console.log('\n2. Verifying OTP...');
    const verifyResponse = await axios.post(verifyOtpUrl, { 
      email: testEmail, 
      otp 
    });
    console.log('Response:', verifyResponse.data);
    
    if (!verifyResponse.data.success) {
      throw new Error('OTP verification failed');
    }
    
    // Wait 2 seconds to simulate user entering new password
    await delay(2000);
    
    // Step 3: Reset password
    console.log('\n3. Setting new password...');
    const resetResponse = await axios.post(resetPasswordUrl, {
      email: testEmail,
      otp,
      password: newPassword
    });
    console.log('Response:', resetResponse.data);
    
    if (!resetResponse.data.success) {
      throw new Error('Password reset failed');
    }
    
    // Wait 2 seconds to simulate user navigating to login page
    await delay(2000);
    
    // Step 4: Login with new password
    console.log('\n4. Logging in with new password...');
    const loginResponse = await axios.post(loginUrl, {
      email: testEmail,
      password: newPassword
    });
    console.log('Login successful!');
    console.log('User data:', loginResponse.data);
    
    console.log('\nPASSWORD RESET FLOW TEST PASSED! ✅');
  } catch (error) {
    console.error('\nTEST FAILED ❌');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

testPasswordResetFlow();