/**
 * Complete test script for admin password reset flow with correct email
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const adminEmail = 'admin@pillnow.info'; // Correct admin email
const otp = '347345'; // OTP from logs
const newPassword = 'admin123'; // New password to set

// Helper to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAdminPasswordReset() {
  try {
    console.log('Starting admin password reset test...');
    
    // Step 1: Request password reset
    console.log('\n1. Requesting password reset...');
    const requestResetResponse = await axios.post(`${baseUrl}/api/password-reset/request`, {
      email: adminEmail
    });
    console.log('Response:', requestResetResponse.data);
    
    console.log('\nPassword reset request sent to admin email.');
    console.log('Please check the server logs to get the OTP, then update this script with the correct OTP.');
    console.log('The OTP will be in a line like: "Generated OTP xxxxxx for admin@pillnow.info"');
    
    console.log('\nOnce you have the OTP, you can continue testing with:');
    console.log(`1. Verify OTP: POST /api/password-reset/verify-otp with { "email": "${adminEmail}", "otp": "OTP_FROM_LOGS" }`);
    console.log(`2. Reset password: POST /api/password-reset/reset with { "email": "${adminEmail}", "otp": "OTP_FROM_LOGS", "password": "${newPassword}" }`);
    console.log(`3. Login with: email=${adminEmail}, password=${newPassword}`);
    
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