/**
 * Test script for admin password reset flow
 */

import axios from 'axios';

const baseUrl = 'http://localhost:5000';
const adminEmail = 'admin@pillnow.com';
const newPassword = 'admin123';  // New password to set

// Helper to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAdminPasswordReset() {
  try {
    console.log('Starting admin password reset test...');
    
    // Step 1: First test that we can login with current password
    console.log('\n1. Testing current admin login...');
    try {
      const currentLoginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
        email: adminEmail,
        password: 'admin'
      });
      console.log('Current login successful!');
    } catch (error) {
      console.log('Current login failed - might be already changed:', error.message);
    }
    
    // Step 2: Request password reset
    console.log('\n2. Requesting password reset...');
    const requestResetResponse = await axios.post(`${baseUrl}/api/password-reset/request`, {
      email: adminEmail
    });
    console.log('Response:', requestResetResponse.data);
    
    console.log('Password reset request sent to admin email.');
    console.log('OTP would be sent to the email. For automated testing we\'ll need to');
    console.log('check the server logs to get the OTP or implement a test endpoint that returns it.');
    
    // In a real scenario, the user would check their email for the OTP
    // For this test, we'd need to extract it from logs or DB
    
    console.log('\nTest password reset flow manually using:');
    console.log(`1. Request OTP: POST /api/password-reset/request with { "email": "${adminEmail}" }`);
    console.log(`2. Verify OTP: POST /api/password-reset/verify-otp with { "email": "${adminEmail}", "otp": "OTP_FROM_LOGS" }`);
    console.log(`3. Reset password: POST /api/password-reset/reset with { "email": "${adminEmail}", "otp": "OTP_FROM_LOGS", "password": "${newPassword}" }`);
    console.log(`4. Login with new password: POST /api/auth/login with { "email": "${adminEmail}", "password": "${newPassword}" }`);
    
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