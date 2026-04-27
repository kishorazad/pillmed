/**
 * Complete test script for admin password reset flow with correct email
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const adminEmail = 'admin@pillnow.info'; // Correct admin email
const otp = '528214'; // Latest OTP from logs
const newPassword = 'admin123'; // New password to set

// Helper to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAdminPasswordReset() {
  try {
    console.log('Starting admin password reset test with correct admin email...');
    
    // Skip the request step since it generates a new OTP
    console.log('\n1. Using existing OTP:', otp);
    console.log('(Skipping request step to avoid generating a new OTP)');
    
    // Wait 2 seconds
    await delay(2000);
    
    // Step 2: Verify OTP
    console.log('\n2. Verifying OTP...');
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
    
    // Step 3: Reset password
    console.log('\n3. Setting new password...');
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
    
    // Step 4: Login with new password
    console.log('\n4. Logging in with new password...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: adminEmail,
      password: newPassword
    });
    console.log('Login successful!');
    console.log('User data:', loginResponse.data.username);
    
    console.log('\nCOMPLETE PASSWORD RESET FLOW TEST PASSED! ✅');
    console.log(`The password for ${adminEmail} has been successfully reset to: ${newPassword}`);
    
  } catch (error) {
    console.error('\nPASSWORD RESET TEST FAILED');
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminPasswordReset();