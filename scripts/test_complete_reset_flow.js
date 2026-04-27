/**
 * Complete password reset flow test using the OTP from logs
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const adminEmail = 'admin@pillnow.com';
const otp = '749606'; // OTP from server logs
const newPassword = 'admin123';

// Helper to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testCompleteResetFlow() {
  try {
    console.log('Starting complete password reset flow test...');
    
    // Step 1: Verify OTP
    console.log('\n1. Verifying OTP...');
    const verifyResponse = await axios.post(`${baseUrl}/api/password-reset/verify-otp`, { 
      email: adminEmail, 
      otp 
    });
    console.log('Response:', verifyResponse.data);
    
    if (!verifyResponse.data.success) {
      throw new Error('OTP verification failed');
    }
    
    // Wait 2 seconds
    await delay(2000);
    
    // Step 2: Reset password
    console.log('\n2. Setting new password...');
    const resetResponse = await axios.post(`${baseUrl}/api/password-reset/reset`, {
      email: adminEmail,
      otp,
      password: newPassword
    });
    console.log('Response:', resetResponse.data);
    
    if (!resetResponse.data.success) {
      throw new Error('Password reset failed');
    }
    
    // Wait 2 seconds
    await delay(2000);
    
    // Step 3: Login with new password
    console.log('\n3. Logging in with new password...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: adminEmail,
      password: newPassword
    });
    console.log('Login successful!');
    console.log('User data:', loginResponse.data.username);
    
    console.log('\nCOMPLETE PASSWORD RESET FLOW TEST PASSED! ✅');
    console.log('The password for admin@pillnow.com has been changed to:', newPassword);
    
  } catch (error) {
    console.error('\nTEST FAILED ❌');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

testCompleteResetFlow();